
import { Quiz, QuizResult } from '../types';
import { dbService } from './db';

const RESULT_KEY = 'quiz_master_results';

const INITIAL_QUIZZES: Quiz[] = [
  {
    id: '1',
    title: 'Fundamentos de React',
    description: 'Teste seus conhecimentos básicos sobre o ecossistema React.',
    category: 'Tecnologia',
    questions: [
      {
        id: 'q1',
        text: 'Qual hook é usado para gerenciar estado em componentes funcionais?',
        options: [
          { id: 'o1', text: 'useEffect', isCorrect: false },
          { id: 'o2', text: 'useState', isCorrect: true },
          { id: 'o3', text: 'useContext', isCorrect: false },
          { id: 'o4', text: 'useReducer', isCorrect: false }
        ]
      }
    ]
  }
];

export const quizService = {
  async getQuizzes(): Promise<Quiz[]> {
    let quizzes = await dbService.getAllQuizzes();
    
    // Seed inicial se o banco estiver vazio
    if (quizzes.length === 0) {
      for (const q of INITIAL_QUIZZES) {
        await dbService.saveQuiz(q);
      }
      quizzes = await dbService.getAllQuizzes();
    }
    
    return quizzes;
  },

  async saveQuiz(quiz: Quiz): Promise<void> {
    await dbService.saveQuiz(quiz);
  },

  async deleteQuiz(id: string): Promise<void> {
    await dbService.deleteQuiz(id);
  },

  // Mantido em LocalStorage conforme solicitado
  saveResult(result: QuizResult): void {
    const results = this.getResults();
    results.unshift(result);
    localStorage.setItem(RESULT_KEY, JSON.stringify(results.slice(0, 20)));
  },

  getResults(): QuizResult[] {
    const data = localStorage.getItem(RESULT_KEY);
    return data ? JSON.parse(data) : [];
  }
};
