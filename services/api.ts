
import axios from 'axios';
import { Quiz } from '../types';

const STORAGE_KEY = 'quiz_master_api_url';
const DEFAULT_URL = 'http://localhost:3001/api';

// Permite obter a URL salva ou usar a padrão
export const getApiBaseUrl = () => {
  return localStorage.getItem(STORAGE_KEY) || DEFAULT_URL;
};

export const setApiBaseUrl = (url: string) => {
  localStorage.setItem(STORAGE_KEY, url);
};

const createClient = () => {
  return axios.create({
    baseURL: getApiBaseUrl(),
    timeout: 5000, // 5 segundos de timeout
    headers: {
      'Content-Type': 'application/json'
    }
  });
};

export const globalApi = {
  async checkHealth(): Promise<boolean> {
    try {
      const client = createClient();
      await client.get('/health');
      return true;
    } catch (e) {
      return false;
    }
  },

  async fetchQuizzes(): Promise<Quiz[]> {
    try {
      const client = createClient();
      const response = await client.get<Quiz[]>('/quizzes');
      return response.data;
    } catch (error: any) {
      console.error("Erro ao buscar quizzes do servidor:", error.message);
      throw error;
    }
  },

  async saveQuiz(quiz: Quiz): Promise<void> {
    try {
      const client = createClient();
      await client.post('/quizzes', quiz);
    } catch (error: any) {
      console.error("Erro ao salvar quiz no servidor:", error.message);
      throw error;
    }
  },

  async deleteQuiz(id: string): Promise<void> {
    try {
      const client = createClient();
      await client.delete(`/quizzes/${id}`);
    } catch (error: any) {
      console.error("Erro ao deletar quiz no servidor:", error.message);
      throw error;
    }
  }
};
