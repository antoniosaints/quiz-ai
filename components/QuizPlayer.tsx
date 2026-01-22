
import React, { useState, useEffect, useMemo } from 'react';
import { Quiz, QuizResult } from '../types';
import { Button } from './Button';

interface QuizPlayerProps {
  quiz: Quiz;
  onFinish: (result: QuizResult) => void;
  onCancel: () => void;
}

export const QuizPlayer: React.FC<QuizPlayerProps> = ({ quiz, onFinish, onCancel }) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<(string | null)[]>([]);

  // Shuffle logic on mount
  const shuffledQuestions = useMemo(() => {
    return [...quiz.questions].sort(() => Math.random() - 0.5).map(q => ({
      ...q,
      options: [...q.options].sort(() => Math.random() - 0.5)
    }));
  }, [quiz]);

  useEffect(() => {
    setAnswers(new Array(quiz.questions.length).fill(null));
  }, [quiz]);

  const handleSelect = (optionId: string) => {
    const newAnswers = [...answers];
    newAnswers[currentIdx] = optionId;
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentIdx < shuffledQuestions.length - 1) {
      setCurrentIdx(currentIdx + 1);
    } else {
      finishQuiz();
    }
  };

  const handlePrev = () => {
    if (currentIdx > 0) {
      setCurrentIdx(currentIdx - 1);
    }
  };

  const finishQuiz = () => {
    let score = 0;
    shuffledQuestions.forEach((q, idx) => {
      const selectedId = answers[idx];
      const selectedOption = q.options.find(o => o.id === selectedId);
      if (selectedOption?.isCorrect) {
        score++;
      }
    });

    onFinish({
      id: Math.random().toString(36).substr(2, 9),
      quizId: quiz.id,
      quizTitle: quiz.title,
      score,
      total: quiz.questions.length,
      date: new Date().toLocaleDateString('pt-BR')
    });
  };

  const currentQuestion = shuffledQuestions[currentIdx];
  const progress = ((currentIdx + 1) / shuffledQuestions.length) * 100;

  return (
    <div className="max-w-2xl mx-auto py-8 animate-in slide-in-from-right-4 duration-500">
      {/* Progress */}
      <div className="mb-10">
        <div className="flex justify-between items-end mb-3">
          <span className="text-xs font-black text-indigo-500 uppercase tracking-widest">
            Pergunta {currentIdx + 1} de {shuffledQuestions.length}
          </span>
          <span className="text-sm font-bold text-slate-400">
            {Math.round(progress)}% Completo
          </span>
        </div>
        <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800">
          <div 
            className="h-full bg-indigo-600 transition-all duration-500 ease-out shadow-[0_0_15px_rgba(79,70,229,0.5)]" 
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      {/* Question */}
      <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl mb-8">
        <h2 className="text-xl md:text-2xl font-bold leading-relaxed mb-10 text-slate-100">
          {currentQuestion.text}
        </h2>

        <div className="space-y-4">
          {currentQuestion.options.map((option, i) => {
            const isSelected = answers[currentIdx] === option.id;
            const letter = String.fromCharCode(65 + i);
            return (
              <button
                key={option.id}
                onClick={() => handleSelect(option.id)}
                className={`
                  w-full text-left p-5 rounded-2xl border-2 transition-all duration-200 flex items-center group
                  ${isSelected 
                    ? 'bg-indigo-600/10 border-indigo-500 text-indigo-400' 
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'}
                `}
              >
                <span className={`
                  w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs mr-4 transition-colors
                  ${isSelected ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-500 group-hover:bg-slate-700 group-hover:text-slate-300'}
                `}>
                  {letter}
                </span>
                <span className="font-medium">{option.text}</span>
                {isSelected && (
                  <i className="fas fa-check-circle ml-auto text-indigo-500"></i>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center bg-slate-900/50 backdrop-blur-md p-4 rounded-3xl border border-slate-800 sticky bottom-10">
        <Button variant="ghost" onClick={handlePrev} disabled={currentIdx === 0}>
          <i className="fas fa-arrow-left mr-2"></i> Anterior
        </Button>
        
        <div className="text-xs text-slate-600 font-bold uppercase tracking-widest hidden md:block">
          Sessão Segura
        </div>

        <Button 
          variant={currentIdx === shuffledQuestions.length - 1 ? 'success' : 'primary'}
          onClick={handleNext}
          disabled={answers[currentIdx] === null}
        >
          {currentIdx === shuffledQuestions.length - 1 ? 'Finalizar Quiz' : 'Próxima'} <i className="fas fa-arrow-right ml-2"></i>
        </Button>
      </div>

      <div className="text-center mt-8">
        <button 
          onClick={onCancel}
          className="text-slate-600 hover:text-rose-500 text-xs font-bold uppercase tracking-widest transition-colors"
        >
          Desistir deste Quiz
        </button>
      </div>
    </div>
  );
};
