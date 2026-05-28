import { Response } from "express";
import bcrypt from "bcryptjs";
import { AuthRequest } from "../middleware/auth";
import { prisma } from "../utils/prisma";

async function createLog(adminId: string, action: string, target?: string, targetId?: string, details?: string) {
  await prisma.adminLog.create({ data: { adminId, action, target, targetId, details } });
}

export const adminController = {
  async getUsers(req: AuthRequest, res: Response) {
    try {
      const users = await prisma.user.findMany({
        select: { id: true, name: true, email: true, role: true, profileImage: true, createdAt: true },
        orderBy: { createdAt: "desc" },
      });
      res.json(users);
    } catch {
      res.status(500).json({ error: "Error al obtener usuarios" });
    }
  },

  async createUser(req: AuthRequest, res: Response) {
    try {
      const { name, email, password, role } = req.body;
      if (!name || !email || !password) {
        return res.status(400).json({ error: "Nombre, email y contraseña son requeridos" });
      }
      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) {
        return res.status(400).json({ error: "El email ya está registrado" });
      }
      const hashedPassword = await bcrypt.hash(password, 12);
      const user = await prisma.user.create({
        data: { name, email, password: hashedPassword, role: role || "USER" },
        select: { id: true, name: true, email: true, role: true, profileImage: true, createdAt: true },
      });
      await createLog(req.userId!, "create_user", "User", user.id, `Creó usuario ${name} (${email})`);
      res.status(201).json(user);
    } catch {
      res.status(500).json({ error: "Error al crear usuario" });
    }
  },

  async updateUser(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const { name, email, role, password } = req.body;
      const user = await prisma.user.findUnique({ where: { id } });
      if (!user) {
        return res.status(404).json({ error: "Usuario no encontrado" });
      }
      const data: any = {};
      if (name !== undefined) data.name = name;
      if (email !== undefined) {
        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing && existing.id !== id) {
          return res.status(400).json({ error: "El email ya está en uso" });
        }
        data.email = email;
      }
      if (role !== undefined) data.role = role;
      if (password) {
        data.password = await bcrypt.hash(password, 12);
      }
      const updated = await prisma.user.update({
        where: { id },
        data,
        select: { id: true, name: true, email: true, role: true, profileImage: true, createdAt: true },
      });
      const changes = Object.keys(data).filter(k => k !== "password").join(", ");
      await createLog(req.userId!, "update_user", "User", user.id, `Actualizó ${user.name}: ${changes}`);
      res.json(updated);
    } catch {
      res.status(500).json({ error: "Error al actualizar usuario" });
    }
  },

  async deleteUser(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      if (id === req.userId) {
        return res.status(400).json({ error: "Un administrador no puede eliminarse a sí mismo" });
      }
      const user = await prisma.user.findUnique({ where: { id } });
      if (!user) {
        return res.status(404).json({ error: "Usuario no encontrado" });
      }
      await prisma.user.delete({ where: { id } });
      await createLog(req.userId!, "delete_user", "User", user.id, `Eliminó usuario ${user.name} (${user.email})`);
      res.json({ message: "Usuario eliminado exitosamente" });
    } catch {
      res.status(500).json({ error: "Error al eliminar usuario" });
    }
  },

  async getUserDetail(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const user = await prisma.user.findUnique({
        where: { id },
        select: { id: true, name: true, email: true, role: true, profileImage: true, createdAt: true },
      });
      if (!user) {
        return res.status(404).json({ error: "Usuario no encontrado" });
      }
      const [activities, habits, schedules] = await Promise.all([
        prisma.activity.findMany({ where: { userId: id }, include: { category: true }, orderBy: { createdAt: "desc" } }),
        prisma.habit.findMany({ where: { userId: id }, orderBy: { createdAt: "desc" } }),
        prisma.fixedSchedule.findMany({ where: { userId: id }, orderBy: { day: "asc" } }),
      ]);
      res.json({ user, activities, habits, schedules });
    } catch {
      res.status(500).json({ error: "Error al obtener detalle del usuario" });
    }
  },

  async getLogs(req: AuthRequest, res: Response) {
    try {
      const logs = await prisma.adminLog.findMany({
        orderBy: { createdAt: "desc" },
        take: 100,
      });
      const adminIds = [...new Set(logs.map((l) => l.adminId))];
      const admins = await prisma.user.findMany({
        where: { id: { in: adminIds } },
        select: { id: true, name: true },
      });
      const adminMap = Object.fromEntries(admins.map((a) => [a.id, a.name]));
      const enriched = logs.map((l) => ({ ...l, adminName: adminMap[l.adminId] || "Desconocido" }));
      res.json(enriched);
    } catch {
      res.status(500).json({ error: "Error al obtener logs" });
    }
  },

  async getStats(req: AuthRequest, res: Response) {
    try {
      const [userCount, activityCount, habitCount, scheduleCount, transportCount, logCount] = await Promise.all([
        prisma.user.count(),
        prisma.activity.count(),
        prisma.habit.count(),
        prisma.fixedSchedule.count(),
        prisma.transport.count(),
        prisma.adminLog.count(),
      ]);
      res.json({
        users: userCount,
        activities: activityCount,
        habits: habitCount,
        schedules: scheduleCount,
        transports: transportCount,
        logs: logCount,
      });
    } catch {
      res.status(500).json({ error: "Error al obtener estadísticas" });
    }
  },

  async exportAll(_req: AuthRequest, res: Response) {
    try {
      const [users, activities, habits, schedules, transports] = await Promise.all([
        prisma.user.findMany({ select: { id: true, name: true, email: true, role: true, createdAt: true } }),
        prisma.activity.findMany({ include: { category: true } }),
        prisma.habit.findMany(),
        prisma.fixedSchedule.findMany(),
        prisma.transport.findMany(),
      ]);
      res.json({
        exportedAt: new Date().toISOString(),
        exportedBy: _req.userId,
        summary: {
          users: users.length,
          activities: activities.length,
          habits: habits.length,
          schedules: schedules.length,
          transports: transports.length,
        },
        data: { users, activities, habits, schedules, transports },
      });
    } catch {
      res.status(500).json({ error: "Error al exportar datos" });
    }
  },
};
