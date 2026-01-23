
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = 3001;
const DB_PATH = path.join(__dirname, 'database.sqlite');

app.use(cors());
app.use(bodyParser.json());

// Inicialização do Banco de Dados
const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('Erro ao abrir banco de dados:', err.message);
  } else {
    console.log('Conectado ao banco SQLite central.');
    db.run(`
      CREATE TABLE IF NOT EXISTS quizzes (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        category TEXT,
        questions TEXT NOT NULL
      )
    `);
  }
});

// Rotas da API
app.get('/api/quizzes', (req, res) => {
  db.all("SELECT * FROM quizzes", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    // Converter a string JSON das questões de volta para objeto
    const formattedQuizzes = rows.map(row => ({
      ...row,
      questions: JSON.parse(row.questions)
    }));
    res.json(formattedQuizzes);
  });
});

app.post('/api/quizzes', (req, res) => {
  const { id, title, description, category, questions } = req.body;
  const questionsJson = JSON.stringify(questions);
  
  const sql = `INSERT OR REPLACE INTO quizzes (id, title, description, category, questions) VALUES (?, ?, ?, ?, ?)`;
  db.run(sql, [id, title, description, category, questionsJson], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Quiz salvo com sucesso', id });
  });
});

app.delete('/api/quizzes/:id', (req, res) => {
  const { id } = req.params;
  db.run("DELETE FROM quizzes WHERE id = ?", [id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Quiz removido', changes: this.changes });
  });
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
