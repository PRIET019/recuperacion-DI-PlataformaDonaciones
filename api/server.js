import express from "express";
import cors from "cors";
import jwt from "jsonwebtoken";
import Database from "better-sqlite3";

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || "SUPER_SECRET_DEV_KEY";
const JWT_EXPIRES_IN_SECONDS = 60 * 60 * 8; // 8h

// --- SQLite (persistente)
const db = new Database("./data.sqlite");
db.pragma("journal_mode = WAL");

// ---------- Utils
function startOfDay(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}
function addDays(d, n) {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}
function ymd(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
function iso(d) {
  return new Date(d).toISOString();
}
function clampInt(v, min, max, fallback) {
  const n = Number.parseInt(v, 10);
  if (Number.isNaN(n)) return fallback;
  return Math.max(min, Math.min(max, n));
}
function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function randChoice(arr) {
  return arr[randInt(0, arr.length - 1)];
}
function randomAmount() {
  const base = randInt(5, 200);
  const half = Math.random() < 0.35 ? 0.5 : 0;
  return base + half;
}

// ---------- Schema
db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  usuario TEXT NOT NULL UNIQUE,
  contrasena TEXT NOT NULL,
  rol TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS campanas (
  id TEXT PRIMARY KEY,
  owner_user_id TEXT NOT NULL,
  nombre TEXT NOT NULL,
  descripcion TEXT NOT NULL,
  objetivoRecaudacion REAL NOT NULL,
  estado TEXT NOT NULL CHECK (estado IN ('ACTIVA','FINALIZADA')),
  fechaCreacion TEXT NOT NULL,
  fechaFinalizacion TEXT,
  FOREIGN KEY (owner_user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS donaciones (
  idDonacion TEXT PRIMARY KEY,
  idCampana TEXT NOT NULL,
  importe REAL NOT NULL,
  fecha TEXT NOT NULL,
  metodoPago TEXT,
  nombreDonante TEXT,
  emailDonante TEXT,
  mensaje TEXT,
  FOREIGN KEY (idCampana) REFERENCES campanas(id)
);

CREATE INDEX IF NOT EXISTS idx_donaciones_campana ON donaciones(idCampana);
CREATE INDEX IF NOT EXISTS idx_donaciones_fecha ON donaciones(fecha);
`);

// ---------- Seed (solo si BD vacía)
const NOW = new Date();
const YEAR_START = new Date(NOW.getFullYear(), 0, 1);
const TODAY = startOfDay(NOW);

function seedIfNeeded() {
  const countUsers = db.prepare("SELECT COUNT(*) as n FROM users").get().n;
  if (countUsers === 0) {
    db.prepare("INSERT INTO users (id, usuario, contrasena, rol) VALUES (?,?,?,?)")
      .run("u_1", "creador1", "1234", "CREADOR");
  }

  const countCamp = db.prepare("SELECT COUNT(*) as n FROM campanas").get().n;
  if (countCamp > 0) return;

  // 20 campañas en lo que va de año
  const temas = [
    "Becas comedor",
    "Material escolar",
    "Ayuda familias",
    "Banco de alimentos",
    "Refuerzo educativo",
    "Emergencia social",
    "Salud infantil",
    "Inclusión digital"
  ];

  const insertCamp = db.prepare(`
    INSERT INTO campanas
    (id, owner_user_id, nombre, descripcion, objetivoRecaudacion, estado, fechaCreacion, fechaFinalizacion)
    VALUES (?,?,?,?,?,?,?,?)
  `);

  const insertDon = db.prepare(`
    INSERT INTO donaciones
    (idDonacion, idCampana, importe, fecha, metodoPago, nombreDonante, emailDonante, mensaje)
    VALUES (?,?,?,?,?,?,?,?)
  `);

  const tx = db.transaction(() => {
    let campaignSeq = 1000;
    let donationSeq = 9000;

    for (let i = 0; i < 20; i++) {
      campaignSeq += 1;
      const campId = `c_${campaignSeq}`;

      const nombre = `Campaña ${i + 1} - ${randChoice(temas)}`;
      const descripcion = `Descripción de ${nombre}. Objetivo solidario y transparencia en donaciones.`;
      const objetivo = randInt(300, 3000);

      const daysSinceStart = Math.max(0, Math.floor((TODAY - YEAR_START) / 86400000));
      const offsetDays = randInt(0, Math.max(0, daysSinceStart));
      const fechaCreacion = addDays(YEAR_START, offsetDays);

      const isFinal = Math.random() < 0.4;
      const estado = isFinal ? "FINALIZADA" : "ACTIVA";

      let fechaFinalizacion = null;
      if (estado === "FINALIZADA") {
        const start = startOfDay(fechaCreacion);
        const maxDays = Math.max(0, Math.floor((TODAY - start) / 86400000));
        const finOffset = randInt(0, maxDays);
        const finDate = addDays(start, finOffset);
        finDate.setHours(randInt(10, 20), randInt(0, 59), randInt(0, 59), 0);
        fechaFinalizacion = iso(finDate);
      }

      insertCamp.run(
        campId,
        "u_1",
        nombre,
        descripcion,
        objetivo,
        estado,
        iso(fechaCreacion),
        fechaFinalizacion
      );

      // Donaciones: desde creación hasta hoy o hasta finalización (día)
      const endDay = estado === "FINALIZADA"
        ? startOfDay(new Date(fechaFinalizacion))
        : TODAY;

      let day = startOfDay(fechaCreacion);
      while (day <= endDay) {
        const nDonaciones = randInt(3, 10);
        for (let j = 0; j < nDonaciones; j++) {
          donationSeq += 1;
          const idDon = `d_${donationSeq}`;
          const metodo = randChoice(["BIZUM", "TRANSFERENCIA", "EFECTIVO"]);
          const importe = randomAmount();

          const fecha = new Date(day);
          fecha.setHours(randInt(9, 21), randInt(0, 59), randInt(0, 59), 0);

          const nombreDonante = Math.random() < 0.6 ? randChoice(["Ana", "Luis", "María", "Iván", "Sofía", "Pablo"]) : null;
          const emailDonante = Math.random() < 0.35 ? "donante@example.com" : null;
          const mensaje = Math.random() < 0.25 ? randChoice(["¡Ánimo!", "Gracias por lo que hacéis", "Un granito de arena"]) : null;

          insertDon.run(idDon, campId, importe, iso(fecha), metodo, nombreDonante, emailDonante, mensaje);
        }
        day = addDays(day, 1);
      }
    }
  });

  tx();
}

seedIfNeeded();

// ---------- Auth middleware
function requireAuth(req, res, next) {
  const h = req.headers.authorization;
  if (!h || !h.startsWith("Bearer ")) {
    return res.status(401).json({ mensaje: "Falta token Bearer" });
  }
  const token = h.slice("Bearer ".length);
  try {
    req.user = jwt.verify(token, JWT_SECRET); // { sub, rol, iat, exp }
    next();
  } catch {
    return res.status(401).json({ mensaje: "Token inválido o caducado" });
  }
}

// ---------- Helpers de respuesta campaña
function mapCampaignRow(row) {
  // row trae recaudado agregado (puede ser null)
  const base = {
    id: row.id,
    nombre: row.nombre,
    descripcion: row.descripcion,
    objetivoRecaudacion: row.objetivoRecaudacion,
    recaudado: Number((row.recaudado ?? 0).toFixed(2)),
    estado: row.estado
  };
  if (row.estado === "FINALIZADA" && row.fechaFinalizacion) {
    return { ...base, fechaFinalizacion: row.fechaFinalizacion };
  }
  return base;
}

// =========================
// 2.1 Login
// =========================
app.post("/api/auth/login", (req, res) => {


  const { usuario, contrasena } = req.body || {};
  const row = db
    .prepare("SELECT id, rol FROM users WHERE usuario = ? AND contrasena = ?")
    .get(usuario, contrasena);

  if (!row) return res.status(401).json({ mensaje: "Credenciales inválidas" });

  const accessToken = jwt.sign(
    { sub: row.id, rol: row.rol },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN_SECONDS }
  );

  res.json({ accessToken });
});

// =========================
// Públicos
// =========================

// 1.1 Listado campañas públicas
app.get("/api/public/campanas", (req, res) => {
  const soloActivas = String(req.query.soloActivas ?? "true") === "true";

  const sql = `
    SELECT c.*,
           COALESCE(SUM(d.importe), 0) AS recaudado
    FROM campanas c
    LEFT JOIN donaciones d ON d.idCampana = c.id
    ${soloActivas ? "WHERE c.estado = 'ACTIVA'" : ""}
    GROUP BY c.id
    ORDER BY c.fechaCreacion DESC
  `;
  const rows = db.prepare(sql).all();
  res.json(rows.map(mapCampaignRow).map(({ descripcion, ...rest }) => rest)); // en listado no hace falta descripcion completa
});

// 1.2 Detalle campaña pública
app.get("/api/public/campanas/:id", (req, res) => {
  const { id } = req.params;
  const row = db.prepare(`
    SELECT c.*,
           COALESCE(SUM(d.importe), 0) AS recaudado
    FROM campanas c
    LEFT JOIN donaciones d ON d.idCampana = c.id
    WHERE c.id = ?
    GROUP BY c.id
  `).get(id);

  if (!row) return res.status(404).json({ mensaje: "Campaña no encontrada" });

  res.json(mapCampaignRow(row));
});

// 1.3 Crear donación pública
app.post("/api/public/campanas/:id/donaciones", (req, res) => {
  const { id } = req.params;

  const camp = db.prepare("SELECT id, estado FROM campanas WHERE id = ?").get(id);
  if (!camp) return res.status(404).json({ mensaje: "Campaña no encontrada" });
  if (camp.estado !== "ACTIVA") {
    return res.status(409).json({ mensaje: "Esta campaña está finalizada y no admite donaciones" });
  }

  const { importe, nombreDonante, emailDonante, metodoPago, mensaje } = req.body || {};
  if (typeof importe !== "number" || importe <= 0) {
    return res.status(400).json({ mensaje: "El importe debe ser mayor que 0" });
  }

  const idDonacion = `d_${Date.now()}_${randInt(1000,9999)}`;
  const fecha = iso(new Date());

  db.prepare(`
    INSERT INTO donaciones (idDonacion, idCampana, importe, fecha, metodoPago, nombreDonante, emailDonante, mensaje)
    VALUES (?,?,?,?,?,?,?,?)
  `).run(
    idDonacion,
    id,
    importe,
    fecha,
    metodoPago ?? null,
    nombreDonante ?? null,
    emailDonante ?? null,
    mensaje ?? null
  );

  res.status(201).json({ idDonacion, idCampana: id, importe, fecha });
});

// =========================
// Privados (JWT)
// =========================

// 3.1 Listar mis campañas
app.get("/api/campanas", requireAuth, (req, res) => {
  const userId = req.user.sub;
  const rows = db.prepare(`
    SELECT c.*,
           COALESCE(SUM(d.importe), 0) AS recaudado
    FROM campanas c
    LEFT JOIN donaciones d ON d.idCampana = c.id
    WHERE c.owner_user_id = ?
    GROUP BY c.id
    ORDER BY c.fechaCreacion DESC
  `).all(userId);

  res.json(rows.map(mapCampaignRow).map(({ descripcion, ...rest }) => rest)); // listado privado sin descripcion completa (opcional)
});

// 3.2 Crear campaña
app.post("/api/campanas", requireAuth, (req, res) => {
  const userId = req.user.sub;
  const { nombre, descripcion, objetivoRecaudacion } = req.body || {};

  if (!nombre || !descripcion || typeof objetivoRecaudacion !== "number") {
    return res.status(400).json({ mensaje: "nombre, descripcion y objetivoRecaudacion son obligatorios" });
  }
  if (objetivoRecaudacion <= 0) {
    return res.status(400).json({ mensaje: "objetivoRecaudacion debe ser mayor que 0" });
  }

  const id = `c_${Date.now()}_${randInt(1000,9999)}`;
  db.prepare(`
    INSERT INTO campanas (id, owner_user_id, nombre, descripcion, objetivoRecaudacion, estado, fechaCreacion, fechaFinalizacion)
    VALUES (?,?,?,?,?,'ACTIVA',?,NULL)
  `).run(id, userId, nombre, descripcion, objetivoRecaudacion, iso(new Date()));

  // devolver campaña creada con recaudado=0
  res.status(201).json({
    id,
    nombre,
    descripcion,
    objetivoRecaudacion,
    recaudado: 0,
    estado: "ACTIVA"
  });
});

// 3.3 Obtener detalle privado de campaña
app.get("/api/campanas/:id", requireAuth, (req, res) => {
  const userId = req.user.sub;
  const { id } = req.params;

  const row = db.prepare(`
    SELECT c.*,
           COALESCE(SUM(d.importe), 0) AS recaudado
    FROM campanas c
    LEFT JOIN donaciones d ON d.idCampana = c.id
    WHERE c.id = ?
    GROUP BY c.id
  `).get(id);

  if (!row) return res.status(404).json({ mensaje: "Campaña no encontrada" });
  if (row.owner_user_id !== userId) return res.status(403).json({ mensaje: "No tienes permisos para acceder a esta campaña" });

  res.json(mapCampaignRow(row));
});

// 3.4 Editar campaña (solo ACTIVA)
app.put("/api/campanas/:id", requireAuth, (req, res) => {
  const userId = req.user.sub;
  const { id } = req.params;

  const camp = db.prepare("SELECT owner_user_id, estado FROM campanas WHERE id = ?").get(id);
  if (!camp) return res.status(404).json({ mensaje: "Campaña no encontrada" });
  if (camp.owner_user_id !== userId) return res.status(403).json({ mensaje: "No tienes permisos para editar esta campaña" });
  if (camp.estado !== "ACTIVA") return res.status(409).json({ mensaje: "No se puede editar una campaña finalizada" });

  const { nombre, descripcion, objetivoRecaudacion } = req.body || {};
  if (!nombre || !descripcion || typeof objetivoRecaudacion !== "number") {
    return res.status(400).json({ mensaje: "nombre, descripcion y objetivoRecaudacion son obligatorios" });
  }
  if (objetivoRecaudacion <= 0) {
    return res.status(400).json({ mensaje: "objetivoRecaudacion debe ser mayor que 0" });
  }

  db.prepare(`
    UPDATE campanas
    SET nombre = ?, descripcion = ?, objetivoRecaudacion = ?
    WHERE id = ?
  `).run(nombre, descripcion, objetivoRecaudacion, id);

  // devolver campaña actualizada
  const row = db.prepare(`
    SELECT c.*,
           COALESCE(SUM(d.importe), 0) AS recaudado
    FROM campanas c
    LEFT JOIN donaciones d ON d.idCampana = c.id
    WHERE c.id = ?
    GROUP BY c.id
  `).get(id);

  res.json(mapCampaignRow(row));
});

// 3.5 Finalizar campaña (backend asigna fechaFinalizacion)
app.post("/api/campanas/:id/finalizar", requireAuth, (req, res) => {
  const userId = req.user.sub;
  const { id } = req.params;

  const camp = db.prepare("SELECT owner_user_id, estado FROM campanas WHERE id = ?").get(id);
  if (!camp) return res.status(404).json({ mensaje: "Campaña no encontrada" });
  if (camp.owner_user_id !== userId) return res.status(403).json({ mensaje: "No tienes permisos para finalizar esta campaña" });
  if (camp.estado === "FINALIZADA") return res.status(409).json({ mensaje: "La campaña ya está finalizada" });

  const fechaFinalizacion = iso(new Date());
  db.prepare(`
    UPDATE campanas
    SET estado = 'FINALIZADA', fechaFinalizacion = ?
    WHERE id = ?
  `).run(fechaFinalizacion, id);

  res.json({ id, estado: "FINALIZADA", fechaFinalizacion });
});

// =========================
// Métricas (sin rangos, globales)
// =========================

// 4.1 Resumen global (/panel)
app.get("/api/metricas/resumen", requireAuth, (req, res) => {
  const userId = req.user.sub;

  const totals = db.prepare(`
    SELECT
      COALESCE(SUM(d.importe), 0) AS totalRecaudado,
      COALESCE(COUNT(d.idDonacion), 0) AS numeroDonaciones
    FROM campanas c
    LEFT JOIN donaciones d ON d.idCampana = c.id
    WHERE c.owner_user_id = ?
  `).get(userId);

  const active = db.prepare(`
    SELECT COUNT(*) AS numeroCampanasActivas
    FROM campanas
    WHERE owner_user_id = ? AND estado = 'ACTIVA'
  `).get(userId);

  const totalRecaudado = Number((totals.totalRecaudado ?? 0).toFixed(2));
  const numeroDonaciones = totals.numeroDonaciones ?? 0;
  const donacionMedia = numeroDonaciones === 0 ? 0 : Number((totalRecaudado / numeroDonaciones).toFixed(2));
  const numeroCampanasActivas = active.numeroCampanasActivas ?? 0;

  res.json({ totalRecaudado, numeroDonaciones, donacionMedia, numeroCampanasActivas });
});

// 4.2 Donaciones por día (global, desde 1 de enero hasta hoy)
app.get("/api/metricas/donaciones-por-dia", requireAuth, (req, res) => {
  const userId = req.user.sub;

  const rows = db.prepare(`
    SELECT
      substr(d.fecha, 1, 10) AS fecha,
      COALESCE(SUM(d.importe), 0) AS totalRecaudado,
      COUNT(d.idDonacion) AS numeroDonaciones
    FROM campanas c
    JOIN donaciones d ON d.idCampana = c.id
    WHERE c.owner_user_id = ?
      AND d.fecha >= ?
      AND d.fecha <= ?
    GROUP BY substr(d.fecha, 1, 10)
    ORDER BY fecha ASC
  `).all(userId, iso(YEAR_START), iso(endOfDay(TODAY)));

  // rellenar días sin datos con 0
  const map = new Map(rows.map(r => [r.fecha, r]));
  const out = [];
  let day = startOfDay(YEAR_START);
  while (day <= TODAY) {
    const k = ymd(day);
    const v = map.get(k);
    out.push({
      fecha: k,
      totalRecaudado: Number(((v?.totalRecaudado) ?? 0).toFixed(2)),
      numeroDonaciones: (v?.numeroDonaciones) ?? 0
    });
    day = addDays(day, 1);
  }

  res.json(out);
});

function endOfDay(d) {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
}

// 4.3 Top campañas (por recaudación)
app.get("/api/metricas/top-campanas", requireAuth, (req, res) => {
  const userId = req.user.sub;
  const limite = clampInt(req.query.limite, 1, 50, 5);

  const rows = db.prepare(`
    SELECT
      c.id AS idCampana,
      c.nombre AS nombreCampana,
      COALESCE(SUM(d.importe), 0) AS totalRecaudado,
      COALESCE(COUNT(d.idDonacion), 0) AS numeroDonaciones
    FROM campanas c
    LEFT JOIN donaciones d ON d.idCampana = c.id
    WHERE c.owner_user_id = ?
    GROUP BY c.id
    ORDER BY totalRecaudado DESC
    LIMIT ?
  `).all(userId, limite);

  res.json(rows.map(r => ({
    idCampana: r.idCampana,
    nombreCampana: r.nombreCampana,
    totalRecaudado: Number((r.totalRecaudado ?? 0).toFixed(2)),
    numeroDonaciones: r.numeroDonaciones ?? 0
  })));
});

// 4.4 Métricas de una campaña
app.get("/api/campanas/:id/metricas", requireAuth, (req, res) => {
  const userId = req.user.sub;
  const { id } = req.params;

  const camp = db.prepare("SELECT owner_user_id FROM campanas WHERE id = ?").get(id);
  if (!camp) return res.status(404).json({ mensaje: "Campaña no encontrada" });
  if (camp.owner_user_id !== userId) return res.status(403).json({ mensaje: "No tienes permisos para acceder a esta campaña" });

  const row = db.prepare(`
    SELECT
      COALESCE(SUM(importe), 0) AS totalRecaudado,
      COALESCE(COUNT(idDonacion), 0) AS numeroDonaciones
    FROM donaciones
    WHERE idCampana = ?
  `).get(id);

  const totalRecaudado = Number((row.totalRecaudado ?? 0).toFixed(2));
  const numeroDonaciones = row.numeroDonaciones ?? 0;
  const donacionMedia = numeroDonaciones === 0 ? 0 : Number((totalRecaudado / numeroDonaciones).toFixed(2));

  res.json({ idCampana: id, totalRecaudado, numeroDonaciones, donacionMedia });
});

// 4.5 Donaciones por día de una campaña (desde creación hasta hoy o finalización)
app.get("/api/campanas/:id/donaciones-por-dia", requireAuth, (req, res) => {
  const userId = req.user.sub;
  const { id } = req.params;

  const camp = db.prepare(`
    SELECT owner_user_id, fechaCreacion, estado, fechaFinalizacion
    FROM campanas
    WHERE id = ?
  `).get(id);

  if (!camp) return res.status(404).json({ mensaje: "Campaña no encontrada" });
  if (camp.owner_user_id !== userId) return res.status(403).json({ mensaje: "No tienes permisos para acceder a esta campaña" });

  const start = startOfDay(new Date(camp.fechaCreacion));
  const end = (camp.estado === "FINALIZADA" && camp.fechaFinalizacion)
    ? startOfDay(new Date(camp.fechaFinalizacion))
    : TODAY;

  const rows = db.prepare(`
    SELECT
      substr(fecha, 1, 10) AS fecha,
      COALESCE(SUM(importe), 0) AS totalRecaudado,
      COUNT(idDonacion) AS numeroDonaciones
    FROM donaciones
    WHERE idCampana = ?
      AND fecha >= ?
      AND fecha <= ?
    GROUP BY substr(fecha, 1, 10)
    ORDER BY fecha ASC
  `).all(id, iso(start), iso(endOfDay(end)));

  const map = new Map(rows.map(r => [r.fecha, r]));
  const out = [];
  let day = start;
  while (day <= end) {
    const k = ymd(day);
    const v = map.get(k);
    out.push({
      fecha: k,
      totalRecaudado: Number(((v?.totalRecaudado) ?? 0).toFixed(2)),
      numeroDonaciones: (v?.numeroDonaciones) ?? 0
    });
    day = addDays(day, 1);
  }

  res.json(out);
});

// 5.1 Donaciones recientes con limite
app.get("/api/campanas/:id/donaciones", requireAuth, (req, res) => {
  const userId = req.user.sub;
  const { id } = req.params;
  const limite = clampInt(req.query.limite, 1, 200, 20);

  const camp = db.prepare("SELECT owner_user_id FROM campanas WHERE id = ?").get(id);
  if (!camp) return res.status(404).json({ mensaje: "Campaña no encontrada" });
  if (camp.owner_user_id !== userId) return res.status(403).json({ mensaje: "No tienes permisos para acceder a esta campaña" });

  const rows = db.prepare(`
    SELECT idDonacion, fecha, importe, metodoPago, nombreDonante, emailDonante, mensaje
    FROM donaciones
    WHERE idCampana = ?
    ORDER BY fecha DESC
    LIMIT ?
  `).all(id, limite);

  // Devuelve solo los campos que existan (sin undefined)
  const out = rows.map(r => {
    const obj = {
      idDonacion: r.idDonacion,
      fecha: r.fecha,
      importe: r.importe,
      metodoPago: r.metodoPago ?? null
    };
    if (r.nombreDonante) obj.nombreDonante = r.nombreDonante;
    if (r.emailDonante) obj.emailDonante = r.emailDonante;
    if (r.mensaje) obj.mensaje = r.mensaje;
    return obj;
  });

  res.json(out);
});

// ---------- Start
app.listen(PORT, () => {
  console.log(`✅ API (SQLite) en http://localhost:${PORT}`);
  console.log(`👤 Usuario: creador1 / 1234`);
  console.log(`🗄️  BD: ./data.sqlite`);
});