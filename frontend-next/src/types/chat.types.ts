// FILE: src/types/chat.types.ts
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  emotionalRiskScore?: number;
  sentiment?: {
    overall: string;
    emotions?: Array<{
      emotion: string;
      confidence: number;
    }>;
    stressLevel: string;
  };
  isEncrypted?: boolean;
}

export interface ChatSession {
  sessionId: string;
  title?: string;
  messages: ChatMessage[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  userToken?: string;
  isPinned?: boolean; // ✅ ADD THIS
  aiMetadata?: {
    modelUsed: string;
    ragContextUsed: boolean;
    processingTime: number;
  };
  safetyCheck?: {
    emotionalRiskScore: number;
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    crisisKeywordsDetected: string[];
    flaggedForReview: boolean;
    counselorAlerted: boolean;
  };
  expiresAt?: Date;
}

export interface ChatResponse {
  status: 'success';
  data: {
    message: string;
    sessionId: string;
    messageCount: number;
    safety: {
      riskLevel: 'low' | 'medium' | 'high' | 'critical';
      needsCounselor: boolean;
    };
    sentiment: string;
    processingTime: number;
    emergencyResources?: {
      helpline: string;
      emergencyContacts: string[];
      immediateActions: string[];
    };
  };
}