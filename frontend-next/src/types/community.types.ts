// FILE: src/types/community.types.ts
export interface Post {
  _id: string;
  author?: {
    _id: string;
    name: string;
    profilePicture?: string;
  };
  isAnonymous: boolean;
  anonymousAlias?: string;
  title?: string;
  content: string;
  category: 
    | 'general-support'
    | 'academic-stress'
    | 'anxiety'
    | 'depression'
    | 'relationships'
    | 'self-care'
    | 'success-stories'
    | 'resources'
    | 'questions'
    | 'other';
  tags?: string[];
  attachments?: Array<{
    type: 'image' | 'document';
    url: string;
    filename: string;
  }>;
  metrics: {
    views: number;
    upvotes: number;
    downvotes: number;
    replyCount: number;
  };
  upvotedBy?: string[];
  downvotedBy?: string[];
  replies?: Reply[];
  moderation?: {
    flagged: boolean;
    flagCount: number;
    moderatorReviewed: boolean;
    approved: boolean;
    removed: boolean;
  };
  contentSafety?: {
    scanned: boolean;
    safetyScore: number;
    requiresReview: boolean;
  };
  status: 'draft' | 'published' | 'archived' | 'removed';
  isPinned: boolean;
  isLocked: boolean;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt?: Date;
}

export interface Reply {
  _id: string;
  author?: {
    _id: string;
    name: string;
    profilePicture?: string;
  };
  isAnonymous: boolean;
  anonymousAlias?: string;
  content: string;
  createdAt: Date;
  upvotes: number;
  upvotedBy?: string[];
  flagged: boolean;
  moderatorApproved: boolean;
}