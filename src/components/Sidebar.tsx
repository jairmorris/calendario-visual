import React from "react";
import { LayoutDashboard, Calendar, Wrench, Users, FileText, PlusCircle, Eye, LogOut, UserCheck, BellRing, ShieldCheck } from "lucide-react";
import { Usuario } from "../types";

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  onOpenNewServiceModal: () => void;
  usuarioActual: Usuario;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  setCurrentTab,
  onOpenNewServiceModal,
  usuarioActual,
  onLogout
}) => {
  const menuItems = [
    { id: "dashboard", label: "Dashboard KPIs", icon: LayoutDashboard },
    { id: "calendar", label: "Calendario de Trabajo", icon: Calendar },
    { id: "availability", label: "Consulta Disponibilidad", icon: UserCheck },
    { id: "services", label: "Gestion de Servicios", icon: Wrench },
    { id: "staff", label: "Carga / Personal", icon: Users },
    { id: "reports", label: "Reportes y Exportar", icon: FileText },
    { id: "asistente", label: "Asistente de Avisos", icon: BellRing },
    ...(usuarioActual.rol === "admin" ? [{ id: "usuarios", label: "Usuarios", icon: ShieldCheck }] : []),
  ];

  return (
    <aside className="print:hidden w-64 bg-slate-900 text-slate-100 flex flex-col justify-between shrink-0 shadow-xl border-r border-slate-800">
      <div>
        <div className="p-5 border-b border-slate-800 flex items-center space-x-3">
          <div className="bg-blue-600 p-2.5 rounded-xl shadow-lg shadow-blue-500/30 text-white">
            <Wrench className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight tracking-wide text-white">SGP Equipos</h1>
            <p className="text-xs text-slate-400">Servidor Privado y Terreno</p>
          </div>
        </div>

        {usuarioActual.rol === "admin" ? (
          <div className="p-4">
            <button
              onClick={onOpenNewServiceModal}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium py-3 px-4 rounded-xl shadow-md shadow-blue-900/40 transition-all transform active:scale-95 flex items-center justify-center space-x-2 border border-blue-400/20"
            >
              <PlusCircle className="w-5 h-5" />
              <span>Nuevo Servicio</span>
            </button>
          </div>
        ) : (
          <div className="p-4">
            <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700/60 text-xs text-slate-300 flex items-center space-x-2">
              <Eye className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Modo Solo Lectura ({usuarioActual.departamento})</span>
            </div>
          </div>
        )}

        <nav className="px-3 py-2 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentTab(item.id)}
                className={
                  isActive
                    ? "w-full flex items-center space-x-3 px-3.5 py-3 rounded-xl text-sm font-medium transition-all bg-blue-600/15 text-blue-400 border border-blue-500/30 shadow-inner"
                    : "w-full flex items-center space-x-3 px-3.5 py-3 rounded-xl text-sm font-medium transition-all text-slate-400 hover:bg-slate-800/80 hover:text-slate-200"
                }
              >
                <Icon className={isActive ? "w-5 h-5 text-blue-400" : "w-5 h-5 text-slate-400"} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      <div className="p-4 border-t border-slate-800 text-xs space-y-3">
        {/* Info Usuario Autenticado */}
        <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/80 flex items-center justify-between">
          <div>
            <p className="font-bold text-slate-200 text-xs truncate max-w-[130px]">{usuarioActual.nombre}</p>
            <p className="text-[10px] text-blue-400 font-medium truncate max-w-[130px]">{usuarioActual.departamento}</p>
          </div>
          <button
            onClick={onLogout}
            title="Cerrar Sesion"
            className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-700 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center space-x-2 text-slate-500">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="font-medium text-slate-400">Servidor Privado Activo</span>
        </div>
      </div>
    </aside>
  );
};

