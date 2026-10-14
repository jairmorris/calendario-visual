import React, { useState } from "react";
import { Servicio, Personal } from "../../types";
import { FileText, Download, Printer } from "lucide-react";

interface Props {
  servicios: Servicio[];
  personal: Personal[];
}

export const ReportsView: React.FC<Props> = ({ servicios, personal }) => {
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");
  const [filtroPersonal, setFiltroPersonal] = useState("todos");
  const [filtroEstado, setFiltroEstado] = useState("todos");

  const serviciosReporte = servicios.filter(s => {
    if (filtroEstado !== "todos" && s.estado !== filtroEstado) return false;
    
    if (filtroPersonal !== "todos") {
      const pid = Number(filtroPersonal);
      if (!s.personal_asignado.some(p => p.id === pid)) return false;
    }

    if (fechaDesde && new Date(s.fecha_programada) < new Date(fechaDesde)) return false;
    
    if (fechaHasta) {
      const fin = new Date(fechaHasta);
      fin.setHours(23, 59, 59, 999);
      if (new Date(s.fecha_programada) > fin) return false;
    }

    return true;
  });

  const exportToExcel = () => {
    const headers = [
      "Codigo", "Cliente", "Contacto", "Ubicacion", "Tipo Servicio", 
      "Fecha Programada", "Estado", "Prioridad", "Personal Asignado", "Observaciones"
    ];

    const rows = serviciosReporte.map(s => [
      `"${s.codigo}"`,
      `"${s.cliente_nombre.replace(/"/g, "")}"`,
      `"${(s.cliente_contacto || "").replace(/"/g, "")}"`,
      `"${s.ubicacion.replace(/"/g, "")}"`,
      `"${s.tipo_servicio.replace(/"/g, "")}"`,
      `"${new Date(s.fecha_programada).toLocaleString("es-ES")}"`,
      `"${s.estado}"`,
      `"${s.prioridad}"`,
      `"${s.personal_asignado.map(p => p.nombre).join(", ")}"`,
      `"${(s.observaciones || "").replace(/"/g, "")}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headers.join(";"), ...rows.map(r => r.join(";"))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Reporte_Servicios_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrintPdf = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4 print:hidden">
        <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
          <FileText className="w-5 h-5 text-blue-600" />
          <h2 className="font-bold text-slate-900 text-base">Generador de Reportes e Informes</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Fecha Desde</label>
            <input
              type="date"
              value={fechaDesde}
              onChange={e => setFechaDesde(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Fecha Hasta</label>
            <input
              type="date"
              value={fechaHasta}
              onChange={e => setFechaHasta(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Personal Asignado</label>
            <select
              value={filtroPersonal}
              onChange={e => setFiltroPersonal(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs bg-white"
            >
              <option value="todos">Todo el Personal</option>
              {personal.map(p => (
                <option key={p.id} value={p.id}>{p.nombre}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Estado</label>
            <select
              value={filtroEstado}
              onChange={e => setFiltroEstado(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs bg-white"
            >
              <option value="todos">Todos los Estados</option>
              <option value="programado">Programado</option>
              <option value="en_curso">En Curso</option>
              <option value="completado">Completado a tiempo</option>
              <option value="completado_atraso">Completado con atraso</option>
              <option value="cancelado">Cancelado</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
          <button
            onClick={exportToExcel}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-md transition-all flex items-center space-x-1.5"
          >
            <Download className="w-4 h-4" />
            <span>Exportar a Excel (CSV)</span>
          </button>

          <button
            onClick={handlePrintPdf}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl shadow-md transition-all flex items-center space-x-1.5"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir / PDF</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4 print:shadow-none print:border-none print:p-0">
        <div className="border-b border-slate-200 pb-4 flex justify-between items-start">
          <div>
            <h1 className="text-xl font-bold text-slate-900">Informe de Programacion de Servicios Tecnicos</h1>
            <p className="text-xs text-slate-500 mt-1">
              Empresa de Servicios - Servidor Privado Local
            </p>
          </div>
          <div className="text-right text-xs text-slate-500">
            <p><strong>Fecha de Emision:</strong> {new Date().toLocaleDateString("es-ES")}</p>
            <p><strong>Total Registros:</strong> {serviciosReporte.length} servicios</p>
          </div>
        </div>

        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-100 border-b border-slate-300 font-bold uppercase text-slate-700">
              <th className="p-2.5">Codigo</th>
              <th className="p-2.5">Cliente</th>
              <th className="p-2.5">Ubicacion</th>
              <th className="p-2.5">Tipo Servicio</th>
              <th className="p-2.5">Fecha Prog.</th>
              <th className="p-2.5">Estado</th>
              <th className="p-2.5">Personal</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {serviciosReporte.map(serv => (
              <tr key={serv.id} className="hover:bg-slate-50">
                <td className="p-2.5 font-bold text-slate-900">{serv.codigo}</td>
                <td className="p-2.5 font-semibold text-slate-800">{serv.cliente_nombre}</td>
                <td className="p-2.5 text-slate-600">{serv.ubicacion}</td>
                <td className="p-2.5 text-slate-700">{serv.tipo_servicio}</td>
                <td className="p-2.5 whitespace-nowrap">
                  {new Date(serv.fecha_programada).toLocaleString("es-ES", { dateStyle: "short", timeStyle: "short" })}
                </td>
                <td className="p-2.5 font-semibold capitalize text-slate-800">{serv.estado.replace("_", " ")}</td>
                <td className="p-2.5 text-slate-600">
                  {serv.personal_asignado.map(p => p.nombre).join(", ") || "Sin asignar"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

