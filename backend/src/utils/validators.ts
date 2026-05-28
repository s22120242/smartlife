import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(6).max(100),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const createActivitySchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  duration: z.number().min(15),
  priority: z.enum(["alta", "media", "baja"]),
  categoryId: z.string(),
  deadline: z.string().optional(),
  startTime: z.string().optional(),
  splittable: z.boolean().default(false),
});

export const createHabitSchema = z.object({
  title: z.string().min(1),
  target: z.number().min(1).optional(),
});

export const updateHabitSchema = z.object({
  title: z.string().min(1).optional(),
  target: z.number().min(1).optional(),
  streak: z.number().min(0).optional(),
  completed: z.number().min(0).optional(),
  lastCompletedAt: z.string().nullable().optional(),
});

const timeRegex = /^\d{2}:\d{2}$/;

export const createScheduleSchema = z.object({
  title: z.string().min(1),
  day: z.string().min(1),
  startTime: z.string().regex(timeRegex, "Formato de hora inválido (HH:mm)"),
  endTime: z.string().regex(timeRegex, "Formato de hora inválido (HH:mm)"),
  type: z.string().min(1),
});

export const updateScheduleSchema = z.object({
  title: z.string().min(1).optional(),
  day: z.string().min(1).optional(),
  startTime: z.string().regex(timeRegex, "Formato de hora inválido (HH:mm)").optional(),
  endTime: z.string().regex(timeRegex, "Formato de hora inválido (HH:mm)").optional(),
  type: z.string().min(1).optional(),
});

export const createBatchScheduleSchema = z.object({
  title: z.string().min(1),
  days: z.array(z.string().min(1)).min(1, "Selecciona al menos un día"),
  startTime: z.string().regex(timeRegex, "Formato de hora inválido (HH:mm)"),
  endTime: z.string().regex(timeRegex, "Formato de hora inválido (HH:mm)"),
  type: z.string().min(1),
});

export const updateActivitySchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  duration: z.number().min(15).optional(),
  priority: z.enum(["alta", "media", "baja"]).optional(),
  categoryId: z.string().optional(),
  deadline: z.string().nullable().optional(),
  startTime: z.string().nullable().optional(),
  splittable: z.boolean().optional(),
  status: z.enum(["pendiente", "completada"]).optional(),
});

export const createTransportSchema = z.object({
  origin: z.string().min(1, "Origen requerido"),
  destination: z.string().min(1, "Destino requerido"),
  duration: z.number().min(1, "Duración debe ser mayor a 0"),
  day: z.string().nullable().optional(),
});

export const updateTransportSchema = z.object({
  origin: z.string().min(1).optional(),
  destination: z.string().min(1).optional(),
  duration: z.number().min(1).optional(),
  day: z.string().nullable().optional(),
});

export const updateProfileSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  profileImage: z.string().optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Contraseña actual requerida"),
  newPassword: z.string().min(6, "La nueva contraseña debe tener al menos 6 caracteres").max(100),
});
