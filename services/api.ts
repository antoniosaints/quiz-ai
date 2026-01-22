
import { Quiz } from '../types';

// Chave para simular o banco de dados "Global" no contexto deste ambiente
// Em um cenário real, isso seria substituído por chamadas fetch('/api/quizzes')
const GLOBAL_STORAGE_KEY = 'quiz_master_global_sqlite_sim';

// Dados iniciais para o "Banco Global"
const INITIAL_DATA: Quiz[] = [
  {
    id: 'g1',
    title: 'Fundamentos de React',
    description: 'Teste seus conhecimentos sobre Hooks, Componentes e Ciclo de Vida.',
    category: 'Tecnologia',
    questions: [
      {
        id: 'q1',
        text: 'Qual hook é usado para gerenciar efeitos colaterais?',
        options: [
          { id: 'o1', text: 'useState', isCorrect: false },
          { id: 'o2', text: 'useEffect', isCorrect: true },
          { id: 'o3', text: 'useContext', isCorrect: false },
          { id: 'o4', text: 'useMemo', isCorrect: false }
        ]
      }
    ]
  }
];

export const globalApi = {
  async fetchQuizzes(): Promise<Quiz[]> {
    // Simula latência de rede de um banco SQL
    await new Promise(resolve => setTimeout(resolve, 300));
    const data = localStorage.getItem(GLOBAL_STORAGE_KEY);
    if (!data) {
      localStorage.setItem(GLOBAL_STORAGE_KEY, JSON.stringify(INITIAL_DATA));
      return INITIAL_DATA;
    }
    return JSON.parse(data);
  },

  async saveQuiz(quiz: Quiz): Promise<void> {
    const quizzes = await this.fetchQuizzes();
    const index = quizzes.findIndex(q => q.id === quiz.id);
    
    if (index >= 0) {
      quizzes[index] = quiz;
    } else {
      quizzes.unshift(quiz);
    }
    
    localStorage.setItem(GLOBAL_STORAGE_KEY, JSON.stringify(quizzes));
  },

  async deleteQuiz(id: string): Promise<void> {
    const quizzes = await this.fetchQuizzes();
    const filtered = quizzes.filter(q => q.id !== id);
    localStorage.setItem(GLOBAL_STORAGE_KEY, JSON.stringify(filtered));
  }
};
