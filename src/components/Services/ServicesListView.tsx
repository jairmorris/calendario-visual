import React, { useState } from "react";
import { Servicio, Personal, RolUsuario } from "../../types";
import { EstadoBadge, PrioridadBadge } from "../Common/EstadoBadge";
import { StorageService } from "../../services/storage";
import { Search, Plus, Edit2, Trash2, Eye } from "lucide-react";

interface Props {
  servicios: Servicio[];
  personal: Personal[];
  onSelectServicio: (servicio: Servicio) => void;
  onEditarServicio: (servicio: Servicio) => void;
  onNuevoServicio: () => void;
  onRefresh: () => void;
  rolActual: RolUsuario;
}

export const ServicesListView: React.FC<Props> = ({
  servicios,
  personal,
  onSelectServicio,
  onEditarServicio,
  onNuevoServicio,
  onRefresh,
  rolActual
}) => {
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [filtroPrioridad, setFiltroPrioridad] = useState("todas");
  const [filtroPersonal, setFiltroPersonal] = useState("todos");

  const serviciosFiltrados = servicios.filter(s => {
    if (busqueda) {
      const q = busqueda.toLowerCase();
      const match = 
        s.codigo.toLowerCase().includes(q) ||
        s.cliente_nombre.toLowerCase().includes(q) ||
        s.ubicacion.toLowerCase().includes(q) ||
        s.tipo_servicio.toLowerCase().includes(q);
      if (!match) return false;
    }

    if (filtroEstado !== "todos") {
      if (filtroEstado === "atrasados") {
        const isAtrasado = s.estado === "programado" && new Date(s.fecha_programada) < new Date();
        if (!isAtrasado) return false;
      } else if (s.estado !== filtroEstado) {
        return false;
      }
    }

    if (filtroPrioridad !== "todas" && s.prioridad !== filtroPrioridad) return false;

    if (filtroPersonal !== "todos") {
      const pid = Number(filtroPersonal);
      if (!s.personal_asignado.some(p => p.id === pid)) return false;
    }

    return true;
  });

  const handleDelete = (id: number, codigo: string) => {
    if (confirm(`Desea eliminar permanentemente el servicio ${codigo}?`)) {
      StorageService.deleteServicio(id);
      onRefresh();
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por codigo, cliente, ubicacion o tipo..."
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {/* Boton Nuevo solo para Admin */}
          {rolActual === "admin" && (
            <button
              onClick={onNuevoServicio}
              className="w-full md:w-auto px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-md shadow-blue-500/20 transition-all flex items-center justify-center space-x-1.5 shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Nuevo Servicio</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100">
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Estado</label>
            <select
              value={filtroEstado}
              onChange={e => setFiltroEstado(e.target.value)}
              className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs bg-white focus:outline-none"
            >
              <option value="todos">Todos los Estados</option>
              <option value="atrasados">Solo Atrasados</option>
              <option value="programado">Programado</option>
              <option value="en_curso">En Curso</option>
              <option value="completado">Completado a tiempo</option>
              <option value="completado_atraso">Completado con atraso</option>
              <option value="reprogramado">Reprogramado</option>
              <option value="cancelado">Cancelado</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Prioridad</label>
            <select
              value={filtroPrioridad}
              onChange={e => setFiltroPrioridad(e.target.value)}
              className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs bg-white focus:outline-none"
            >
              <option value="todas">Todas las Prioridades</option>
              <option value="urgente">Urgente</option>
              <option value="alta">Alta</option>
              <option value="media">Media</option>
              <option value="baja">Baja</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Personal Asignado</label>
            <select
              value={filtroPersonal}
              onChange={e => setFiltroPersonal(e.target.value)}
              className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs bg-white focus:outline-none"
            >
              <option value="todos">Todo el Personal</option>
              {personal.map(p => (
                <option key={p.id} value={p.id}>{p.nombre}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider">
                <th className="p-3">Codigo</th>
                <th className="p-3">Cliente / Ubicacion</th>
                <th className="p-3">Tipo de Servicio</th>
                <th className="p-3">Programacion</th>
                <th className="p-3">Personal</th>
                <th className="p-3">Prioridad</th>
                <th className="p-3">Estado</th>
                <th className="p-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {serviciosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400 italic">
                    No se encontraron servicios que coincidan con los filtros.
                  </td>
                </tr>
              ) : (
                serviciosFiltrados.map(serv => (
                  <tr key={serv.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3 font-bold text-blue-600">
                      <button onClick={() => onSelectServicio(serv)} className="hover:underline">
                        {serv.codigo}
                      </button>
                    </td>

                    <td className="p-3">
                      <p className="font-semibold text-slate-900">{serv.cliente_nombre}</p>
                      <p className="text-[11px] text-slate-500 truncate max-w-[200px]">{serv.ubicacion}</p>
                    </td>

                    <td className="p-3 font-medium text-slate-700">
                      {serv.tipo_servicio}
                    </td>

                    <td className="p-3 whitespace-nowrap">
                      <p className="font-semibold text-slate-800">
                        {new Date(serv.fecha_programada).toLocaleDateString("es-ES")}
                      </p>
                      <p className="text-[11px] text-blue-600 font-medium">
                        {new Date(serv.fecha_programada).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })} hrs
                      </p>
                    </td>

                    <td className="p-3">
                      {serv.personal_asignado.length === 0 ? (
                        <span className="text-slate-400 italic">Sin asignar</span>
                      ) : (
                        <div className="flex -space-x-1.5 overflow-hidden">
                          {serv.personal_asignado.map(p => (
                            <span
                              key={p.id}
                              title={p.nombre}
                              className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-800 text-white font-bold text-[10px] ring-2 ring-white"
                            >
                              {p.nombre.split(" ").map(n => n[0]).join("")}
                            </span>
                          ))}
                        </div>
                      )}
                    </td>

                    <td className="p-3">
                      <PrioridadBadge prioridad={serv.prioridad} />
                    </td>

                    <td className="p-3">
                      <EstadoBadge estado={serv.estado} fechaProgramada={serv.fecha_programada} />
                    </td>

                    <td className="p-3 text-right space-x-1 whitespace-nowrap">
                      <button
                        onClick={() => onSelectServicio(serv)}
                        title="Ver Detalle"
                        className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      
                      {/* Botones Editar y Eliminar solo para Admin / Operaciones */}
                      {rolActual === "admin" && (
                        <>
                          <button
                            onClick={() => onEditarServicio(serv)}
                            title="Editar Servicio"
                            className="p-1.5 text-slate-600 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(serv.id, serv.codigo)}
                            title="Eliminar"
                            className="p-1.5 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

