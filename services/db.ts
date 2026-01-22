
import { Quiz } from '../types';

const DB_NAME = 'QuizMasterDB';
const DB_VERSION = 1;
const QUIZ_STORE = 'quizzes';

let dbInstance: IDBDatabase | null = null;

export const dbService = {
  async init(): Promise<IDBDatabase> {
    if (dbInstance) return dbInstance;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(QUIZ_STORE)) {
          db.createObjectStore(QUIZ_STORE, { keyPath: 'id' });
        }
      };

      request.onsuccess = () => {
        dbInstance = request.result;
        resolve(dbInstance);
      };

      request.onerror = () => reject(request.error);
    });
  },

  async getAllQuizzes(): Promise<Quiz[]> {
    try {
      const db = await this.init();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(QUIZ_STORE, 'readonly');
        const store = transaction.objectStore(QUIZ_STORE);
        const request = store.getAll();

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    } catch (e) {
      console.error("Erro ao buscar quizzes:", e);
      return [];
    }
  },

  async saveQuiz(quiz: Quiz): Promise<void> {
    const db = await this.init();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(QUIZ_STORE, 'readwrite');
      const store = transaction.objectStore(QUIZ_STORE);
      const request = store.put(quiz);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  },

  async deleteQuiz(id: string): Promise<void> {
    const db = await this.init();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(QUIZ_STORE, 'readwrite');
      const store = transaction.objectStore(QUIZ_STORE);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
};
