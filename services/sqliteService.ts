
import initSqlJs from 'sql.js';
import { Quiz } from '../types';

let db: any = null;
const DB_NAME = 'quiz_master_db';
const STORE_NAME = 'sqlite_file';

export const sqliteService = {
  async init() {
    if (db) return db;

    const SQL = await initSqlJs({
      locateFile: file => `https://esm.sh/sql.js@1.12.0/dist/${file}`
    });

    const savedDb = await this.loadFromIndexedDB();
    
    if (savedDb) {
      db = new SQL.Database(new Uint8Array(savedDb));
    } else {
      db = new SQL.Database();
      this.createTables();
      this.seedInitialData();
    }
    
    return db;
  },

  createTables() {
    db.run(`
      CREATE TABLE IF NOT EXISTS quizzes (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        category TEXT,
        questions TEXT NOT NULL
      )
    `);
  },

  seedInitialData() {
    const initialQuiz = {
      id: 'g1',
      title: 'Fundamentos de React (SQL)',
      description: 'Teste seus conhecimentos sobre Hooks e SQLite WASM.',
      category: 'Tecnologia',
      questions: JSON.stringify([
        {
          id: 'q1',
          text: 'Onde o banco de dados SQLite deste app está rodando?',
          options: [
            { id: 'o1', text: 'Servidor Cloud', isCorrect: false },
            { id: 'o2', text: 'Diretamente no seu Navegador (WASM)', isCorrect: true },
            { id: 'o3', text: 'LocalStorage', isCorrect: false },
            { id: 'o4', text: 'Não existe banco', isCorrect: false }
          ]
        }
      ])
    };

    db.run(
      "INSERT OR IGNORE INTO quizzes (id, title, description, category, questions) VALUES (?, ?, ?, ?, ?)",
      [initialQuiz.id, initialQuiz.title, initialQuiz.description, initialQuiz.category, initialQuiz.questions]
    );
    this.persist();
  },

  async persist() {
    const data = db.export();
    await this.saveToIndexedDB(data);
  },

  // Persistência em IndexedDB para binários grandes
  saveToIndexedDB(data: Uint8Array): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, 1);
      request.onupgradeneeded = () => {
        request.result.createObjectStore(STORE_NAME);
      };
      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        store.put(data, 'db_file');
        transaction.oncomplete = () => resolve();
      };
      request.onerror = () => reject(request.error);
    });
  },

  loadFromIndexedDB(): Promise<ArrayBuffer | null> {
    return new Promise((resolve) => {
      const request = indexedDB.open(DB_NAME, 1);
      request.onupgradeneeded = () => {
        request.result.createObjectStore(STORE_NAME);
      };
      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction(STORE_NAME, 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const getRequest = store.get('db_file');
        getRequest.onsuccess = () => resolve(getRequest.result || null);
      };
      request.onerror = () => resolve(null);
    });
  },

  getDb() {
    return db;
  }
};
