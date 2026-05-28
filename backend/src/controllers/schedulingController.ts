import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import { schedulingService } from "../services/schedulingService";

// Unidad 4 — Servicio web asíncrono (procesamiento intensivo)
export const schedulingController = {
  // Analiza el horario del usuario: cruza actividades pendientes con bloques libres
  async analyze(req: AuthRequest, res: Response) {
    try {
      const result = await schedulingService.analyzeTime(req.userId!);
      res.json(result);
    } catch {
      res.status(500).json({ error: "Error al analizar horario" });
    }
  },

  // Genera sugerencias personalizadas basadas en hábitos y actividades
  async getSuggestions(req: AuthRequest, res: Response) {
    try {
      const suggestions = await schedulingService.getSuggestions(req.userId!);
      res.json(suggestions);
    } catch {
      res.status(500).json({ error: "Error al cargar sugerencias" });
    }
  },
};
