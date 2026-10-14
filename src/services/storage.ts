import { Servicio, Personal, Cliente, FiltrosServicio } from "../types";
import { api } from "./api";

// Cache en memoria de los datos del servidor. Las vistas leen de aqui de forma sincrona;
// `load()` la refresca desde la API y las escrituras van al servidor y luego recargan.
let servicios: Servicio[] = [];
let personal: Personal[] = [];
let clientes: Cliente[] = [];

export class StorageService {
  public static async load(): Promise<void> {
    [servicios, personal, clientes] = await Promise.all([
      api<Servicio[]>("/servicios"),
      api<Personal[]>("/personal"),
      api<Cliente[]>("/clientes")
    ]);
  }

  public static clear(): void {
    servicios = [];
    personal = [];
    clientes = [];
  }

  public static getServicios(filtros?: FiltrosServicio): Servicio[] {
    if (!filtros) return servicios;

    return servicios.filter(s => {
      if (filtros.busqueda) {
        const q = filtros.busqueda.toLowerCase();
        const match = [s.codigo, s.cliente_nombre, s.ubicacion, s.tipo_servicio].some(v => v.toLowerCase().includes(q));
        if (!match) return false;
      }

      if (filtros.estado && filtros.estado !== "todos") {
        if (filtros.estado === "atrasados") {
          const isAtrasado = s.estado === "programado" && new Date(s.fecha_programada) < new Date();
          if (!isAtrasado) return false;
        } else if (s.estado !== filtros.estado) {
          return false;
        }
      }

      if (filtros.prioridad && filtros.prioridad !== "todas" && s.prioridad !== filtros.prioridad) return false;
      if (filtros.tipo_servicio && filtros.tipo_servicio !== "todos" && s.tipo_servicio !== filtros.tipo_servicio) return false;

      if (filtros.personal_id && filtros.personal_id !== "todos") {
        const pid = Number(filtros.personal_id);
        if (!s.personal_asignado.some(p => p.id === pid)) return false;
      }

      if (filtros.fecha_desde && new Date(s.fecha_programada) < new Date(filtros.fecha_desde)) return false;

      if (filtros.fecha_hasta) {
        const finDia = new Date(filtros.fecha_hasta);
        finDia.setHours(23, 59, 59, 999);
        if (new Date(s.fecha_programada) > finDia) return false;
      }

      return true;
    });
  }

  public static getServicioById(id: number): Servicio | undefined {
    return servicios.find(s => s.id === id);
  }

  // El historial, el codigo y el id los calcula el servidor (el usuario sale de su sesion).
  public static async saveServicio(data: Partial<Servicio>): Promise<Servicio> {
    const saved = data.id
      ? await api<Servicio>(`/servicios/${data.id}`, { method: "PUT", body: data })
      : await api<Servicio>("/servicios", { method: "POST", body: data });
    await this.load();
    return saved;
  }

  public static async deleteServicio(id: number): Promise<void> {
    await api(`/servicios/${id}`, { method: "DELETE" });
    await this.load();
  }

  public static getPersonal(): Personal[] {
    return personal;
  }

  public static async savePersonal(p: Partial<Personal>): Promise<Personal> {
    const saved = p.id
      ? await api<Personal>(`/personal/${p.id}`, { method: "PUT", body: p })
      : await api<Personal>("/personal", { method: "POST", body: p });
    await this.load();
    return saved;
  }

  public static async deletePersonal(id: number): Promise<void> {
    await api(`/personal/${id}`, { method: "DELETE" });
    await this.load();
  }

  public static getClientes(): Cliente[] {
    return clientes;
  }
}
