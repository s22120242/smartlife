import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import { schedulingService } from "../services/schedulingService";

export const schedulingController = {
  async analyze(req: AuthRequest, res: Response) {
    try {
      const result = await schedulingService.analyzeTime(req.userId!);
      res.json(result);
    } catch {
      res.status(500).json({ error: "Error al analizar horario" });
    }
  },

  async getSuggestions(req: AuthRequest, res: Response) {
    try {
      const suggestions = await schedulingService.getSuggestions(req.userId!);
      res.json(suggestions);
    } catch {
      res.status(500).json({ error: "Error al cargar sugerencias" });
    }
  },
};
