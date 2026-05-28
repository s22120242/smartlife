import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import { categoryController } from "../controllers/categoryController";

const router = Router();

router.get("/", authMiddleware, categoryController.getAll);

export default router;
