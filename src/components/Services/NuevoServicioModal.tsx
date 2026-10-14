import React, { useState, useEffect } from "react";
import { Servicio, Personal, EstadoServicio, PrioridadServicio } from "../../types";
import { StorageService } from "../../services/storage";
import { X, Calendar, MapPin, CheckCircle } from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  servicioEditar?: Servicio | null;
}

export const NuevoServicioModal: React.FC<Props> = ({ isOpen, onClose, onSaved, servicioEditar }) => {
  const [personalList, setPersonalList] = useState<Personal[]>([]);

  const [clienteNombre, setClienteNombre] = useState("");
  const [clienteContacto, setClienteContacto] = useState("");
  const [ubicacion, setUbicacion] = useState("");
  const [tipoServicio, setTipoServicio] = useState("Mantenimiento Preventivo");
  const [descripcion, setDescripcion] = useState("");
  
  const [fechaProgDate, setFechaProgDate] = useState("");
  const [fechaProgTime, setFechaProgTime] = useState("09:00");
  
  const [fechaRealInicioDate, setFechaRealInicioDate] = useState("");
  const [fechaRealInicioTime, setFechaRealInicioTime] = useState("");
  const [fechaRealFinDate, setFechaRealFinDate] = useState("");
  const [fechaRealFinTime, setFechaRealFinTime] = useState("");

  const [estado, setEstado] = useState<EstadoServicio>("programado");
  const [prioridad, setPrioridad] = useState<PrioridadServicio>("media");
  const [observaciones, setObservaciones] = useState("");
  const [selectedPersonalIds, setSelectedPersonalIds] = useState<number[]>([]);

  useEffect(() => {
    if (isOpen) {
      setPersonalList(StorageService.getPersonal());
      
      if (servicioEditar) {
        setClienteNombre(servicioEditar.cliente_nombre || "");
        setClienteContacto(servicioEditar.cliente_contacto || "");
        setUbicacion(servicioEditar.ubicacion || "");
        setTipoServicio(servicioEditar.tipo_servicio || "Mantenimiento Preventivo");
        setDescripcion(servicioEditar.descripcion || "");
        
        if (servicioEditar.fecha_programada) {
          const d = new Date(servicioEditar.fecha_programada);
          setFechaProgDate(d.toISOString().split("T")[0]);
          setFechaProgTime(d.toTimeString().substring(0, 5));
        }

        if (servicioEditar.fecha_real_inicio) {
          const d = new Date(servicioEditar.fecha_real_inicio);
          setFechaRealInicioDate(d.toISOString().split("T")[0]);
          setFechaRealInicioTime(d.toTimeString().substring(0, 5));
        } else {
          setFechaRealInicioDate("");
          setFechaRealInicioTime("");
        }

        if (servicioEditar.fecha_real_fin) {
          const d = new Date(servicioEditar.fecha_real_fin);
          setFechaRealFinDate(d.toISOString().split("T")[0]);
          setFechaRealFinTime(d.toTimeString().substring(0, 5));
        } else {
          setFechaRealFinDate("");
          setFechaRealFinTime("");
        }

        setEstado(servicioEditar.estado);
        setPrioridad(servicioEditar.prioridad);
        setObservaciones(servicioEditar.observaciones || "");
        setSelectedPersonalIds(servicioEditar.personal_asignado.map(p => p.id));
      } else {
        setClienteNombre("");
        setClienteContacto("");
        setUbicacion("");
        setTipoServicio("Mantenimiento Preventivo");
        setDescripcion("");
        
        const todayStr = new Date().toISOString().split("T")[0];
        setFechaProgDate(todayStr);
        setFechaProgTime("09:00");
        setFechaRealInicioDate("");
        setFechaRealInicioTime("");
        setFechaRealFinDate("");
        setFechaRealFinTime("");

        setEstado("programado");
        setPrioridad("media");
        setObservaciones("");
        setSelectedPersonalIds([]);
      }
    }
  }, [isOpen, servicioEditar]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clienteNombre || !ubicacion || !fechaProgDate) {
      alert("Por favor complete los campos obligatorios (Cliente, Ubicacion y Fecha Programada).");
      return;
    }

    const isoProgramada = `${fechaProgDate}T${fechaProgTime || "00:00"}:00`;

    let isoRealInicio: string | undefined = undefined;
    if (fechaRealInicioDate) {
      isoRealInicio = `${fechaRealInicioDate}T${fechaRealInicioTime || "00:00"}:00`;
    }

    let isoRealFin: string | undefined = undefined;
    if (fechaRealFinDate) {
      isoRealFin = `${fechaRealFinDate}T${fechaRealFinTime || "00:00"}:00`;
    }

    const personalAsignado = personalList.filter(p => selectedPersonalIds.includes(p.id));

    StorageService.saveServicio({
      id: servicioEditar?.id,
      cliente_nombre: clienteNombre,
      cliente_contacto: clienteContacto,
      ubicacion,
      tipo_servicio: tipoServicio,
      descripcion,
      fecha_programada: isoProgramada,
      fecha_real_inicio: isoRealInicio,
      fecha_real_fin: isoRealFin,
      estado,
      prioridad,
      observaciones,
      personal_asignado: personalAsignado
    });

    onSaved();
    onClose();
  };

  const togglePersonal = (id: number) => {
    setSelectedPersonalIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden my-8 border border-slate-100 animate-in fade-in zoom-in duration-200">
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold">
              {servicioEditar ? `Editar Servicio: ${servicioEditar.codigo}` : "Registrar Nuevo Servicio Tecnico"}
            </h2>
            <p className="text-xs text-slate-400">
              Complete la informacion para agendar o registrar el trabajo
            </p>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Cliente / Empresa *
              </label>
              <input
                type="text"
                required
                placeholder="Nombre del cliente o empresa"
                value={clienteNombre}
                onChange={e => setClienteNombre(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Contacto del Cliente
              </label>
              <input
                type="text"
                placeholder="Nombre y telefono de contacto"
                value={clienteContacto}
                onChange={e => setClienteContacto(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Ubicacion / Direccion del Servicio *
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder="Direccion, piso, bodega o planta"
                  value={ubicacion}
                  onChange={e => setUbicacion(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Tipo de Servicio
              </label>
              <select
                value={tipoServicio}
                onChange={e => setTipoServicio(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
              >
                <option value="Mantenimiento Preventivo">Mantenimiento Preventivo</option>
                <option value="Mantenimiento Correctivo">Mantenimiento Correctivo</option>
                <option value="Instalacion Electrica">Instalacion Electrica</option>
                <option value="Reparacion de Climatizacion">Reparacion Climatizacion</option>
                <option value="Redes y Telecomunicaciones">Redes y Telecomunicaciones</option>
                <option value="Inspeccion Tecnica">Inspeccion Tecnica</option>
                <option value="Servicio de Emergencia">Servicio de Emergencia</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Descripcion del Trabajo a Realizar
            </label>
            <textarea
              rows={2}
              placeholder="Detalles del requerimiento, tareas a ejecutar, equipos..."
              value={descripcion}
              onChange={e => setDescripcion(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center space-x-1.5">
              <Calendar className="w-4 h-4 text-blue-600" />
              <span>Programacion de Fechas</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Fecha Programada *</label>
                <input
                  type="date"
                  required
                  value={fechaProgDate}
                  onChange={e => setFechaProgDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Hora Programada *</label>
                <input
                  type="time"
                  required
                  value={fechaProgTime}
                  onChange={e => setFechaProgTime(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
                />
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200">
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Registro Real de Ejecucion (Opcional si ya se realizo o inicio)
              </p>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div>
                  <label className="block text-[11px] text-slate-500">Fecha Inicio Real</label>
                  <input
                    type="date"
                    value={fechaRealInicioDate}
                    onChange={e => setFechaRealInicioDate(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-500">Hora Inicio Real</label>
                  <input
                    type="time"
                    value={fechaRealInicioTime}
                    onChange={e => setFechaRealInicioTime(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-500">Fecha Fin Real</label>
                  <input
                    type="date"
                    value={fechaRealFinDate}
                    onChange={e => setFechaRealFinDate(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-500">Hora Fin Real</label>
                  <input
                    type="time"
                    value={fechaRealFinTime}
                    onChange={e => setFechaRealFinTime(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-white"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Estado del Servicio
              </label>
              <select
                value={estado}
                onChange={e => setEstado(e.target.value as EstadoServicio)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white font-medium"
              >
                <option value="programado">Programado</option>
                <option value="en_curso">En Curso</option>
                <option value="completado">Completado a tiempo</option>
                <option value="completado_atraso">Completado con atraso</option>
                <option value="reprogramado">Reprogramado</option>
                <option value="cancelado">Cancelado</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Prioridad
              </label>
              <select
                value={prioridad}
                onChange={e => setPrioridad(e.target.value as PrioridadServicio)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white font-medium"
              >
                <option value="baja">Baja</option>
                <option value="media">Media</option>
                <option value="alta">Alta</option>
                <option value="urgente">Urgente</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Personal / Equipo Asignado
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-36 overflow-y-auto border border-slate-200 rounded-lg p-2.5 bg-slate-50">
              {personalList.map(person => {
                const isSelected = selectedPersonalIds.includes(person.id);
                return (
                  <label
                    key={person.id}
                    onClick={() => togglePersonal(person.id)}
                    className={`flex items-center space-x-3 p-2 rounded-lg cursor-pointer transition-all border ${
                      isSelected
                        ? "bg-blue-50 border-blue-300 text-blue-900 shadow-sm"
                        : "bg-white border-slate-200 text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {}}
                      className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4"
                    />
                    <div className="text-xs">
                      <p className="font-semibold">{person.nombre}</p>
                      <p className="text-[11px] text-slate-500">{person.cargo} - {person.especialidad}</p>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Observaciones / Notas Adicionales
            </label>
            <textarea
              rows={2}
              placeholder="Notas de seguridad, materiales requeridos, comentarios..."
              value={observaciones}
              onChange={e => setObservaciones(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div className="pt-4 border-t border-slate-200 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20 transition-all flex items-center space-x-1.5"
            >
              <CheckCircle className="w-4 h-4" />
              <span>{servicioEditar ? "Guardar Cambios" : "Guardar Servicio"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

