
import React, { useState, useEffect, useCallback } from 'react';
import { View, Quiz, QuizResult } from './types';
import { quizService } from './services/quizService';
import { getApiBaseUrl, setApiBaseUrl } from './services/api';
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
  const [customApiUrl, setCustomApiUrl] = useState(getApiBaseUrl());
  const [loginForm, setLoginForm] = useState({ user: '', pass: '' });

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const fetchedQuizzes = await quizService.getQuizzes();
      setQuizzes(fetchedQuizzes);
      setResults(quizService.getResults());
    } catch (err: any) {
      console.error("Falha ao conectar com o backend:", err);
      setError(
        err.code === 'ERR_NETWORK' 
        ? "Erro de Rede: O servidor não foi encontrado ou a conexão foi recusada. Verifique se o backend está rodando."
        : "Erro ao carregar dados: " + (err.message || "Erro desconhecido")
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleUpdateApiUrl = () => {
    setApiBaseUrl(customApiUrl);
    loadData();
  };

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
            <div className="absolute inset-0 flex items-center justify-center text-indigo-500">
               <i className="fas fa-cloud text-xl"></i>
            </div>
          </div>
          <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] animate-pulse">Sincronizando com o Servidor Central</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950 p-6">
        <div className="max-w-xl w-full text-center bg-slate-900 p-10 rounded-[2.5rem] border border-slate-800 shadow-2xl animate-in zoom-in-95 duration-500">
          <div className="w-20 h-20 bg-rose-500/10 text-rose-500 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-rose-500/20">
            <i className="fas fa-server text-3xl"></i>
          </div>
          <h2 className="text-2xl font-black mb-3">Erro de Conexão</h2>
          <p className="text-slate-400 text-sm mb-8 leading-relaxed">{error}</p>
          
          <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 mb-8 text-left">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 block">Configuração do Endpoint</label>
            <div className="flex flex-col md:flex-row gap-2">
              <input 
                type="text" 
                className="flex-1 bg-slate-900 border border-slate-800 p-3 rounded-xl outline-none focus:border-indigo-500 text-sm font-mono text-indigo-400"
                value={customApiUrl}
                onChange={(e) => setCustomApiUrl(e.target.value)}
                placeholder="Ex: http://localhost:3001/api"
              />
              <Button onClick={handleUpdateApiUrl} size="sm">ATUALIZAR</Button>
            </div>
            <p className="text-[9px] text-slate-600 mt-3 font-medium">
              * Se estiver usando um túnel (ngrok), insira a URL pública gerada.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <Button className="w-full py-4" onClick={() => loadData()}>
              <i className="fas fa-sync-alt mr-2"></i> TENTAR NOVAMENTE
            </Button>
            <Button variant="ghost" className="w-full" onClick={() => setError(null)}>
              VOLTAR PARA HOME (MODO OFFLINE)
            </Button>
          </div>
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
            <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse"></span>
            {view === 'HOME' ? 'Central Database Sync' : view === 'ADMIN' ? 'Admin Dashboard' : activeQuiz?.title}
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
                  <i className="fas fa-globe-americas mr-3 text-emerald-500"></i>
                  Quizzes da Comunidade
                </h2>
                <div className="flex gap-2">
                  <span className="text-[9px] bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 px-2 py-1 rounded font-bold uppercase tracking-tighter">
                    API: {new URL(getApiBaseUrl()).hostname}
                  </span>
                </div>
              </div>
              <div className="grid gap-6 md:grid-cols-2">
                {quizzes.map(q => (
                  <QuizCard key={q.id} quiz={q} onClick={handleStartQuiz} />
                ))}
                {quizzes.length === 0 && (
                  <div className="col-span-full py-20 text-center border-2 border-dashed border-slate-900 rounded-3xl">
                    <p className="text-slate-600 font-bold uppercase tracking-widest text-xs">Nenhum quiz encontrado no servidor.</p>
                  </div>
                )}
              </div>
            </section>

            {results.length > 0 && (
              <section className="bg-slate-900/50 rounded-3xl p-8 border border-slate-800">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-bold flex items-center">
                    <i className="fas fa-history mr-3 text-indigo-500"></i>
                    Seu Histórico (Local)
                  </h2>
                  <span className="text-[10px] bg-slate-800 text-slate-500 px-2 py-1 rounded font-bold uppercase">Navegador</span>
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
                  <i className="fas fa-shield-halved text-2xl"></i>
                </div>
                <h2 className="text-xl font-bold">Admin Login</h2>
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
                  CONECTAR AO PAINEL
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
        <p className="text-[10px] text-slate-600 font-black uppercase tracking-[0.2em]">
          Backend: Node.js/Express &bull; Database: Central SQLite &bull; API: Gemini 3
        </p>
      </footer>
    </div>
  );
};

export default App;
