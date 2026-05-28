import express from "express";
import cors from "cors";
import helmet from "helmet";
import path from "path";
import { config } from "./config";
import mainRoutes from "./routes";
import { errorHandler } from "./middleware/errorHandler";

// Framework: Express crea la aplicación servidor
const app = express();

// Seguridad: Helmet protege headers HTTP (XSS, clickjacking, MIME sniffing, etc.)
app.use(helmet({ contentSecurityPolicy: false }));
// Seguridad: CORS controla qué orígenes pueden consumir la API
app.use(cors({ origin: config.corsOrigin === "*" ? "*" : config.corsOrigin.split(",") }));
// Middleware para parsear JSON y XML en el body de las peticiones
app.use(express.json({ limit: "1mb" }));
app.use(express.text({ type: ["text/xml", "application/xml"], limit: "1mb" }));

// Servicios web: monta todas las rutas bajo /api/v1
app.use("/api/v1", mainRoutes);

// En producción, sirve el frontend compilado desde public/
const publicPath = path.join(__dirname, "../public");
app.use(express.static(publicPath));
// SPA fallback: toda ruta no-API redirige al index.html de React
app.get("*", (_req, res) => {
  res.sendFile(path.join(publicPath, "index.html"));
});

app.use(errorHandler);

process.on("unhandledRejection", (reason) => {
  console.error("[Error] Unhandled Rejection:", reason);
});

process.on("uncaughtException", (err) => {
  console.error("[Error] Uncaught Exception:", err);
});

app.listen(config.port, () => {
  console.log(`Servidor corriendo en puerto ${config.port}`);
});
