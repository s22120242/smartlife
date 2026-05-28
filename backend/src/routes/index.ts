import { Router } from "express";
import rateLimit from "express-rate-limit";
import { authMiddleware } from "../middleware/auth";
import authRoutes from "./authRoutes";
import activityRoutes from "./activityRoutes";
import scheduleRoutes from "./scheduleRoutes";
import schedulingRoutes from "./schedulingRoutes";
import habitRoutes from "./habitRoutes";
import statsRoutes from "./statsRoutes";
import categoryRoutes from "./categoryRoutes";
import transportRoutes from "./transportRoutes";
import xmlRoutes from "./xmlRoutes";
import adminRoutes from "./adminRoutes";
import weatherRoutes from "./weatherRoutes";
import { prisma } from "../utils/prisma";

const router = Router();

// Seguridad: Rate Limiting — máximo 60 peticiones por minuto por IP
const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  message: { error: "Demasiadas solicitudes, intenta de nuevo en un minuto" },
  standardHeaders: true,
  legacyHeaders: false,
});

router.use(apiLimiter);

// Endpoint de salud del servidor
router.get("/health", (_, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Servicio web síncrono: exporta todos los datos del usuario en JSON
router.get("/export", authMiddleware, async (req, res) => {
  try {
    const userId = (req as any).userId;
    const [activities, schedules, habits, transports] = await Promise.all([
      prisma.activity.findMany({ where: { userId }, include: { category: true } }),
      prisma.fixedSchedule.findMany({ where: { userId } }),
      prisma.habit.findMany({ where: { userId } }),
      prisma.transport.findMany({ where: { userId } }),
    ]);
    res.json({
      exportedAt: new Date().toISOString(),
      activities,
      schedules,
      habits,
      transports,
    });
  } catch {
    res.status(500).json({ error: "Error al exportar datos" });
  }
});

// Montaje de todas las rutas del servicio web REST
router.use("/auth", authRoutes);         // Autenticación (login, register, refresh)
router.use("/activities", activityRoutes); // CRUD de actividades
router.use("/schedule", scheduleRoutes);   // CRUD de horarios fijos
router.use("/scheduling", schedulingRoutes); // Motor de scheduling (asíncrono)
router.use("/habits", habitRoutes);       // CRUD de hábitos
router.use("/statistics", statsRoutes);    // Estadísticas (asíncrono)
router.use("/categories", categoryRoutes); // Categorías
router.use("/transport", transportRoutes); // CRUD de transporte
router.use("/xml", xmlRoutes);            // XML (export/import) — Unidad 2
router.use("/admin", adminRoutes);        // Panel de administración
router.use("/weather", weatherRoutes);    // Clima externo (asíncrono)

export default router;
