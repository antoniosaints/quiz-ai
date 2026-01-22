
import React, { useState, useEffect } from 'react';
import { Quiz, Question } from '../types';
import { quizService } from '../services/quizService';
import { geminiService } from '../services/geminiService';
import { Button } from './Button';

interface AdminPanelProps {
  onUpdate: () => void;
  onCancel: () => void;
}

declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }

  interface Window {
    aistudio?: AIStudio;
  }
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ onUpdate, onCancel }) => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [editingQuiz, setEditingQuiz] = useState<Partial<Quiz> | null>(null);
  const [shareQuiz, setShareQuiz] = useState<Quiz | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [copyFeedback, setCopyFeedback] = useState(false);

  const fetchQuizzes = async () => {
    try {
      const q = await quizService.getQuizzes();
      setQuizzes(q);
    } catch (error) {
      console.error("Erro ao buscar quizzes:", error);
    }
  };

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const handleCreateNew = () => {
    setEditingQuiz({
      id: Math.random().toString(36).substr(2, 9),
      title: '',
      description: '',
      category: 'Geral',
      questions: []
    });
  };

  const handleEdit = (quiz: Quiz) => {
    setEditingQuiz(quiz);
  };

  const handleShare = (quiz: Quiz) => {
    setShareQuiz(quiz);
    setCopyFeedback(false);
  };

  const copyToClipboard = () => {
    if (!shareQuiz) return;
    const link = `quizmaster.ai/quiz/${shareQuiz.id}`;
    navigator.clipboard.writeText(link).then(() => {
      setCopyFeedback(true);
      setTimeout(() => setCopyFeedback(false), 2000);
    });
  };

  const handleDelete = async (id: string) => {
    if (!id) return;
    
    if (window.confirm('Tem certeza que deseja apagar este quiz permanentemente do banco de dados SQLite?')) {
      try {
        console.log(`Tentando deletar quiz com ID: ${id}`);
        await quizService.deleteQuiz(id);
        
        // Remove localmente para feedback instantâneo
        setQuizzes(prev => prev.filter(q => q.id !== id));
        
        await fetchQuizzes();
        
        alert("Quiz removido com sucesso!");
      } catch (error) {
        console.error("Erro ao deletar quiz:", error);
        alert("Erro ao remover o quiz do SQLite. Verifique o console.");
      }
    }
  };

  const handleSave = async () => {
    if (!editingQuiz) return;

    // --- VALIDAÇÕES RIGOROSAS ---
    if (!editingQuiz.title?.trim()) {
      alert('O título do quiz é obrigatório.');
      return;
    }
    if (!editingQuiz.questions || editingQuiz.questions.length === 0) {
      alert('O quiz precisa de pelo menos uma pergunta.');
      return;
    }

    for (let i = 0; i < editingQuiz.questions.length; i++) {
      const q = editingQuiz.questions[i];
      const qNum = i + 1;
      if (!q.text.trim()) {
        alert(`A pergunta #${qNum} está sem enunciado.`);
        return;
      }
      if (q.options.length !== 4) {
        alert(`A pergunta #${qNum} deve ter exatamente 4 opções. Ajuste a quantidade antes de salvar.`);
        return;
      }
      const hasEmptyOption = q.options.some(opt => !opt.text.trim());
      if (hasEmptyOption) {
        alert(`Todas as 4 opções da pergunta #${qNum} devem ser preenchidas.`);
        return;
      }
      const correctCount = q.options.filter(opt => opt.isCorrect).length;
      if (correctCount !== 1) {
        alert(`A pergunta #${qNum} precisa de exatamente 1 opção marcada como correta. (Atualmente: ${correctCount})`);
        return;
      }
    }

    setIsSaving(true);
    try {
      await quizService.saveQuiz(editingQuiz as Quiz);
      alert("Quiz salvo com sucesso no banco de dados!");
      onUpdate();
    } catch (error) {
      console.error("Erro ao salvar quiz:", error);
      alert("Erro ao persistir dados no SQLite.");
    } finally {
      setIsSaving(false);
    }
  };

  const addQuestion = () => {
    const newQuestion: Question = {
      id: Math.random().toString(36).substr(2, 9),
      text: '',
      options: [
        { id: Math.random().toString(36).substr(2, 9), text: '', isCorrect: false },
        { id: Math.random().toString(36).substr(2, 9), text: '', isCorrect: false },
        { id: Math.random().toString(36).substr(2, 9), text: '', isCorrect: false },
        { id: Math.random().toString(36).substr(2, 9), text: '', isCorrect: true }
      ]
    };
    setEditingQuiz(prev => ({
      ...prev!,
      questions: [...(prev?.questions || []), newQuestion]
    }));
  };

  const handleGenerateAI = async () => {
    if (!prompt) return alert('Digite um tema para gerar!');

    if (window.aistudio) {
      const hasKey = await window.aistudio.hasSelectedApiKey();
      if (!hasKey) {
        alert("Selecione uma chave de API para usar a geração por IA.");
        await window.aistudio.openSelectKey();
      }
    }

    setIsGenerating(true);
    try {
      const generated = await geminiService.generateQuiz(prompt);
      setEditingQuiz({
        ...generated,
        id: Math.random().toString(36).substr(2, 9)
      });
    } catch (error: any) {
      console.error(error);
      const errorMessage = error.message || "";
      if (errorMessage.includes("Requested entity was not found.")) {
        if (window.aistudio) {
          await window.aistudio.openSelectKey();
          return;
        }
      }
      alert('Erro ao gerar quiz. Verifique sua chave de API e conexão.');
    } finally {
      setIsGenerating(false);
    }
  };

  if (editingQuiz) {
    return (
      <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500 pb-20">
        <div className="flex justify-between items-center border-b border-slate-900 pb-4">
          <h2 className="text-xl font-bold">Configuração do Quiz</h2>
          <Button variant="ghost" size="sm" onClick={() => setEditingQuiz(null)}>
            <i className="fas fa-times mr-2"></i> Cancelar Edição
          </Button>
        </div>

        <div className="grid gap-6 bg-slate-900 p-8 rounded-3xl border border-slate-800 shadow-xl">
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase px-1">Título do Questionário</label>
              <input 
                type="text" 
                placeholder="Ex: História do Brasil"
                className="w-full bg-slate-950 border border-slate-800 p-4 rounded-xl outline-none focus:border-indigo-500 transition-colors font-medium text-slate-100"
                value={editingQuiz.title}
                onChange={e => setEditingQuiz({ ...editingQuiz, title: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase px-1">Descrição Breve</label>
              <textarea 
                placeholder="Sobre o que é este quiz?"
                className="w-full bg-slate-950 border border-slate-800 p-4 rounded-xl outline-none focus:border-indigo-500 transition-colors h-24 resize-none text-slate-300"
                value={editingQuiz.description}
                onChange={e => setEditingQuiz({ ...editingQuiz, description: e.target.value })}
              />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
               <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase px-1">Categoria</label>
                <input 
                  type="text" 
                  placeholder="Ex: Ciência, História..."
                  className="w-full bg-slate-950 border border-slate-800 p-4 rounded-xl outline-none focus:border-indigo-500 transition-colors"
                  value={editingQuiz.category}
                  onChange={e => setEditingQuiz({ ...editingQuiz, category: e.target.value })}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex justify-between items-center px-1">
            <h3 className="font-bold text-slate-400 uppercase tracking-widest text-xs">Questões do Banco ({editingQuiz.questions?.length || 0})</h3>
            <Button variant="ghost" size="sm" onClick={addQuestion} className="text-indigo-400">
              <i className="fas fa-plus mr-2"></i> Adicionar Manualmente
            </Button>
          </div>

          {editingQuiz.questions?.map((q, qIdx) => (
            <div key={q.id} className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl relative group hover:border-slate-700 transition-all">
              <button 
                onClick={() => {
                  const qs = [...editingQuiz.questions!];
                  qs.splice(qIdx, 1);
                  setEditingQuiz({ ...editingQuiz, questions: qs });
                }}
                className="absolute top-4 right-4 text-slate-700 hover:text-rose-500 transition-colors p-2"
                title="Remover pergunta"
              >
                <i className="fas fa-trash"></i>
              </button>
              
              <div className="mb-6 mr-10">
                <input 
                  type="text" 
                  className="w-full bg-transparent border-b border-slate-800 p-2 text-lg font-medium outline-none focus:border-indigo-500 transition-all"
                  placeholder="Escreva aqui o enunciado da questão..."
                  value={q.text}
                  onChange={e => {
                    const qs = [...editingQuiz.questions!];
                    qs[qIdx].text = e.target.value;
                    setEditingQuiz({ ...editingQuiz, questions: qs });
                  }}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {q.options.map((opt, oIdx) => (
                  <div key={opt.id} className="flex gap-2 group/opt">
                    <input 
                      type="text" 
                      className={`flex-1 bg-slate-950 border p-3 rounded-xl text-sm outline-none transition-all ${opt.isCorrect ? 'border-emerald-500 ring-1 ring-emerald-500/20 text-emerald-100' : 'border-slate-800 text-slate-400 focus:border-slate-600'}`}
                      placeholder={`Opção ${oIdx + 1}`}
                      value={opt.text}
                      onChange={e => {
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
                          isCorrect: idx === oIdx
                        }));
                        setEditingQuiz({ ...editingQuiz, questions: qs });
                      }}
                      title={opt.isCorrect ? "Opção Correta" : "Marcar como Correta"}
                      className={`px-4 rounded-xl border transition-all ${opt.isCorrect ? 'bg-emerald-600 border-emerald-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-500 hover:border-slate-500'}`}
                    >
                      <i className={`fas ${opt.isCorrect ? 'fa-check' : 'fa-circle-check opacity-20'}`}></i>
                    </button>
                    
                    {q.options.length > 4 && (
                      <button 
                        onClick={() => {
                           const qs = [...editingQuiz.questions!];
                           qs[qIdx].options.splice(oIdx, 1);
                           setEditingQuiz({ ...editingQuiz, questions: qs });
                        }}
                        className="p-2 text-rose-500 hover:bg-rose-500/10 rounded-lg"
                      >
                        <i className="fas fa-times"></i>
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-4 flex items-center justify-between text-[10px] font-bold uppercase tracking-widest px-1">
                 <div className="flex gap-2">
                   <Button variant="ghost" size="sm" className="h-8 py-0" onClick={() => {
                      const qs = [...editingQuiz.questions!];
                      qs[qIdx].options.push({ id: Math.random().toString(36).substr(2, 9), text: '', isCorrect: false });
                      setEditingQuiz({ ...editingQuiz, questions: qs });
                   }}>+ Opção</Button>
                   <span className={q.options.length === 4 ? 'text-emerald-500' : 'text-amber-500'}>
                     {q.options.length}/4 Opções
                   </span>
                 </div>
                 {q.options.filter(o => o.isCorrect).length !== 1 && (
                   <span className="text-rose-500 animate-pulse">Marque 1 correta</span>
                 )}
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-4 sticky bottom-8 bg-slate-950/90 backdrop-blur-xl p-5 rounded-3xl border border-slate-900 shadow-2xl z-20">
          <Button variant="secondary" className="flex-1" onClick={() => setEditingQuiz(null)}>DESCARTAR</Button>
          <Button variant="primary" className="flex-1 h-14" onClick={handleSave} isLoading={isSaving}>
            CONSOLIDAR NO SQLITE
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      {/* Share Modal */}
      {shareQuiz && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">Compartilhar Quiz</h3>
              <button onClick={() => setShareQuiz(null)} className="text-slate-500 hover:text-white">
                <i className="fas fa-times"></i>
              </button>
            </div>
            <p className="text-sm text-slate-400 mb-6">Envie o link abaixo para seus amigos testarem seus conhecimentos sobre <strong>{shareQuiz.title}</strong>.</p>
            <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl flex items-center gap-3 group relative overflow-hidden">
               <span className="text-indigo-400 font-mono text-xs flex-1 truncate select-all">
                quizmaster.ai/quiz/{shareQuiz.id}
               </span>
               <Button variant={copyFeedback ? "success" : "secondary"} size="sm" onClick={copyToClipboard}>
                  <i className={`fas ${copyFeedback ? 'fa-check' : 'fa-copy'}`}></i>
               </Button>
            </div>
            {copyFeedback && (
              <p className="text-[10px] text-emerald-500 font-bold uppercase mt-2 text-center animate-bounce">Link copiado com sucesso!</p>
            )}
            <div className="mt-8">
              <Button className="w-full" variant="ghost" onClick={() => setShareQuiz(null)}>FECHAR</Button>
            </div>
          </div>
        </div>
      )}

      <section className="bg-indigo-600 p-10 rounded-3xl text-white relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
        <div className="relative z-10 max-w-lg">
          <h2 className="text-3xl font-black mb-3 italic">AI GENERATOR</h2>
          <p className="text-indigo-100 mb-8 opacity-90 leading-relaxed font-medium">
            Crie novos conteúdos instantaneamente usando Inteligência Artificial e salve-os localmente.
          </p>
          <div className="flex flex-col md:flex-row gap-3">
            <input 
              type="text" 
              placeholder="Digite um tema (ex: Mitologia Grega)..."
              className="flex-1 bg-white/10 border border-white/20 p-4 rounded-2xl outline-none placeholder:text-indigo-200 text-white font-bold focus:bg-white/20 transition-all"
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleGenerateAI()}
            />
            <Button className="bg-white text-indigo-600 px-8" isLoading={isGenerating} onClick={handleGenerateAI}>
              GERAR COM GEMINI
            </Button>
          </div>
        </div>
      </section>

      <section>
        <div className="flex justify-between items-center mb-6 px-1">
          <h3 className="font-bold text-slate-400 uppercase tracking-widest text-xs">Registros no Banco (Tabela 'quizzes')</h3>
          <Button variant="ghost" size="sm" onClick={handleCreateNew} className="text-emerald-400">
            <i className="fas fa-plus mr-2"></i> Criar Manual
          </Button>
        </div>
        
        <div className="grid gap-4">
          {quizzes.map(q => (
            <div key={q.id} className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex items-center justify-between group hover:border-slate-700 transition-all">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-slate-950 rounded-xl flex items-center justify-center text-indigo-500 font-bold border border-slate-800 shadow-inner">
                  {q.questions.length}
                </div>
                <div>
                  <h4 className="font-bold text-slate-100 group-hover:text-indigo-400 transition-colors">{q.title}</h4>
                  <p className="text-[10px] text-slate-500 uppercase font-black tracking-tighter mt-0.5">
                    {q.category} &bull; <span className="text-emerald-500/80">PERSISTIDO</span>
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={() => handleShare(q)} title="Compartilhar Quiz">
                  <i className="fas fa-share-nodes text-indigo-400"></i>
                </Button>
                <Button variant="ghost" size="sm" onClick={() => handleEdit(q)} title="Editar Quiz">
                  <i className="fas fa-edit"></i>
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="hover:text-rose-500 hover:bg-rose-500/10" 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(q.id);
                  }}
                  title="Apagar Quiz"
                >
                  <i className="fas fa-trash"></i>
                </Button>
              </div>
            </div>
          ))}

          {quizzes.length === 0 && (
            <div className="text-center py-16 border-2 border-dashed border-slate-900 rounded-3xl">
              <i className="fas fa-database text-slate-800 text-3xl mb-3"></i>
              <p className="text-slate-600 font-bold uppercase tracking-widest text-[10px]">Banco de Dados SQLite Vazio</p>
              <p className="text-slate-700 text-[9px] mt-1">Gere um quiz acima ou crie um manual.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
