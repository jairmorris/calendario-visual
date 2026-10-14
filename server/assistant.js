// Asistente proactivo: revisa la agenda y avisa por email sin que nadie lo pida.
//   - Resumen diario (lun-vie) a la lista de DESTINATARIOS_RESUMEN y agenda personal a cada tecnico con email
//   - Alertas a DESTINATARIOS_ALERTAS: servicio atrasado, tecnico con dos servicios a la vez
//   - Recordatorio al tecnico poco antes de un servicio
//   - Aviso inmediato al tecnico cuando le asignan un servicio (via onServicioGuardado)
const store = require("./db");
const { enviar } = require("./mailer");

const lista = v => (v || "").split(",").map(s => s.trim()).filter(Boolean);
const cfg = () => ({
  resumen: lista(process.env.DESTINATARIOS_RESUMEN),
  alertas: lista(process.env.DESTINATARIOS_ALERTAS),
  horaResumen: process.env.HORA_RESUMEN || "07:30",
  recordatorioHoras: Number(process.env.RECORDATORIO_HORAS) || 2,
  duracionHoras: Number(process.env.DURACION_HORAS) || 4,
  urlApp: process.env.URL_APP || ""
});

const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const ACTIVO = new Set(["programado", "en_curso"]);
const fmtHora = d => new Date(d).toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit" });
const fmtFecha = d => new Date(d).toLocaleDateString("es-CL", { weekday: "long", day: "numeric", month: "long" });
const mismoDia = (a, b) => new Date(a).toDateString() === new Date(b).toDateString();

const filaServicio = s => `<li><b>${fmtHora(s.fecha_programada)}</b> · ${esc(s.codigo)} · ${esc(s.cliente_nombre)} — ${esc(s.tipo_servicio)}
  <br><small>${esc(s.ubicacion)} · prioridad ${esc(s.prioridad)} · ${esc(s.personal_asignado.map(p => p.nombre).join(", ") || "sin personal asignado")}</small></li>`;

const bloque = (titulo, servicios) =>
  servicios.length ? `<h3>${esc(titulo)} (${servicios.length})</h3><ul>${servicios.map(filaServicio).join("")}</ul>` : "";

const layout = (titulo, cuerpo) => {
  const { urlApp } = cfg();
  return `<div style="font-family:Arial,sans-serif;max-width:640px"><h2>${esc(titulo)}</h2>${cuerpo}
  ${urlApp ? `<p><a href="${esc(urlApp)}">Abrir el calendario</a></p>` : ""}
  <hr><small>Mensaje automatico del asistente de programacion.</small></div>`;
};

const porHora = (a, b) => new Date(a.fecha_programada) - new Date(b.fecha_programada);
const atrasados = (servicios, ahora) =>
  servicios.filter(s => s.estado === "programado" && new Date(s.fecha_programada) < ahora).sort(porHora);

// Pares de servicios activos que comparten un tecnico en horarios que se solapan.
function conflictos(servicios) {
  const { duracionHoras } = cfg();
  const ms = duracionHoras * 3600 * 1000;
  const activos = servicios.filter(s => ACTIVO.has(s.estado)).sort(porHora);
  const res = [];
  for (let i = 0; i < activos.length; i++) {
    for (let j = i + 1; j < activos.length; j++) {
      const a = activos[i], b = activos[j];
      if (new Date(b.fecha_programada) - new Date(a.fecha_programada) >= ms) break;
      const comunes = a.personal_asignado.filter(p => b.personal_asignado.some(q => q.id === p.id));
      if (comunes.length) res.push({ a, b, tecnicos: comunes });
    }
  }
  return res;
}

// Marca un aviso como enviado; devuelve false si ya se habia enviado.
function primeraVez(clave) {
  const db = store.data();
  if (db.avisos[clave]) return false;
  db.avisos[clave] = new Date().toISOString();
  store.save();
  return true;
}

// ---------- Resumen diario ----------
function construirResumen(ahora = new Date()) {
  const { servicios } = store.data();
  const manana = new Date(ahora); manana.setDate(manana.getDate() + 1);
  const hoy = servicios.filter(s => ACTIVO.has(s.estado) && mismoDia(s.fecha_programada, ahora)).sort(porHora);
  const prox = servicios.filter(s => ACTIVO.has(s.estado) && mismoDia(s.fecha_programada, manana)).sort(porHora);
  const atr = atrasados(servicios, ahora).filter(s => !mismoDia(s.fecha_programada, ahora));
  const conf = conflictos(servicios).filter(c => new Date(c.b.fecha_programada) >= ahora);
  return { hoy, manana: prox, atrasados: atr, conflictos: conf };
}

async function enviarResumenDiario(ahora = new Date()) {
  const c = cfg();
  const r = construirResumen(ahora);
  const hayAlgo = r.hoy.length || r.manana.length || r.atrasados.length || r.conflictos.length;

  if (c.resumen.length && hayAlgo) {
    const confHtml = r.conflictos.length
      ? `<h3>Conflictos de personal (${r.conflictos.length})</h3><ul>${r.conflictos.map(x =>
          `<li>${esc(x.tecnicos.map(t => t.nombre).join(", "))}: ${esc(x.a.codigo)} (${fmtHora(x.a.fecha_programada)}) y ${esc(x.b.codigo)} (${fmtHora(x.b.fecha_programada)}) se solapan</li>`).join("")}</ul>`
      : "";
    await enviar({
      to: c.resumen,
      subject: `Agenda del ${fmtFecha(ahora)}: ${r.hoy.length} servicio(s) hoy`,
      html: layout(`Resumen del ${fmtFecha(ahora)}`,
        bloque("Atrasados sin iniciar", r.atrasados) + bloque("Hoy", r.hoy) + bloque("Manana", r.manana) + confHtml ||
        "<p>Sin servicios.</p>")
    });
  }

  // Agenda personal de cada tecnico con email
  for (const t of store.data().personal.filter(p => p.activo && p.email)) {
    const suyos = s => s.personal_asignado.some(p => p.id === t.id);
    const h = r.hoy.filter(suyos), m = r.manana.filter(suyos);
    if (!h.length && !m.length) continue;
    await enviar({
      to: t.email,
      subject: `Tu agenda de hoy: ${h.length} servicio(s)`,
      html: layout(`Hola ${t.nombre.split(" ")[0]}`, bloque("Hoy", h) + bloque("Manana", m))
    });
  }
}

// ---------- Alertas periodicas ----------
async function revisarAlertas(ahora = new Date()) {
  const c = cfg();
  const { servicios, personal } = store.data();

  if (c.alertas.length) {
    for (const s of atrasados(servicios, ahora)) {
      if (!primeraVez(`atrasado:${s.id}:${s.fecha_programada}`)) continue;
      await enviar({
        to: c.alertas,
        subject: `Servicio atrasado: ${s.codigo} - ${s.cliente_nombre}`,
        html: layout("Servicio sin iniciar fuera de hora",
          `<p>Estaba programado para ${fmtFecha(s.fecha_programada)} a las ${fmtHora(s.fecha_programada)} y sigue en estado "programado".</p><ul>${filaServicio(s)}</ul><p>Inicielo, reprogramelo o cancelelo.</p>`)
      });
    }

    for (const x of conflictos(servicios)) {
      if (!primeraVez(`conflicto:${x.a.id}:${x.a.fecha_programada}:${x.b.id}:${x.b.fecha_programada}`)) continue;
      await enviar({
        to: c.alertas,
        subject: `Conflicto de agenda: ${x.tecnicos.map(t => t.nombre).join(", ")}`,
        html: layout("Un tecnico esta asignado a dos servicios a la vez", `<ul>${filaServicio(x.a)}${filaServicio(x.b)}</ul>
          <p>Se asume una duracion de ${c.duracionHoras} h por servicio.</p>`)
      });
    }
  }

  // Recordatorio al tecnico antes del servicio
  const limite = new Date(ahora.getTime() + c.recordatorioHoras * 3600 * 1000);
  for (const s of servicios.filter(x => x.estado === "programado" && new Date(x.fecha_programada) > ahora && new Date(x.fecha_programada) <= limite)) {
    const correos = s.personal_asignado.map(p => personal.find(q => q.id === p.id)?.email).filter(Boolean);
    if (!correos.length || !primeraVez(`recordatorio:${s.id}:${s.fecha_programada}`)) continue;
    await enviar({
      to: correos,
      subject: `Recordatorio: ${s.codigo} a las ${fmtHora(s.fecha_programada)}`,
      html: layout("Tienes un servicio en breve", `<ul>${filaServicio(s)}</ul><p>${esc(s.descripcion)}</p><p><i>${esc(s.observaciones)}</i></p>`)
    });
  }
}

// ---------- Aviso inmediato al guardar ----------
// antes = servicio previo (null si es nuevo)
async function onServicioGuardado(antes, despues) {
  const { personal } = store.data();
  const c = cfg();
  const idsAntes = new Set((antes?.personal_asignado || []).map(p => p.id));
  const nuevos = despues.personal_asignado.filter(p => !idsAntes.has(p.id));
  const reprogramado = antes && antes.fecha_programada !== despues.fecha_programada;

  const aTecnicos = (lista, asunto, titulo) => {
    const correos = lista.map(p => personal.find(q => q.id === p.id)?.email).filter(Boolean);
    return enviar({ to: correos, subject: asunto, html: layout(titulo, `<ul>${filaServicio(despues)}</ul><p>${esc(despues.descripcion)}</p>`) });
  };

  if (ACTIVO.has(despues.estado)) {
    if (nuevos.length) await aTecnicos(nuevos, `Nuevo servicio asignado: ${despues.codigo}`, "Se te asigno un servicio");
    if (reprogramado) {
      await aTecnicos(despues.personal_asignado.filter(p => !nuevos.some(n => n.id === p.id)),
        `Servicio reprogramado: ${despues.codigo}`, "Cambio de fecha de un servicio");
    }
  }

  const esUrgenteNuevo = despues.prioridad === "urgente" && (!antes || antes.prioridad !== "urgente");
  if (esUrgenteNuevo && c.alertas.length) {
    await enviar({ to: c.alertas, subject: `Servicio URGENTE: ${despues.codigo}`, html: layout("Se registro un servicio urgente", `<ul>${filaServicio(despues)}</ul>`) });
  }
}

// ---------- Planificador ----------
let ultimoResumen = "";

function iniciar() {
  const tick = async () => {
    const ahora = new Date();
    try {
      const hhmm = ahora.toTimeString().slice(0, 5);
      const dia = ahora.getDay();
      const clave = ahora.toDateString();
      if (dia >= 1 && dia <= 5 && hhmm >= cfg().horaResumen && ultimoResumen !== clave) {
        // Tras un reinicio no repetir el resumen del dia si ya salio
        ultimoResumen = clave;
        if (primeraVez(`resumen:${clave}`)) await enviarResumenDiario(ahora);
      }
      await revisarAlertas(ahora);
    } catch (e) {
      console.error("[asistente] Error:", e);
    }
  };
  setInterval(tick, 5 * 60 * 1000);
  setTimeout(tick, 10 * 1000);
  console.log(`[asistente] Activo. Resumen diario ${cfg().horaResumen}, alertas cada 5 min.`);
}

module.exports = { iniciar, onServicioGuardado, construirResumen, enviarResumenDiario, revisarAlertas };
