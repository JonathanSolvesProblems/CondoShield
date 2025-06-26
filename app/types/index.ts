export interface Assessment {
  id: string;
  title: string;
  amount: number;
  dueDate: string;
  status: 'pending' | 'paid' | 'disputed' | 'overdue';
  description: string;
  breakdown: AssessmentItem[];
  region: string;
  dateReceived: string;
}

export interface AssessmentItem {
  category: string;
  amount: number;
  description: string;
  questionable: boolean;
}

export interface LegalQuestion {
  id: string;
  question: string;
  answer: string;
  region: string;
  category: string;
  timestamp: string;
}

export interface DisputeLetter {
  created_at: string | number | Date;
  id: string;
  assessmentId: string;
  content: string;
  recipient: string;
  dateGenerated: string;
  status: 'draft' | 'sent' | 'responded';
}

export interface CommunityPost {
  id: number;
  title: string;
  content: string;
  user_id: any;
  region: string;
  upvotes: number;
  replies: number;
  timestamp: string;
  category: 'warning' | 'success' | 'question' | 'advice';
  author: string;
}

export type Language = 'en' | 'fr';

export interface User {
  id: string;
  name: string;
  email: string;
  region: string;
  verified: boolean;
  language: Language;
}

export interface CostSavingSuggestion {
  id: string;
  user_id: string;
  assessment_id: string;
  category: string;
  suggestion: string;
  estimated_savings: number;
  created_at: string;
}
