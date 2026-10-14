import { Usuario } from "../types";
import { api, getToken, setToken } from "./api";

export class AuthService {
  /** Devuelve el usuario o null si las credenciales son incorrectas. Lanza si el servidor no responde o bloquea. */
  public static async login(username: string, pass: string): Promise<Usuario | null> {
    try {
      const r = await api<{ token: string; usuario: Usuario }>("/login", { method: "POST", body: { username, password: pass } });
      setToken(r.token);
      return r.usuario;
    } catch (e: any) {
      if (e.status === 401) return null;
      throw e;
    }
  }

  /** Recupera la sesion guardada validandola contra el servidor. */
  public static async restoreSession(): Promise<Usuario | null> {
    if (!getToken()) return null;
    try {
      return await api<Usuario>("/me");
    } catch {
      setToken(null);
      return null;
    }
  }

  public static async logout(): Promise<void> {
    try { await api("/logout", { method: "POST" }); } catch { /* da igual */ }
    setToken(null);
  }
}
