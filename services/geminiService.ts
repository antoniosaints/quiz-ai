
import { GoogleGenAI, Type } from "@google/genai";
import { Quiz } from "../types";

export const geminiService = {
  generateQuiz: async (topic: string, numQuestions: number = 5): Promise<Partial<Quiz>> => {
    // A chave de API deve ser obtida exclusivamente de process.env.API_KEY
    // O shim no index.tsx garante que este valor esteja disponível mesmo no Vite
    const apiKey = process.env.API_KEY;
    
    if (!apiKey) {
      throw new Error("API_KEY_MISSING");
    }

    const ai = new GoogleGenAI({ apiKey });
    
    // Quiz generation é uma tarefa de raciocínio complexo, usamos gemini-3-pro-preview
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Gere um quiz em Português sobre o tema: "${topic}". O quiz deve ter no maximo 20 e no mínimo 5 perguntas de múltipla escolha. Retorne em formato JSON estruturado.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            category: { type: Type.STRING },
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  text: { type: Type.STRING },
                  options: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        text: { type: Type.STRING },
                        isCorrect: { type: Type.BOOLEAN }
                      },
                      required: ["text", "isCorrect"]
                    }
                  }
                },
                required: ["text", "options"]
              }
            }
          },
          required: ["title", "description", "category", "questions"]
        }
      }
    });

    // .text é uma propriedade getter que retorna a string do JSON gerado
    const data = JSON.parse(response.text || "{}");
    
    return {
      ...data,
      questions: (data.questions || []).map((q: any) => ({
        ...q,
        id: Math.random().toString(36).substr(2, 9),
        options: (q.options || []).map((o: any) => ({
          ...o,
          id: Math.random().toString(36).substr(2, 9)
        }))
      }))
    };
  }
};
