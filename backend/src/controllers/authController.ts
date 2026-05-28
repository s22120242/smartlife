import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import { authService } from "../services/authService";
import { registerSchema, loginSchema, updateProfileSchema, changePasswordSchema } from "../utils/validators";
import { handleZodError } from "../utils/errors";

export const authController = {
  async register(req: AuthRequest, res: Response) {
    try {
      const data = registerSchema.parse(req.body);
      const result = await authService.register(data.name, data.email, data.password);
      res.status(201).json(result);
    } catch (err: any) {
      if (handleZodError(err, res)) return;
      if (err.message === "El email ya está registrado") {
        return res.status(400).json({ error: err.message });
      }
      res.status(400).json({ error: "Error al registrar" });
    }
  },

  async login(req: AuthRequest, res: Response) {
    try {
      const data = loginSchema.parse(req.body);
      const result = await authService.login(data.email, data.password);
      res.json(result);
    } catch (err: any) {
      if (handleZodError(err, res)) return;
      if (err.message === "Credenciales inválidas") {
        return res.status(401).json({ error: err.message });
      }
      res.status(401).json({ error: "Error al iniciar sesión" });
    }
  },

  async refresh(req: AuthRequest, res: Response) {
    try {
      const header = req.headers.authorization;
      if (!header || !header.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Token requerido" });
      }
      const token = header.split(" ")[1];
      const result = await authService.refreshToken(token);
      res.json(result);
    } catch {
      res.status(401).json({ error: "Token inválido" });
    }
  },

  async logout(req: AuthRequest, res: Response) {
    try {
      await authService.logout(req.userId!);
      res.json({ message: "Sesión cerrada exitosamente" });
    } catch {
      res.status(500).json({ error: "Error al cerrar sesión" });
    }
  },

  async changePassword(req: AuthRequest, res: Response) {
    try {
      const data = changePasswordSchema.parse(req.body);
      await authService.changePassword(req.userId!, data.currentPassword, data.newPassword);
      res.json({ message: "Contraseña actualizada exitosamente" });
    } catch (err: any) {
      if (handleZodError(err, res)) return;
      if (err.message === "Contraseña actual incorrecta") {
        return res.status(400).json({ error: err.message });
      }
      res.status(500).json({ error: "Error al cambiar contraseña" });
    }
  },

  async deleteAccount(req: AuthRequest, res: Response) {
    try {
      await authService.deleteAccount(req.userId!);
      res.json({ message: "Cuenta eliminada exitosamente" });
    } catch {
      res.status(500).json({ error: "Error al eliminar cuenta" });
    }
  },

  async getProfile(req: AuthRequest, res: Response) {
    try {
      const user = await authService.getProfile(req.userId!);
      res.json(user);
    } catch {
      res.status(404).json({ error: "Usuario no encontrado" });
    }
  },

  async updateProfile(req: AuthRequest, res: Response) {
    try {
      const data = updateProfileSchema.parse(req.body);
      const user = await authService.updateProfile(req.userId!, data);
      res.json(user);
    } catch (err: any) {
      if (handleZodError(err, res)) return;
      res.status(400).json({ error: "Error al actualizar perfil" });
    }
  },
};
