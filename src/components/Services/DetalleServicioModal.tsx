import React from "react";
import { Servicio } from "../../types";
import { EstadoBadge, PrioridadBadge } from "../Common/EstadoBadge";
import { 
  X, MapPin, Calendar, Clock, 
  History, Edit 
} from "lucide-react";

interface Props {
  servicio: Servicio | null;
  onClose: () => void;
  onEditar: (servicio: Servicio) => void;
}

export const DetalleServicioModal: React.FC<Props> = ({ servicio, onClose, onEditar }) => {
  if (!servicio) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden my-8 border border-slate-100 animate-in fade-in zoom-in duration-200">
        
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-xl font-bold text-blue-400">{servicio.codigo}</span>
            <PrioridadBadge prioridad={servicio.prioridad} />
            <EstadoBadge estado={servicio.estado} fechaProgramada={servicio.fecha_programada} />
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
            <h3 className="font-bold text-slate-900 text-base">{servicio.cliente_nombre}</h3>
            {servicio.cliente_contacto && (
              <p className="text-xs text-slate-600">
                <span className="font-semibold text-slate-700">Contacto:</span> {servicio.cliente_contacto}
              </p>
            )}
            <p className="text-xs text-slate-600 flex items-center">
              <MapPin className="w-4 h-4 mr-1 text-slate-400 shrink-0" />
              <span>{servicio.ubicacion}</span>
            </p>
            <p className="text-xs text-slate-600 font-medium">
              <span className="font-semibold text-slate-700">Tipo de Servicio:</span> {servicio.tipo_servicio}
            </p>
          </div>

          <div>
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Descripcion del Trabajo</h4>
            <p className="text-xs text-slate-800 bg-white p-3 rounded-lg border border-slate-200 leading-relaxed">
              {servicio.descripcion || "Sin descripcion proporcionada."}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100">
              <h5 className="text-[11px] font-bold text-blue-800 uppercase mb-1 flex items-center">
                <Calendar className="w-3.5 h-3.5 mr-1 text-blue-600" />
                Fecha Programada
              </h5>
              <p className="text-xs font-semibold text-slate-900">
                {new Date(servicio.fecha_programada).toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
              </p>
              <p className="text-xs font-medium text-blue-700 mt-0.5">
                {new Date(servicio.fecha_programada).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })} hrs
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <h5 className="text-[11px] font-bold text-slate-600 uppercase mb-1 flex items-center">
                <Clock className="w-3.5 h-3.5 mr-1 text-slate-500" />
                Fechas Reales de Ejecucion
              </h5>
              <p className="text-xs text-slate-700">
                <span className="font-semibold">Inicio:</span> {servicio.fecha_real_inicio ? new Date(servicio.fecha_real_inicio).toLocaleString("es-ES") : "No registrado"}
              </p>
              <p className="text-xs text-slate-700 mt-0.5">
                <span className="font-semibold">Termino:</span> {servicio.fecha_real_fin ? new Date(servicio.fecha_real_fin).toLocaleString("es-ES") : "No registrado"}
              </p>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Personal Asignado</h4>
            {servicio.personal_asignado.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No hay personal asignado a este servicio.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {servicio.personal_asignado.map(p => (
                  <div key={p.id} className="p-2.5 rounded-lg border border-slate-200 bg-white flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-slate-800 text-white font-bold text-xs flex items-center justify-center shrink-0">
                      {p.nombre.split(" ").map(n => n[0]).join("")}
                    </div>
                    <div className="text-xs">
                      <p className="font-semibold text-slate-800">{p.nombre}</p>
                      <p className="text-[11px] text-slate-500">{p.cargo}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {servicio.observaciones && (
            <div>
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Observaciones / Notas</h4>
              <p className="text-xs text-slate-700 bg-amber-50/50 p-3 rounded-lg border border-amber-200">
                {servicio.observaciones}
              </p>
            </div>
          )}

          <div>
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center">
              <History className="w-3.5 h-3.5 mr-1" />
              Historial de Cambios de Estado
            </h4>
            <div className="space-y-2 max-h-36 overflow-y-auto border border-slate-200 rounded-lg p-3 bg-slate-50">
              {servicio.historial && servicio.historial.length > 0 ? (
                servicio.historial.map(h => (
                  <div key={h.id} className="text-xs border-b border-slate-200/60 pb-1.5 last:border-0 last:pb-0">
                    <div className="flex items-center justify-between text-slate-600 font-medium">
                      <span>
                        Estado cambiado a <strong className="text-slate-900">{h.estado_nuevo}</strong> por {h.usuario}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(h.fecha).toLocaleString("es-ES")}
                      </span>
                    </div>
                    {h.nota && <p className="text-[11px] text-slate-500 italic mt-0.5">{h.nota}</p>}
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 italic">Sin modificaciones previas.</p>
              )}
            </div>
          </div>
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={() => { onClose(); onEditar(servicio); }}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-xl transition-all flex items-center space-x-1.5"
          >
            <Edit className="w-4 h-4" />
            <span>Editar Servicio</span>
          </button>
          
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-xl transition-all"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

