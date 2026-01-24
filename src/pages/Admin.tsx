import React from "react";
import { useNavigate } from "react-router-dom";
import { AdminPanel } from "../components/AdminPanel"; // Check if path handles index.ts or file directly
import { useQuiz } from "../contexts/QuizContext";

export const Admin: React.FC = () => {
  const navigate = useNavigate();
  const { loadData } = useQuiz();

  const handleUpdate = async () => {
    await loadData();
    navigate("/");
  };

  const handleCancel = () => {
    navigate("/");
  };

  return <AdminPanel onUpdate={handleUpdate} onCancel={handleCancel} />;
};
