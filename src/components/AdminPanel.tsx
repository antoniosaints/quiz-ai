import React, { useState, useEffect } from "react";
import { Quiz, Question, Option } from "../types";
import { quizService } from "../services/quizService";
import { geminiService } from "../services/geminiService";
import { Button } from "./Button";

interface AdminPanelProps {
  onUpdate: () => void;
  onCancel: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  onUpdate,
  onCancel,
}) => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [editingQuiz, setEditingQuiz] = useState<Partial<Quiz> | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [prompt, setPrompt] = useState("");

  useEffect(() => {
    const fetchQuizzes = async () => {
      const q = await quizService.getQuizzes();
      setQuizzes(q);
    };
    fetchQuizzes();
  }, []);

  const handleCreateNew = () => {
    setEditingQuiz({
      id: Math.random().toString(36).substr(2, 9),
      title: "",
      description: "",
      category: "Geral",
      questions: [],
    });
  };

  const handleEdit = (quiz: Quiz) => {
    setEditingQuiz(quiz);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Tem certeza que deseja apagar este quiz?")) {
      await quizService.deleteQuiz(id);
      const q = await quizService.getQuizzes();
      setQuizzes(q);
    }
  };

  const handleSave = async () => {
    if (!editingQuiz?.title || !editingQuiz?.questions?.length) {
      alert("Preencha o título e adicione pelo menos uma pergunta.");
      return;
    }
    setIsSaving(true);
    try {
      await quizService.saveQuiz(editingQuiz as Quiz);
      onUpdate();
    } finally {
      setIsSaving(false);
    }
  };

  const addQuestion = () => {
    const newQuestion: Question = {
      id: Math.random().toString(36).substr(2, 9),
      text: "",
      options: [
        { id: "o1", text: "", isCorrect: false },
        { id: "o2", text: "", isCorrect: false },
        { id: "o3", text: "", isCorrect: false },
        { id: "o4", text: "", isCorrect: true },
      ],
    };
    setEditingQuiz((prev) => ({
      ...prev!,
      questions: [...(prev?.questions || []), newQuestion],
    }));
  };

  const handleGenerateAI = async () => {
    if (!prompt) return alert("Digite um tema para gerar!");
    setIsGenerating(true);
    try {
      const generated = await geminiService.generateQuiz(prompt);
      setEditingQuiz({
        ...generated,
        id: Math.random().toString(36).substr(2, 9),
      });
    } catch (error) {
      console.error(error);
      alert("Erro ao gerar quiz. Tente novamente.");
    } finally {
      setIsGenerating(false);
    }
  };

  if (editingQuiz) {
    return (
      <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500 pb-20">
        <div className="flex justify-between items-center border-b border-slate-900 pb-4">
          <h2 className="text-xl font-bold">Configurando Quiz</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setEditingQuiz(null)}
          >
            <i className="fas fa-times mr-2"></i> Cancelar Edição
          </Button>
        </div>

        <div className="grid gap-6 bg-slate-900 p-8 rounded-3xl border border-slate-800">
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase px-1">
                Título do Quiz
              </label>
              <input
                type="text"
                className="w-full bg-slate-950 border border-slate-800 p-4 rounded-xl outline-none focus:border-blue-500 transition-colors"
                value={editingQuiz.title}
                onChange={(e) =>
                  setEditingQuiz({ ...editingQuiz, title: e.target.value })
                }
                placeholder="Ex: História da Arte"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase px-1">
                Descrição
              </label>
              <textarea
                className="w-full bg-slate-950 border border-slate-800 p-4 rounded-xl outline-none focus:border-blue-500 transition-colors h-24 resize-none"
                value={editingQuiz.description}
                onChange={(e) =>
                  setEditingQuiz({
                    ...editingQuiz,
                    description: e.target.value,
                  })
                }
                placeholder="Uma breve descrição sobre o que o quiz trata..."
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase px-1">
                Categoria
              </label>
              <input
                type="text"
                className="w-full bg-slate-950 border border-slate-800 p-4 rounded-xl outline-none focus:border-blue-500 transition-colors"
                value={editingQuiz.category}
                onChange={(e) =>
                  setEditingQuiz({ ...editingQuiz, category: e.target.value })
                }
                placeholder="Ex: Educação"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase px-1">
                Tempo Limite (minutos)
              </label>
              <input
                type="number"
                min="0"
                className="w-full bg-slate-950 border border-slate-800 p-4 rounded-xl outline-none focus:border-blue-500 transition-colors"
                value={editingQuiz.timeLimit || ""}
                onChange={(e) =>
                  setEditingQuiz({
                    ...editingQuiz,
                    timeLimit: parseInt(e.target.value) || 0,
                  })
                }
                placeholder="0 para sem limite"
              />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-slate-400 uppercase tracking-widest text-xs px-1">
              Perguntas ({editingQuiz.questions?.length || 0})
            </h3>
            <Button variant="ghost" size="sm" onClick={addQuestion}>
              <i className="fas fa-plus mr-2"></i> Adicionar Manualmente
            </Button>
          </div>

          {editingQuiz.questions?.map((q, qIdx) => (
            <div
              key={q.id}
              className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl relative group"
            >
              <button
                onClick={() => {
                  const qs = [...editingQuiz.questions!];
                  qs.splice(qIdx, 1);
                  setEditingQuiz({ ...editingQuiz, questions: qs });
                }}
                className="absolute top-4 right-4 text-slate-700 hover:text-rose-500 transition-colors p-2"
              >
                <i className="fas fa-trash"></i>
              </button>

              <div className="mb-6 mr-10">
                <input
                  type="text"
                  className="w-full bg-transparent border-b border-slate-800 p-2 text-lg font-medium outline-none focus:border-blue-500"
                  placeholder="Digite o enunciado da pergunta..."
                  value={q.text}
                  onChange={(e) => {
                    const qs = [...editingQuiz.questions!];
                    qs[qIdx].text = e.target.value;
                    setEditingQuiz({ ...editingQuiz, questions: qs });
                  }}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {q.options.map((opt, oIdx) => (
                  <div key={opt.id} className="flex gap-2">
                    <input
                      type="text"
                      className={`flex-1 bg-slate-950 border p-3 rounded-xl text-sm outline-none transition-all ${
                        opt.isCorrect
                          ? "border-emerald-500/50 ring-1 ring-emerald-500/20"
                          : "border-slate-800"
                      }`}
                      placeholder={`Opção ${oIdx + 1}`}
                      value={opt.text}
                      onChange={(e) => {
                        const qs = [...editingQuiz.questions!];
                        qs[qIdx].options[oIdx].text = e.target.value;
                        setEditingQuiz({ ...editingQuiz, questions: qs });
                      }}
                    />
                    <button
                      onClick={() => {
                        const qs = [...editingQuiz.questions!];
                        qs[qIdx].options = qs[qIdx].options.map((o, idx) => ({
                          ...o,
                          isCorrect: idx === oIdx,
                        }));
                        setEditingQuiz({ ...editingQuiz, questions: qs });
                      }}
                      className={`px-4 rounded-xl border transition-all ${
                        opt.isCorrect
                          ? "bg-emerald-600 border-emerald-500 text-white"
                          : "bg-slate-800 border-slate-700 text-slate-500"
                      }`}
                      title="Marcar como correta"
                    >
                      <i className="fas fa-check"></i>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-4 sticky bottom-8 bg-slate-950/80 backdrop-blur-xl p-4 rounded-3xl border border-slate-900 shadow-2xl">
          <Button
            variant="secondary"
            className="flex-1"
            onClick={() => setEditingQuiz(null)}
          >
            DESCARTAR
          </Button>
          <Button
            variant="primary"
            className="flex-1"
            onClick={handleSave}
            isLoading={isSaving}
          >
            SALVAR QUIZ
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <section className="bg-blue-600 p-10 rounded-3xl text-white relative overflow-hidden shadow-2xl shadow-blue-500/20">
        <div className="relative z-10">
          <h2 className="text-3xl font-black mb-3">Gerador com IA</h2>
          <p className="text-blue-100 mb-8 opacity-90 leading-relaxed font-medium">
            Use nossa inteligência artificial para criar um quiz completo em
            segundos. Basta digitar o tema!
          </p>
          <div className="grid grid-cols-12 gap-3">
            <input
              type="text"
              placeholder="Ex: Biologia Marinha, Império Romano..."
              className="col-span-9 bg-white/10 border border-white/20 p-4 rounded-2xl outline-none placeholder:text-blue-200 focus:bg-white/20 transition-all text-white font-bold"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
            <Button
              className="col-span-3 bg-white text-blue-600 hover:bg-slate-100 h-full"
              isLoading={isGenerating}
              onClick={handleGenerateAI}
            >
              GERAR COM IA
            </Button>
          </div>
        </div>
        <i className="fas fa-wand-magic-sparkles absolute -bottom-10 -right-10 text-[200px] text-white/10 -rotate-12 pointer-events-none"></i>
      </section>

      <section>
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-bold text-slate-400 uppercase tracking-widest text-xs px-1">
            Gerenciar Quizzes
          </h3>
          <Button variant="ghost" size="sm" onClick={handleCreateNew}>
            <i className="fas fa-plus mr-2"></i> Criar do Zero
          </Button>
        </div>

        <div className="grid gap-4">
          {quizzes.map((q) => (
            <div
              key={q.id}
              className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex items-center justify-between group hover:border-blue-500/30 transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-slate-950 rounded-xl flex items-center justify-center text-blue-500 font-bold border border-slate-800">
                  {q.questions.length}
                </div>
                <div>
                  <h4 className="font-bold text-slate-100">{q.title}</h4>
                  <p className="text-xs text-slate-500">
                    {q.category} &bull; Armazenado em Banco de Dados
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="md"
                  onClick={() => handleEdit(q)}
                  title="Editar"
                >
                  <i className="fas fa-edit"></i>
                </Button>
                <Button
                  variant="ghost"
                  size="md"
                  className="hover:text-red-500"
                  onClick={() => handleDelete(q.id)}
                  title="Excluir"
                >
                  <i className="fas fa-trash"></i>
                </Button>
              </div>
            </div>
          ))}

          {quizzes.length === 0 && (
            <div className="text-center py-10 border-2 border-dashed border-slate-800 rounded-3xl">
              <p className="text-slate-600 font-bold uppercase tracking-widest text-xs">
                Nenhum quiz encontrado
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
