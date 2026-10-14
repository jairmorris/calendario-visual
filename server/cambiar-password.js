// Uso (con el servidor DETENIDO):
//   node --env-file=.env server/cambiar-password.js <usuario> <nueva-contrasena>
const store = require("./db");

const [username, nueva] = process.argv.slice(2);
if (!username || !nueva) {
  console.error("Uso: node --env-file=.env server/cambiar-password.js <usuario> <nueva-contrasena>");
  process.exit(1);
}

store.load();
const db = store.data();
const u = db.usuarios.find(x => x.username.toLowerCase() === username.toLowerCase());
if (!u) {
  console.error(`No existe el usuario "${username}". Usuarios: ${db.usuarios.map(x => x.username).join(", ")}`);
  process.exit(1);
}

u.password = store.hashPassword(nueva);
// Cierra las sesiones abiertas de ese usuario
for (const [token, s] of Object.entries(db.sesiones)) if (s.userId === u.id) delete db.sesiones[token];
store.save();
console.log(`Contrasena de "${u.username}" actualizada.`);
