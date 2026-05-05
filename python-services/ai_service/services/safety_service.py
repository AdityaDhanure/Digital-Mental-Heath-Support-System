# python-services/ai_service/services/safety_service.py

import re
from typing import Dict, List, Any
import logging
from transformers import pipeline

logger = logging.getLogger(__name__)

# Words/phrases that negate or cancel out a harmful keyword
NEGATION_PATTERNS = [
    r"\b(not|no|never|don't|do not|didn't|did not|doesn't|does not|won't|will not|can't|cannot)\b.{0,25}",
    r"\b(obviously|clearly|of course)\b",  # "obviously not"
    r"\b(trying to calm|trying to help|trying to stop|avoid|prevent)\b",
]

def _is_negated(message: str, keyword_match_start: int) -> bool:
    """
    Check if a keyword match is preceded or followed by a negation within a short window.
    """
    window = 60
    start = max(0, keyword_match_start - window)
    context = message[start:keyword_match_start + window].lower()

    for neg_pat in NEGATION_PATTERNS:
        if re.search(neg_pat, context, re.IGNORECASE):
            return True
    return False


class SafetyService:
    """Service for safety checks, crisis detection, and sentiment analysis"""
    
    def __init__(self):
        self.sentiment_analyzer = None
        self.emotion_classifier = None
        
        # Crisis keywords — uses CONFIRMED intent patterns (not just keywords)
        # Patterns are written to require actual intent signals, not just the root word.
        self.crisis_keywords = {
            "critical": [
                # Explicit intent with no negation already baked into pattern
                r"\b(want to (kill|end) (myself|my life)|going to (kill|harm) myself)\b",
                r"\b(suicide|suicidal|end it all|end my life|not worth living|better off dead)\b",
                r"\b(harm myself|hurt myself|cut myself|cutting myself)\b",
                r"\b(wish I was dead|don't want to live|overdose|pills to end)\b",
            ],
            "high": [
                r"\b(hopeless|worthless|can't go on|giving up on life)\b",
                r"\b(no point in living|no reason to live|nothing matters anymore)\b",
                r"\b(unbearable|can't take it anymore|want to disappear forever)\b",
                r"\b(severe (depression|anxiety|panic))\b",
            ],
            "medium": [
                r"\b(depressed|anxious|overwhelmed|stressed out)\b",
                r"\b(can't sleep|insomnia|nightmares)\b",
                r"\b(panic attack|breakdown)\b",
                r"\b(self harm|cutting)\b",
            ]
        }
        
        # Positive/protective factors
        self.protective_patterns = [
            r"\b(getting help|seeing (counselor|therapist))\b",
            r"\b(reaching out|talking to someone)\b",
            r"\b(feeling better|improving|making progress)\b",
            r"\b(support (from|system)|friend|family)\b",
            r"\b(trying to calm|trying to cope|calm down|calming)\b",
        ]


# 1. ===================================================================================================================================== #   
    async def load_models(self):
        """Load ML models for sentiment and emotion analysis"""
        try:
            logger.info("Loading safety analysis models...")
            
            # Load sentiment analysis model
            self.sentiment_analyzer = pipeline(
                "sentiment-analysis",
                model="distilbert-base-uncased-finetuned-sst-2-english"
            )
            
            # Load emotion classification model
            self.emotion_classifier = pipeline(
                "text-classification",
                model="bhadresh-savani/distilbert-base-uncased-emotion",
                top_k=5
            )
            
            logger.info("Safety models loaded successfully")
            
        except Exception as e:
            logger.error(f"Model loading error: {str(e)}")
            logger.warning("Running in fallback mode without ML models")


# 2.  =================================================================================================================================== #
    async def analyze_message(
        self,
        message: str
    ) -> Dict[str, Any]:
        """
        Comprehensive safety analysis of a message.
        Includes negation-awareness to avoid false positives.
        """
        try:
            message_lower = message.lower()
            
            # 1. Check for crisis keywords
            detected_keywords = []
            risk_level = "low"
            risk_score = 0.0
            negated = False

            # Helper: check pattern with negation awareness
            def check_patterns(patterns, level, base_score):
                nonlocal risk_level, risk_score, negated

                for pattern in patterns:
                    match = re.search(pattern, message_lower, re.IGNORECASE)
                    if match:
                        if _is_negated(message_lower, match.start()):
                            # Keyword found but it's negated ("I do NOT want to kill myself")
                            negated = True
                            # Still log a low-risk flag but don't escalate
                            risk_score = max(risk_score, 1.5)
                            risk_level = "low" if risk_level == "low" else risk_level
                        else:
                            detected_keywords.extend(re.findall(pattern, message_lower, re.IGNORECASE))
                            risk_level = level
                            risk_score = max(risk_score, base_score)

            # Check levels from most severe to least
            check_patterns(self.crisis_keywords["critical"], "critical", 9.0)
            if risk_level != "critical":
                check_patterns(self.crisis_keywords["high"], "high", 7.0)
            if risk_level not in ["critical", "high"]:
                check_patterns(self.crisis_keywords["medium"], "medium", 4.0)

            # 2. Check for protective factors (reduce risk)
            has_protective_factors = False
            for pattern in self.protective_patterns:
                if re.search(pattern, message_lower, re.IGNORECASE):
                    has_protective_factors = True
                    risk_score = max(0, risk_score - 1.5)
                    break

            # 3. Protective factors + negation together: drop to low
            if has_protective_factors and negated:
                risk_level = "low"
                risk_score = min(risk_score, 1.0)

            # Only alert counselor for confirmed (non-negated) high/critical  
            alert_counselor = risk_level in ["high", "critical"] and not negated

            # 5. Flag for review at medium+
            flagged = risk_level in ["medium", "high", "critical"]

            recommendations = self._generate_recommendations(risk_level, has_protective_factors)

            result = {
                "risk_score": risk_score,
                "risk_level": risk_level,
                "detected_keywords": list(set(str(k) for k in detected_keywords))[:5],
                "flagged": flagged,
                "alert_counselor": alert_counselor,
                "has_protective_factors": has_protective_factors,
                "recommendations": recommendations,
                "negation_detected": negated,
            }

            if alert_counselor:
                logger.warning(f"Confirmed high-risk message: {risk_level}")
            elif negated:
                logger.info("Harmful keyword detected but negated — treating as low risk")

            return result
            
        except Exception as e:
            logger.error(f"Safety analysis error: {str(e)}")
            return {
                "risk_score": 3.0,
                "risk_level": "low",
                "detected_keywords": [],
                "flagged": False,
                "alert_counselor": False,
                "has_protective_factors": False,
                "recommendations": [],
                "error": str(e)
            }
        
# 2. => a.   ==================================================================================================== #   
    def _generate_recommendations(
        self,
        risk_level: str,
        has_protective_factors: bool
    ) -> List[str]:
        """Generate appropriate recommendations based on risk level"""
        
        recommendations = {
            "critical": [
                "Please reach out to emergency services immediately (911)",
                "Contact iCall: 9152987821 or Vandrevala Foundation: 1860-2662-345",
                "Tell a trusted friend or family member how you're feeling",
                "Book a session with a counselor — they are here to help"
            ],
            "high": [
                "Consider speaking with a counselor as soon as possible",
                "Contact campus counseling services",
                "Book a session with a counselor",
                "Talk to a trusted friend or mentor"
            ],
            "medium": [
                "Schedule an appointment with a counselor",
                "Practice stress-reduction techniques like deep breathing",
                "Reach out to supportive friends or family"
            ],
            "low": [
                "Continue practicing self-care",
                "Maintain healthy habits (sleep, exercise, nutrition)",
                "Stay connected with supportive people"
            ]
        }
        
        base_recommendations = recommendations.get(risk_level, recommendations["low"])
        
        if has_protective_factors:
            base_recommendations.insert(
                0,
                "It's great that you're taking steps to get support"
            )
        
        return base_recommendations

# 3.   ================================================================================================================================= #  
    async def analyze_sentiment(
        self,
        message: str
    ) -> Dict[str, Any]:
        """
        Analyze sentiment and emotions in a message
        """
        try:
            result = {
                "overall": "neutral",
                "emotions": [],
                "stress_level": "none"
            }
            
            # Use ML model if available
            if self.sentiment_analyzer and self.emotion_classifier:
                # Sentiment analysis
                sentiment_result = self.sentiment_analyzer(message[:512])[0]
                result["overall"] = sentiment_result["label"].lower()
                result["confidence"] = sentiment_result["score"]
                
                # Emotion classification
                emotion_result = self.emotion_classifier(message[:512])
                result["emotions"] = [
                    {
                        "emotion": e["label"],
                        "confidence": e["score"]
                    }
                    for e in emotion_result[0]
                ]
                
                # Determine stress level based on emotions
                stress_emotions = ["fear", "anger", "sadness"]
                avg_stress_score = sum(
                    e["confidence"] 
                    for e in result["emotions"] 
                    if e["emotion"] in stress_emotions
                ) / len(stress_emotions) if len(stress_emotions) > 0 else 0
                
                if avg_stress_score > 0.7:
                    result["stress_level"] = "severe"
                elif avg_stress_score > 0.5:
                    result["stress_level"] = "high"
                elif avg_stress_score > 0.3:
                    result["stress_level"] = "moderate"
                else:
                    result["stress_level"] = "low"
            
            else:
                # Fallback: Rule-based sentiment
                result = self._rule_based_sentiment(message)
            
            return result
            
        except Exception as e:
            logger.error(f"Sentiment analysis error: {str(e)}")
            return {
                "overall": "neutral",
                "emotions": [],
                "stress_level": "unknown",
                "error": str(e)
            }
        

# 3. => a.  ==================================================================================================== #  
    def _rule_based_sentiment(self, message: str) -> Dict[str, Any]:
        """Fallback rule-based sentiment analysis"""
        message_lower = message.lower()
        
        negative_words = [
            "sad", "depressed", "anxious", "worried", "stressed",
            "overwhelmed", "hopeless", "terrible", "awful", "bad"
        ]
        
        positive_words = [
            "happy", "good", "better", "improving", "hopeful",
            "grateful", "thankful", "positive", "great", "excited"
        ]
        
        neg_count = sum(1 for word in negative_words if word in message_lower)
        pos_count = sum(1 for word in positive_words if word in message_lower)
        
        if neg_count > pos_count:
            overall = "negative"
            stress_level = "moderate" if neg_count > 2 else "low"
        elif pos_count > neg_count:
            overall = "positive"
            stress_level = "none"
        else:
            overall = "neutral"
            stress_level = "low"
        
        return {
            "overall": overall,
            "emotions": [],
            "stress_level": stress_level
        }
    