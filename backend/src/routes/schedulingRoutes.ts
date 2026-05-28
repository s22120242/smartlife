import { Router } from "express";
import { schedulingController } from "../controllers/schedulingController";
import { authMiddleware } from "../middleware/auth";

const router = Router();

router.use(authMiddleware);

router.get("/analyze", schedulingController.analyze);
router.get("/suggestions", schedulingController.getSuggestions);

export default router;
