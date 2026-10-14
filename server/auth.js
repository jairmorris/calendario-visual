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

const publico = u => ({ id: u.id, username: u.username, nombre: u.nombre, rol: u.rol, departamento: u.departamento, activo: u.activo });

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

module.exports = { cambiarPasswordDe, listarUsuarios, login, logout, usuarioDeRequest, requireAuth, requireAdmin };
