import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import { transportController } from "../controllers/transportController";

const router = Router();

router.use(authMiddleware);

router.get("/", transportController.getAll);
router.get("/:id", transportController.getById);
router.post("/", transportController.create);
router.put("/:id", transportController.update);
router.delete("/:id", transportController.remove);

export default router;
