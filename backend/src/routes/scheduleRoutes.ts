import { Router } from "express";
import { scheduleController } from "../controllers/scheduleController";
import { authMiddleware } from "../middleware/auth";

const router = Router();

router.use(authMiddleware);

router.get("/", scheduleController.getAll);
router.post("/", scheduleController.create);
router.post("/batch", scheduleController.createBatch);
router.put("/:id", scheduleController.update);
router.delete("/:id", scheduleController.remove);

export default router;
