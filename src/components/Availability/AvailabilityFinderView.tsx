import React, { useState } from "react";
import { Servicio, Personal } from "../../types";
import { Calendar as CalendarIcon, UserCheck } from "lucide-react";
import { format, addDays, isSameDay } from "date-fns";
import { es } from "date-fns/locale";

interface Props {
  servicios: Servicio[];
  personal: Personal[];
  onSelectServicio: (servicio: Servicio) => void;
}

export const AvailabilityFinderView: React.FC<Props> = ({ servicios, personal }) => {
  const todayStr = new Date().toISOString().split("T")[0];
  const nextWeekStr = addDays(new Date(), 7).toISOString().split("T")[0];

  const [fechaDesde, setFechaDesde] = useState(todayStr);
  const [fechaHasta, setFechaHasta] = useState(nextWeekStr);
  const [tipoServicio, setTipoServicio] = useState("todos");

  const start = new Date(fechaDesde);
  const end = new Date(fechaHasta);
  const diasRango: Date[] = [];
  let curr = new Date(start);
  while (curr <= end && diasRango.length < 14) {
    diasRango.push(new Date(curr));
    curr.setDate(curr.getDate() + 1);
  }

  const personalFiltrado = personal.filter(p => {
    if (tipoServicio === "todos") return true;
    return p.especialidad.toLowerCase().includes(tipoServicio.toLowerCase());
  });

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white rounded-2xl p-6 shadow-md border border-blue-800 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="p-2 bg-blue-600/40 rounded-xl">
              <UserCheck className="w-6 h-6 text-blue-300" />
            </span>
            <h2 className="text-lg font-bold">Buscador Rapido de Disponibilidad para Ventas</h2>
          </div>
          <p className="text-xs text-blue-200">
            Consulte en tiempo real los cupos y la carga horaria del personal tecnico para ofrecer fechas a clientes.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">Tipo de Servicio Requerido</label>
          <select
            value={tipoServicio}
            onChange={e => setTipoServicio(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            <option value="todos">Cualquier Especialidad / Todos los Servicios</option>
            <option value="electricidad">Electricidad</option>
            <option value="climatizacion">Climatizacion</option>
            <option value="redes">Redes / Telecomunicaciones</option>
            <option value="mecanica">Mecanica / Obras</option>
            <option value="seguridad">Inspeccion / Seguridad</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">Rango Fecha Desde</label>
          <input
            type="date"
            value={fechaDesde}
            onChange={e => setFechaDesde(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs bg-white"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">Rango Fecha Hasta</label>
          <input
            type="date"
            value={fechaHasta}
            onChange={e => setFechaHasta(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs bg-white"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-6 space-y-4">
        <h3 className="text-sm font-bold text-slate-800 flex items-center space-x-2">
          <CalendarIcon className="w-4 h-4 text-blue-600" />
          <span>Matriz de Carga Horaria por Tecnico</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-200">
                <th className="p-3 font-bold text-slate-700 min-w-[180px]">Tecnico / Especialidad</th>
                {diasRango.map((dia, idx) => (
                  <th key={idx} className="p-2.5 text-center min-w-[90px]">
                    <span className="block font-bold text-slate-800">{format(dia, "EEE d", { locale: es })}</span>
                    <span className="text-[10px] text-slate-500 uppercase">{format(dia, "MMM", { locale: es })}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {personalFiltrado.map(p => (
                <tr key={p.id} className="hover:bg-slate-50/80">
                  <td className="p-3">
                    <p className="font-bold text-slate-900">{p.nombre}</p>
                    <p className="text-[11px] text-blue-600 font-medium">{p.especialidad}</p>
                  </td>

                  {diasRango.map((dia, idx) => {
                    const serviciosDia = servicios.filter(
                      s => s.personal_asignado.some(pa => pa.id === p.id) &&
                           isSameDay(new Date(s.fecha_programada), dia) &&
                           s.estado !== "cancelado"
                    );

                    const cantidad = serviciosDia.length;

                    let statusClass = "bg-emerald-50 text-emerald-700 border-emerald-200";
                    let statusText = "Disponible";

                    if (cantidad === 1) {
                      statusClass = "bg-blue-50 text-blue-700 border-blue-200";
                      statusText = "1 Servicio";
                    } else if (cantidad >= 2) {
                      statusClass = "bg-rose-50 text-rose-700 border-rose-200 font-bold";
                      statusText = `${cantidad} Ocupado`;
                    }

                    return (
                      <td key={idx} className="p-2 text-center">
                        <div className={`p-2 rounded-xl border text-[11px] shadow-2xs space-y-0.5 ${statusClass}`}>
                          <span className="block font-semibold">{statusText}</span>
                          {cantidad === 0 && (
                            <span className="text-[10px] opacity-75">100% Libre</span>
                          )}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

