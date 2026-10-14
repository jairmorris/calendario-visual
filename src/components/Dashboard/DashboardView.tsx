import React from "react";
import { Servicio, Personal } from "../../types";
import { EstadoBadge, PrioridadBadge } from "../Common/EstadoBadge";
import { 
  CheckCircle2, Clock, AlertTriangle, PlayCircle, Users, 
  TrendingUp, Calendar, ArrowRight, ShieldAlert 
} from "lucide-react";

interface Props {
  servicios: Servicio[];
  personal: Personal[];
  onSelectServicio: (servicio: Servicio) => void;
  onNavigateTab: (tab: string) => void;
}

export const DashboardView: React.FC<Props> = ({ 
  servicios, 
  personal, 
  onSelectServicio,
  onNavigateTab 
}) => {
  const total = servicios.length;
  
  const completadosATiempo = servicios.filter(s => s.estado === "completado").length;
  const completadosAtraso = servicios.filter(s => s.estado === "completado_atraso").length;
  const enCurso = servicios.filter(s => s.estado === "en_curso").length;
  const programados = servicios.filter(s => s.estado === "programado").length;

  const atrasados = servicios.filter(
    s => s.estado === "programado" && new Date(s.fecha_programada) < new Date()
  );

  const porcentajeEficiencia = total > 0 
    ? Math.round((completadosATiempo / total) * 100) 
    : 100;

  const personalStats = personal.map(p => {
    const asignaciones = servicios.filter(s => s.personal_asignado.some(pa => pa.id === p.id)).length;
    return { ...p, asignaciones };
  }).sort((a, b) => b.asignaciones - a.asignaciones);

  const proximosServicios = [...servicios]
    .filter(s => s.estado === "programado" || s.estado === "en_curso")
    .sort((a, b) => new Date(a.fecha_programada).getTime() - new Date(b.fecha_programada).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {atrasados.length > 0 && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-rose-500 text-white rounded-xl shadow-sm animate-pulse">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-rose-900 text-sm">
                Atencion: Hay {atrasados.length} servicio(s) atrasados pendientes
              </h3>
              <p className="text-xs text-rose-700">
                Servicios cuya fecha programada ya vencio sin registrar inicio o termino.
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigateTab("services")}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-all flex items-center space-x-1"
          >
            <span>Ver Atrasados</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">A Tiempo</p>
            <h3 className="text-2xl font-extrabold text-slate-900 mt-1">{completadosATiempo}</h3>
            <p className="text-xs text-emerald-600 font-medium mt-1 flex items-center">
              <TrendingUp className="w-3.5 h-3.5 mr-1" />
              {porcentajeEficiencia}% Tasa Cumplimiento
            </p>
          </div>
          <div className="p-3 bg-emerald-100 text-emerald-600 rounded-2xl">
            <CheckCircle2 className="w-7 h-7" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">En Curso</p>
            <h3 className="text-2xl font-extrabold text-slate-900 mt-1">{enCurso}</h3>
            <p className="text-xs text-amber-600 font-medium mt-1">En Ejecucion Ahora</p>
          </div>
          <div className="p-3 bg-amber-100 text-amber-600 rounded-2xl">
            <PlayCircle className="w-7 h-7" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Programados</p>
            <h3 className="text-2xl font-extrabold text-slate-900 mt-1">{programados}</h3>
            <p className="text-xs text-blue-600 font-medium mt-1">A Futuro Agendados</p>
          </div>
          <div className="p-3 bg-blue-100 text-blue-600 rounded-2xl">
            <Clock className="w-7 h-7" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Atrasados / Alerta</p>
            <h3 className="text-2xl font-extrabold text-rose-600 mt-1">
              {atrasados.length + completadosAtraso}
            </h3>
            <p className="text-xs text-rose-500 font-medium mt-1">
              {atrasados.length} no iniciados - {completadosAtraso} cerrados tarde
            </p>
          </div>
          <div className="p-3 bg-rose-100 text-rose-600 rounded-2xl">
            <AlertTriangle className="w-7 h-7" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              <h2 className="font-bold text-slate-900 text-base">Proximos Servicios a Ejecutar</h2>
            </div>
            <button
              onClick={() => onNavigateTab("calendar")}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors flex items-center space-x-1"
            >
              <span>Ver Calendario Completo</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {proximosServicios.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-4 text-center">No hay servicios pendientes proximos.</p>
            ) : (
              proximosServicios.map(serv => (
                <div
                  key={serv.id}
                  onClick={() => onSelectServicio(serv)}
                  className="p-4 rounded-xl border border-slate-200 hover:border-blue-400 hover:shadow-md cursor-pointer transition-all bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-xs text-slate-900">{serv.codigo}</span>
                      <PrioridadBadge prioridad={serv.prioridad} />
                      <EstadoBadge estado={serv.estado} fechaProgramada={serv.fecha_programada} />
                    </div>
                    <h3 className="font-semibold text-sm text-slate-800">{serv.cliente_nombre}</h3>
                    <p className="text-xs text-slate-500">{serv.ubicacion} - <span className="font-medium text-slate-700">{serv.tipo_servicio}</span></p>
                  </div>

                  <div className="text-right shrink-0 border-t md:border-t-0 pt-2 md:pt-0 border-slate-200">
                    <p className="text-xs font-bold text-slate-700">
                      {new Date(serv.fecha_programada).toLocaleDateString("es-ES", { weekday: "short", day: "numeric", month: "short" })}
                    </p>
                    <p className="text-xs text-blue-600 font-semibold">
                      {new Date(serv.fecha_programada).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })} hrs
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-indigo-600" />
              <h2 className="font-bold text-slate-900 text-base">Carga de Personal</h2>
            </div>
            <button
              onClick={() => onNavigateTab("staff")}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
            >
              Gestionar
            </button>
          </div>

          <div className="space-y-3">
            {personalStats.map(p => (
              <div key={p.id} className="p-3 rounded-xl border border-slate-100 bg-slate-50 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800">{p.nombre}</span>
                  <span className="font-semibold text-blue-600">{p.asignaciones} servicio(s)</span>
                </div>
                <p className="text-[11px] text-slate-500">{p.cargo} - {p.especialidad}</p>
                <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-indigo-600 h-1.5 rounded-full"
                    style={{ width: `${Math.min(p.asignaciones * 25, 100)}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

