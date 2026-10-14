const express = require("express");
const cors = require("cors");
const path = require("path");

const store = require("./db");
const auth = require("./auth");
const assistant = require("./assistant");
const mailer = require("./mailer");

store.load();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: "1mb" }));
app.use(express.static(path.join(__dirname, "../dist")));

// ---------- Autenticacion ----------
app.post("/api/login", (req, res) => {
  const r = auth.login(req.body?.username, req.body?.password, req.ip);
  if (r.error) return res.status(r.status).json({ error: r.error });
  res.json(r);
});

app.post("/api/logout", (req, res) => {
  auth.logout(req);
  res.json({ ok: true });
});

app.get("/api/me", auth.requireAuth, (req, res) => res.json(req.usuario));

// Todo lo demas de /api requiere sesion
app.use("/api", auth.requireAuth);

// ---------- Usuarios (solo admin) ----------
app.get("/api/usuarios", auth.requireAdmin, (req, res) => res.json(auth.listarUsuarios()));

app.put("/api/usuarios/:id/password", auth.requireAdmin, (req, res) => {
  const tokenActual = (req.headers.authorization || "").replace(/^Bearer /, "");
  const r = auth.cambiarPasswordDe(Number(req.params.id), req.body?.nueva, tokenActual);
  if (r.error) return res.status(r.status).json({ error: r.error });
  res.json({ ok: true });
});

// ---------- Lectura ----------
app.get("/api/servicios", (req, res) => res.json(store.data().servicios));
app.get("/api/personal", (req, res) => res.json(store.data().personal));
app.get("/api/clientes", (req, res) => res.json(store.data().clientes));

// ---------- Escritura (solo admin) ----------
const nombreUsuario = req => req.usuario.nombre;

app.post("/api/servicios", auth.requireAdmin, async (req, res) => {
  const nuevo = store.crearServicio(req.body || {}, nombreUsuario(req));
  res.status(201).json(nuevo);
  assistant.onServicioGuardado(null, nuevo).catch(e => console.error("[asistente]", e));
});

app.put("/api/servicios/:id", auth.requireAdmin, async (req, res) => {
  const r = store.actualizarServicio(Number(req.params.id), req.body || {}, nombreUsuario(req));
  if (!r) return res.status(404).json({ error: "Servicio no encontrado" });
  res.json(r.despues);
  assistant.onServicioGuardado(r.antes, r.despues).catch(e => console.error("[asistente]", e));
});

app.delete("/api/servicios/:id", auth.requireAdmin, (req, res) => {
  store.borrarServicio(Number(req.params.id));
  res.json({ ok: true });
});

app.post("/api/personal", auth.requireAdmin, (req, res) => res.status(201).json(store.guardarPersonal({ ...req.body, id: undefined })));

app.put("/api/personal/:id", auth.requireAdmin, (req, res) => {
  const p = store.guardarPersonal({ ...req.body, id: Number(req.params.id) });
  if (!p) return res.status(404).json({ error: "Personal no encontrado" });
  res.json(p);
});

app.delete("/api/personal/:id", auth.requireAdmin, (req, res) => {
  store.borrarPersonal(Number(req.params.id));
  res.json({ ok: true });
});

// ---------- Asistente ----------
app.get("/api/asistente/resumen", (req, res) => res.json(assistant.construirResumen()));

app.post("/api/asistente/enviar-resumen", auth.requireAdmin, async (req, res) => {
  await assistant.enviarResumenDiario();
  res.json({ ok: true, smtp: mailer.configurado });
});

// SPA
app.use((req, res) => res.sendFile(path.join(__dirname, "../dist/index.html")));

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Servidor ejecutandose en el puerto ${PORT} (SMTP ${mailer.configurado ? "configurado" : "NO configurado: emails simulados"})`);
  assistant.iniciar();
});
