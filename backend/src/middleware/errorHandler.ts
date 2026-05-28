import { Request, Response, NextFunction } from "express";

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  console.error("[Error]", err.stack || err.message);
  const status = "status" in err ? (err as any).status : 500;
  res.status(status).json({ error: "Error interno del servidor" });
};
