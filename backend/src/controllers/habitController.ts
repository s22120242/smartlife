import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import { habitService } from "../services/habitService";
import { createHabitSchema, updateHabitSchema } from "../utils/validators";
import { handleZodError, handleServiceError } from "../utils/errors";

export const habitController = {
  async getAll(req: AuthRequest, res: Response) {
    try {
      const rawPage = req.query.page as string;
      const rawLimit = req.query.limit as string;
      const page = rawPage ? Math.max(1, parseInt(rawPage, 10) || 1) : undefined;
      const limit = rawLimit ? Math.min(100, Math.max(1, parseInt(rawLimit, 10) || 20)) : undefined;
      const habits = await habitService.getAll(req.userId!, page, limit);
      res.json(habits);
    } catch {
      res.status(500).json({ error: "Error al cargar hábitos" });
    }
  },

  async create(req: AuthRequest, res: Response) {
    try {
      const data = createHabitSchema.parse(req.body);
      const habit = await habitService.create({ ...data, userId: req.userId! });
      res.status(201).json(habit);
    } catch (err: any) {
      if (handleZodError(err, res)) return;
      res.status(400).json({ error: "Error al crear hábito" });
    }
  },

  async update(req: AuthRequest, res: Response) {
    try {
      const data = updateHabitSchema.parse(req.body);
      const habit = await habitService.update(req.params.id, req.userId!, data);
      res.json(habit);
    } catch (err: any) {
      if (handleZodError(err, res)) return;
      if (handleServiceError(err, res, "Hábito")) return;
      res.status(500).json({ error: "Error al actualizar hábito" });
    }
  },

  async remove(req: AuthRequest, res: Response) {
    try {
      await habitService.remove(req.params.id, req.userId!);
      res.status(204).send();
    } catch (err: any) {
      if (handleServiceError(err, res, "Hábito")) return;
      res.status(500).json({ error: "Error al eliminar hábito" });
    }
  },

  async removeBatch(req: AuthRequest, res: Response) {
    try {
      const { ids } = req.body;
      if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ error: "Se requiere un array de IDs" });
      }
      const result = await habitService.removeBatch(ids, req.userId!);
      res.json(result);
    } catch {
      res.status(500).json({ error: "Error al eliminar hábitos" });
    }
  },
};
