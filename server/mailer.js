const nodemailer = require("nodemailer");

const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM, SMTP_SECURE } = process.env;

const configurado = Boolean(SMTP_HOST);
const transporter = configurado
  ? nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT) || 587,
      secure: SMTP_SECURE === "true",
      auth: SMTP_USER ? { user: SMTP_USER, pass: SMTP_PASS } : undefined
    })
  : null;

// Sin SMTP configurado el asistente funciona en "modo prueba": escribe el correo en el log.
async function enviar({ to, subject, html }) {
  const destinatarios = [...new Set([].concat(to).filter(Boolean))];
  if (!destinatarios.length) return false;
  if (!transporter) {
    console.log(`[email simulado] Para: ${destinatarios.join(", ")} | Asunto: ${subject}`);
    return true;
  }
  try {
    await transporter.sendMail({ from: SMTP_FROM || SMTP_USER, to: destinatarios, subject, html });
    return true;
  } catch (e) {
    console.error(`[email] Error enviando "${subject}":`, e.message);
    return false;
  }
}

module.exports = { enviar, configurado };
