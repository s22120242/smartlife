import express from "express";
import cors from "cors";
import helmet from "helmet";
import path from "path";
import { config } from "./config";
import mainRoutes from "./routes";
import { errorHandler } from "./middleware/errorHandler";

const app = express();

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: config.corsOrigin === "*" ? "*" : config.corsOrigin.split(",") }));
app.use(express.json({ limit: "1mb" }));
app.use(express.text({ type: ["text/xml", "application/xml"], limit: "1mb" }));

app.use("/api/v1", mainRoutes);

const publicPath = path.join(__dirname, "../public");
app.use(express.static(publicPath));
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
