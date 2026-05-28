import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config";

export interface AuthRequest extends Request {
  userId?: string;
  userRole?: string;
}

export const authMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Token requerido" });
  }

  const token = header.split(" ")[1];

  try {
    const decoded = jwt.verify(token, config.jwtSecret) as { userId: string; role: string };
    req.userId = decoded.userId;
    req.userRole = decoded.role;
    next();
  } catch {
    return res.status(401).json({ error: "Token inválido" });
  }
};

export const adminMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  if (req.userRole !== "ADMIN") {
    return res.status(403).json({ error: "Acceso denegado: se requieren permisos de administrador" });
  }
  next();
};
