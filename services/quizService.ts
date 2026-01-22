
import { Quiz, QuizResult } from '../types';
import { globalApi } from './api';

const RESULT_KEY = 'quiz_master_local_results';

export const quizService = {
  // Busca do "Banco de Dados Global"
  async getQuizzes(): Promise<Quiz[]> {
    return await globalApi.fetchQuizzes();
  },

  // Salva no "Banco de Dados Global"
  async saveQuiz(quiz: Quiz): Promise<void> {
    await globalApi.saveQuiz(quiz);
  },

  // Remove do "Banco de Dados Global"
  async deleteQuiz(id: string): Promise<void> {
    await globalApi.deleteQuiz(id);
  },

  // Mantém resultados estritamente LOCAL (LocalStorage)
  saveResult(result: QuizResult): void {
    const results = this.getResults();
    results.unshift(result);
    // Mantém apenas os últimos 50 resultados localmente
    localStorage.setItem(RESULT_KEY, JSON.stringify(results.slice(0, 50)));
  },

  getResults(): QuizResult[] {
    const data = localStorage.getItem(RESULT_KEY);
    return data ? JSON.parse(data) : [];
  }
};
