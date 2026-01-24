
import { Quiz, QuizResult } from '../types';
import { globalApi } from './api';

const RESULT_KEY = 'quiz_master_results';

export const quizService = {
  async getQuizzes(): Promise<Quiz[]> {
    try {
      return await globalApi.fetchQuizzes();
    } catch (error) {
      console.warn("Servidor offline, os quizzes não puderam ser carregados.");
      return [];
    }
  },

  async saveQuiz(quiz: Quiz): Promise<void> {
    await globalApi.saveQuiz(quiz);
  },

  async deleteQuiz(id: string): Promise<void> {
    await globalApi.deleteQuiz(id);
  },

  // Os resultados continuam locais para privacidade do usuário
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
