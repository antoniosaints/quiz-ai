import React from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { Button } from "./Button"; // Correct path since Layout is in components
import { useAuth } from "../contexts/AuthContext";

export const Layout: React.FC = () => {
  const { isAdmin, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const isSharedMode =
    location.pathname.includes("/quiz/") && location.pathname !== "/"; // Simple check, improved later

  // Hide header buttons on Quiz Player if shared mode, similar to original logic
  // But actually, the original logic hid buttons based on `isSharedMode` state which came from URL.
  // We can use location state or query params.

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 md:py-12">
      <header className="flex justify-between items-center mb-12 animate-in fade-in slide-in-from-top-4 duration-700">
        <div>
          <h1
            className={`text-2xl font-black text-white transition-colors ${
              !isSharedMode ? "cursor-pointer hover:text-blue-500" : ""
            }`}
            onClick={() => !isSharedMode && navigate("/")}
          >
            {process.env.APP_NAME}
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">
              {isSharedMode ? "Sessão Compartilhada" : "Conectado ao Banco"}
            </p>
          </div>
        </div>

        {!isSharedMode && (
          <div className="flex gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/")}
              title="Início"
            >
              <i className="fas fa-home text-lg"></i>
            </Button>
            {!isAdmin ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/login")}
                title="Admin"
              >
                <i className="fas fa-lock text-lg"></i>
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => navigate("/admin")}
                >
                  ADMIN
                </Button>
                <Button variant="danger" size="sm" onClick={handleLogout}>
                  SAIR
                </Button>
              </div>
            )}
          </div>
        )}
      </header>

      <main>
        <Outlet />
      </main>

      <footer className="mt-20 pt-12 border-t border-slate-900 text-center">
        <p className="text-[10px] text-slate-600 font-black uppercase tracking-[0.2em]">
          Desenvolvido por Antonio
        </p>
      </footer>
    </div>
  );
};
