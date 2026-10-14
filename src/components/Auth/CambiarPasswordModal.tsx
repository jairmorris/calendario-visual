import React, { useEffect, useState } from "react";
import { X, KeyRound } from "lucide-react";
import { api } from "../../services/api";
import { Usuario } from "../../types";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

// Solo se muestra a administradores; el servidor tambien lo exige.
export const CambiarPasswordModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [usuarioId, setUsuarioId] = useState<number | "">("");
  const [nueva, setNueva] = useState("");
  const [repetir, setRepetir] = useState("");
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    api<Usuario[]>("/usuarios")
      .then(lista => {
        setUsuarios(lista);
        setUsuarioId(lista[0]?.id ?? "");
      })
      .catch(() => setError("No se pudo cargar la lista de usuarios."));
  }, [isOpen]);

  if (!isOpen) return null;

  const cerrar = () => {
    setNueva(""); setRepetir(""); setError(""); setOk("");
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (usuarioId === "") return setError("Seleccione un usuario.");
    if (nueva.length < 8) return setError("La nueva contrasena debe tener al menos 8 caracteres.");
    if (nueva !== repetir) return setError("Las contrasenas no coinciden.");

    setGuardando(true);
    try {
      await api(`/usuarios/${usuarioId}/password`, { method: "PUT", body: { nueva } });
      const nombre = usuarios.find(u => u.id === usuarioId)?.username;
      setOk(`Contrasena de "${nombre}" actualizada. Sus sesiones abiertas se cerraron.`);
    } catch (err: any) {
      setError(err.message || "No se pudo cambiar la contrasena.");
    } finally {
      setGuardando(false);
    }
  };

  const inputClass = "w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
        <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <KeyRound className="w-4 h-4" />
            <h2 className="text-sm font-bold">Cambiar contrasena de usuario</h2>
          </div>
          <button onClick={cerrar} className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="w-4 h-4" />
          </button>
        </div>

        {ok ? (
          <div className="p-5 space-y-4 text-sm">
            <p className="text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl p-3">{ok}</p>
            <button onClick={cerrar} className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl">
              Cerrar
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-3">
            {error && <p className="text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-xl p-2.5">{error}</p>}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Usuario</label>
              <select value={usuarioId} onChange={e => setUsuarioId(Number(e.target.value))} className={inputClass}>
                {usuarios.map(u => (
                  <option key={u.id} value={u.id}>{u.username} ({u.rol === "admin" ? "administrador" : "solo lectura"})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Nueva contrasena (minimo 8 caracteres)</label>
              <input type="password" required autoComplete="new-password" value={nueva} onChange={e => setNueva(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Repetir nueva contrasena</label>
              <input type="password" required autoComplete="new-password" value={repetir} onChange={e => setRepetir(e.target.value)} className={inputClass} />
            </div>
            <button
              type="submit"
              disabled={guardando}
              className="w-full py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold text-sm rounded-xl"
            >
              {guardando ? "Guardando..." : "Guardar"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
