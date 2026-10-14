import React, { useState } from "react";
import { Servicio } from "../../types";
import { EstadoBadge, PrioridadBadge } from "../Common/EstadoBadge";
import { 
  Calendar as CalendarIcon, 
  Clock, MapPin, User, ChevronLeft, ChevronRight 
} from "lucide-react";
import { 
  format, addMonths, subMonths, startOfWeek, endOfWeek, 
  startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, 
  isSameDay, isToday, addDays, subDays 
} from "date-fns";
import { es } from "date-fns/locale";

interface Props {
  servicios: Servicio[];
  onSelectServicio: (servicio: Servicio) => void;
  onNuevoServicioFecha?: (fechaIso: string) => void;
}

type VistaCalendario = "mes" | "semana" | "dia";

export const CalendarView: React.FC<Props> = ({ servicios, onSelectServicio }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [vista, setVista] = useState<VistaCalendario>("mes");

  const nextPeriod = () => {
    if (vista === "mes") setCurrentDate(addMonths(currentDate, 1));
    else if (vista === "semana") setCurrentDate(addDays(currentDate, 7));
    else setCurrentDate(addDays(currentDate, 1));
  };

  const prevPeriod = () => {
    if (vista === "mes") setCurrentDate(subMonths(currentDate, 1));
    else if (vista === "semana") setCurrentDate(subDays(currentDate, 7));
    else setCurrentDate(subDays(currentDate, 1));
  };

  const todayPeriod = () => setCurrentDate(new Date());

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const daysInMonth = eachDayOfInterval({ start: startDate, end: endDate });

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
  const daysInWeek = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const getServiciosPorDia = (day: Date) => {
    return servicios.filter(s => isSameDay(new Date(s.fecha_programada), day));
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full">
      <div className="p-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4 bg-slate-50">
        <div className="flex items-center space-x-3">
          <h2 className="text-lg font-bold text-slate-900 capitalize min-w-[200px]">
            {format(currentDate, vista === "mes" ? "MMMM yyyy" : "d MMMM yyyy", { locale: es })}
          </h2>
          
          <div className="inline-flex rounded-lg border border-slate-300 bg-white p-0.5 shadow-sm">
            <button
              onClick={prevPeriod}
              className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={todayPeriod}
              className="px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-md border-x border-slate-200 transition-colors"
            >
              Hoy
            </button>
            <button
              onClick={nextPeriod}
              className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="hidden lg:flex items-center space-x-4 text-xs">
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-3 rounded-full bg-blue-500"></span>
            <span className="text-slate-600">Programado</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-3 rounded-full bg-amber-500"></span>
            <span className="text-slate-600">En Curso</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
            <span className="text-slate-600">Completado</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-3 rounded-full bg-rose-500"></span>
            <span className="text-slate-600 font-semibold">Atrasado</span>
          </div>
        </div>

        <div className="inline-flex rounded-xl bg-slate-200/80 p-1 text-xs font-semibold text-slate-600">
          <button
            onClick={() => setVista("mes")}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              vista === "mes" ? "bg-white text-blue-600 shadow-sm" : "hover:text-slate-900"
            }`}
          >
            Mes
          </button>
          <button
            onClick={() => setVista("semana")}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              vista === "semana" ? "bg-white text-blue-600 shadow-sm" : "hover:text-slate-900"
            }`}
          >
            Semana
          </button>
          <button
            onClick={() => setVista("dia")}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              vista === "dia" ? "bg-white text-blue-600 shadow-sm" : "hover:text-slate-900"
            }`}
          >
            Dia
          </button>
        </div>
      </div>

      {vista === "mes" && (
        <div className="flex-1 grid grid-cols-7 auto-rows-fr gap-px bg-slate-200">
          {["Lun", "Mar", "Mie", "Jue", "Vie", "Sab", "Dom"].map((d, i) => (
            <div key={i} className="bg-slate-100 p-2 text-center text-xs font-bold text-slate-600 uppercase">
              {d}
            </div>
          ))}

          {daysInMonth.map((day, idx) => {
            const dayServicios = getServiciosPorDia(day);
            const isCurrentMonth = isSameMonth(day, monthStart);
            const isDayToday = isToday(day);

            return (
              <div
                key={idx}
                className={`min-h-[100px] p-2 flex flex-col justify-between transition-colors ${
                  isCurrentMonth ? "bg-white" : "bg-slate-50/50 text-slate-400"
                } ${isDayToday ? "ring-2 ring-blue-500 ring-inset bg-blue-50/20" : ""}`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={`text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center ${
                      isDayToday ? "bg-blue-600 text-white" : "text-slate-700"
                    }`}
                  >
                    {format(day, "d")}
                  </span>
                  {dayServicios.length > 0 && (
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                      {dayServicios.length}
                    </span>
                  )}
                </div>

                <div className="space-y-1 flex-1 overflow-y-auto max-h-[85px] scrollbar-thin">
                  {dayServicios.map(serv => {
                    const isAtrasado = serv.estado === "programado" && new Date(serv.fecha_programada) < new Date();
                    
                    let colorBg = "bg-blue-50 border-blue-200 text-blue-900 hover:bg-blue-100";
                    if (isAtrasado) colorBg = "bg-rose-50 border-rose-300 text-rose-900 hover:bg-rose-100 font-medium";
                    else if (serv.estado === "en_curso") colorBg = "bg-amber-50 border-amber-300 text-amber-900 hover:bg-amber-100";
                    else if (serv.estado === "completado" || serv.estado === "completado_atraso") colorBg = "bg-emerald-50 border-emerald-300 text-emerald-900 hover:bg-emerald-100";

                    return (
                      <div
                        key={serv.id}
                        onClick={() => onSelectServicio(serv)}
                        className={`p-1 rounded border text-left cursor-pointer transition-all text-[11px] ${colorBg}`}
                      >
                        <div className="flex items-center justify-between font-bold truncate">
                          <span>{serv.codigo}</span>
                          <span className="text-[10px] opacity-75">
                            {format(new Date(serv.fecha_programada), "HH:mm")}
                          </span>
                        </div>
                        <div className="truncate text-slate-700 font-medium">{serv.cliente_nombre}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {(vista === "semana" || vista === "dia") && (
        <div className="flex-1 p-4 overflow-y-auto space-y-4">
          {(vista === "semana" ? daysInWeek : [currentDate]).map((day, idx) => {
            const dayServicios = getServiciosPorDia(day);
            const isDayToday = isToday(day);

            return (
              <div
                key={idx}
                className={`border rounded-xl p-4 bg-white ${
                  isDayToday ? "border-blue-400 ring-1 ring-blue-400" : "border-slate-200"
                }`}
              >
                <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
                  <h3 className="font-bold text-slate-800 text-sm capitalize flex items-center space-x-2">
                    <span className={`w-3 h-3 rounded-full ${isDayToday ? "bg-blue-600" : "bg-slate-300"}`}></span>
                    <span>{format(day, "EEEE d MMMM", { locale: es })}</span>
                  </h3>
                  <span className="text-xs text-slate-500 font-medium">{dayServicios.length} servicios agendados</span>
                </div>

                {dayServicios.length === 0 ? (
                  <p className="text-xs text-slate-400 italic py-2">Sin servicios programados para este dia.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {dayServicios.map(serv => (
                      <div
                        key={serv.id}
                        onClick={() => onSelectServicio(serv)}
                        className="p-3 rounded-xl border border-slate-200 hover:border-blue-400 hover:shadow-md cursor-pointer transition-all bg-slate-50/50 space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-slate-900">{serv.codigo}</span>
                          <EstadoBadge estado={serv.estado} fechaProgramada={serv.fecha_programada} />
                        </div>

                        <div>
                          <h4 className="font-semibold text-sm text-slate-800">{serv.cliente_nombre}</h4>
                          <p className="text-xs text-slate-600 flex items-center mt-1">
                            <MapPin className="w-3.5 h-3.5 mr-1 text-slate-400 shrink-0" />
                            <span className="truncate">{serv.ubicacion}</span>
                          </p>
                        </div>

                        <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-200/60">
                          <span className="flex items-center">
                            <Clock className="w-3.5 h-3.5 mr-1 text-blue-500" />
                            {format(new Date(serv.fecha_programada), "HH:mm")} hrs
                          </span>
                          <span className="flex items-center">
                            <User className="w-3.5 h-3.5 mr-1 text-slate-400" />
                            {serv.personal_asignado.length} asignados
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

