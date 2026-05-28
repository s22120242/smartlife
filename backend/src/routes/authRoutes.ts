import { Router } from "express";
import rateLimit from "express-rate-limit";
import { authMiddleware } from "../middleware/auth";
import { authController } from "../controllers/authController";

const router = Router();

const registerLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: { error: "Demasiadas solicitudes de registro, intenta de nuevo en un minuto" },
  standardHeaders: true,
  legacyHeaders: false,
});

const loginLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  message: { error: "Demasiadas solicitudes de inicio de sesión, intenta de nuevo en un minuto" },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post("/register", registerLimiter, authController.register);
router.post("/login", loginLimiter, authController.login);
router.post("/refresh", authController.refresh);
router.post("/logout", authMiddleware, authController.logout);
router.post("/change-password", authMiddleware, authController.changePassword);
router.delete("/account", authMiddleware, authController.deleteAccount);
router.get("/profile", authMiddleware, authController.getProfile);
router.put("/profile", authMiddleware, authController.updateProfile);

export default router;
