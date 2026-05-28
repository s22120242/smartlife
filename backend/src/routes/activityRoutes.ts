import { Router } from "express";
import { activityController } from "../controllers/activityController";
import { authMiddleware } from "../middleware/auth";

const router = Router();

router.use(authMiddleware);

router.get("/", activityController.getAll);
router.get("/:id", activityController.getById);
router.post("/", activityController.create);
router.post("/batch-delete", activityController.removeBatch);
router.put("/:id", activityController.update);
router.delete("/:id", activityController.remove);

export default router;
