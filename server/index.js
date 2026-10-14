const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Servir archivos estaticos compilados del frontend (React)
app.use(express.static(path.join(__dirname, "../dist")));

// Memoria central temporal / SQLite DB
let serviciosDB = [
  {
    id: 1,
    codigo: "SERV-2026-0001",
    cliente_nombre: "Constructora del Norte S.A.",
    cliente_contacto: "Ing. Juan Perez (+56 9 1234 5678)",
    ubicacion: "Av. Industrial 450, Bodega 3, Santiago",
    tipo_servicio: "Instalacion Electrica",
    descripcion: "Montaje de tableros secundarios de distribucion en nave industrial principal.",
    fecha_programada: new Date().toISOString(),
    estado: "en_curso",
    prioridad: "alta",
    observaciones: "Requiere EPP completo y certificacion de trabajo en altura.",
    personal_asignado: [
      { id: 1, nombre: "Carlos Mendoza", cargo: "Tecnico Senior", especialidad: "Electricidad y Climatizacion" },
      { id: 3, nombre: "Roberto Silva", cargo: "Tecnico de Terreno", especialidad: "Mecanica y Obras" }
    ]
  }
];

let personalDB = [
  { id: 1, nombre: "Carlos Mendoza", cargo: "Tecnico Senior", especialidad: "Electricidad y Climatizacion", telefono: "+56 9 1234 5678", activo: true },
  { id: 2, nombre: "Ana Gutierrez", cargo: "Especialista Redes", especialidad: "Telecomunicaciones y Fibra", telefono: "+56 9 8765 4321", activo: true },
  { id: 3, nombre: "Roberto Silva", cargo: "Tecnico de Terreno", especialidad: "Mecanica y Obras", telefono: "+56 9 5555 4444", activo: true },
  { id: 4, nombre: "Maria Jose Fernandez", cargo: "Supervisora de Calidad", especialidad: "Inspecciones de Seguridad", telefono: "+56 9 3333 2222", activo: true }
];

// Endpoints REST de la API
app.get("/api/servicios", (req, res) => {
  res.json(serviciosDB);
});

app.post("/api/servicios", (req, res) => {
  const nuevo = {
    id: Date.now(),
    codigo: `SERV-2026-${String(serviciosDB.length + 1).padStart(4, "0")}`,
    ...req.body
  };
  serviciosDB.unshift(nuevo);
  res.status(201).json(nuevo);
});

app.get("/api/personal", (req, res) => {
  res.json(personalDB);
});

// Todas las demas rutas sirven la SPA React
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../dist/index.html"));
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Servidor Central Corporativo ejecutandose en el puerto ${PORT}`);
});

