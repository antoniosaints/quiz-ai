
import { GoogleGenAI, Type } from "@google/genai";
import { Quiz } from "../types";

export const geminiService = {
  generateQuiz: async (topic: string, numQuestions: number = 5): Promise<Partial<Quiz>> => {
    // Re-initialize for each call to pick up the latest API Key from the dialog/environment
    const apiKey = process.env.API_KEY;
    
    if (!apiKey) {
      throw new Error("API_KEY_MISSING");
    }

    const ai = new GoogleGenAI({ apiKey });
    
    // Quiz generation is a complex text reasoning task, using gemini-3-pro-preview
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Gere um quiz em Português sobre o tema: "${topic}". O quiz deve ter no maximo 20 e no mínimo 5 perguntas de múltipla escolha.`,
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

    // Accessing .text directly (it's a property, not a method)
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
