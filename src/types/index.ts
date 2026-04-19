export interface SRSData {
  repetition: number;
  interval: number; // in days
  easeFactor: number;
  nextReviewDate: number; // timestamp
}

export interface Question {
  id: string;
  text: string;
  codeSnippet?: string; // Tùy chọn chứa code của đề bài
  options: Record<string, string>; // e.g. { "A": "...", "B": "..." }
  correctAnswer: string; // e.g. "A"
  srs?: SRSData;
}

export interface QuizSet {
  id: string;
  title: string;
  description?: string;
  questions: Question[];
  createdAt: number;
}

export type ViewState = 
  | { type: 'dashboard' }
  | { type: 'import', targetQuizId?: string }
  | { type: 'study', quizId: string }
  | { type: 'srs-setup' }
  | { type: 'srs-study', quizIds: string[] };
