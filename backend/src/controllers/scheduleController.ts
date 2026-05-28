import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import { scheduleService } from "../services/scheduleService";
import { createScheduleSchema, updateScheduleSchema, createBatchScheduleSchema } from "../utils/validators";
import { handleZodError, handleServiceError } from "../utils/errors";

export const scheduleController = {
  async getAll(req: AuthRequest, res: Response) {
    try {
      const rawPage = req.query.page as string;
      const rawLimit = req.query.limit as string;
      const page = rawPage ? Math.max(1, parseInt(rawPage, 10) || 1) : undefined;
      const limit = rawLimit ? Math.min(100, Math.max(1, parseInt(rawLimit, 10) || 20)) : undefined;
      const schedules = await scheduleService.getAll(req.userId!, page, limit);
      res.json(schedules);
    } catch {
      res.status(500).json({ error: "Error al cargar horarios" });
    }
  },

  async create(req: AuthRequest, res: Response) {
    try {
      const data = createScheduleSchema.parse(req.body);
      const schedule = await scheduleService.create({
        ...data,
        userId: req.userId!,
      });
      res.status(201).json(schedule);
    } catch (err: any) {
      if (handleZodError(err, res)) return;
      res.status(400).json({ error: "Error al crear horario" });
    }
  },

  async createBatch(req: AuthRequest, res: Response) {
    try {
      const data = createBatchScheduleSchema.parse(req.body);
      const schedules = await scheduleService.createBatch({
        ...data,
        userId: req.userId!,
      });
      res.status(201).json(schedules);
    } catch (err: any) {
      if (handleZodError(err, res)) return;
      res.status(400).json({ error: "Error al crear horarios" });
    }
  },

  async update(req: AuthRequest, res: Response) {
    try {
      const data = updateScheduleSchema.parse(req.body);
      const schedule = await scheduleService.update(req.params.id, req.userId!, data);
      res.json(schedule);
    } catch (err: any) {
      if (handleZodError(err, res)) return;
      if (handleServiceError(err, res, "Horario")) return;
      res.status(500).json({ error: "Error al actualizar horario" });
    }
  },

  async remove(req: AuthRequest, res: Response) {
    try {
      await scheduleService.remove(req.params.id, req.userId!);
      res.status(204).send();
    } catch (err: any) {
      if (handleServiceError(err, res, "Horario")) return;
      res.status(500).json({ error: "Error al eliminar horario" });
    }
  },
};
