import React, { useState, useEffect, useMemo } from "react";
import { Quiz, QuizResult } from "../types";
import { Button } from "./Button";

interface QuizPlayerProps {
  quiz: Quiz;
  onFinish: (result: QuizResult) => void;
  onCancel: () => void;
  exitLabel?: string;
}

export const QuizPlayer: React.FC<QuizPlayerProps> = ({
  quiz,
  onFinish,
  onCancel,
  exitLabel = "Voltar ao Menu",
}) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<(string | null)[]>([]);
  const [result, setResult] = useState<QuizResult | null>(null);

  // New State: Has the quiz started?
  const [hasStarted, setHasStarted] = useState(false);

  // Timer State (in seconds)
  const [timeLeft, setTimeLeft] = useState<number | null>(
    quiz.timeLimit ? quiz.timeLimit * 60 : null,
  );

  // Shuffle logic on mount
  const shuffledQuestions = useMemo(() => {
    return [...quiz.questions]
      .sort(() => Math.random() - 0.5)
      .map((q) => ({
        ...q,
        options: [...q.options].sort(() => Math.random() - 0.5),
      }));
  }, [quiz]);

  useEffect(() => {
    setAnswers(new Array(quiz.questions.length).fill(null));
  }, [quiz]);

  // Timer Effect
  useEffect(() => {
    if (!hasStarted || timeLeft === null || result) return;

    if (timeLeft === 0) {
      finishQuiz();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev !== null ? prev - 1 : null));
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, result, hasStarted]);

  // Anti-Cheat (Visibility)
  useEffect(() => {
    if (!hasStarted || result) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        alert(
          "⚠️ Mudança de aba detectada! A pergunta foi pulada como penalidade.",
        );

        const newAnswers = [...answers];
        newAnswers[currentIdx] = "PENALTY";
        setAnswers(newAnswers);

        if (currentIdx < shuffledQuestions.length - 1) {
          setCurrentIdx((prev) => prev + 1);
        } else {
          finishQuiz();
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [currentIdx, shuffledQuestions, result, answers, hasStarted]);

  // Anti-Cheat (Mouse Leave)
  useEffect(() => {
    if (!hasStarted || result) return;

    const handleMouseLeave = (e: MouseEvent) => {
      // Check if mouse actually left the window (relatedTarget is null)
      if (e.relatedTarget === null) {
        // Warning first? User requested: "informe que caso o foco da tela seja perdido, o usuario perde a questão por penalização"
        // The requirement says: "agora vamos implementar a tela de aviso antes do quiz iniciar"
        // And previously: "avise o usuario, caso ele confirme que quer sair, penalize"

        const confirmed = window.alert(
          "⚠️ ALERTA DE FOCO ⚠️\n\nVocê tirou o mouse da janela do quiz. Isso é considerado suspeito.\n\nPor motivos de didática, a pergunta será penalizada.",
        );

        const newAnswers = [...answers];
        newAnswers[currentIdx] = "PENALTY";
        setAnswers(newAnswers);

        if (currentIdx < shuffledQuestions.length - 1) {
          setCurrentIdx((prev) => prev + 1);
        } else {
          finishQuiz();
        }
      }
    };

    document.body.addEventListener("mouseleave", handleMouseLeave);
    return () =>
      document.body.removeEventListener("mouseleave", handleMouseLeave);
  }, [currentIdx, shuffledQuestions, result, answers, hasStarted]);

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

  const restartQuiz = () => {
    setCurrentIdx(0);
    setAnswers(new Array(quiz.questions.length).fill(null));
    setResult(null);
    setHasStarted(false);
    setTimeLeft(quiz.timeLimit ? quiz.timeLimit * 60 : null);
  };

  const handlePrev = () => {
    if (currentIdx > 0) {
      // Check if previous question was a penalty
      if (answers[currentIdx - 1] === "PENALTY") {
        alert("Você não pode voltar para uma questão penalizada.");
        return;
      }
      setCurrentIdx(currentIdx - 1);
    }
  };

  const finishQuiz = () => {
    let score = 0;
    shuffledQuestions.forEach((q, idx) => {
      const selectedId = answers[idx];
      const selectedOption = q.options.find((o) => o.id === selectedId);
      if (selectedOption?.isCorrect) {
        score++;
      }
    });

    setResult({
      id: Math.random().toString(36).substr(2, 9),
      quizId: quiz.id,
      quizTitle: quiz.title,
      score,
      total: quiz.questions.length,
      date: new Date().toLocaleDateString("pt-BR"),
    });
  };

  // Format Timer
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (result) {
    // ... result view (kept same, just updating implementation below)
    const percentage = Math.round((result.score / result.total) * 100);
    let message = "";
    let icon = "";
    let color = "";

    if (percentage === 100) {
      message = "Perfeito! Você dominou o assunto!";
      icon = "fa-trophy";
      color = "text-yellow-400";
    } else if (percentage >= 70) {
      message = "Ótimo trabalho! Você tem um bom conhecimento.";
      icon = "fa-star";
      color = "text-emerald-400";
    } else if (percentage >= 50) {
      message = "Bom esforço! Mas ainda há espaço para melhorar.";
      icon = "fa-thumbs-up";
      color = "text-blue-400";
    } else {
      message = "Continue estudando! Não desista.";
      icon = "fa-book-open";
      color = "text-slate-400";
    }

    return (
      <div className="max-w-xl mx-auto py-12 animate-in zoom-in-95 duration-500">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center shadow-2xl relative overflow-hidden">
          {/* Background Decoration */}
          <div
            className={`absolute top-0 inset-x-0 h-2 bg-gradient-to-r ${
              percentage >= 70
                ? "from-emerald-500 to-teal-500"
                : "from-blue-500 to-purple-500"
            }`}
          ></div>

          <div className="mb-8">
            <div
              className={`w-24 h-24 mx-auto rounded-full bg-slate-950 border-4 border-slate-800 flex items-center justify-center mb-6`}
            >
              <i className={`fas ${icon} text-4xl ${color} animate-bounce`}></i>
            </div>
            <h2 className="text-3xl font-black text-white mb-2">
              Quiz Completado!
            </h2>
            <p className="text-slate-400">{message}</p>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
              <p className="text-xs text-slate-500 font-bold uppercase">
                Acertos
              </p>
              <p className="text-3xl font-bold text-white">
                {result.score}
                <span className="text-lg text-slate-600">/{result.total}</span>
              </p>
            </div>
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
              <p className="text-xs text-slate-500 font-bold uppercase">
                Precisão
              </p>
              <p
                className={`text-3xl font-bold ${
                  percentage >= 70 ? "text-emerald-400" : "text-blue-400"
                }`}
              >
                {percentage}%
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <Button
              onClick={() => onFinish(result)}
              className="w-full py-4 text-lg"
            >
              {exitLabel}{" "}
              <i
                className={`fas ${
                  exitLabel.includes("Voltar") ? "fa-home" : "fa-redo"
                } ml-2`}
              ></i>
            </Button>
            <Button
              onClick={() => restartQuiz()}
              className="w-full py-4 text-lg bg-orange-700 hover:bg-orange-800"
            >
              Reiniciar Quiz
              <i className={`fas fa-redo ml-2`}></i>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Pre-Quiz Warning Modal
  if (!hasStarted) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-300">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 max-w-md w-full shadow-2xl relative">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-rose-500/10 text-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-rose-500/20">
              <i className="fas fa-exclamation-triangle text-2xl animate-pulse"></i>
            </div>
            <h2 className="text-xl font-bold text-white mb-2">
              Regras de Anti-Cheat
            </h2>
            <p className="text-slate-400 text-sm">
              Para garantir a integridade do quiz, implementamos algumas regras
              de segurança.
            </p>
          </div>

          <div className="space-y-4 mb-8">
            <div className="flex gap-4 items-start bg-slate-950 p-4 rounded-xl border border-slate-800">
              <i className="fas fa-eye text-blue-500 mt-1"></i>
              <div>
                <h4 className="font-bold text-slate-200 text-sm">
                  Foco na Janela
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  Se você <strong>mudar de aba</strong> ou{" "}
                  <strong>minimizar</strong>, a questão atual será pulada como
                  penalidade.
                </p>
              </div>
            </div>
            <div className="flex gap-4 items-start bg-slate-950 p-4 rounded-xl border border-slate-800">
              <i className="fas fa-mouse-pointer text-blue-500 mt-1"></i>
              <div>
                <h4 className="font-bold text-slate-200 text-sm">
                  Cursor na Tela
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  Se você <strong>tirar o mouse</strong> da área do quiz, você
                  receberá um alerta e poderá ser penalizado.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <Button
              className="w-full bg-green-700 py-4 shadow-none hover:scale-105 transition-all duration-200 text-white border-green-500/30 hover:bg-green-500/80"
              onClick={() => setHasStarted(true)}
            >
              ENTENDI, INICIAR QUIZ
            </Button>
            <Button variant="ghost" className="w-full" onClick={onCancel}>
              Cancelar
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = shuffledQuestions[currentIdx];
  const progress = ((currentIdx + 1) / shuffledQuestions.length) * 100;

  return (
    <div className="max-w-2xl mx-auto py-8 animate-in slide-in-from-right-4 duration-500 relative">
      {/* Timer Badge */}
      {timeLeft !== null && (
        <div className="fixed top-24 right-4 md:right-8 z-50 bg-slate-900 border border-slate-700 text-white font-mono text-xl font-bold px-4 py-2 rounded-xl shadow-lg flex items-center gap-2 animate-pulse">
          <i className="fas fa-clock text-rose-500"></i>
          <span className={timeLeft < 60 ? "text-rose-500" : ""}>
            {formatTime(timeLeft)}
          </span>
        </div>
      )}

      {/* Progress */}
      <div className="mb-10">
        {/* ... (progress bars kept same) */}
        <div className="flex justify-between items-end mb-3">
          <span className="text-xs font-black text-blue-500 uppercase tracking-widest">
            Pergunta {currentIdx + 1} de {shuffledQuestions.length}
          </span>
          <span className="text-sm font-bold text-slate-400">
            {Math.round(progress)}% Completo
          </span>
        </div>
        <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800">
          <div
            className="h-full bg-blue-600 transition-all duration-500 ease-out shadow-[0_0_15px_rgba(79,70,229,0.5)]"
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
                  ${
                    isSelected
                      ? "bg-blue-600/10 border-blue-500 text-blue-400"
                      : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                  }
                `}
              >
                <span
                  className={`
                  w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs mr-4 transition-colors
                  ${
                    isSelected
                      ? "bg-blue-500 text-white"
                      : "bg-slate-800 text-slate-500 group-hover:bg-slate-700 group-hover:text-slate-300"
                  }
                `}
                >
                  {letter}
                </span>
                <span className="font-medium">{option.text}</span>
                {isSelected && (
                  <i className="fas fa-check-circle ml-auto text-blue-500"></i>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center bg-slate-900/50 backdrop-blur-md p-4 rounded-3xl border border-slate-800 sticky bottom-10">
        <Button
          variant="ghost"
          onClick={handlePrev}
          disabled={currentIdx === 0}
        >
          <i className="fas fa-arrow-left mr-2"></i> Anterior
        </Button>

        <div className="text-xs text-slate-600 font-bold uppercase tracking-widest hidden md:block">
          Sessão Segura
        </div>

        <Button
          variant={
            currentIdx === shuffledQuestions.length - 1 ? "success" : "primary"
          }
          onClick={handleNext}
          disabled={answers[currentIdx] === null}
        >
          {currentIdx === shuffledQuestions.length - 1
            ? "Finalizar Quiz"
            : "Próxima"}{" "}
          <i className="fas fa-arrow-right ml-2"></i>
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
