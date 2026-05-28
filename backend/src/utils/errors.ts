import { ZodError } from "zod";
import { Response } from "express";

export function handleZodError(err: unknown, res: Response): boolean {
  if (err instanceof ZodError) {
    res.status(400).json({ error: "Datos inválidos", details: err.issues });
    return true;
  }
  return false;
}

export function handleServiceError(err: unknown, res: Response, entityName: string): boolean {
  if (err instanceof Error) {
    if (err.message.endsWith("no encontrado") || err.message.endsWith("no encontrada")) {
      res.status(404).json({ error: err.message });
      return true;
    }
    if (err.message.includes("inválidas") || err.message.includes("incorrecta")) {
      res.status(401).json({ error: err.message });
      return true;
    }
    if (err.message.includes("ya está registrado")) {
      res.status(400).json({ error: err.message });
      return true;
    }
  }
  return false;
}
