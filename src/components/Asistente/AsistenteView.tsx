import React, { useEffect, useRef, useState } from "react";
import { AlertTriangle, CalendarClock, Mail, Send, Settings2, UsersRound } from "lucide-react";
import { api } from "../../services/api";
import { Personal, RolUsuario, Servicio } from "../../types";

interface Resumen {
  hoy: Servicio[];
  manana: Servicio[];
  atrasados: Servicio[];
  conflictos: { a: Servicio; b: Servicio; tecnicos: Personal[] }[];
}

interface Estado {
  smtp: boolean;
  config: { horaResumen: string; recordatorioHoras: number; duracionHoras: number };
  registro: { fecha: string; asunto: string; para: string[]; ok: boolean; simulado: boolean }[];
}

interface Props {
  rolActual: RolUsuario;
  onSelectServicio: (s: Servicio) => void;
}

const hora = (iso: string) => new Date(iso).toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit" });
const fechaCorta = (iso: string) => new Date(iso).toLocaleString("es-CL", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });

export const AsistenteView: React.FC<Props> = ({ rolActual, onSelectServicio }) => {
  const [resumen, setResumen] = useState<Resumen | null>(null);
  const [estado, setEstado] = useState<Estado | null>(null);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [cfg, setCfg] = useState({ horaResumen: "07:30", recordatorioHoras: 2, duracionHoras: 4 });
  const [enviando, setEnviando] = useState(false);
  const formCargado = useRef(false); // el formulario se rellena una sola vez para no pisar lo que escribe el admin

  const cargar = async () => {
    try {
      const [r, e] = await Promise.all([api<Resumen>("/asistente/resumen"), api<Estado>("/asistente/estado")]);
      setResumen(r);
      setEstado(e);
      if (!formCargado.current) {
        setCfg(e.config);
        formCargado.current = true;
      }
      setError("");
    } catch {
      setError("No se pudo cargar la informacion del asistente.");
    }
  };

  useEffect(() => {
    cargar();
    const id = setInterval(cargar, 30000);
    return () => clearInterval(id);
  }, []);

  const guardarConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setMensaje("");
    try {
      await api("/asistente/config", { method: "PUT", body: cfg });
      setMensaje("Configuracion guardada.");
      cargar();
    } catch (err: any) {
      setMensaje(err.message);
    }
  };

  const enviarResumen = async () => {
    if (!confirm("Se enviara el resumen ahora a todos los destinatarios configurados. Continuar?")) return;
    setEnviando(true);
    setMensaje("");
    try {
      const r = await api<{ smtp: boolean }>("/asistente/enviar-resumen", { method: "POST" });
      setMensaje(r.smtp ? "Resumen enviado." : "Resumen generado en modo prueba (SMTP no configurado): no salio ningun correo real.");
      cargar();
    } catch (err: any) {
      setMensaje(err.message);
    } finally {
      setEnviando(false);
    }
  };

  if (error && !resumen) return <p className="text-sm text-rose-700">{error}</p>;
  if (!resumen || !estado) return <p className="text-sm text-slate-500">Cargando...</p>;

  const Lista = ({ titulo, items, vacio, tono }: { titulo: string; items: Servicio[]; vacio: string; tono: string }) => (
    <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 space-y-2">
      <h3 className={`text-sm font-bold flex items-center space-x-2 ${tono}`}>
        <span>{titulo}</span>
        <span className="text-xs font-semibold bg-slate-100 text-slate-600 rounded-full px-2 py-0.5">{items.length}</span>
      </h3>
      {items.length === 0 ? (
        <p className="text-xs text-slate-400">{vacio}</p>
      ) : (
        <ul className="divide-y divide-slate-100">
          {items.map(s => (
            <li key={s.id}>
              <button onClick={() => onSelectServicio(s)} className="w-full text-left py-2 hover:bg-slate-50 rounded-lg px-2">
                <p className="text-sm font-semibold text-slate-800">
                  {fechaCorta(s.fecha_programada)} · {s.codigo} · {s.cliente_nombre}
                </p>
                <p className="text-xs text-slate-500">
                  {s.tipo_servicio} · {s.personal_asignado.map(p => p.nombre).join(", ") || "Sin personal asignado"}
                </p>
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );

  return (
    <div className="space-y-5 max-w-5xl">
      {!estado.smtp && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start space-x-2">
          <Mail className="w-4 h-4 shrink-0 mt-0.5" />
          <span>El correo saliente (SMTP) no esta configurado: el asistente funciona en modo prueba y los avisos aparecen abajo como simulados, sin enviarse a nadie.</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Lista titulo="Atrasados sin iniciar" items={resumen.atrasados} vacio="Nada atrasado." tono="text-rose-700" />
        <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 space-y-2">
          <h3 className="text-sm font-bold flex items-center space-x-2 text-amber-700">
            <UsersRound className="w-4 h-4" />
            <span>Conflictos de personal</span>
            <span className="text-xs font-semibold bg-slate-100 text-slate-600 rounded-full px-2 py-0.5">{resumen.conflictos.length}</span>
          </h3>
          {resumen.conflictos.length === 0 ? (
            <p className="text-xs text-slate-400">Ningun tecnico esta en dos servicios a la vez.</p>
          ) : (
            <ul className="space-y-2">
              {resumen.conflictos.map((c, i) => (
                <li key={i} className="text-xs bg-amber-50 border border-amber-200 rounded-xl p-2.5 space-y-1">
                  <p className="font-semibold text-amber-900">{c.tecnicos.map(t => t.nombre).join(", ")}</p>
                  <button onClick={() => onSelectServicio(c.a)} className="block text-left text-slate-700 hover:underline">
                    {fechaCorta(c.a.fecha_programada)} · {c.a.codigo} · {c.a.cliente_nombre}
                  </button>
                  <button onClick={() => onSelectServicio(c.b)} className="block text-left text-slate-700 hover:underline">
                    {fechaCorta(c.b.fecha_programada)} · {c.b.codigo} · {c.b.cliente_nombre}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
        <Lista titulo="Hoy" items={resumen.hoy} vacio="Sin servicios para hoy." tono="text-blue-700" />
        <Lista titulo="Manana" items={resumen.manana} vacio="Sin servicios para manana." tono="text-indigo-700" />
      </div>

      <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 space-y-2">
        <h3 className="text-sm font-bold text-slate-800 flex items-center space-x-2">
          <Mail className="w-4 h-4" />
          <span>Ultimos avisos enviados</span>
        </h3>
        {estado.registro.length === 0 ? (
          <p className="text-xs text-slate-400">Todavia no se ha enviado ningun aviso.</p>
        ) : (
          <ul className="divide-y divide-slate-100 text-xs">
            {estado.registro.slice(0, 15).map((r, i) => (
              <li key={i} className="py-1.5 flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-slate-800">{r.asunto}</p>
                  <p className="text-slate-500">{r.para.join(", ")}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-slate-500">{fechaCorta(r.fecha)}</p>
                  <p className={r.ok ? (r.simulado ? "text-amber-600" : "text-emerald-600") : "text-rose-600"}>
                    {!r.ok ? "Fallo el envio" : r.simulado ? "Simulado" : "Enviado"}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {rolActual === "admin" && (
        <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 space-y-3">
          <h3 className="text-sm font-bold text-slate-800 flex items-center space-x-2">
            <Settings2 className="w-4 h-4" />
            <span>Configuracion del asistente</span>
          </h3>
          <p className="text-xs text-slate-500">Quien recibe cada aviso se define en la pantalla Usuarios (email y casillas de avisos).</p>
          <form onSubmit={guardarConfig} className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
            <label className="text-xs font-semibold text-slate-600">
              Hora del resumen diario (lun-vie)
              <input type="time" value={cfg.horaResumen} onChange={e => setCfg({ ...cfg, horaResumen: e.target.value })}
                className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-xl text-sm font-normal" />
            </label>
            <label className="text-xs font-semibold text-slate-600">
              Recordatorio al tecnico (horas antes)
              <input type="number" min={1} max={72} value={cfg.recordatorioHoras} onChange={e => setCfg({ ...cfg, recordatorioHoras: Number(e.target.value) })}
                className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-xl text-sm font-normal" />
            </label>
            <label className="text-xs font-semibold text-slate-600">
              Duracion supuesta de un servicio (horas)
              <input type="number" min={1} max={72} value={cfg.duracionHoras} onChange={e => setCfg({ ...cfg, duracionHoras: Number(e.target.value) })}
                className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-xl text-sm font-normal" />
            </label>
            <button type="submit" className="py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl">Guardar</button>
          </form>
          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <p className="text-xs text-slate-500 flex items-center space-x-1">
              <CalendarClock className="w-3.5 h-3.5" />
              <span>La duracion se usa para detectar solapes entre servicios.</span>
            </p>
            <button onClick={enviarResumen} disabled={enviando}
              className="flex items-center space-x-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-900 disabled:opacity-60 text-white text-xs font-semibold rounded-xl">
              <Send className="w-3.5 h-3.5" />
              <span>{enviando ? "Enviando..." : "Enviar resumen ahora"}</span>
            </button>
          </div>
          {mensaje && (
            <p className="text-xs text-slate-700 bg-slate-50 border border-slate-200 rounded-xl p-2.5 flex items-center space-x-2">
              <AlertTriangle className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <span>{mensaje}</span>
            </p>
          )}
        </section>
      )}
    </div>
  );
};
