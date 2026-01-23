import React from "react";
import { Quiz } from "../types";

interface QuizCardProps {
  quiz: Quiz;
  onClick: (quiz: Quiz) => void;
}

export const QuizCard: React.FC<QuizCardProps> = ({ quiz, onClick }) => {
  return (
    <div
      onClick={() => onClick(quiz)}
      className="group bg-slate-900 border border-slate-800 p-6 rounded-2xl cursor-pointer hover:bg-slate-800/80 hover:border-indigo-500/50 transition-all duration-300"
    >
      <div className="flex justify-between items-start mb-3">
        <span className="text-[10px] uppercase tracking-widest font-bold text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded">
          {quiz.category}
        </span>
        <span className="text-xs text-slate-500">
          {quiz.questions.length} Questões
        </span>
      </div>
      <h3 className="text-lg font-bold text-slate-100 mb-2 group-hover:text-indigo-400 transition-colors">
        {quiz.title}
      </h3>
      <p className="text-sm text-slate-400 line-clamp-2 leading-relaxed">
        {quiz.description}
      </p>
      <div className="mt-6 flex items-center justify-between">
        <div className="text-indigo-500 font-bold text-sm flex items-center">
          Começar Quiz{" "}
          <i className="fas fa-arrow-right ml-2 group-hover:translate-x-1 transition-transform"></i>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            const url = `${window.location.origin}?quizId=${quiz.id}`;
            navigator.clipboard.writeText(url);
            alert("Link copiado para a área de transferência!");
          }}
          className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-800 text-slate-400 hover:bg-indigo-500 hover:text-white transition-all"
          title="Compartilhar Quiz"
        >
          <i className="fas fa-share-alt"></i>
        </button>
      </div>
    </div>
  );
};
