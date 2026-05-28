import { Router } from "express";
import { habitController } from "../controllers/habitController";
import { authMiddleware } from "../middleware/auth";

const router = Router();

router.use(authMiddleware);

router.get("/", habitController.getAll);
router.post("/", habitController.create);
router.post("/batch-delete", habitController.removeBatch);
router.put("/:id", habitController.update);
router.delete("/:id", habitController.remove);

export default router;
