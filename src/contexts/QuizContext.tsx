import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { Quiz, QuizResult } from "../types";
import { quizService } from "../services/quizService";

interface QuizContextType {
  quizzes: Quiz[];
  results: QuizResult[];
  isLoading: boolean;
  error: string | null;
  loadData: () => Promise<void>;
  saveResult: (result: QuizResult) => void;
}

const QuizContext = createContext<QuizContextType | undefined>(undefined);

export const QuizProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [results, setResults] = useState<QuizResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const fetchedQuizzes = await quizService.getQuizzes();
      setQuizzes(fetchedQuizzes);
      setResults(quizService.getResults());
    } catch (err) {
      console.error("Falha ao carregar dados:", err);
      setError(
        "Não foi possível conectar ao servidor SQLite. Verifique se o backend está rodando.",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  const saveResult = (result: QuizResult) => {
    quizService.saveResult(result);
    setResults(quizService.getResults());
  };

  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <QuizContext.Provider
      value={{ quizzes, results, isLoading, error, loadData, saveResult }}
    >
      {children}
    </QuizContext.Provider>
  );
};

export const useQuiz = () => {
  const context = useContext(QuizContext);
  if (!context) {
    throw new Error("useQuiz must be used within a QuizProvider");
  }
  return context;
};
