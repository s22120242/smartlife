import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config";

// Seguridad: extiende Request para incluir datos del usuario autenticado
export interface AuthRequest extends Request {
  userId?: string;
  userRole?: string;
}

// Middleware de autenticación: verifica el JWT en cada petición protegida
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
    // Verifica que el JWT sea válido y no haya expirado
    const decoded = jwt.verify(token, config.jwtSecret) as { userId: string; role: string };
    req.userId = decoded.userId;
    req.userRole = decoded.role;
    next();
  } catch {
    return res.status(401).json({ error: "Token inválido" });
  }
};

// Middleware de autorización: solo ADMIN puede acceder a ciertas rutas
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
