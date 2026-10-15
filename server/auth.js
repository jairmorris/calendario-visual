const crypto = require("crypto");
const store = require("./db");

const SESSION_MS = 12 * 60 * 60 * 1000;
const MAX_INTENTOS = 5;
const VENTANA_MS = 15 * 60 * 1000;
const intentos = new Map(); // ip -> { n, desde }

function bloqueado(ip) {
  const r = intentos.get(ip);
  if (!r) return false;
  if (Date.now() - r.desde > VENTANA_MS) { intentos.delete(ip); return false; }
  return r.n >= MAX_INTENTOS;
}

function registrarFallo(ip) {
  const r = intentos.get(ip);
  if (!r || Date.now() - r.desde > VENTANA_MS) intentos.set(ip, { n: 1, desde: Date.now() });
  else r.n++;
}

const publico = u => ({
  id: u.id, username: u.username, nombre: u.nombre, rol: u.rol, departamento: u.departamento, activo: u.activo,
  email: u.email || "", avisos: u.avisos || { resumen: false, alertas: false }
});

function login(username, password, ip) {
  if (bloqueado(ip)) return { error: "Demasiados intentos. Espere unos minutos.", status: 429 };
  const db = store.data();
  const u = db.usuarios.find(x => x.activo && x.username.toLowerCase() === String(username || "").toLowerCase());
  if (!u || !store.verifyPassword(String(password || ""), u.password)) {
    registrarFallo(ip);
    return { error: "Usuario o contrasena incorrectos.", status: 401 };
  }
  intentos.delete(ip);
  const token = crypto.randomBytes(32).toString("hex");
  db.sesiones[token] = { userId: u.id, exp: Date.now() + SESSION_MS };
  store.save();
  return { token, usuario: publico(u) };
}

function usuarioDeRequest(req) {
  const token = (req.headers.authorization || "").replace(/^Bearer /, "");
  const ses = token && store.data().sesiones[token];
  if (!ses) return null;
  if (ses.exp < Date.now()) {
    delete store.data().sesiones[token];
    store.save();
    return null;
  }
  const u = store.data().usuarios.find(x => x.id === ses.userId && x.activo);
  return u ? publico(u) : null;
}

function logout(req) {
  const token = (req.headers.authorization || "").replace(/^Bearer /, "");
  if (token && store.data().sesiones[token]) {
    delete store.data().sesiones[token];
    store.save();
  }
}

// Solo la invoca un admin (ver ruta). Cierra las sesiones del usuario afectado,
// salvo la del propio admin si se esta cambiando la clave a si mismo.
function cambiarPasswordDe(userId, nueva, tokenActual) {
  if (typeof nueva !== "string" || nueva.length < 8) return { error: "La nueva contrasena debe tener al menos 8 caracteres.", status: 400 };
  const db = store.data();
  const u = db.usuarios.find(x => x.id === userId);
  if (!u) return { error: "Usuario no encontrado", status: 404 };
  u.password = store.hashPassword(nueva);
  for (const [token, ses] of Object.entries(db.sesiones)) {
    if (ses.userId === u.id && token !== tokenActual) delete db.sesiones[token];
  }
  store.save();
  return { ok: true, usuario: u.username };
}

const listarUsuarios = () => store.data().usuarios.map(publico);

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const admins = db => db.usuarios.filter(u => u.activo && u.rol === "admin");

// Valida y copia solo los campos permitidos. Devuelve { error } o { campos }.
function camposUsuario(d, db, idActual) {
  const c = {};
  if (d.username !== undefined) {
    const n = String(d.username).trim();
    if (!n) return { error: "El nombre de usuario es obligatorio." };
    if (db.usuarios.some(u => u.id !== idActual && u.username.toLowerCase() === n.toLowerCase())) return { error: "Ese nombre de usuario ya existe." };
    c.username = n;
  }
  if (d.nombre !== undefined) c.nombre = String(d.nombre).trim() || undefined;
  if (d.departamento !== undefined) c.departamento = String(d.departamento).trim();
  if (d.rol !== undefined) {
    if (!["admin", "lector"].includes(d.rol)) return { error: "Rol invalido." };
    c.rol = d.rol;
  }
  if (d.activo !== undefined) c.activo = Boolean(d.activo);
  if (d.email !== undefined) {
    const e = String(d.email).trim();
    if (e && !EMAIL_RE.test(e)) return { error: "El email no es valido." };
    c.email = e;
  }
  if (d.avisos !== undefined) c.avisos = { resumen: Boolean(d.avisos?.resumen), alertas: Boolean(d.avisos?.alertas) };
  return { campos: c };
}

function crearUsuario(d) {
  const db = store.data();
  if (typeof d.password !== "string" || d.password.length < 8) return { error: "La contrasena debe tener al menos 8 caracteres.", status: 400 };
  const r = camposUsuario({ rol: "lector", activo: true, avisos: {}, email: "", departamento: "", ...d }, db, null);
  if (r.error) return { error: r.error, status: 400 };
  if (!r.campos.username) return { error: "El nombre de usuario es obligatorio.", status: 400 };
  const u = {
    id: db.usuarios.length ? Math.max(...db.usuarios.map(x => x.id)) + 1 : 1,
    nombre: r.campos.username,
    ...Object.fromEntries(Object.entries(r.campos).filter(([, v]) => v !== undefined)),
    password: store.hashPassword(d.password)
  };
  db.usuarios.push(u);
  store.save();
  return { usuario: publico(u) };
}

function actualizarUsuario(id, d, idQuienEdita) {
  const db = store.data();
  const u = db.usuarios.find(x => x.id === id);
  if (!u) return { error: "Usuario no encontrado", status: 404 };
  const r = camposUsuario(d, db, id);
  if (r.error) return { error: r.error, status: 400 };

  const quedaAdminActivo = (r.campos.rol ?? u.rol) === "admin" && (r.campos.activo ?? u.activo);
  if (u.rol === "admin" && u.activo && !quedaAdminActivo) {
    if (id === idQuienEdita) return { error: "No puede quitarse a si mismo el acceso de administrador.", status: 400 };
    if (admins(db).length <= 1) return { error: "Debe existir al menos un administrador activo.", status: 400 };
  }

  const desactiva = r.campos.activo === false && u.activo;
  Object.assign(u, Object.fromEntries(Object.entries(r.campos).filter(([, v]) => v !== undefined)));
  // Cambiar rol o desactivar invalida las sesiones abiertas de esa persona
  if (desactiva || r.campos.rol) {
    for (const [token, s] of Object.entries(db.sesiones)) if (s.userId === id) delete db.sesiones[token];
  }
  store.save();
  return { usuario: publico(u) };
}

function requireAuth(req, res, next) {
  const u = usuarioDeRequest(req);
  if (!u) return res.status(401).json({ error: "No autenticado" });
  req.usuario = u;
  next();
}

function requireAdmin(req, res, next) {
  if (req.usuario.rol !== "admin") return res.status(403).json({ error: "Solo administradores" });
  next();
}

module.exports = { crearUsuario, actualizarUsuario, cambiarPasswordDe, listarUsuarios, login, logout, usuarioDeRequest, requireAuth, requireAdmin };
