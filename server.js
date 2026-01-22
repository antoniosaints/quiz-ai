
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;
const DB_PATH = path.join(__dirname, 'database.sqlite');

// Configuração robusta de CORS
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(bodyParser.json());

// Middleware de Log para Debug
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Inicialização do Banco de Dados
const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('Erro crítico ao abrir banco de dados:', err.message);
  } else {
    console.log('--- DATABASE ONLINE ---');
    console.log(`Arquivo: ${DB_PATH}`);
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

// Endpoints
app.get('/api/quizzes', (req, res) => {
  db.all("SELECT * FROM quizzes ORDER BY rowid DESC", [], (err, rows) => {
    if (err) {
      console.error('Erro GET /api/quizzes:', err.message);
      return res.status(500).json({ error: err.message });
    }
    const formatted = rows.map(row => ({
      ...row,
      questions: JSON.parse(row.questions)
    }));
    res.json(formatted);
  });
});

app.post('/api/quizzes', (req, res) => {
  const { id, title, description, category, questions } = req.body;
  const questionsJson = JSON.stringify(questions);
  
  const sql = `INSERT OR REPLACE INTO quizzes (id, title, description, category, questions) VALUES (?, ?, ?, ?, ?)`;
  db.run(sql, [id, title, description, category, questionsJson], function(err) {
    if (err) {
      console.error('Erro POST /api/quizzes:', err.message);
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: 'Quiz salvo com sucesso', id });
  });
});

app.delete('/api/quizzes/:id', (req, res) => {
  const { id } = req.params;
  db.run("DELETE FROM quizzes WHERE id = ?", [id], function(err) {
    if (err) {
      console.error('Erro DELETE /api/quizzes:', err.message);
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: 'Quiz removido', deleted: this.changes });
  });
});

// Health check para o frontend testar a conexão
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', database: 'connected' });
});

// Ouvindo em 0.0.0.0 para aceitar conexões de rede/container
app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🚀 Backend rodando em http://localhost:${PORT}`);
  console.log(`📝 API Base: http://localhost:${PORT}/api`);
  console.log(`Press Ctrl+C to stop\n`);
});
