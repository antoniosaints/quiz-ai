import React from "react";
import { Quiz } from "../types";

interface QuizCardProps {
  quiz: Quiz;
  onClick: (quiz: Quiz) => void;
}

export const QuizCard: React.FC<QuizCardProps> = ({ quiz, onClick }) => {
  const handleCopyLink = () => {
    const url = `${quiz.title}, basta clicar no link abaixo:\n\n*${window.location.origin}/quiz/${quiz.id}*`;

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard
        .writeText(url)
        .then(() => alert("Link copiado para a área de transferência!"))
        .catch(() => alert("Erro ao copiar o link."));
    } else {
      alert(
        "Seu navegador ou o ambiente não suporta a função de copiar para a área de transferência.",
      );
    }
  };
  return (
    <div className="group bg-slate-900 border border-slate-800 p-6 rounded-2xl hover:bg-slate-800/80 hover:border-blue-500/50 transition-all duration-300">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase tracking-widest font-bold text-blue-400 bg-blue-500/10 px-2 py-1 rounded">
            {quiz.category}
          </span>
          {quiz.timeLimit && (
            <span className="text-[10px] uppercase tracking-widest font-bold text-purple-400 bg-purple-500/10 px-2 py-1 rounded">
              {quiz.timeLimit} min
            </span>
          )}
        </div>
        <span className="text-xs text-slate-500">
          {quiz.questions.length} Questões
        </span>
      </div>
      <h3 className="text-lg font-bold text-slate-100 mb-2 group-hover:text-blue-400 transition-colors">
        {quiz.title}
      </h3>
      <p className="text-sm text-slate-400 line-clamp-2 leading-relaxed">
        {quiz.description}
      </p>
      <div className="mt-6 flex items-center justify-between">
        <div
          onClick={() => onClick(quiz)}
          className="text-blue-500 cursor-pointer font-bold text-sm flex items-center"
        >
          Começar Quiz{" "}
          <i className="fas fa-arrow-right ml-2 group-hover:translate-x-1 transition-transform"></i>
        </div>
        <button
          onClick={handleCopyLink}
          className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-800 text-slate-400 hover:bg-blue-500 hover:text-white transition-all"
          title="Compartilhar Quiz"
        >
          <i className="fas fa-share-alt"></i>
        </button>
      </div>
    </div>
  );
};
