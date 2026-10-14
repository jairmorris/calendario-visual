import React from "react";
import { EstadoServicio, PrioridadServicio } from "../../types";
import { Clock, CheckCircle2, AlertTriangle, XCircle, PlayCircle, RotateCcw } from "lucide-react";

interface EstadoBadgeProps {
  estado: EstadoServicio;
  fechaProgramada?: string;
  className?: string;
}

export const EstadoBadge: React.FC<EstadoBadgeProps> = ({ estado, fechaProgramada, className = "" }) => {
  const isAtrasado = estado === "programado" && fechaProgramada && new Date(fechaProgramada) < new Date();

  if (isAtrasado) {
    return (
      <span className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-300 ${className}`}>
        <AlertTriangle className="w-3.5 h-3.5 text-rose-600 animate-pulse" />
        <span>Atrasado</span>
      </span>
    );
  }

  switch (estado) {
    case "programado":
      return (
        <span className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200 ${className}`}>
          <Clock className="w-3.5 h-3.5 text-blue-600" />
          <span>Programado</span>
        </span>
      );
    case "en_curso":
      return (
        <span className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-900 border border-amber-300 ${className}`}>
          <PlayCircle className="w-3.5 h-3.5 text-amber-700 animate-spin" style={{ animationDuration: "3s" }} />
          <span>En Curso</span>
        </span>
      );
    case "completado":
      return (
        <span className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300 ${className}`}>
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          <span>Completado a tiempo</span>
        </span>
      );
    case "completado_atraso":
      return (
        <span className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-800 border border-orange-300 ${className}`}>
          <CheckCircle2 className="w-3.5 h-3.5 text-orange-600" />
          <span>Completado con atraso</span>
        </span>
      );
    case "cancelado":
      return (
        <span className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-200 text-slate-700 border border-slate-300 ${className}`}>
          <XCircle className="w-3.5 h-3.5 text-slate-500" />
          <span>Cancelado</span>
        </span>
      );
    case "reprogramado":
      return (
        <span className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 border border-purple-300 ${className}`}>
          <RotateCcw className="w-3.5 h-3.5 text-purple-600" />
          <span>Reprogramado</span>
        </span>
      );
    default:
      return null;
  }
};

export const PrioridadBadge: React.FC<{ prioridad: PrioridadServicio }> = ({ prioridad }) => {
  switch (prioridad) {
    case "urgente":
      return <span className="px-2 py-0.5 rounded text-[11px] font-bold uppercase bg-red-600 text-white shadow-sm">Urgente</span>;
    case "alta":
      return <span className="px-2 py-0.5 rounded text-[11px] font-bold uppercase bg-orange-500 text-white">Alta</span>;
    case "media":
      return <span className="px-2 py-0.5 rounded text-[11px] font-medium uppercase bg-slate-200 text-slate-700">Media</span>;
    case "baja":
      return <span className="px-2 py-0.5 rounded text-[11px] font-medium uppercase bg-slate-100 text-slate-600">Baja</span>;
  }
};

