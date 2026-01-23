import React, { useState, useEffect, useCallback } from "react";
import { View, Quiz, QuizResult } from "./types";
import { quizService } from "./services/quizService";
import { Button } from "./components/Button";
import { QuizCard } from "./components/QuizCard";
import { QuizPlayer } from "./components/QuizPlayer";
import { AdminPanel } from "./components/AdminPanel";
import { SearchInput } from "./components/SearchInput";
import { Pagination } from "./components/Pagination";

const ITEMS_PER_PAGE = 6;

const App: React.FC = () => {
  const [view, setView] = useState<View>("HOME");
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [results, setResults] = useState<QuizResult[]>([]);
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);
  const [isSharedMode, setIsSharedMode] = useState(false);
  const [playerKey, setPlayerKey] = useState(0); // Key to force remount of QuizPlayer
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loginForm, setLoginForm] = useState({ user: "", pass: "" });
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const fetchedQuizzes = await quizService.getQuizzes();
      setQuizzes(fetchedQuizzes);
      setResults(quizService.getResults());

      // Checa se o link compartilhado contém um quizId
      const params = new URLSearchParams(window.location.search);
      const sharedId = params.get("quizId");
      if (sharedId) {
        const sharedQuiz = fetchedQuizzes.find((q) => q.id === sharedId);
        if (sharedQuiz) {
          setActiveQuiz(sharedQuiz);
          setView("QUIZ_PLAYER");
          setIsSharedMode(true);
          // NÃO limpamos a URL no modo compartilhado para permitir refresh
        }
      }
    } catch (err) {
      console.error("Falha ao carregar dados:", err);
      setError(
        "Não foi possível conectar ao servidor SQLite. Verifique se o backend está rodando."
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    const token = sessionStorage.getItem("adminToken");
    if (token) setIsAdmin(true);
  }, [loadData]);

  const handleStartQuiz = (quiz: Quiz) => {
    setActiveQuiz(quiz);
    setView("QUIZ_PLAYER");
    setPlayerKey((prev) => prev + 1);
  };

  const handleFinishQuiz = (result: QuizResult) => {
    quizService.saveResult(result);
    // Recarrega dados para atualizar histórico local se necessário
    setResults(quizService.getResults());

    if (isSharedMode) {
      // No modo compartilhado, reiniciar o quiz
      setPlayerKey((prev) => prev + 1);
    } else {
      setView("HOME");
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginForm.user === "admin" && loginForm.pass === "admin") {
      setIsAdmin(true);
      sessionStorage.setItem("adminToken", "mock-token-123");
      setView("ADMIN");
    } else {
      alert("Credenciais inválidas! (Dica: admin/admin)");
    }
  };

  const handleLogout = () => {
    setIsAdmin(false);
    sessionStorage.removeItem("adminToken");
    setView("HOME");
  };

  // Filter Logic
  const filteredQuizzes = quizzes.filter((q) => {
    const term = searchTerm.toLowerCase();
    return (
      q.title.toLowerCase().includes(term) ||
      q.category.toLowerCase().includes(term) ||
      q.description.toLowerCase().includes(term)
    );
  });

  // Pagination Logic
  const totalPages = Math.ceil(filteredQuizzes.length / ITEMS_PER_PAGE);
  const currentQuizzes = filteredQuizzes.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
    setCurrentPage(1); // Reset to first page on search
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-6">
            <div className="absolute inset-0 border-4 border-indigo-500/20 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-t-indigo-500 rounded-full animate-spin"></div>
          </div>
          <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">
            Conectando ao SQLite Central
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950 p-6">
        <div className="max-w-md text-center bg-slate-900 p-8 rounded-3xl border border-rose-500/30 shadow-2xl">
          <i className="fas fa-server text-rose-500 text-4xl mb-4"></i>
          <h2 className="text-xl font-bold mb-2 text-white">
            Erro de Banco de Dados
          </h2>
          <p className="text-slate-400 text-sm mb-6">{error}</p>
          <Button onClick={() => window.location.reload()}>
            Tentar Reconectar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 md:py-12">
      <header className="flex justify-between items-center mb-12 animate-in fade-in slide-in-from-top-4 duration-700">
        <div>
          <h1
            className={`text-2xl font-black text-white transition-colors ${
              !isSharedMode ? "cursor-pointer hover:text-indigo-500" : ""
            }`}
            onClick={() => !isSharedMode && setView("HOME")}
          >
            QUIZ<span className="text-indigo-500">MASTER</span>
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">
              {isSharedMode
                ? "Sessão Compartilhada"
                : "SQLite Cloud Link Active"}
            </p>
          </div>
        </div>

        {!isSharedMode && (
          <div className="flex gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setView("HOME")}
              title="Início"
            >
              <i className="fas fa-home text-lg"></i>
            </Button>
            {!isAdmin ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setView("LOGIN")}
                title="Admin"
              >
                <i className="fas fa-lock text-lg"></i>
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setView("ADMIN")}
                >
                  ADMIN
                </Button>
                <Button variant="danger" size="sm" onClick={handleLogout}>
                  SAIR
                </Button>
              </div>
            )}
          </div>
        )}
      </header>

      <main>
        {/* ... (Home view logic unchanged) ... */}
        {view === "HOME" && (
          <div className="space-y-12 animate-in fade-in duration-500">
            <section>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold flex items-center">
                  <i className="fas fa-database mr-3 text-indigo-500"></i>
                  Quizzes no SQLite Central
                </h2>
                <span className="text-xs text-slate-500 font-medium">
                  {filteredQuizzes.length} itens {searchTerm && "(filtrado)"}
                </span>
              </div>

              <div className="mb-8 max-w-md">
                <SearchInput
                  value={searchTerm}
                  onChange={handleSearchChange}
                  placeholder="Buscar por título, categoria..."
                />
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                {currentQuizzes.map((q) => (
                  <QuizCard key={q.id} quiz={q} onClick={handleStartQuiz} />
                ))}
                {currentQuizzes.length === 0 && (
                  <div className="col-span-full py-20 text-center border-2 border-dashed border-slate-800 rounded-3xl">
                    <p className="text-slate-500">
                      {searchTerm
                        ? "Nenhum quiz encontrado para sua busca."
                        : "Nenhum quiz no banco de dados."}
                    </p>
                  </div>
                )}
              </div>

              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </section>

            {results.length > 0 && (
              <section className="bg-slate-900/50 rounded-3xl p-8 border border-slate-800">
                <h2 className="text-lg font-bold mb-6 flex items-center">
                  <i className="fas fa-history mr-3 text-indigo-500"></i>
                  Seu Histórico Local
                </h2>
                <div className="space-y-4">
                  {results.map((r) => (
                    <div
                      key={r.id}
                      className="flex justify-between items-center p-4 bg-slate-900 border border-slate-800 rounded-xl"
                    >
                      <div>
                        <p className="font-bold text-slate-100">
                          {r.quizTitle}
                        </p>
                        <p className="text-xs text-slate-500">{r.date}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-black text-indigo-400">
                          {r.score}/{r.total}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}

        {view === "LOGIN" && (
          <div className="flex flex-col items-center justify-center py-20 animate-in slide-in-from-bottom-4 duration-500">
            <div className="bg-slate-900 p-8 rounded-3xl border border-slate-800 w-full max-w-sm shadow-xl">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-indigo-500/10 text-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-indigo-500/20">
                  <i className="fas fa-user-shield text-2xl"></i>
                </div>
                <h2 className="text-xl font-bold">Acesso Administrador</h2>
                <p className="text-sm text-slate-500 mt-1">
                  Gerencie o banco de dados SQLite
                </p>
              </div>
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase px-1">
                    Usuário
                  </label>
                  <input
                    type="text"
                    placeholder="admin"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none p-3 rounded-xl transition-all"
                    value={loginForm.user}
                    onChange={(e) =>
                      setLoginForm((prev) => ({
                        ...prev,
                        user: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase px-1">
                    Senha
                  </label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none p-3 rounded-xl transition-all"
                    value={loginForm.pass}
                    onChange={(e) =>
                      setLoginForm((prev) => ({
                        ...prev,
                        pass: e.target.value,
                      }))
                    }
                  />
                </div>
                <Button className="w-full py-4 mt-4" type="submit">
                  ACESSAR BANCO DE DADOS
                </Button>
              </form>
            </div>
          </div>
        )}

        {view === "QUIZ_PLAYER" && activeQuiz && (
          <QuizPlayer
            key={playerKey}
            quiz={activeQuiz}
            onFinish={handleFinishQuiz}
            onCancel={() => !isSharedMode && setView("HOME")}
            exitLabel={isSharedMode ? "Reiniciar Quiz" : "Voltar ao Menu"}
          />
        )}

        {view === "ADMIN" && (
          <AdminPanel
            onUpdate={() => {
              loadData();
              setView("HOME");
            }}
            onCancel={() => setView("HOME")}
          />
        )}
      </main>

      <footer className="mt-20 pt-12 border-t border-slate-900 text-center">
        <p className="text-[10px] text-slate-600 font-black uppercase tracking-[0.2em]">
          Engine: Node.js + SQLite3 &bull; AI Core: Gemini 3 Flash
        </p>
      </footer>
    </div>
  );
};

export default App;
