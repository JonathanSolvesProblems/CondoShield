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
  id: string;
  assessmentId: string;
  content: string;
  recipient: string;
  dateGenerated: string;
  status: 'draft' | 'sent' | 'responded';
}

export interface CommunityPost {
  id: string;
  title: string;
  content: string;
  author: string;
  region: string;
  upvotes: number;
  replies: number;
  timestamp: string;
  category: 'warning' | 'success' | 'question' | 'advice';
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