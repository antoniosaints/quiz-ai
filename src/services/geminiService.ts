
import { GoogleGenAI, Type } from "@google/genai";
import { Quiz } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const geminiService = {
  generateQuiz: async (topic: string, numQuestions: number = 5): Promise<Partial<Quiz>> => {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Gere um quiz em Português sobre o tema: "${topic}". O quiz deve ter no máximo 20 e no mínimo 5 perguntas de múltipla escolha.`,
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

    const data = JSON.parse(response.text);
    // Map to include IDs which types require
    return {
      ...data,
      questions: data.questions.map((q: any) => ({
        ...q,
        id: Math.random().toString(36).substr(2, 9),
        options: q.options.map((o: any) => ({
          ...o,
          id: Math.random().toString(36).substr(2, 9)
        }))
      }))
    };
  }
};
