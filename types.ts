
export interface Option {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface Question {
  id: string;
  text: string;
  options: Option[];
}

export interface Quiz {
  id: string;
  title: string;
  description: string;
  questions: Question[];
  category: string;
}

export interface QuizResult {
  id: string;
  quizId: string;
  quizTitle: string;
  score: number;
  total: number;
  date: string;
}

export type View = 'HOME' | 'QUIZ_PLAYER' | 'ADMIN' | 'LOGIN' | 'RESULT_SUMMARY';
