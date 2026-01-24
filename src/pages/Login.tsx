import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "../components/Button";

export const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [loginForm, setLoginForm] = useState({ user: "", pass: "" });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginForm.user === "admin" && loginForm.pass === "admin") {
      login();
      navigate("/admin");
    } else {
      alert("Credenciais inválidas! (Dica: admin/admin)");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-20 animate-in slide-in-from-bottom-4 duration-500">
      <div className="bg-slate-900 p-8 rounded-3xl border border-slate-800 w-full max-w-sm shadow-xl">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-500/10 text-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-blue-500/20">
            <i className="fas fa-user-shield text-2xl"></i>
          </div>
          <h2 className="text-xl font-bold">Acesso Administrador</h2>
          <p className="text-sm text-slate-500 mt-1">
            Gerencie o banco de dados SQLite
          </p>
        </div>
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase px-1">
              Usuário
            </label>
            <input
              type="text"
              placeholder="admin"
              className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none p-3 rounded-xl transition-all"
              value={loginForm.user}
              onChange={(e) =>
                setLoginForm((prev) => ({
                  ...prev,
                  user: e.target.value,
                }))
              }
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase px-1">
              Senha
            </label>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none p-3 rounded-xl transition-all"
              value={loginForm.pass}
              onChange={(e) =>
                setLoginForm((prev) => ({
                  ...prev,
                  pass: e.target.value,
                }))
              }
            />
          </div>
          <Button className="w-full py-4 mt-4" type="submit">
            ACESSAR BANCO DE DADOS
          </Button>
        </form>
      </div>
    </div>
  );
};
