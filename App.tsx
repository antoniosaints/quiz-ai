
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
    } catch (err) {
      console.error("Falha ao carregar dados do banco global:", err);
      setError("Não foi possível conectar ao banco de dados global. Verifique sua conexão.");
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
    // Recarrega apenas resultados para manter performance
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
          <div className="relative w-16 h-16 mx-auto mb-6">
            <div className="absolute inset-0 border-4 border-emerald-500/10 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-t-emerald-500 rounded-full animate-spin"></div>
          </div>
          <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Conectando ao Banco Global SQLite</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950 p-6">
        <div className="max-w-md text-center bg-slate-900 p-8 rounded-3xl border border-rose-500/30">
          <i className="fas fa-database text-rose-500 text-4xl mb-4"></i>
          <h2 className="text-xl font-bold mb-2">Erro de Conexão</h2>
          <p className="text-slate-400 text-sm mb-6">{error}</p>
          <Button onClick={() => window.location.reload()}>Tentar Reconectar</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 md:py-12">
      {/* Header */}
      <header className="flex justify-between items-center mb-12 animate-in fade-in slide-in-from-top-4 duration-700">
        <div>
          <h1 
            className="text-2xl font-black text-white cursor-pointer hover:text-indigo-500 transition-colors"
            onClick={() => setView('HOME')}
          >
            QUIZ<span className="text-indigo-500">MASTER</span>
          </h1>
          <p className="text-xs text-slate-500 uppercase tracking-widest font-bold mt-1">
            {view === 'HOME' ? 'Dashboard Global' : view === 'ADMIN' ? 'Gestor de Conteúdo' : activeQuiz?.title}
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

      {/* Views */}
      <main>
        {view === 'HOME' && (
          <div className="space-y-12 animate-in fade-in duration-500">
            <section>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold flex items-center">
                  <i className="fas fa-globe-americas mr-3 text-emerald-500"></i>
                  Quizzes da Comunidade
                </h2>
                <span className="text-[10px] text-slate-600 font-black uppercase border border-slate-800 px-2 py-1 rounded">SQLite Global Mode</span>
              </div>
              <div className="grid gap-6 md:grid-cols-2">
                {quizzes.map(q => (
                  <QuizCard key={q.id} quiz={q} onClick={handleStartQuiz} />
                ))}
                {quizzes.length === 0 && (
                  <div className="col-span-full py-20 text-center border-2 border-dashed border-slate-900 rounded-3xl">
                    <p className="text-slate-600 font-bold uppercase tracking-widest text-xs">Aguardando novos conteúdos globais...</p>
                  </div>
                )}
              </div>
            </section>

            {results.length > 0 && (
              <section className="bg-slate-900/50 rounded-3xl p-8 border border-slate-800">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-bold flex items-center">
                    <i className="fas fa-user-circle mr-3 text-indigo-500"></i>
                    Meu Desempenho Local
                  </h2>
                  <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-1 rounded font-bold uppercase">Armazenamento Privado</span>
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
                        <p className="text-[10px] text-slate-500 uppercase font-bold tracking-tighter">Acertos</p>
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
                  <i className="fas fa-shield-halved text-2xl"></i>
                </div>
                <h2 className="text-xl font-bold">Acesso Administrador</h2>
                <p className="text-sm text-slate-500 mt-1">Gerencie o banco de dados central</p>
              </div>
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase px-1">Usuário</label>
                  <input 
                    type="text" 
                    placeholder="admin"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none p-3 rounded-xl transition-all"
                    value={loginForm.user}
                    onChange={e => setLoginForm(prev => ({ ...prev, user: e.target.value }))}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase px-1">Senha</label>
                  <input 
                    type="password" 
                    placeholder="••••••••"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none p-3 rounded-xl transition-all"
                    value={loginForm.pass}
                    onChange={e => setLoginForm(prev => ({ ...prev, pass: e.target.value }))}
                  />
                </div>
                <Button className="w-full py-4 mt-4" type="submit">
                  AUTENTICAR NO PAINEL
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
        <p className="text-xs text-slate-600 font-bold uppercase tracking-widest">
          Arquitetura Híbrida: SQLite Global Content &bull; LocalStorage Personal History
        </p>
      </footer>
    </div>
  );
};

export default App;
