import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import { transportService } from "../services/transportService";
import { createTransportSchema, updateTransportSchema } from "../utils/validators";
import { handleZodError, handleServiceError } from "../utils/errors";

export const transportController = {
  async getAll(req: AuthRequest, res: Response) {
    try {
      const rawPage = req.query.page as string;
      const rawLimit = req.query.limit as string;
      const page = rawPage ? Math.max(1, parseInt(rawPage, 10) || 1) : undefined;
      const limit = rawLimit ? Math.min(100, Math.max(1, parseInt(rawLimit, 10) || 20)) : undefined;
      const transports = await transportService.getAll(req.userId!, page, limit);
      res.json(transports);
    } catch {
      res.status(500).json({ error: "Error al cargar transportes" });
    }
  },

  async getById(req: AuthRequest, res: Response) {
    try {
      const transport = await transportService.getById(req.params.id, req.userId!);
      if (!transport) return res.status(404).json({ error: "Transporte no encontrado" });
      res.json(transport);
    } catch {
      res.status(500).json({ error: "Error al cargar transporte" });
    }
  },

  async create(req: AuthRequest, res: Response) {
    try {
      const data = createTransportSchema.parse(req.body);
      const transport = await transportService.create({ ...data, userId: req.userId! });
      res.status(201).json(transport);
    } catch (err: any) {
      if (handleZodError(err, res)) return;
      res.status(400).json({ error: "Error al crear transporte" });
    }
  },

  async update(req: AuthRequest, res: Response) {
    try {
      const data = updateTransportSchema.parse(req.body);
      const transport = await transportService.update(req.params.id, req.userId!, data);
      res.json(transport);
    } catch (err: any) {
      if (handleZodError(err, res)) return;
      if (handleServiceError(err, res, "Transporte")) return;
      res.status(500).json({ error: "Error al actualizar transporte" });
    }
  },

  async remove(req: AuthRequest, res: Response) {
    try {
      await transportService.remove(req.params.id, req.userId!);
      res.status(204).send();
    } catch (err: any) {
      if (handleServiceError(err, res, "Transporte")) return;
      res.status(500).json({ error: "Error al eliminar transporte" });
    }
  },
};
