import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import { weatherController } from "../controllers/weatherController";

const router = Router();

router.get("/", authMiddleware, weatherController.getWeather);

export default router;
