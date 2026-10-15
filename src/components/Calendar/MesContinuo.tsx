import React, { forwardRef, useImperativeHandle, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Servicio } from "../../types";
import { addDays, addWeeks, differenceInCalendarWeeks, eachDayOfInterval, format, isToday, startOfWeek } from "date-fns";

const SEMANA = { weekStartsOn: 1 as const };
const ALTO_FILA = 120; // px por semana, borde inferior incluido: el paso entre filas debe ser exacto para calcular posiciones sin medir el DOM
const PASO = 12; // semanas que se agregan al llegar a un extremo
const MAX_CHIPS = 2;

export interface MesContinuoHandle {
  irAFecha: (fecha: Date, opciones?: { suave?: boolean; semanasArriba?: number }) => void;
}

interface Props {
  servicios: Servicio[];
  fechaInicial: Date;
  onFechaVisible: (fecha: Date) => void;
  onSelectServicio: (s: Servicio) => void;
  onVerDia: (dia: Date) => void;
}

const colorServicio = (s: Servicio) => {
  if (s.estado === "programado" && new Date(s.fecha_programada) < new Date()) return "bg-rose-50 border-rose-300 text-rose-900 hover:bg-rose-100 font-medium";
  if (s.estado === "en_curso") return "bg-amber-50 border-amber-300 text-amber-900 hover:bg-amber-100";
  if (s.estado === "completado" || s.estado === "completado_atraso") return "bg-emerald-50 border-emerald-300 text-emerald-900 hover:bg-emerald-100";
  return "bg-blue-50 border-blue-200 text-blue-900 hover:bg-blue-100";
};

export const MesContinuo = forwardRef<MesContinuoHandle, Props>(
  ({ servicios, fechaInicial, onFechaVisible, onSelectServicio, onVerDia }, ref) => {
    const [ancla] = useState(() => startOfWeek(new Date(), SEMANA));
    const [rango, setRango] = useState({ antes: 12, despues: 40 });
    const scrollRef = useRef<HTMLDivElement>(null);
    const pendiente = useRef<number | null>(null); // semana a la que saltar cuando termine de cambiar el rango
    const desplazar = useRef(0); // px a sumar al scroll tras agregar semanas arriba
    const extendiendo = useRef(false);
    const ultimaFila = useRef(-1);

    // Los callbacks del padre cambian en cada render; se leen por ref para no invalidar las filas memorizadas
    const cb = useRef({ onFechaVisible, onSelectServicio, onVerDia });
    cb.current = { onFechaVisible, onSelectServicio, onVerDia };

    const semanas = useMemo(
      () => Array.from({ length: rango.antes + rango.despues + 1 }, (_, i) => addWeeks(ancla, i - rango.antes)),
      [ancla, rango.antes, rango.despues]
    );

    const porDia = useMemo(() => {
      const m = new Map<string, Servicio[]>();
      for (const s of servicios) {
        const k = format(new Date(s.fecha_programada), "yyyy-MM-dd");
        (m.get(k) || m.set(k, []).get(k)!).push(s);
      }
      for (const lista of m.values()) lista.sort((a, b) => a.fecha_programada.localeCompare(b.fecha_programada));
      return m;
    }, [servicios]);

    useLayoutEffect(() => {
      const el = scrollRef.current;
      if (el) {
        if (pendiente.current !== null) {
          el.scrollTop = (pendiente.current + rango.antes) * ALTO_FILA;
          pendiente.current = null;
        } else if (desplazar.current) {
          el.scrollTop += desplazar.current;
        }
      }
      desplazar.current = 0;
      extendiendo.current = false;
    }, [rango]);

    const irAFecha = (fecha: Date, { suave = true, semanasArriba = 0 } = {}) => {
      const el = scrollRef.current;
      if (!el) return;
      const w = differenceInCalendarWeeks(fecha, ancla, SEMANA) - semanasArriba;
      // El titulo toma la segunda fila visible; se fija aqui para no depender de que el navegador emita eventos de scroll
      cb.current.onFechaVisible(addDays(addWeeks(ancla, w + 1), 3));
      if (w < -rango.antes || w + 6 > rango.despues) {
        pendiente.current = w;
        extendiendo.current = true;
        setRango(r => ({ antes: Math.max(r.antes, -w + 6), despues: Math.max(r.despues, w + 12) }));
      } else {
        el.scrollTo({ top: (w + rango.antes) * ALTO_FILA, behavior: suave ? "smooth" : "auto" });
      }
    };

    useImperativeHandle(ref, () => ({ irAFecha }));

    // Posicion inicial: la fecha que estaba mostrando el calendario
    useLayoutEffect(() => { irAFecha(fechaInicial, { suave: false, semanasArriba: 1 }); }, []);

    const onScroll = () => {
      const el = scrollRef.current;
      if (!el) return;
      const top = el.scrollTop;

      if (!extendiendo.current) {
        if (top < ALTO_FILA * 3) {
          extendiendo.current = true;
          desplazar.current = PASO * ALTO_FILA;
          setRango(r => ({ ...r, antes: r.antes + PASO }));
        } else if (top + el.clientHeight > el.scrollHeight - ALTO_FILA * 3) {
          extendiendo.current = true;
          setRango(r => ({ ...r, despues: r.despues + PASO }));
        }
      }

      // La fila de referencia es la segunda visible: la primera suele ser la cola del mes anterior
      const fila = Math.min(Math.max(Math.round(top / ALTO_FILA) + 1, 0), semanas.length - 1);
      if (fila !== ultimaFila.current) {
        ultimaFila.current = fila;
        cb.current.onFechaVisible(addDays(semanas[fila], 3));
      }
    };

    const filas = useMemo(
      () =>
        semanas.map(inicio => (
          <div key={inicio.getTime()} className="grid grid-cols-7 gap-px shrink-0 border-b border-slate-200 bg-slate-200" style={{ height: ALTO_FILA }}>
            {eachDayOfInterval({ start: inicio, end: addDays(inicio, 6) }).map(day => {
              const lista = porDia.get(format(day, "yyyy-MM-dd")) || [];
              const hoy = isToday(day);
              const extra = lista.length - MAX_CHIPS;
              return (
                <div
                  key={day.getTime()}
                  className={`p-1.5 flex flex-col overflow-hidden ${day.getMonth() % 2 === 0 ? "bg-white" : "bg-slate-50"} ${
                    hoy ? "ring-2 ring-blue-500 ring-inset bg-blue-50/30" : ""
                  }`}
                >
                  <div className="flex items-center justify-between mb-1 shrink-0">
                    <span
                      className={`text-xs font-bold rounded-full min-w-6 h-6 px-1 flex items-center justify-center ${
                        hoy ? "bg-blue-600 text-white" : day.getDate() === 1 ? "bg-slate-800 text-white" : "text-slate-700"
                      }`}
                    >
                      {day.getDate() === 1 ? format(day, "d MMM") : format(day, "d")}
                    </span>
                    {lista.length > 0 && (
                      <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">{lista.length}</span>
                    )}
                  </div>

                  <div className="space-y-0.5 min-h-0">
                    {lista.slice(0, MAX_CHIPS).map(serv => (
                      <div
                        key={serv.id}
                        onClick={() => cb.current.onSelectServicio(serv)}
                        title={`${serv.codigo} - ${serv.cliente_nombre}`}
                        className={`px-1 py-0.5 rounded border text-left cursor-pointer transition-all text-[11px] leading-tight ${colorServicio(serv)}`}
                      >
                        <div className="flex items-center justify-between font-bold truncate">
                          <span>{serv.codigo}</span>
                          <span className="text-[10px] opacity-75">{format(new Date(serv.fecha_programada), "HH:mm")}</span>
                        </div>
                        <div className="truncate text-slate-700 font-medium">{serv.cliente_nombre}</div>
                      </div>
                    ))}
                    {extra > 0 && (
                      <button onClick={() => cb.current.onVerDia(day)} className="text-[10px] font-semibold text-blue-600 hover:underline">
                        +{extra} mas
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )),
      [semanas, porDia]
    );

    return (
      <div ref={scrollRef} onScroll={onScroll} className="flex-1 min-h-0 overflow-y-auto bg-slate-200">
        <div className="flex flex-col">{filas}</div>
      </div>
    );
  }
);
