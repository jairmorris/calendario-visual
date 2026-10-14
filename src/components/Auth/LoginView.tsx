import React, { useState } from "react";
import { Usuario } from "../../types";
import { AuthService } from "../../services/auth";
import { Wrench, Lock, User, AlertCircle, Building2, UserCheck } from "lucide-react";

interface Props {
  onLoginSuccess: (usuario: Usuario) => void;
}

export const LoginView: React.FC<Props> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const usuario = AuthService.login(username, password);
    if (usuario) {
      onLoginSuccess(usuario);
    } else {
      setError("Usuario o contrasena incorrectos.");
    }
  };

  const handleQuickDemo = (demoUser: string, demoPass: string) => {
    setUsername(demoUser);
    setPassword(demoPass);
    const u = AuthService.login(demoUser, demoPass);
    if (u) onLoginSuccess(u);
  };

  return (
    <div className="min-h-screen w-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-800">
        <div className="bg-gradient-to-r from-blue-900 via-slate-900 to-indigo-950 p-8 text-center text-white space-y-3">
          <div className="inline-flex p-3 bg-blue-600/30 rounded-2xl border border-blue-500/30 text-blue-400">
            <Wrench className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-wide">SGP Equipos de Trabajo</h1>
            <p className="text-xs text-slate-400 mt-1">Acceso al Sistema Corporativo</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Nombre de Usuario</label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                required
                placeholder="Ej: Administrador o Ventas"
                value={username}
                onChange={e => setUsername(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Contrasena</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="password"
                required
                placeholder="????????"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl shadow-lg shadow-blue-600/30 transition-all transform active:scale-98"
          >
            Ingresar al Sistema
          </button>

          <div className="pt-4 border-t border-slate-100 space-y-2">
            <p className="text-[11px] font-semibold text-slate-400 uppercase text-center">Accesos Directos por Perfil</p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleQuickDemo("Administrador", "admin")}
                className="p-3 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl text-blue-900 font-medium text-left space-y-0.5"
              >
                <div className="flex items-center space-x-1">
                  <UserCheck className="w-4 h-4 text-blue-600" />
                  <span className="font-bold">Administrador</span>
                </div>
                <p className="text-[10px] text-blue-700">Edicion / Operaciones</p>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo("Ventas", "ventas")}
                className="p-3 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl text-emerald-900 font-medium text-left space-y-0.5"
              >
                <div className="flex items-center space-x-1">
                  <Building2 className="w-4 h-4 text-emerald-600" />
                  <span className="font-bold">Ventas</span>
                </div>
                <p className="text-[10px] text-emerald-700">Solo Lectura / Consulta</p>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

