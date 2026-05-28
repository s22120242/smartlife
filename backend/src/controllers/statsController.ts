import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import { statsService } from "../services/statsService";

export const statsController = {
  async getStats(req: AuthRequest, res: Response) {
    try {
      const period = (req.query.period as string) || "all";
      const stats = await statsService.getStats(req.userId!, period);
      res.json(stats);
    } catch {
      res.status(500).json({ error: "Error al cargar estadísticas" });
    }
  },
};
