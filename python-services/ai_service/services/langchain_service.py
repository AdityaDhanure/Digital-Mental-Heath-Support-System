# python-services/ai_service/services/langchain_service.py

from typing import List, Dict, Optional, Any
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage
from langchain_core.output_parsers import StrOutputParser
from config.settings import settings
import logging

logger = logging.getLogger(__name__)

class LangChainService:
    """Service for LangChain-based LLM interactions"""   
    
    def __init__(self):
        # Initialize LLM  
        self.llm = ChatGoogleGenerativeAI(
            model=settings.LLM_MODEL,
            temperature=settings.LLM_TEMPERATURE,
            max_output_tokens=settings.LLM_MAX_TOKENS,
            google_api_key=settings.GOOGLE_API_KEY
        )
        
        # Initialize Output Parser
        self.output_parser = StrOutputParser()
        
        # System prompt for mental health support
        self.system_prompt = self._load_system_prompt()

# 0. => a.  ==================================================================================================== #  
    def _load_system_prompt(self) -> str:
        """Load the mental health support system prompt"""
        return """You are Giffie, a warm and empathetic mental health companion for college students.

You are NOT a therapist or doctor. You provide emotional support, validation, and gentle guidance.

──────── HOW TO RESPOND ────────
• Keep replies SHORT — 2 to 4 sentences max unless the user asks for more detail.
• Always acknowledge the user's feelings before offering advice.
• Use simple, conversational language — no clinical or textbook tone.
• Offer one practical coping idea only if it naturally fits the conversation.
• Do NOT generate long summaries or lists unless explicitly asked.
• Interpret what the user ACTUALLY means — do not over-react to words taken out of context.
  For example: "I do not want to kill myself but I am trying to calm down" = someone managing stress, not crisis.

──────── WHEN TO SUGGEST PROFESSIONAL HELP ────────
• Only suggest a counselor or crisis support when the user's message clearly shows:
  - Genuine suicidal or self-harm intent (confirmed, not negated or hypothetical)
  - Severe hopelessness with no sign of coping
  - A request for professional help
• For ambiguous messages: ask a gentle follow-up question first to understand better.
  Example: "That sounds really tough. Can you tell me a bit more about what's going on for you right now?"

──────── STRICT LIMITS ────────
• Never diagnose.
• Never suggest or name medications.
• Never lecture, shame, or pressure.
• Never claim to replace professional care.

──────── RAG RESOURCES ────────
• If relevant context from mental health resources is provided, use it naturally in your reply.
• Keep resource-based answers brief and in plain language.

──────── MISSION ────────
Help students feel heard and understood. Be a calm, non-judgmental presence that gently guides toward healthy steps — including professional help when it is genuinely needed.
"""


# 1. ======================================================================================================================================= #  
    async def generate_response(
        self,
        user_message: str,
        conversation_history: Optional[List[Dict[str, Any]]] = None,
        rag_context: Optional[List[Dict[str, Any]]] = None,
        safety_context: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Generate AI response using LangChain with optional RAG and safety context
        """

        print("Hellloeeeeeeeeeeeeeee before try:.....")
        try:
            messages = [SystemMessage(content=self.system_prompt)]
            print("Hellloeeeeeeeeeeeeeee after messages:.....")

            # ---- Conversation history (last 8 messages max) ----
            if conversation_history:
                for msg in conversation_history[-8:]:
                    role = msg.role
                    content = msg.content
                    if role == "user":
                        messages.append(HumanMessage(content=content))
                    elif role == "assistant":
                        messages.append(AIMessage(content=content))
            print("Hellloeeeeeeeeeeeeeee after history:.....")

            # ---- RAG context (short & focused) ----
            if rag_context:
                context_snippets = "\n".join(
                    f"- {doc.get('title', 'Resource')}: {doc.get('content', '')[:300]}"
                    for doc in rag_context[:3]
                )
                print("Hellloeeeeeeeeeeeeeee inside rag_context:.....")

                user_message = (
                    f"Relevant information:\n{context_snippets}\n\n"
                    f"User message: {user_message}"
                )

            print("Hellloeeeeeeeeeeeeeee after rag_context:.....")
            # ---- Safety hint for confirmed high/critical risk only ----
            risk_level = safety_context.get("risk_level", "low") if safety_context else "low"
            negation = safety_context.get("negation_detected", False) if safety_context else False

            if risk_level in {"high", "critical"} and not negation:
                user_message += (
                    "\n\n[Note: This message may reflect significant distress. "
                    "Respond with empathy, ask a gentle follow-up question to understand the situation better, "
                    "and only suggest professional help if the situation clearly warrants it.]"
                )

            messages.append(HumanMessage(content=user_message))

            print("Hellloeeeeeeeeeeeeeee before LLM call:.....")
            # ---- LLM call ----
            response = await self.llm.ainvoke(messages)   # asynchronous call
            
            content = response.content
            
            # Handle case where content is a list (Multi-part content)
            if isinstance(content, list):
                # Join all parts into a single string
                final_text = " ".join([str(item) for item in content])
            else:
                # It is already a string (or simpler object)
                final_text = str(content)

            print("Hellloeeeeeeeeeeeeeee before post response:.....")
            # ---- Safety post-processing ----
            final_response = self._post_process_response(final_text, safety_context)

            return {
                "message": final_response,
                "model": settings.LLM_MODEL,
                "tokens_used": 0
            }

        except Exception as e:
            logger.exception("LangChain response generation failed")
            return {
                "message": self._get_fallback_response(safety_context),
                "model": "fallback",
                "tokens_used": 0,
                "error": str(e)
            }

    

# 1. => a.  ==================================================================================================== #  
    def _post_process_response(
        self,
        response: str,
        safety_context: Optional[Dict[str, Any]]
    ) -> str:
        """
        Ensure response safety and add crisis guidance when genuinely needed.
        Avoids adding crisis text for negated/protective-factor situations.
        """
        risk_level = safety_context.get("risk_level", "low") if safety_context else "low"
        negation = safety_context.get("negation_detected", False) if safety_context else False
        has_protective = safety_context.get("has_protective_factors", False) if safety_context else False

        print("Hellloeeeeeeeeeeeeeee before appending crisis resources:.....")
        # Only append crisis resources for confirmed high/critical intent
        if risk_level in {"high", "critical"} and not negation and not has_protective:
            response += (
                "\n\n💙 If things feel overwhelming right now:\n"
                "- iCall (India): **9152987821**\n"
                "- Vandrevala Foundation: **1860-2662-345** (24/7)\n"
                "- [Book a counseling session](/bookings) — a counsellor can help.\n\n"
                "You don't have to go through this alone."
            )

        # Block medical claims
        forbidden_phrases = [
            "i diagnose",
            "you have depression",
            "you need medication",
            "take this medication"
        ]

        lowered = response.lower()
        if any(phrase in lowered for phrase in forbidden_phrases):
            logger.warning("Medical claim detected and replaced")

            return (
                "I'm really glad you shared this with me. I can offer emotional support "
                "and coping strategies, but I can't diagnose or recommend medication — "
                "a mental health professional is best suited for that. "
                "Would you like to explore some gentle coping techniques together?"
            )

        return response

    

# 1. => b. ==================================================================================================== #  
    def _get_fallback_response(
        self,
        safety_context: Optional[Dict[str, Any]]
    ) -> str:
        """
        Safe fallback response if LLM fails
        """
        risk_level = safety_context.get("risk_level", "low") if safety_context else "low"
        negation = safety_context.get("negation_detected", False) if safety_context else False

        if risk_level in {"high", "critical"} and not negation:
            return (
                "I'm having a brief technical issue, but your message sounds important.\n\n"
                "If this feels urgent, please reach out:\n"
                "- iCall: 9152987821\n"
                "- Vandrevala Foundation: 1860-2662-345 (24/7)\n"
                "- [Book a counseling session](/bookings)\n\n"
                "Your wellbeing matters. Please try again in a moment."
            )

        return (
            "I'm having a brief technical issue right now. "
            "Please try sending your message again in a moment — I'm here with you."
        )



# 2.  ====================================================================================================================================== #  
    async def generate_coping_strategies(
        self,
        concern_type: str,
        context: str = ""
    ) -> List[str]:
        """
        Generate short, practical coping strategies for a given concern
        """

        # ---- Guardrail for unsafe inputs ----
        if concern_type.lower() in {"self-harm", "suicide", "kill myself"}:
            return [
                "Reach out to a counselor or mental health professional",
                "Contact a trusted friend or family member",
                "If you're in danger, call your local emergency number"
            ]

        prompt = (
            f"Give 3–5 short, practical coping strategies for a college student experiencing "
            f"{concern_type}. Keep each strategy one sentence. "
            f"Use CBT, mindfulness, or self-care techniques.\n"
            f"Context (optional): {context}"
        )

        try:
            response = await self.llm.ainvoke([
                SystemMessage(content="You provide brief, safe, non-clinical coping strategies."),
                HumanMessage(content=prompt)
            ])

            strategies = self._parse_strategies(response.content)
            return strategies[:5]

        except Exception as e:
            logger.exception("Coping strategy generation failed")
            return self._get_default_strategies(concern_type)

    

# 2. => a.   ==================================================================================================== #  
    def _parse_strategies(self, text: str) -> List[str]:
        """Extract clean strategy lines from LLM output"""
        lines = []
        for line in text.splitlines():
            line = line.strip("•-0123456789. ").strip()
            if 5 < len(line) < 200:
                lines.append(line)
        return lines



# 2. => b.   ==================================================================================================== # 
    def _get_default_strategies(self, concern_type: str) -> List[str]:
        strategies = {
            "anxiety": [
                "Practice slow breathing (inhale 4, hold 4, exhale 4)",
                "Use the 5-4-3-2-1 grounding technique",
                "Write worries down and revisit them later",
                "Try progressive muscle relaxation"
            ],
            "stress": [
                "Break tasks into smaller steps",
                "Take short breaks during study sessions",
                "Do light movement or stretching",
                "Keep a regular sleep routine"
            ],
            "depression": [
                "Set one small, achievable goal today",
                "Spend a few minutes outdoors",
                "Message or call someone you trust",
                "Do a simple activity you used to enjoy"
            ]
        }

        return strategies.get(
            concern_type.lower(),
            [
                "Take a few slow breaths",
                "Talk to someone you trust",
                "Do a calming activity",
                "Consider reaching out to a counselor"
            ]
        )
