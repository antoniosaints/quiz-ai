import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useQuiz } from "../contexts/QuizContext";
import { Button } from "../components/Button";
import { QuizCard } from "../components/QuizCard";
import { Pagination } from "../components/Pagination";
import { SearchInput } from "../components/SearchInput";
import { Quiz } from "../types";

const ITEMS_PER_PAGE = 6;

export const Home: React.FC = () => {
  const { quizzes, results, isLoading, error } = useQuiz();
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-6">
            <div className="absolute inset-0 border-4 border-blue-500/20 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-t-blue-500 rounded-full animate-spin"></div>
          </div>
          <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">
            Carregando
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-6 bg-slate-950">
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
    currentPage * ITEMS_PER_PAGE,
  );

  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
    setCurrentPage(1); // Reset to first page on search
  };

  const handleStartQuiz = (quiz: Quiz) => {
    navigate(`/quiz/${quiz.id}`);
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-500">
      <section>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-bold flex items-center">
            <i className="fas fa-database mr-3 text-blue-500"></i>
            Quizzes compartilhados
          </h2>
          {isAdmin && (
            <span className="text-xs text-slate-500 font-medium">
              {filteredQuizzes.length} itens {searchTerm && "(filtrado)"}
            </span>
          )}
        </div>

        {!isAdmin ? (
          <div className="text-center py-20 border-2 border-dashed border-slate-800 rounded-3xl bg-slate-900/30">
            <div className="w-16 h-16 bg-slate-800 text-slate-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-lock text-2xl"></i>
            </div>
            <h3 className="text-white font-bold text-lg mb-2">
              Acesso Restrito
            </h3>
            <p className="text-slate-500 max-w-sm mx-auto mb-6">
              A listagem pública de quizzes está desabilitada. Faça login como
              administrador para ver todos os itens ou use um link direto.
            </p>
            <Button onClick={() => navigate("/login")} variant="primary">
              <i className="fas fa-key mr-2"></i> Área Administrativa
            </Button>
          </div>
        ) : (
          <>
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
          </>
        )}
      </section>

      {isAdmin && results.length > 0 && (
        <section className="bg-slate-900/50 rounded-3xl p-8 border border-slate-800">
          <h2 className="text-lg font-bold mb-6 flex items-center">
            <i className="fas fa-history mr-3 text-blue-500"></i>
            Seu Histórico Local
          </h2>
          <div className="space-y-4">
            {results.map((r) => (
              <div
                key={r.id}
                className="flex justify-between items-center px-4 py-2 bg-slate-900 border border-slate-800 rounded-lg"
              >
                <div>
                  <p className="font-bold text-slate-100">{r.quizTitle}</p>
                  <p className="text-xs text-slate-500">{r.date}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-black text-blue-400">
                    {r.score}/{r.total}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
