import { Usuario } from "../types";

const AUTH_STORAGE_KEY = "sgp_current_user";
const USERS_DB_KEY = "sgp_users_db";

const INITIAL_USERS: Usuario[] = [
  {
    id: 1,
    username: "Administrador",
    nombre: "Administrador de Operaciones",
    password: "admin",
    rol: "admin",
    departamento: "Departamento de Operaciones",
    activo: true
  },
  {
    id: 2,
    username: "Ventas",
    nombre: "Equipo Comercial y Ventas",
    password: "ventas",
    rol: "lector",
    departamento: "Departamento de Ventas",
    activo: true
  }
];

export class AuthService {
  public static getUsers(): Usuario[] {
    const data = localStorage.getItem(USERS_DB_KEY);
    if (!data) {
      localStorage.setItem(USERS_DB_KEY, JSON.stringify(INITIAL_USERS));
      return INITIAL_USERS;
    }
    try {
      return JSON.parse(data);
    } catch {
      return INITIAL_USERS;
    }
  }

  public static login(username: string, pass: string): Usuario | null {
    const users = this.getUsers();
    const user = users.find(u => u.username.toLowerCase() === username.toLowerCase() && u.password === pass && u.activo);
    if (user) {
      const userSafe = { ...user };
      delete userSafe.password;
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(userSafe));
      return userSafe;
    }
    return null;
  }

  public static getCurrentUser(): Usuario | null {
    const data = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!data) return null;
    try {
      return JSON.parse(data);
    } catch {
      return null;
    }
  }

  public static logout(): void {
    localStorage.removeItem(AUTH_STORAGE_KEY);
  }
}

