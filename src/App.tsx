import React, { useState, useEffect } from "react";
import { Servicio, Personal, Usuario } from "./types";
import { StorageService } from "./services/storage";
import { AuthService } from "./services/auth";
import { setSesionExpiradaHandler } from "./services/api";
import { Sidebar } from "./components/Sidebar";
import { DashboardView } from "./components/Dashboard/DashboardView";
import { CalendarView } from "./components/Calendar/CalendarView";
import { AvailabilityFinderView } from "./components/Availability/AvailabilityFinderView";
import { ServicesListView } from "./components/Services/ServicesListView";
import { StaffView } from "./components/Staff/StaffView";
import { ReportsView } from "./components/Reports/ReportsView";
import { NuevoServicioModal } from "./components/Services/NuevoServicioModal";
import { DetalleServicioModal } from "./components/Services/DetalleServicioModal";
import { LoginView } from "./components/Auth/LoginView";
import { Bell, ShieldCheck, Eye } from "lucide-react";

export const App: React.FC = () => {
  const [usuarioActual, setUsuarioActual] = useState<Usuario | null>(null);
  const [currentTab, setCurrentTab] = useState("dashboard");
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [personal, setPersonal] = useState<Personal[]>([]);

  const [isNuevoModalOpen, setIsNuevoModalOpen] = useState(false);
  const [servicioAEditar, setServicioAEditar] = useState<Servicio | null>(null);
  const [servicioSeleccionado, setServicioSeleccionado] = useState<Servicio | null>(null);

  const [cargando, setCargando] = useState(true);

  // Copia los datos de la cache al estado de React (la cache ya fue cargada del servidor)
  const refreshData = () => {
    setServicios([...StorageService.getServicios()]);
    setPersonal([...StorageService.getPersonal()]);
  };

  // Trae los datos del servidor; en segundo plano no molesta si falla un ciclo
  const sincronizar = async () => {
    try {
      await StorageService.load();
      refreshData();
    } catch { /* se reintenta en el siguiente ciclo */ }
  };

  const cerrarSesionLocal = () => {
    StorageService.clear();
    refreshData();
    setUsuarioActual(null);
  };

  useEffect(() => {
    setSesionExpiradaHandler(cerrarSesionLocal);
    AuthService.restoreSession().then(u => {
      setUsuarioActual(u);
      setCargando(false);
    });
  }, []);

  // Con sesion: cargar datos y refrescar cada 30 s para ver los cambios de los demas
  useEffect(() => {
    if (!usuarioActual) return;
    sincronizar();
    const id = setInterval(sincronizar, 30000);
    return () => clearInterval(id);
  }, [usuarioActual]);

  const handleLoginSuccess = (u: Usuario) => {
    setUsuarioActual(u);
  };

  const handleLogout = async () => {
    await AuthService.logout();
    cerrarSesionLocal();
  };

  const handleOpenNuevo = () => {
    if (!usuarioActual || usuarioActual.rol !== "admin") return;
    setServicioAEditar(null);
    setIsNuevoModalOpen(true);
  };

  const handleOpenEditar = (serv: Servicio) => {
    if (!usuarioActual || usuarioActual.rol !== "admin") return;
    setServicioAEditar(serv);
    setIsNuevoModalOpen(true);
  };

  if (cargando) return null;

  if (!usuarioActual) {
    return <LoginView onLoginSuccess={handleLoginSuccess} />;
  }

  const rolActual = usuarioActual.rol;

  const totalAtrasados = servicios.filter(
    s => s.estado === "programado" && new Date(s.fecha_programada) < new Date()
  ).length;

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-100 font-sans text-slate-900">
      <Sidebar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        onOpenNewServiceModal={handleOpenNuevo}
        usuarioActual={usuarioActual}
        onLogout={handleLogout}
      />

      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0 shadow-xs">
          <div>
            <h2 className="text-base font-bold text-slate-800 capitalize">
              {currentTab === "dashboard" && "Dashboard General y KPIs"}
              {currentTab === "calendar" && "Calendario de Programacion de Equipos"}
              {currentTab === "availability" && "Matriz de Disponibilidad para Ventas"}
              {currentTab === "services" && "Gestion y Registro de Servicios"}
              {currentTab === "staff" && "Gestion y Disponibilidad de Tecnicos"}
              {currentTab === "reports" && "Generacion de Reportes"}
            </h2>
            <p className="text-xs text-slate-500">Servidor Privado local - {usuarioActual.departamento}</p>
          </div>

          <div className="flex items-center space-x-4">
            {totalAtrasados > 0 && (
              <button
                onClick={() => setCurrentTab("services")}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-rose-100 text-rose-800 border border-rose-300 text-xs font-semibold hover:bg-rose-200 transition-colors animate-pulse"
              >
                <Bell className="w-3.5 h-3.5 text-rose-600" />
                <span>{totalAtrasados} Atrasado(s)</span>
              </button>
            )}

            <div className="flex items-center space-x-2 border-l border-slate-200 pl-4 text-xs">
              <div className={`w-8 h-8 rounded-full text-white font-bold flex items-center justify-center ${
                rolActual === "admin" ? "bg-blue-600" : "bg-emerald-600"
              }`}>
                {usuarioActual.nombre.split(" ").map(n => n[0]).join("").substring(0, 2)}
              </div>
              <div className="hidden sm:block text-left">
                <p className="font-semibold text-slate-800 flex items-center space-x-1">
                  <span>{usuarioActual.nombre}</span>
                  {rolActual === "admin" ? (
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-600 inline" />
                  ) : (
                    <Eye className="w-3.5 h-3.5 text-emerald-600 inline" />
                  )}
                </p>
                <p className="text-[11px] text-slate-500">{usuarioActual.departamento}</p>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-6 overflow-y-auto">
          {currentTab === "dashboard" && (
            <DashboardView
              servicios={servicios}
              personal={personal}
              onSelectServicio={setServicioSeleccionado}
              onNavigateTab={setCurrentTab}
            />
          )}

          {currentTab === "calendar" && (
            <CalendarView
              servicios={servicios}
              onSelectServicio={setServicioSeleccionado}
            />
          )}

          {currentTab === "availability" && (
            <AvailabilityFinderView
              servicios={servicios}
              personal={personal}
              onSelectServicio={setServicioSeleccionado}
            />
          )}

          {currentTab === "services" && (
            <ServicesListView
              servicios={servicios}
              personal={personal}
              onSelectServicio={setServicioSeleccionado}
              onEditarServicio={handleOpenEditar}
              onNuevoServicio={handleOpenNuevo}
              onRefresh={refreshData}
              rolActual={rolActual}
            />
          )}

          {currentTab === "staff" && (
            <StaffView
              personal={personal}
              servicios={servicios}
              onRefresh={refreshData}
              rolActual={rolActual}
            />
          )}

          {currentTab === "reports" && (
            <ReportsView
              servicios={servicios}
              personal={personal}
            />
          )}
        </main>
      </div>

      {rolActual === "admin" && (
        <NuevoServicioModal
          isOpen={isNuevoModalOpen}
          onClose={() => setIsNuevoModalOpen(false)}
          onSaved={refreshData}
          servicioEditar={servicioAEditar}
        />
      )}

      <DetalleServicioModal
        servicio={servicioSeleccionado}
        onClose={() => setServicioSeleccionado(null)}
        onEditar={(s) => {
          if (rolActual !== "admin") return;
          setServicioSeleccionado(null);
          handleOpenEditar(s);
        }}
      />
    </div>
  );
};

