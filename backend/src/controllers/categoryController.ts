import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import { prisma } from "../utils/prisma";

export const categoryController = {
  async getAll(_req: AuthRequest, res: Response) {
    try {
      const categories = await prisma.category.findMany();
      res.json(categories);
    } catch {
      res.status(500).json({ error: "Error al cargar categorías" });
    }
  },
};
