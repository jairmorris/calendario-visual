// Persistencia en un archivo JSON dentro de DATA_DIR (en el NAS: volumen montado).
// Suficiente para un equipo pequeno; escritura atomica para no corromper el archivo.
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const seed = require("./seed");

const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, "../data");
const FILE = path.join(DATA_DIR, "db.json");

let db;

function hashPassword(pass) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(pass, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

function verifyPassword(pass, stored) {
  const [salt, hash] = stored.split(":");
  const test = crypto.scryptSync(pass, salt, 64);
  const expected = Buffer.from(hash, "hex");
  return test.length === expected.length && crypto.timingSafeEqual(test, expected);
}

function initialUsers() {
  const adminPass = process.env.ADMIN_PASSWORD;
  const ventasPass = process.env.VENTAS_PASSWORD;
  if (!adminPass || !ventasPass) {
    console.warn("[seguridad] ADMIN_PASSWORD / VENTAS_PASSWORD no definidas: usando contrasenas por defecto. Cambielas.");
  }
  return [
    { id: 1, username: "Administrador", nombre: "Administrador de Operaciones", password: hashPassword(adminPass || "admin"), rol: "admin", departamento: "Departamento de Operaciones", activo: true },
    { id: 2, username: "Ventas", nombre: "Equipo Comercial y Ventas", password: hashPassword(ventasPass || "ventas"), rol: "lector", departamento: "Departamento de Ventas", activo: true }
  ];
}

function load() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  if (fs.existsSync(FILE)) {
    db = JSON.parse(fs.readFileSync(FILE, "utf8"));
    db.avisos ||= {};
    db.sesiones ||= {};
  } else {
    db = {
      usuarios: initialUsers(),
      personal: seed.PERSONAL,
      clientes: seed.CLIENTES,
      servicios: seed.servicios(),
      sesiones: {},
      avisos: {} // claves de avisos ya enviados, para no repetirlos
    };
    save();
  }
}

function save() {
  const tmp = `${FILE}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(db, null, 2));
  fs.renameSync(tmp, FILE);
}

const data = () => db;

// ---------- Servicios ----------
function crearServicio(d, usuario) {
  const nowIso = new Date().toISOString();
  const nextId = db.servicios.length ? Math.max(...db.servicios.map(s => s.id)) + 1 : 1;
  const anio = new Date().getFullYear();
  const nuevo = {
    id: nextId,
    codigo: `SERV-${anio}-${String(nextId).padStart(4, "0")}`,
    cliente_nombre: d.cliente_nombre || "Cliente General",
    cliente_contacto: d.cliente_contacto || "",
    ubicacion: d.ubicacion || "Instalaciones del cliente",
    tipo_servicio: d.tipo_servicio || "Mantenimiento General",
    descripcion: d.descripcion || "",
    fecha_programada: d.fecha_programada || nowIso,
    fecha_real_inicio: d.fecha_real_inicio,
    fecha_real_fin: d.fecha_real_fin,
    estado: d.estado || "programado",
    prioridad: d.prioridad || "media",
    observaciones: d.observaciones || "",
    personal_asignado: d.personal_asignado || [],
    creado_en: nowIso,
    modificado_en: nowIso,
    historial: [{
      id: Date.now(), servicio_id: nextId, estado_anterior: "nuevo",
      estado_nuevo: d.estado || "programado", usuario, nota: "Servicio creado en el sistema", fecha: nowIso
    }]
  };
  db.servicios.unshift(nuevo);
  save();
  return nuevo;
}

function actualizarServicio(id, d, usuario) {
  const idx = db.servicios.findIndex(s => s.id === id);
  if (idx === -1) return null;
  const original = db.servicios[idx];
  const nowIso = new Date().toISOString();
  const cambioEstado = d.estado && d.estado !== original.estado;
  const cambioFecha = d.fecha_programada && d.fecha_programada !== original.fecha_programada;

  let nota = "";
  if (cambioEstado) nota += `Estado: ${original.estado} -> ${d.estado}. `;
  if (cambioFecha) nota += `Reprogramado: ${new Date(d.fecha_programada).toLocaleString("es-CL")}. `;

  const historial = [...(original.historial || [])];
  if (nota || d.observaciones) {
    historial.push({
      id: Date.now(), servicio_id: id, estado_anterior: original.estado,
      estado_nuevo: d.estado || original.estado, usuario,
      nota: nota + (d.observaciones ? `Notas: ${d.observaciones}` : ""), fecha: nowIso
    });
  }

  const { id: _i, codigo: _c, historial: _h, creado_en: _ce, ...campos } = d;
  db.servicios[idx] = { ...original, ...campos, historial, modificado_en: nowIso };
  save();
  return { antes: original, despues: db.servicios[idx] };
}

function borrarServicio(id) {
  const antes = db.servicios.length;
  db.servicios = db.servicios.filter(s => s.id !== id);
  if (db.servicios.length !== antes) save();
}

// ---------- Personal ----------
function guardarPersonal(p) {
  if (p.id) {
    const idx = db.personal.findIndex(i => i.id === p.id);
    if (idx === -1) return null;
    db.personal[idx] = { ...db.personal[idx], ...p };
    save();
    return db.personal[idx];
  }
  const nuevo = {
    id: db.personal.length ? Math.max(...db.personal.map(i => i.id)) + 1 : 1,
    nombre: p.nombre || "Nuevo Trabajador",
    cargo: p.cargo || "Tecnico",
    especialidad: p.especialidad || "General",
    telefono: p.telefono || "",
    email: p.email || "",
    activo: p.activo !== undefined ? p.activo : true
  };
  db.personal.push(nuevo);
  save();
  return nuevo;
}

function borrarPersonal(id) {
  db.personal = db.personal.filter(p => p.id !== id);
  save();
}

module.exports = {
  load, save, data, hashPassword, verifyPassword,
  crearServicio, actualizarServicio, borrarServicio, guardarPersonal, borrarPersonal
};
