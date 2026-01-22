
import React, { useState, useEffect, useCallback } from 'react';
import { View, Quiz, QuizResult } from './types';
import { quizService } from './services/quizService';
import { Button } from './components/Button';
import { QuizCard } from './components/QuizCard';
import { QuizPlayer } from './components/QuizPlayer';
import { AdminPanel } from './components/AdminPanel';

const App: React.FC = () => {
  const [view, setView] = useState<View>('HOME');
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [results, setResults] = useState<QuizResult[]>([]);
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loginForm, setLoginForm] = useState({ user: '', pass: '' });

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const fetchedQuizzes = await quizService.getQuizzes();
      setQuizzes(fetchedQuizzes);
      setResults(quizService.getResults());
    } catch (err: any) {
      console.error("Falha ao carregar SQLite:", err);
      setError("Não foi possível carregar o banco de dados SQLite WASM.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    const token = sessionStorage.getItem('adminToken');
    if (token) setIsAdmin(true);
  }, [loadData]);

  const handleStartQuiz = (quiz: Quiz) => {
    setActiveQuiz(quiz);
    setView('QUIZ_PLAYER');
  };

  const handleFinishQuiz = (result: QuizResult) => {
    quizService.saveResult(result);
    setResults(quizService.getResults());
    setView('HOME');
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginForm.user === 'admin' && loginForm.pass === 'admin') {
      setIsAdmin(true);
      sessionStorage.setItem('adminToken', 'mock-token-123');
      setView('ADMIN');
    } else {
      alert('Credenciais inválidas! (Dica: admin/admin)');
    }
  };

  const handleLogout = () => {
    setIsAdmin(false);
    sessionStorage.removeItem('adminToken');
    setView('HOME');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950">
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 border-4 border-indigo-500/10 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-t-indigo-500 rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <i className="fas fa-database text-indigo-500"></i>
            </div>
          </div>
          <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] animate-pulse">Iniciando SQLite WASM Engine</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950 p-6">
        <div className="max-w-md text-center bg-slate-900 p-8 rounded-3xl border border-rose-500/30">
          <i className="fas fa-exclamation-triangle text-rose-500 text-4xl mb-4"></i>
          <h2 className="text-xl font-bold mb-2">Erro de Inicialização</h2>
          <p className="text-slate-400 text-sm mb-6">{error}</p>
          <Button onClick={() => window.location.reload()}>Tentar Novamente</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 md:py-12">
      <header className="flex justify-between items-center mb-12 animate-in fade-in slide-in-from-top-4 duration-700">
        <div>
          <h1 
            className="text-2xl font-black text-white cursor-pointer hover:text-indigo-500 transition-colors"
            onClick={() => setView('HOME')}
          >
            QUIZ<span className="text-indigo-500">MASTER</span>
          </h1>
          <p className="text-[10px] text-slate-500 uppercase tracking-widest font-black mt-1 flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
            {view === 'HOME' ? 'SQLite Native Engine' : view === 'ADMIN' ? 'SQL Dashboard' : activeQuiz?.title}
          </p>
        </div>
        <div className="flex gap-3">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setView('HOME')} 
            title="Início"
          >
            <i className="fas fa-home text-lg"></i>
          </Button>
          {!isAdmin ? (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setView('LOGIN')}
              title="Admin"
            >
              <i className="fas fa-lock text-lg"></i>
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button 
                variant="secondary" 
                size="sm" 
                onClick={() => setView('ADMIN')}
              >
                ADMIN
              </Button>
              <Button 
                variant="danger" 
                size="sm" 
                onClick={handleLogout}
              >
                SAIR
              </Button>
            </div>
          )}
        </div>
      </header>

      <main>
        {view === 'HOME' && (
          <div className="space-y-12 animate-in fade-in duration-500">
            <section>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold flex items-center">
                  <i className="fas fa-layer-group mr-3 text-emerald-500"></i>
                  Quizzes Disponíveis (SQL)
                </h2>
                <div className="flex gap-2">
                  <span className="text-[9px] bg-slate-900 border border-slate-800 text-slate-500 px-2 py-1 rounded font-bold uppercase">WASM Core</span>
                  <span className="text-[9px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 px-2 py-1 rounded font-bold uppercase">DB Online</span>
                </div>
              </div>
              <div className="grid gap-6 md:grid-cols-2">
                {quizzes.map(q => (
                  <QuizCard key={q.id} quiz={q} onClick={handleStartQuiz} />
                ))}
                {quizzes.length === 0 && (
                  <div className="col-span-full py-20 text-center border-2 border-dashed border-slate-900 rounded-3xl">
                    <p className="text-slate-600 font-bold uppercase tracking-widest text-xs">Aguardando dados da tabela 'quizzes'...</p>
                  </div>
                )}
              </div>
            </section>

            {results.length > 0 && (
              <section className="bg-slate-900/50 rounded-3xl p-8 border border-slate-800">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-bold flex items-center">
                    <i className="fas fa-history mr-3 text-indigo-500"></i>
                    Histórico Recente
                  </h2>
                  <span className="text-[10px] bg-slate-800 text-slate-500 px-2 py-1 rounded font-bold uppercase">LocalStorage Cache</span>
                </div>
                <div className="space-y-4">
                  {results.map(r => (
                    <div key={r.id} className="flex justify-between items-center p-4 bg-slate-900 border border-slate-800 rounded-xl hover:border-indigo-500/30 transition-colors">
                      <div>
                        <p className="font-bold text-slate-100">{r.quizTitle}</p>
                        <p className="text-xs text-slate-500">{r.date}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-black text-indigo-400">{r.score}/{r.total}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}

        {view === 'LOGIN' && (
          <div className="flex flex-col items-center justify-center py-20 animate-in slide-in-from-bottom-4 duration-500">
            <div className="bg-slate-900 p-8 rounded-3xl border border-slate-800 w-full max-w-sm shadow-2xl">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-indigo-500/10 text-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-indigo-500/20">
                  <i className="fas fa-terminal text-2xl"></i>
                </div>
                <h2 className="text-xl font-bold">SQL Authentication</h2>
                <p className="text-sm text-slate-500 mt-1">Acesse as tabelas do sistema</p>
              </div>
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase px-1">DB User</label>
                  <input 
                    type="text" 
                    placeholder="admin"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none p-3 rounded-xl transition-all"
                    value={loginForm.user}
                    onChange={e => setLoginForm(prev => ({ ...prev, user: e.target.value }))}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase px-1">Secret</label>
                  <input 
                    type="password" 
                    placeholder="••••••••"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none p-3 rounded-xl transition-all"
                    value={loginForm.pass}
                    onChange={e => setLoginForm(prev => ({ ...prev, pass: e.target.value }))}
                  />
                </div>
                <Button className="w-full py-4 mt-4" type="submit">
                  ESTABELECER CONEXÃO
                </Button>
              </form>
            </div>
          </div>
        )}

        {view === 'QUIZ_PLAYER' && activeQuiz && (
          <QuizPlayer 
            quiz={activeQuiz} 
            onFinish={handleFinishQuiz} 
            onCancel={() => setView('HOME')} 
          />
        )}

        {view === 'ADMIN' && (
          <AdminPanel 
            onUpdate={() => { loadData(); setView('HOME'); }} 
            onCancel={() => setView('HOME')}
          />
        )}
      </main>

      <footer className="mt-20 pt-12 border-t border-slate-900 text-center">
        <div className="flex justify-center gap-6 mb-4">
          <i className="fab fa-react text-slate-800 text-xl"></i>
          <i className="fas fa-database text-slate-800 text-xl"></i>
          <i className="fab fa-google text-slate-800 text-xl"></i>
        </div>
        <p className="text-[10px] text-slate-600 font-black uppercase tracking-[0.2em]">
          Engine: SQLite v3.45.0 WASM &bull; Logic: Google Gemini 1.3
        </p>
      </footer>
    </div>
  );
};

export default App;
