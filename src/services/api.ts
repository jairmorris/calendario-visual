const TOKEN_KEY = "sgp_token";

export const getToken = (): string | null => localStorage.getItem(TOKEN_KEY);
export const setToken = (t: string | null) => {
  if (t) localStorage.setItem(TOKEN_KEY, t);
  else localStorage.removeItem(TOKEN_KEY);
};

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

// Se invoca cuando el servidor responde 401 con una sesion existente (expirada)
let onSesionExpirada: () => void = () => {};
export const setSesionExpiradaHandler = (fn: () => void) => { onSesionExpirada = fn; };

export async function api<T>(path: string, options: { method?: string; body?: unknown } = {}): Promise<T> {
  const token = getToken();
  const res = await fetch(`/api${path}`, {
    method: options.method || "GET",
    headers: {
      ...(options.body !== undefined ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    if (res.status === 401 && token && path !== "/login") onSesionExpirada();
    throw new ApiError(res.status, data.error || `Error ${res.status}`);
  }
  return res.json();
}
