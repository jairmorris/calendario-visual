export type EstadoServicio = 
  | "programado" 
  | "en_curso" 
  | "completado" 
  | "completado_atraso" 
  | "cancelado" 
  | "reprogramado";

export type PrioridadServicio = "baja" | "media" | "alta" | "urgente";
export type RolUsuario = "admin" | "lector";

export interface Usuario {
  id: number;
  username: string;
  nombre: string;
  password?: string;
  rol: RolUsuario;
  departamento: string;
  email?: string;
  avisos?: { resumen: boolean; alertas: boolean };
  activo: boolean;
}

export interface Personal {
  id: number;
  nombre: string;
  cargo: string;
  especialidad: string;
  telefono?: string;
  email?: string;
  activo: boolean;
}

export interface Cliente {
  id: number;
  nombre: string;
  contacto: string;
  telefono: string;
  email: string;
  direccion: string;
}

export interface HistorialEstado {
  id: number;
  servicio_id: number;
  estado_anterior: string;
  estado_nuevo: EstadoServicio;
  usuario: string;
  nota?: string;
  fecha: string;
}

export interface Servicio {
  id: number;
  codigo: string;
  cliente_id?: number;
  cliente_nombre: string;
  cliente_contacto: string;
  ubicacion: string;
  tipo_servicio: string;
  descripcion: string;
  fecha_programada: string;
  fecha_real_inicio?: string;
  fecha_real_fin?: string;
  estado: EstadoServicio;
  prioridad: PrioridadServicio;
  observaciones: string;
  personal_asignado: Personal[];
  historial?: HistorialEstado[];
  creado_en?: string;
  modificado_en?: string;
}

export interface FiltrosServicio {
  busqueda?: string;
  estado?: string;
  prioridad?: string;
  tipo_servicio?: string;
  personal_id?: number | string;
  fecha_desde?: string;
  fecha_hasta?: string;
}

