import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import { activityService } from "../services/activityService";
import { createActivitySchema, updateActivitySchema } from "../utils/validators";
import { handleZodError, handleServiceError } from "../utils/errors";

export const activityController = {
  async getAll(req: AuthRequest, res: Response) {
    try {
      const rawPage = req.query.page as string;
      const rawLimit = req.query.limit as string;
      const page = rawPage ? Math.max(1, parseInt(rawPage, 10) || 1) : undefined;
      const limit = rawLimit ? Math.min(100, Math.max(1, parseInt(rawLimit, 10) || 20)) : undefined;
      const activities = await activityService.getAll(req.userId!, page, limit);
      res.json(activities);
    } catch {
      res.status(500).json({ error: "Error al cargar actividades" });
    }
  },

  async getById(req: AuthRequest, res: Response) {
    try {
      const activity = await activityService.getById(req.params.id, req.userId!);
      if (!activity) return res.status(404).json({ error: "Actividad no encontrada" });
      res.json(activity);
    } catch {
      res.status(500).json({ error: "Error al cargar actividad" });
    }
  },

  async create(req: AuthRequest, res: Response) {
    try {
      const data = createActivitySchema.parse(req.body);
      const activity = await activityService.create({
        ...data,
        userId: req.userId!,
      });
      res.status(201).json(activity);
    } catch (err: any) {
      if (handleZodError(err, res)) return;
      res.status(400).json({ error: "Error al crear actividad" });
    }
  },

  async update(req: AuthRequest, res: Response) {
    try {
      const data = updateActivitySchema.parse(req.body);
      const activity = await activityService.update(req.params.id, req.userId!, data);
      res.json(activity);
    } catch (err: any) {
      if (handleZodError(err, res)) return;
      if (handleServiceError(err, res, "Actividad")) return;
      res.status(500).json({ error: "Error al actualizar actividad" });
    }
  },

  async remove(req: AuthRequest, res: Response) {
    try {
      await activityService.remove(req.params.id, req.userId!);
      res.status(204).send();
    } catch (err: any) {
      if (handleServiceError(err, res, "Actividad")) return;
      res.status(500).json({ error: "Error al eliminar actividad" });
    }
  },

  async removeBatch(req: AuthRequest, res: Response) {
    try {
      const { ids } = req.body;
      if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ error: "Se requiere un array de IDs" });
      }
      const result = await activityService.removeBatch(ids, req.userId!);
      res.json(result);
    } catch {
      res.status(500).json({ error: "Error al eliminar actividades" });
    }
  },
};
