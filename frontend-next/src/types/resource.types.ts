// FILE: src/types/resource.types.ts
export interface Resource {
  _id: string;
  title: string;
  description: string;
  type: 'article' | 'video' | 'audio' | 'pdf' | 'exercise' | 'guide' | 'infographic';
  category: 
    | 'anxiety'
    | 'therapy'
    | 'depression'
    | 'stress'
    | 'sleep'
    | 'mindfulness'
    | 'coping-strategies'
    | 'self-care'
    | 'academic-pressure'
    | 'relationships'
    | 'crisis-management'
    | 'general-wellness';
  tags: string[];
  content: {
    text?: string;
    mediaUrl?: string;
    thumbnailUrl?: string;
    duration?: number;
    fileSize?: number;
  };
  language: 'english' | 'hindi' | 'marathi' | 'multilingual';
  translations?: Array<{
    language: string;
    title: string;
    description: string;
    content: string;
  }>;
  author?: {
    name: string;
    credentials?: string;
    organization?: string;
  };
  uploadedBy: string;
  verified: boolean;
  verifiedBy?: string;
  verifiedAt?: Date;
  targetAudience: 'all' | 'students' | 'counselors' | 'faculty';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  metrics: {
    views: number;
    likes: number;
    shares: number;
    downloads: number;
    averageRating: number;
    totalRatings: number;
  };
  likedBy: string[];
  externalSource?: {
    name: string;
    url: string;
    licenseType: string;
  };
  isPublished: boolean;
  isArchived: boolean;
  publishedAt?: Date;
  searchKeywords: string[];
  createdAt: Date;
  updatedAt: Date;
}