
import { Quiz } from '../types';
import { sqliteService } from './sqliteService';

export const globalApi = {
  async fetchQuizzes(): Promise<Quiz[]> {
    const db = await sqliteService.init();
    const res = db.exec("SELECT * FROM quizzes ORDER BY rowid DESC");
    
    if (res.length === 0) return [];
    
    const columns = res[0].columns;
    const values = res[0].values;
    
    return values.map((row: any) => {
      const quiz: any = {};
      columns.forEach((col, i) => {
        if (col === 'questions') {
          quiz[col] = JSON.parse(row[i]);
        } else {
          quiz[col] = row[i];
        }
      });
      return quiz as Quiz;
    });
  },

  async saveQuiz(quiz: Quiz): Promise<void> {
    const db = await sqliteService.init();
    const questionsJson = JSON.stringify(quiz.questions);
    
    db.run(
      `INSERT OR REPLACE INTO quizzes (id, title, description, category, questions) 
       VALUES (?, ?, ?, ?, ?)`,
      [quiz.id, quiz.title, quiz.description, quiz.category, questionsJson]
    );
    
    await sqliteService.persist();
  },

  async deleteQuiz(id: string): Promise<void> {
    const db = await sqliteService.init();
    db.run("DELETE FROM quizzes WHERE id = ?", [id]);
    await sqliteService.persist();
  }
};
