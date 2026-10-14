// Datos iniciales (solo se usan la primera vez, cuando no existe data/db.json)
const PERSONAL = [
  { id: 1, nombre: "Carlos Mendoza", cargo: "Tecnico Senior", especialidad: "Electricidad y Climatizacion", telefono: "+56 9 1234 5678", email: "", activo: true },
  { id: 2, nombre: "Ana Gutierrez", cargo: "Especialista Redes", especialidad: "Telecomunicaciones y Fibra", telefono: "+56 9 8765 4321", email: "", activo: true },
  { id: 3, nombre: "Roberto Silva", cargo: "Tecnico de Terreno", especialidad: "Mecanica y Obras", telefono: "+56 9 5555 4444", email: "", activo: true },
  { id: 4, nombre: "Maria Jose Fernandez", cargo: "Supervisora de Calidad", especialidad: "Inspecciones de Seguridad", telefono: "+56 9 3333 2222", email: "", activo: true }
];

const CLIENTES = [
  { id: 1, nombre: "Constructora del Norte S.A.", contacto: "Ing. Juan Perez", telefono: "+56 2 2999 1111", email: "jperez@cnorte.cl", direccion: "Av. Industrial 450, Bodega 3, Santiago" },
  { id: 2, nombre: "Hospital Clinico Central", contacto: "Dra. Elena Ramos", telefono: "+56 2 2888 2222", email: "eramos@hospitalcentral.cl", direccion: "Av. San Martin 1200, Piso 4, Santiago" },
  { id: 3, nombre: "Supermercados El Valle", contacto: "Marcos Torres", telefono: "+56 2 2777 3333", email: "mtorres@elvalle.cl", direccion: "Calle Los Aromos 890, Maipu" }
];

function servicios() {
  const now = new Date();
  const at = (days, hours = 9) => {
    const d = new Date(now);
    d.setDate(d.getDate() + days);
    d.setHours(hours, 0, 0, 0);
    return d.toISOString();
  };
  const P = PERSONAL;
  return [
    {
      id: 1, codigo: "SERV-2026-0001", cliente_id: 1,
      cliente_nombre: "Constructora del Norte S.A.", cliente_contacto: "Ing. Juan Perez (+56 9 1234 5678)",
      ubicacion: "Av. Industrial 450, Bodega 3, Santiago", tipo_servicio: "Instalacion Electrica",
      descripcion: "Montaje de tableros secundarios de distribucion en nave industrial principal.",
      fecha_programada: at(0, 10), fecha_real_inicio: at(0, 10), estado: "en_curso", prioridad: "alta",
      observaciones: "Requiere EPP completo y certificacion de trabajo en altura.",
      personal_asignado: [P[0], P[2]],
      historial: [
        { id: 1, servicio_id: 1, estado_anterior: "creado", estado_nuevo: "programado", usuario: "Admin", fecha: at(-2) },
        { id: 2, servicio_id: 1, estado_anterior: "programado", estado_nuevo: "en_curso", usuario: "Carlos Mendoza", nota: "Iniciado en terreno a la hora prevista", fecha: at(0, 10) }
      ]
    },
    {
      id: 2, codigo: "SERV-2026-0002", cliente_id: 2,
      cliente_nombre: "Hospital Clinico Central", cliente_contacto: "Dra. Elena Ramos (+56 2 2888 2222)",
      ubicacion: "Av. San Martin 1200, Piso 4, Pabellon B", tipo_servicio: "Mantenimiento Preventivo",
      descripcion: "Revision periodica de grupos electrogenos y sistemas UPS de respaldo.",
      fecha_programada: at(1, 14), estado: "programado", prioridad: "urgente",
      observaciones: "Coordinar horario silencioso con jefe de pabellones.",
      personal_asignado: [P[0], P[1]],
      historial: [{ id: 3, servicio_id: 2, estado_anterior: "creado", estado_nuevo: "programado", usuario: "Admin", fecha: at(-1) }]
    },
    {
      id: 3, codigo: "SERV-2026-0003", cliente_id: 3,
      cliente_nombre: "Supermercados El Valle", cliente_contacto: "Marcos Torres (+56 9 5555 4444)",
      ubicacion: "Calle Los Aromos 890, Maipu", tipo_servicio: "Reparacion de Climatizacion",
      descripcion: "Reparacion urgente de compresor de frio industrial en sala de congelados.",
      fecha_programada: at(-1, 8), fecha_real_inicio: at(-1, 8), fecha_real_fin: at(-1, 12),
      estado: "completado", prioridad: "alta",
      observaciones: "Prueba de presion realizada exitosamente. Temperatura estabilizada en -18C.",
      personal_asignado: [P[2]],
      historial: [
        { id: 4, servicio_id: 3, estado_anterior: "programado", estado_nuevo: "en_curso", usuario: "Roberto Silva", fecha: at(-1, 8) },
        { id: 5, servicio_id: 3, estado_anterior: "en_curso", estado_nuevo: "completado", usuario: "Roberto Silva", nota: "Trabajo entregado conforme", fecha: at(-1, 12) }
      ]
    },
    {
      id: 4, codigo: "SERV-2026-0004", cliente_id: 1,
      cliente_nombre: "Constructora del Norte S.A.", cliente_contacto: "Ing. Juan Perez",
      ubicacion: "Av. El Parque 300, Quilicura", tipo_servicio: "Inspeccion Tecnica",
      descripcion: "Auditoria de cableado estructurado y certificacion Fluke de puntos de red.",
      fecha_programada: at(-3, 9), fecha_real_inicio: at(-3, 11), fecha_real_fin: at(-3, 17),
      estado: "completado_atraso", prioridad: "media",
      observaciones: "Finalizado con 2 horas de retraso por falta de acceso inicial a salas tecnicas.",
      personal_asignado: [P[1]],
      historial: [{ id: 6, servicio_id: 4, estado_anterior: "programado", estado_nuevo: "completado_atraso", usuario: "Ana Gutierrez", nota: "Se entregaron informes digitales", fecha: at(-3, 17) }]
    },
    {
      id: 5, codigo: "SERV-2026-0005", cliente_id: 3,
      cliente_nombre: "Supermercados El Valle", cliente_contacto: "Marcos Torres",
      ubicacion: "Sucursal Pudahuel, Av. San Pablo 4500", tipo_servicio: "Instalacion de Camaras",
      descripcion: "Instalacion de 8 camaras IP y NVR de 16 canales en zona de recepcion de mercaderia.",
      fecha_programada: at(-2, 10), estado: "programado", prioridad: "alta",
      observaciones: "Cliente solicita reprogramar por obras en el techo.",
      personal_asignado: [P[1], P[3]],
      historial: [{ id: 7, servicio_id: 5, estado_anterior: "creado", estado_nuevo: "programado", usuario: "Admin", fecha: at(-5) }]
    }
  ];
}

module.exports = { PERSONAL, CLIENTES, servicios };
