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

const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  message: { error: "Demasiadas solicitudes, intenta de nuevo en un minuto" },
  standardHeaders: true,
  legacyHeaders: false,
});

router.use(apiLimiter);

router.get("/health", (_, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

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

router.use("/auth", authRoutes);
router.use("/activities", activityRoutes);
router.use("/schedule", scheduleRoutes);
router.use("/scheduling", schedulingRoutes);
router.use("/habits", habitRoutes);
router.use("/statistics", statsRoutes);
router.use("/categories", categoryRoutes);
router.use("/transport", transportRoutes);
router.use("/xml", xmlRoutes);
router.use("/admin", adminRoutes);
router.use("/weather", weatherRoutes);

export default router;
