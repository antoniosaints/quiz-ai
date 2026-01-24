import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuiz } from "../contexts/QuizContext";
import { QuizPlayer } from "../components/QuizPlayer";
import { Quiz } from "../types";

export const QuizPlayerPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { quizzes, isLoading, saveResult } = useQuiz();
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);

  useEffect(() => {
    if (!isLoading && id) {
      const found = quizzes.find((q) => q.id === id);
      if (found) {
        setActiveQuiz(found);
      } else {
        // Handle quiz not found
        console.error("Quiz not found");
        navigate("/");
      }
    }
  }, [id, quizzes, isLoading, navigate]);

  const handleFinish = (result: any) => {
    saveResult(result);
    // If shared mode (direct link), maybe we want to restart or show summary?
    // Original logic: if isSharedMode => setPlayerKey(prev => prev+1) (restart)
    // with Router, we can just reload or stay here.
    // Let's go home for now or stay.
    // If we want to restart, we can pass a prop to QuizPlayer or handle it there.
    navigate("/");
  };

  if (isLoading || !activeQuiz) {
    return <div>Loading...</div>; // TODO: Better loading state
  }

  return (
    <QuizPlayer
      quiz={activeQuiz}
      onFinish={handleFinish}
      onCancel={() => navigate("/")}
      exitLabel={"Voltar ao Menu"} // Simplify for now
    />
  );
};
