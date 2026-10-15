import React, { useRef, useState } from "react";
import { MesContinuo, MesContinuoHandle } from "./MesContinuo";
import { Servicio } from "../../types";
import { EstadoBadge, PrioridadBadge } from "../Common/EstadoBadge";
import { 
  Calendar as CalendarIcon, 
  Clock, MapPin, User, ChevronLeft, ChevronRight 
} from "lucide-react";
import { 
  format, addMonths, subMonths, startOfWeek, endOfWeek, 
  startOfMonth, eachDayOfInterval, 
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

  const mesRef = useRef<MesContinuoHandle>(null);

  const nextPeriod = () => {
    if (vista === "mes") mesRef.current?.irAFecha(startOfMonth(addMonths(currentDate, 1)));
    else if (vista === "semana") setCurrentDate(addDays(currentDate, 7));
    else setCurrentDate(addDays(currentDate, 1));
  };

  const prevPeriod = () => {
    if (vista === "mes") mesRef.current?.irAFecha(startOfMonth(subMonths(currentDate, 1)));
    else if (vista === "semana") setCurrentDate(subDays(currentDate, 7));
    else setCurrentDate(subDays(currentDate, 1));
  };

  const todayPeriod = () => {
    if (vista === "mes") mesRef.current?.irAFecha(new Date(), { semanasArriba: 1 });
    else setCurrentDate(new Date());
  };

  const verDia = (dia: Date) => {
    setCurrentDate(dia);
    setVista("dia");
  };

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
  const daysInWeek = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const getServiciosPorDia = (day: Date) => {
    return servicios.filter(s => isSameDay(new Date(s.fecha_programada), day));
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-[calc(100vh-7rem)] min-h-[420px]">
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
        <div className="flex-1 min-h-0 flex flex-col">
          <div className="grid grid-cols-7 gap-px bg-slate-200 border-b border-slate-200 shrink-0">
            {["Lun", "Mar", "Mie", "Jue", "Vie", "Sab", "Dom"].map(d => (
              <div key={d} className="bg-slate-100 py-1 text-center text-[10px] font-bold text-slate-600 uppercase tracking-wide">
                {d}
              </div>
            ))}
          </div>
          <MesContinuo
            ref={mesRef}
            servicios={servicios}
            fechaInicial={currentDate}
            onFechaVisible={setCurrentDate}
            onSelectServicio={onSelectServicio}
            onVerDia={verDia}
          />
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

