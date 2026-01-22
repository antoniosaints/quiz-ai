
import { Quiz, QuizResult } from '../types';
import { dbService } from './db';

const RESULT_KEY = 'quiz_master_results';

const INITIAL_QUIZZES: Quiz[] = [

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
