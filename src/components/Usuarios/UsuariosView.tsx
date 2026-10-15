import React, { useEffect, useState } from "react";
import { KeyRound, UserPlus, Mail, ShieldCheck, Eye } from "lucide-react";
import { api } from "../../services/api";
import { Usuario, RolUsuario } from "../../types";
import { CambiarPasswordModal } from "../Auth/CambiarPasswordModal";

interface Props {
  usuarioActual: Usuario;
}

const vacio = { username: "", nombre: "", departamento: "", email: "", password: "", rol: "lector" as RolUsuario };

export const UsuariosView: React.FC<Props> = ({ usuarioActual }) => {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [form, setForm] = useState(vacio);
  const [error, setError] = useState("");
  const [passwordAbierto, setPasswordAbierto] = useState(false);

  const cargar = () => api<Usuario[]>("/usuarios").then(setUsuarios).catch(() => setError("No se pudo cargar la lista de usuarios."));
  useEffect(() => { cargar(); }, []);

  const guardar = async (id: number, cambios: Partial<Usuario>) => {
    setError("");
    try {
      await api(`/usuarios/${id}`, { method: "PUT", body: cambios });
      await cargar();
    } catch (e: any) {
      setError(e.message);
      await cargar(); // vuelve a mostrar el valor real si el servidor lo rechazo
    }
  };

  const crear = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await api("/usuarios", { method: "POST", body: { ...form, nombre: form.nombre || form.username } });
      setForm(vacio);
      await cargar();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const input = "w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none";

  return (
    <div className="space-y-5 max-w-6xl">
      {error && <p className="text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-xl p-2.5">{error}</p>}

      <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-800 flex items-center space-x-2">
            <UserPlus className="w-4 h-4" />
            <span>Nuevo usuario</span>
          </h3>
          <button onClick={() => setPasswordAbierto(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl">
            <KeyRound className="w-3.5 h-3.5" />
            <span>Cambiar contrasena</span>
          </button>
        </div>
        <form onSubmit={crear} className="grid grid-cols-1 md:grid-cols-6 gap-3 items-end">
          <label className="text-xs font-semibold text-slate-600">Usuario
            <input required value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} className={`${input} mt-1 font-normal`} />
          </label>
          <label className="text-xs font-semibold text-slate-600">Nombre
            <input value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} className={`${input} mt-1 font-normal`} />
          </label>
          <label className="text-xs font-semibold text-slate-600">Email (avisos)
            <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className={`${input} mt-1 font-normal`} />
          </label>
          <label className="text-xs font-semibold text-slate-600">Rol
            <select value={form.rol} onChange={e => setForm({ ...form, rol: e.target.value as RolUsuario })} className={`${input} mt-1 font-normal`}>
              <option value="lector">Solo lectura</option>
              <option value="admin">Administrador</option>
            </select>
          </label>
          <label className="text-xs font-semibold text-slate-600">Contrasena (min. 8)
            <input required type="password" autoComplete="new-password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} className={`${input} mt-1 font-normal`} />
          </label>
          <button type="submit" className="py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl">Crear usuario</button>
        </form>
      </section>

      <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-x-auto">
        <table className="w-full text-xs">
          <thead className="bg-slate-50 text-slate-500 uppercase text-[10px]">
            <tr>
              <th className="text-left p-3">Usuario</th>
              <th className="text-left p-3">Email</th>
              <th className="text-left p-3">Rol</th>
              <th className="p-3">
                <span className="inline-flex items-center space-x-1"><Mail className="w-3 h-3" /><span>Resumen diario</span></span>
              </th>
              <th className="p-3">Alertas</th>
              <th className="p-3">Activo</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {usuarios.map(u => {
              const esYo = u.id === usuarioActual.id;
              return (
                <tr key={u.id} className={u.activo ? "" : "opacity-50"}>
                  <td className="p-3">
                    <p className="font-semibold text-slate-800">{u.username}{esYo && <span className="ml-1 text-[10px] text-blue-600">(usted)</span>}</p>
                    <p className="text-slate-500">{u.nombre}</p>
                  </td>
                  <td className="p-3">
                    <input
                      key={`${u.id}-${u.email}`}
                      type="email"
                      defaultValue={u.email}
                      placeholder="sin email"
                      onBlur={e => e.target.value !== (u.email || "") && guardar(u.id, { email: e.target.value })}
                      className={input}
                    />
                  </td>
                  <td className="p-3">
                    <div className="flex items-center space-x-1">
                      {u.rol === "admin" ? <ShieldCheck className="w-3.5 h-3.5 text-blue-600" /> : <Eye className="w-3.5 h-3.5 text-emerald-600" />}
                      <select value={u.rol} disabled={esYo} onChange={e => guardar(u.id, { rol: e.target.value as RolUsuario })} className={input}>
                        <option value="lector">Solo lectura</option>
                        <option value="admin">Administrador</option>
                      </select>
                    </div>
                  </td>
                  <td className="p-3 text-center">
                    <input type="checkbox" checked={u.avisos?.resumen ?? false} disabled={!u.email}
                      title={u.email ? "" : "Primero agregue un email"}
                      onChange={e => guardar(u.id, { avisos: { resumen: e.target.checked, alertas: u.avisos?.alertas ?? false } })} />
                  </td>
                  <td className="p-3 text-center">
                    <input type="checkbox" checked={u.avisos?.alertas ?? false} disabled={!u.email}
                      title={u.email ? "" : "Primero agregue un email"}
                      onChange={e => guardar(u.id, { avisos: { resumen: u.avisos?.resumen ?? false, alertas: e.target.checked } })} />
                  </td>
                  <td className="p-3 text-center">
                    <input type="checkbox" checked={u.activo} disabled={esYo} onChange={e => guardar(u.id, { activo: e.target.checked })} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>
      <p className="text-xs text-slate-500">
        Resumen diario: agenda del dia y del siguiente. Alertas: servicios atrasados, conflictos de personal y servicios urgentes nuevos.
        Los tecnicos reciben sus propios avisos segun el email que tengan en la pantalla de personal.
      </p>

      <CambiarPasswordModal isOpen={passwordAbierto} onClose={() => setPasswordAbierto(false)} />
    </div>
  );
};
