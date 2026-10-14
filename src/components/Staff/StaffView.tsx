import React, { useState } from "react";
import { Personal, Servicio, RolUsuario } from "../../types";
import { StorageService } from "../../services/storage";
import { UserPlus, Phone, Award, Trash2, Edit, CheckCircle, XCircle } from "lucide-react";

interface Props {
  personal: Personal[];
  servicios: Servicio[];
  onRefresh: () => void;
  rolActual: RolUsuario;
}

export const StaffView: React.FC<Props> = ({ personal, servicios, onRefresh, rolActual }) => {
  const [nombre, setNombre] = useState("");
  const [cargo, setCargo] = useState("");
  const [especialidad, setEspecialidad] = useState("");
  const [telefono, setTelefono] = useState("");
  const [email, setEmail] = useState("");

  const [tecnicoEditar, setTecnicoEditar] = useState<Personal | null>(null);

  const handleCreatePersonal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rolActual !== "admin") return;

    if (!nombre || !cargo) {
      alert("Por favor ingrese el nombre y el cargo.");
      return;
    }

    if (tecnicoEditar) {
      await StorageService.savePersonal({
        id: tecnicoEditar.id,
        nombre,
        cargo,
        especialidad: especialidad || "General",
        telefono,
        email
      });
      setTecnicoEditar(null);
    } else {
      await StorageService.savePersonal({
        nombre,
        cargo,
        especialidad: especialidad || "General",
        telefono,
        email,
        activo: true
      });
    }

    setNombre("");
    setCargo("");
    setEspecialidad("");
    setTelefono("");
    setEmail("");
    onRefresh();
  };

  const handleEditClick = (p: Personal) => {
    setTecnicoEditar(p);
    setNombre(p.nombre);
    setCargo(p.cargo);
    setEspecialidad(p.especialidad);
    setTelefono(p.telefono || "");
    setEmail(p.email || "");
  };

  const handleCancelEdit = () => {
    setTecnicoEditar(null);
    setNombre("");
    setCargo("");
    setEspecialidad("");
    setTelefono("");
    setEmail("");
  };

  const handleToggleEstado = async (p: Personal) => {
    if (rolActual !== "admin") return;
    await StorageService.savePersonal({
      id: p.id,
      activo: !p.activo
    });
    onRefresh();
  };

  const handleDeletePersonal = async (p: Personal) => {
    if (rolActual !== "admin") return;
    const tieneAsignados = servicios.some(s => s.personal_asignado.some(pa => pa.id === p.id) && s.estado !== "completado" && s.estado !== "cancelado");

    if (tieneAsignados) {
      if (!confirm(`El tecnico ${p.nombre} tiene servicios activos agendados. Desea desactivarlo en lugar de eliminarlo?`)) {
        return;
      }
      await StorageService.savePersonal({ id: p.id, activo: false });
    } else {
      if (confirm(`Desea eliminar permanentemente a ${p.nombre} del listado de personal?`)) {
        await StorageService.deletePersonal(p.id);
      }
    }
    onRefresh();
  };

  return (
    <div className="space-y-6">
      {/* Formulario Agregar/Editar Personal (Solo Admin) */}
      {rolActual === "admin" && (
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center space-x-2">
              <UserPlus className="w-5 h-5 text-indigo-600" />
              <h2 className="font-bold text-slate-900 text-base">
                {tecnicoEditar ? `Editar Tecnico: ${tecnicoEditar.nombre}` : "Registrar Nuevo Integrante del Equipo"}
              </h2>
            </div>
            {tecnicoEditar && (
              <button
                onClick={handleCancelEdit}
                className="text-xs font-semibold text-slate-500 hover:text-slate-700 underline"
              >
                Cancelar Edicion
              </button>
            )}
          </div>

          <form onSubmit={handleCreatePersonal} className="grid grid-cols-1 md:grid-cols-6 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Nombre Completo *</label>
              <input
                type="text"
                required
                placeholder="Ej: Pedro Morales"
                value={nombre}
                onChange={e => setNombre(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Cargo / Rol *</label>
              <input
                type="text"
                required
                placeholder="Ej: Tecnico Electricista"
                value={cargo}
                onChange={e => setCargo(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Especialidad</label>
              <input
                type="text"
                placeholder="Ej: Climatizacion, Fibra Opt."
                value={especialidad}
                onChange={e => setEspecialidad(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Telefono</label>
              <input
                type="text"
                placeholder="+56 9..."
                value={telefono}
                onChange={e => setTelefono(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Email (para avisos)</label>
              <input
                type="email"
                placeholder="tecnico@empresa.cl"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-md transition-all flex items-center justify-center space-x-1"
              >
                <UserPlus className="w-4 h-4" />
                <span>{tecnicoEditar ? "Guardar Cambios" : "Agregar Trabajador"}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tarjetas del Personal */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {personal.map(p => {
          const serviciosTrabajador = servicios.filter(s => s.personal_asignado.some(pa => pa.id === p.id));
          const pendientes = serviciosTrabajador.filter(s => s.estado === "programado" || s.estado === "en_curso");
          const completados = serviciosTrabajador.filter(s => s.estado === "completado" || s.estado === "completado_atraso");

          return (
            <div key={p.id} className={`bg-white rounded-2xl border shadow-sm p-5 space-y-4 ${!p.activo ? "opacity-60 border-slate-300" : "border-slate-200"}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-12 h-12 rounded-2xl text-white font-bold text-base flex items-center justify-center shadow-md ${
                    p.activo ? "bg-indigo-600 shadow-indigo-500/20" : "bg-slate-500"
                  }`}>
                    {p.nombre.split(" ").map(n => n[0]).join("")}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm flex items-center space-x-1">
                      <span>{p.nombre}</span>
                      {!p.activo && <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-200 text-slate-600">Inactivo</span>}
                    </h3>
                    <p className="text-xs text-indigo-600 font-medium">{p.cargo}</p>
                  </div>
                </div>

                {/* Acciones de Edicion/Retiro (Solo Admin) */}
                {rolActual === "admin" && (
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => handleToggleEstado(p)}
                      title={p.activo ? "Desactivar Tecnico" : "Activar Tecnico"}
                      className={`p-1.5 rounded-lg border text-xs font-semibold transition-colors ${
                        p.activo ? "text-emerald-600 hover:bg-emerald-50 border-emerald-200" : "text-slate-500 hover:bg-slate-100 border-slate-200"
                      }`}
                    >
                      {p.activo ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => handleEditClick(p)}
                      title="Editar Tecnico"
                      className="p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeletePersonal(p)}
                      title="Eliminar Tecnico"
                      className="p-1.5 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              <div className="text-xs space-y-1.5 text-slate-600 border-y border-slate-100 py-3">
                <p className="flex items-center">
                  <Award className="w-3.5 h-3.5 mr-2 text-slate-400" />
                  <span className="font-medium text-slate-700">Especialidad:</span>&nbsp;{p.especialidad}
                </p>
                {p.telefono && (
                  <p className="flex items-center">
                    <Phone className="w-3.5 h-3.5 mr-2 text-slate-400" />
                    <span>{p.telefono}</span>
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2 text-center text-xs">
                <div className="bg-blue-50 p-2.5 rounded-xl border border-blue-100">
                  <span className="block font-bold text-blue-700 text-base">{pendientes.length}</span>
                  <span className="text-[11px] text-blue-600 font-medium">Asignados Activos</span>
                </div>
                <div className="bg-emerald-50 p-2.5 rounded-xl border border-emerald-100">
                  <span className="block font-bold text-emerald-700 text-base">{completados.length}</span>
                  <span className="text-[11px] text-emerald-600 font-medium">Completados</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

