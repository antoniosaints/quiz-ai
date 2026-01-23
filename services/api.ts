
import { Quiz } from '../types';

<<<<<<< HEAD
const API_BASE = process.env.API_BASE + '/api';
=======
const API_BASE = 'http://localhost:3001/api';
>>>>>>> 6b91b2a595c0f4d92a29a55546224e2097be79bd

export const globalApi = {
  async fetchQuizzes(): Promise<Quiz[]> {
    const response = await fetch(`${API_BASE}/quizzes`);
    if (!response.ok) throw new Error('Falha ao buscar quizzes do servidor');
    return response.json();
  },

  async saveQuiz(quiz: Quiz): Promise<void> {
    const response = await fetch(`${API_BASE}/quizzes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(quiz)
    });
    if (!response.ok) throw new Error('Falha ao salvar quiz no servidor');
  },

  async deleteQuiz(id: string): Promise<void> {
    const response = await fetch(`${API_BASE}/quizzes/${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('Falha ao deletar quiz no servidor');
  }
};
