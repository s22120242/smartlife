import { Router } from "express";
import { authMiddleware, adminMiddleware } from "../middleware/auth";
import { adminController } from "../controllers/adminController";

const router = Router();

router.use(authMiddleware, adminMiddleware);

router.get("/stats", adminController.getStats);
router.get("/users", adminController.getUsers);
router.post("/users", adminController.createUser);
router.put("/users/:id", adminController.updateUser);
router.delete("/users/:id", adminController.deleteUser);
router.get("/users/:id/detail", adminController.getUserDetail);
router.get("/logs", adminController.getLogs);
router.get("/export", adminController.exportAll);

export default router;
