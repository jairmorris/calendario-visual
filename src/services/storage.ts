import { Servicio, Personal, Cliente, FiltrosServicio, EstadoServicio, HistorialEstado } from "../types";

const DB_KEY_SERVICIOS = "sgp_servicios_db";
const DB_KEY_PERSONAL = "sgp_personal_db";
const DB_KEY_CLIENTES = "sgp_clientes_db";

const INITIAL_PERSONAL: Personal[] = [
  { id: 1, nombre: "Carlos Mendoza", cargo: "Tecnico Senior", especialidad: "Electricidad y Climatizacion", telefono: "+56 9 1234 5678", activo: true },
  { id: 2, nombre: "Ana Gutierrez", cargo: "Especialista Redes", especialidad: "Telecomunicaciones y Fibra", telefono: "+56 9 8765 4321", activo: true },
  { id: 3, nombre: "Roberto Silva", cargo: "Tecnico de Terreno", especialidad: "Mecanica y Obras", telefono: "+56 9 5555 4444", activo: true },
  { id: 4, nombre: "Maria Jose Fernandez", cargo: "Supervisora de Calidad", especialidad: "Inspecciones de Seguridad", telefono: "+56 9 3333 2222", activo: true }
];

const INITIAL_CLIENTES: Cliente[] = [
  { id: 1, nombre: "Constructora del Norte S.A.", contacto: "Ing. Juan Perez", telefono: "+56 2 2999 1111", email: "jperez@cnorte.cl", direccion: "Av. Industrial 450, Bodega 3, Santiago" },
  { id: 2, nombre: "Hospital Clinico Central", contacto: "Dra. Elena Ramos", telefono: "+56 2 2888 2222", email: "eramos@hospitalcentral.cl", direccion: "Av. San Martin 1200, Piso 4, Santiago" },
  { id: 3, nombre: "Supermercados El Valle", contacto: "Marcos Torres", telefono: "+56 2 2777 3333", email: "mtorres@elvalle.cl", direccion: "Calle Los Aromos 890, Maipu" }
];

const now = new Date();
const formatIsoOffset = (days: number, hours: number = 9) => {
  const d = new Date(now);
  d.setDate(d.getDate() + days);
  d.setHours(hours, 0, 0, 0);
  return d.toISOString();
};

const INITIAL_SERVICIOS: Servicio[] = [
  {
    id: 1,
    codigo: "SERV-2026-0001",
    cliente_id: 1,
    cliente_nombre: "Constructora del Norte S.A.",
    cliente_contacto: "Ing. Juan Perez (+56 9 1234 5678)",
    ubicacion: "Av. Industrial 450, Bodega 3, Santiago",
    tipo_servicio: "Instalacion Electrica",
    descripcion: "Montaje de tableros secundarios de distribucion en nave industrial principal.",
    fecha_programada: formatIsoOffset(0, 10),
    fecha_real_inicio: formatIsoOffset(0, 10),
    estado: "en_curso",
    prioridad: "alta",
    observaciones: "Requiere EPP completo y certificacion de trabajo en altura.",
    personal_asignado: [INITIAL_PERSONAL[0], INITIAL_PERSONAL[2]],
    historial: [
      { id: 1, servicio_id: 1, estado_anterior: "creado", estado_nuevo: "programado", usuario: "Admin", fecha: formatIsoOffset(-2) },
      { id: 2, servicio_id: 1, estado_anterior: "programado", estado_nuevo: "en_curso", usuario: "Carlos Mendoza", nota: "Iniciado en terreno a la hora prevista", fecha: formatIsoOffset(0, 10) }
    ]
  },
  {
    id: 2,
    codigo: "SERV-2026-0002",
    cliente_id: 2,
    cliente_nombre: "Hospital Clinico Central",
    cliente_contacto: "Dra. Elena Ramos (+56 2 2888 2222)",
    ubicacion: "Av. San Martin 1200, Piso 4, Pabellon B",
    tipo_servicio: "Mantenimiento Preventivo",
    descripcion: "Revision periodica de grupos electrogenos y sistemas UPS de respaldo.",
    fecha_programada: formatIsoOffset(1, 14),
    estado: "programado",
    prioridad: "urgente",
    observaciones: "Coordinar horario silencioso con jefe de pabellones.",
    personal_asignado: [INITIAL_PERSONAL[0], INITIAL_PERSONAL[1]],
    historial: [
      { id: 3, servicio_id: 2, estado_anterior: "creado", estado_nuevo: "programado", usuario: "Admin", fecha: formatIsoOffset(-1) }
    ]
  },
  {
    id: 3,
    codigo: "SERV-2026-0003",
    cliente_id: 3,
    cliente_nombre: "Supermercados El Valle",
    cliente_contacto: "Marcos Torres (+56 9 5555 4444)",
    ubicacion: "Calle Los Aromos 890, Maipu",
    tipo_servicio: "Reparacion de Climatizacion",
    descripcion: "Reparacion urgente de compresor de frio industrial en sala de congelados.",
    fecha_programada: formatIsoOffset(-1, 8),
    fecha_real_inicio: formatIsoOffset(-1, 8),
    fecha_real_fin: formatIsoOffset(-1, 12),
    estado: "completado",
    prioridad: "alta",
    observaciones: "Prueba de presion realizada exitosamente. Temperatura estabilizada en -18C.",
    personal_asignado: [INITIAL_PERSONAL[2]],
    historial: [
      { id: 4, servicio_id: 3, estado_anterior: "programado", estado_nuevo: "en_curso", usuario: "Roberto Silva", fecha: formatIsoOffset(-1, 8) },
      { id: 5, servicio_id: 3, estado_anterior: "en_curso", estado_nuevo: "completado", usuario: "Roberto Silva", nota: "Trabajo entregado conforme", fecha: formatIsoOffset(-1, 12) }
    ]
  },
  {
    id: 4,
    codigo: "SERV-2026-0004",
    cliente_id: 1,
    cliente_nombre: "Constructora del Norte S.A.",
    cliente_contacto: "Ing. Juan Perez",
    ubicacion: "Av. El Parque 300, Quilicura",
    tipo_servicio: "Inspeccion Tecnica",
    descripcion: "Auditoria de cableado estructurado y certificacion Fluke de puntos de red.",
    fecha_programada: formatIsoOffset(-3, 9),
    fecha_real_inicio: formatIsoOffset(-3, 11),
    fecha_real_fin: formatIsoOffset(-3, 17),
    estado: "completado_atraso",
    prioridad: "media",
    observaciones: "Finalizado con 2 horas de retraso por falta de acceso inicial a salas tecnicas.",
    personal_asignado: [INITIAL_PERSONAL[1]],
    historial: [
      { id: 6, servicio_id: 4, estado_anterior: "programado", estado_nuevo: "completado_atraso", usuario: "Ana Gutierrez", nota: "Se entregaron informes digitales", fecha: formatIsoOffset(-3, 17) }
    ]
  },
  {
    id: 5,
    codigo: "SERV-2026-0005",
    cliente_id: 3,
    cliente_nombre: "Supermercados El Valle",
    cliente_contacto: "Marcos Torres",
    ubicacion: "Sucursal Pudahuel, Av. San Pablo 4500",
    tipo_servicio: "Instalacion de Camaras",
    descripcion: "Instalacion de 8 camaras IP y NVR de 16 canales en zona de recepcion de mercaderia.",
    fecha_programada: formatIsoOffset(-2, 10),
    estado: "programado",
    prioridad: "alta",
    observaciones: "Cliente solicita reprogramar por obras en el techo.",
    personal_asignado: [INITIAL_PERSONAL[1], INITIAL_PERSONAL[3]],
    historial: [
      { id: 7, servicio_id: 5, estado_anterior: "creado", estado_nuevo: "programado", usuario: "Admin", fecha: formatIsoOffset(-5) }
    ]
  }
];

export class StorageService {
  private static get<T>(key: string, fallback: T): T {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : fallback;
    } catch {
      return fallback;
    }
  }

  private static set<T>(key: string, data: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
      console.error("Error al guardar en LocalStorage", e);
    }
  }

  public static initialize(): void {
    if (!localStorage.getItem(DB_KEY_PERSONAL)) {
      this.set(DB_KEY_PERSONAL, INITIAL_PERSONAL);
    }
    if (!localStorage.getItem(DB_KEY_CLIENTES)) {
      this.set(DB_KEY_CLIENTES, INITIAL_CLIENTES);
    }
    if (!localStorage.getItem(DB_KEY_SERVICIOS)) {
      this.set(DB_KEY_SERVICIOS, INITIAL_SERVICIOS);
    }
  }

  public static resetSeed(): void {
    this.set(DB_KEY_PERSONAL, INITIAL_PERSONAL);
    this.set(DB_KEY_CLIENTES, INITIAL_CLIENTES);
    this.set(DB_KEY_SERVICIOS, INITIAL_SERVICIOS);
  }

  public static getServicios(filtros?: FiltrosServicio): Servicio[] {
    this.initialize();
    let lista: Servicio[] = this.get(DB_KEY_SERVICIOS, INITIAL_SERVICIOS);

    if (!filtros) return lista;

    return lista.filter(s => {
      if (filtros.busqueda) {
        const q = filtros.busqueda.toLowerCase();
        const matchCode = s.codigo.toLowerCase().includes(q);
        const matchCliente = s.cliente_nombre.toLowerCase().includes(q);
        const matchUbicacion = s.ubicacion.toLowerCase().includes(q);
        const matchTipo = s.tipo_servicio.toLowerCase().includes(q);
        if (!matchCode && !matchCliente && !matchUbicacion && !matchTipo) return false;
      }

      if (filtros.estado && filtros.estado !== "todos") {
        if (filtros.estado === "atrasados") {
          const isAtrasado = s.estado === "programado" && new Date(s.fecha_programada) < new Date();
          if (!isAtrasado) return false;
        } else if (s.estado !== filtros.estado) {
          return false;
        }
      }

      if (filtros.prioridad && filtros.prioridad !== "todas") {
        if (s.prioridad !== filtros.prioridad) return false;
      }

      if (filtros.tipo_servicio && filtros.tipo_servicio !== "todos") {
        if (s.tipo_servicio !== filtros.tipo_servicio) return false;
      }

      if (filtros.personal_id && filtros.personal_id !== "todos") {
        const pid = Number(filtros.personal_id);
        if (!s.personal_asignado.some(p => p.id === pid)) return false;
      }

      if (filtros.fecha_desde) {
        if (new Date(s.fecha_programada) < new Date(filtros.fecha_desde)) return false;
      }

      if (filtros.fecha_hasta) {
        const finDia = new Date(filtros.fecha_hasta);
        finDia.setHours(23, 59, 59, 999);
        if (new Date(s.fecha_programada) > finDia) return false;
      }

      return true;
    });
  }

  public static getServicioById(id: number): Servicio | undefined {
    const lista = this.getServicios();
    return lista.find(s => s.id === id);
  }

  public static saveServicio(servicioData: Partial<Servicio>, usuarioNombre: string = "Administrador"): Servicio {
    const servicios = this.getServicios();
    const nowIso = new Date().toISOString();

    if (servicioData.id) {
      const index = servicios.findIndex(s => s.id === servicioData.id);
      if (index === -1) throw new Error("Servicio no encontrado");

      const original = servicios[index];
      const cambioEstado = servicioData.estado && servicioData.estado !== original.estado;
      const cambioFecha = servicioData.fecha_programada && servicioData.fecha_programada !== original.fecha_programada;

      const historialActualizado: HistorialEstado[] = [...(original.historial || [])];
      
      let notaCambio = "";
      if (cambioEstado) notaCambio += `Estado: ${original.estado} -> ${servicioData.estado}. `;
      if (cambioFecha) notaCambio += `Reprogramado: ${new Date(servicioData.fecha_programada!).toLocaleString("es-ES")}. `;

      if (notaCambio || servicioData.observaciones) {
        historialActualizado.push({
          id: Date.now(),
          servicio_id: original.id,
          estado_anterior: original.estado,
          estado_nuevo: servicioData.estado || original.estado,
          usuario: usuarioNombre,
          nota: notaCambio + (servicioData.observaciones ? `Notas: ${servicioData.observaciones}` : ""),
          fecha: nowIso
        });
      }

      const actualizado: Servicio = {
        ...original,
        ...servicioData,
        historial: historialActualizado,
        modificado_en: nowIso
      };

      servicios[index] = actualizado;
      this.set(DB_KEY_SERVICIOS, servicios);
      return actualizado;
    } else {
      const nextId = servicios.length > 0 ? Math.max(...servicios.map(s => s.id)) + 1 : 1;
      const codigo = `SERV-2026-${String(nextId).padStart(4, "0")}`;

      const nuevo: Servicio = {
        id: nextId,
        codigo,
        cliente_nombre: servicioData.cliente_nombre || "Cliente General",
        cliente_contacto: servicioData.cliente_contacto || "",
        ubicacion: servicioData.ubicacion || "Instalaciones del cliente",
        tipo_servicio: servicioData.tipo_servicio || "Mantenimiento General",
        descripcion: servicioData.descripcion || "",
        fecha_programada: servicioData.fecha_programada || nowIso,
        fecha_real_inicio: servicioData.fecha_real_inicio,
        fecha_real_fin: servicioData.fecha_real_fin,
        estado: servicioData.estado || "programado",
        prioridad: servicioData.prioridad || "media",
        observaciones: servicioData.observaciones || "",
        personal_asignado: servicioData.personal_asignado || [],
        creado_en: nowIso,
        modificado_en: nowIso,
        historial: [
          {
            id: Date.now(),
            servicio_id: nextId,
            estado_anterior: "nuevo",
            estado_nuevo: servicioData.estado || "programado",
            usuario: usuarioNombre,
            nota: "Servicio creado en el sistema",
            fecha: nowIso
          }
        ]
      };

      servicios.unshift(nuevo);
      this.set(DB_KEY_SERVICIOS, servicios);
      return nuevo;
    }
  }

  public static deleteServicio(id: number): void {
    const servicios = this.getServicios().filter(s => s.id !== id);
    this.set(DB_KEY_SERVICIOS, servicios);
  }

  public static getPersonal(): Personal[] {
    this.initialize();
    return this.get(DB_KEY_PERSONAL, INITIAL_PERSONAL);
  }

  public static savePersonal(p: Partial<Personal>): Personal {
    const lista = this.getPersonal();
    if (p.id) {
      const idx = lista.findIndex(item => item.id === p.id);
      if (idx !== -1) {
        lista[idx] = { ...lista[idx], ...p };
      }
    } else {
      const newId = lista.length > 0 ? Math.max(...lista.map(i => i.id)) + 1 : 1;
      const nuevo: Personal = {
        id: newId,
        nombre: p.nombre || "Nuevo Trabajador",
        cargo: p.cargo || "Tecnico",
        especialidad: p.especialidad || "General",
        telefono: p.telefono || "",
        activo: p.activo !== undefined ? p.activo : true
      };
      lista.push(nuevo);
    }
    this.set(DB_KEY_PERSONAL, lista);
    return p.id ? lista.find(item => item.id === p.id)! : lista[lista.length - 1];
  }

  public static deletePersonal(id: number): void {
    const lista = this.getPersonal().filter(p => p.id !== id);
    this.set(DB_KEY_PERSONAL, lista);
  }

  public static getClientes(): Cliente[] {
    this.initialize();
    return this.get(DB_KEY_CLIENTES, INITIAL_CLIENTES);
  }
}

