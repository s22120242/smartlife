import { prisma } from "../utils/prisma";
import { parseTime, formatTime } from "../utils/helpers";

interface TimeSlot {
  day: string;
  start: string;
  end: string;
  duration: number;
}

const DAYS = ["lunes", "martes", "miércoles", "jueves", "viernes", "sábado", "domingo"];

export const schedulingService = {
  async analyzeTime(userId: string) {
    const schedules = await prisma.fixedSchedule.findMany({ where: { userId } });
    const activities = await prisma.activity.findMany({
      where: { userId, status: "pendiente" },
      orderBy: [
        { priority: "asc" },
        { deadline: "asc" },
      ],
    });
    const transports = await prisma.transport.findMany({ where: { userId } });

    const freeSlots: TimeSlot[] = [];

    for (const day of DAYS) {
      const daySchedules = schedules.filter((s) => s.day === day);
      const busySlots = daySchedules
        .map((s) => ({ start: parseTime(s.startTime), end: parseTime(s.endTime) }))
        .sort((a, b) => a.start - b.start);

      let current = 0;
      for (const busy of busySlots) {
        if (current < busy.start) {
          freeSlots.push({
            day,
            start: formatTime(current),
            end: formatTime(busy.start),
            duration: busy.start - current,
          });
        }
        current = Math.max(current, busy.end);
      }
      if (current < 1440) {
        freeSlots.push({
          day,
          start: formatTime(current),
          end: formatTime(1440),
          duration: 1440 - current,
        });
      }
    }

    const priorityOrder: Record<string, number> = { alta: 0, media: 1, baja: 2 };
    const sortedActivities = [...activities].sort((a, b) => {
      const pDiff = (priorityOrder[a.priority] ?? 1) - (priorityOrder[b.priority] ?? 1);
      if (pDiff !== 0) return pDiff;
      if (a.deadline && b.deadline) return a.deadline.getTime() - b.deadline.getTime();
      if (a.deadline) return -1;
      if (b.deadline) return 1;
      return 0;
    });

    const totalFreeMinutes = freeSlots.reduce((sum, s) => sum + s.duration, 0);
    const totalPendingMinutes = sortedActivities.reduce((sum, a) => sum + a.duration, 0);

    const totalTransportMinutes = transports.reduce((sum, t) => sum + t.duration, 0);

    const transportByDay: Record<string, number> = {};
    for (const t of transports) {
      if (t.day) {
        transportByDay[t.day] = (transportByDay[t.day] || 0) + t.duration;
      }
    }

    const adjustedFreeSlots = freeSlots.map((slot) => {
      const dayTransport = transportByDay[slot.day] || 0;
      const remaining = slot.duration - dayTransport;
      if (remaining <= 0) return null;
      return { ...slot, duration: remaining, transportDeducted: Math.min(dayTransport, slot.duration) };
    }).filter(Boolean) as (TimeSlot & { transportDeducted: number })[];

    const adjustedFreeMinutes = adjustedFreeSlots.reduce((sum, s) => sum + s.duration, 0);

    const suggestions: string[] = [];

    const overloadDiff = totalPendingMinutes - adjustedFreeMinutes;

    if (overloadDiff > 0) {
      if (totalTransportMinutes > 0) {
        suggestions.push(
          `Tienes ${Math.round(overloadDiff / 60)}h más de actividades que tiempo disponible (${Math.round(totalTransportMinutes / 60)}h destinadas a transporte). Considera ajustar tus actividades o plazos.`
        );
      } else {
        suggestions.push(
          `Tienes ${Math.round(overloadDiff / 60)}h más de actividades que tiempo disponible. Considera reducir tareas o extender plazos.`
        );
      }
    } else if (totalFreeMinutes >= totalPendingMinutes && totalTransportMinutes > 0) {
      suggestions.push(
        `Sin transporte tendrías tiempo suficiente, pero ${Math.round(totalTransportMinutes / 60)}h de viajes reducen tu disponibilidad. Revisa rutas de transporte.`
      );
    }

    const categoryCount: Record<string, number> = {};
    for (const a of sortedActivities) {
      categoryCount[a.categoryId] = (categoryCount[a.categoryId] || 0) + a.duration;
    }

    const categories = await prisma.category.findMany();
    for (const cat of categories) {
      const catMinutes = categoryCount[cat.id] || 0;
      const catHours = Math.round(catMinutes / 60);
      if (catHours > 0) {
        suggestions.push(
          `Tienes ${catHours}h planificadas en "${cat.name}".`
        );
      }
    }

    const totalAllMinutes = Object.values(categoryCount).reduce((a, b) => a + b, 0);
    if (totalAllMinutes > 0) {
      for (const cat of categories) {
        const pct = Math.round(((categoryCount[cat.id] || 0) / totalAllMinutes) * 100);
        if (["Salud", "Descanso"].includes(cat.name) && pct < 10) {
          suggestions.push(
            `Solo dedicaste ${pct}% a "${cat.name}". Intenta aumentar este porcentaje para mejor balance.`
          );
        }
      }
    }

    if (suggestions.length === 0) {
      suggestions.push("Buen balance. Tienes tiempo suficiente para tus actividades.");
    }

    await prisma.$transaction(async (tx) => {
      await tx.suggestion.deleteMany({ where: { userId } });
      if (suggestions.length > 0) {
        await tx.suggestion.createMany({
          data: suggestions.map((s) => ({
            userId,
            suggestion: s,
            type: s.includes("balance") || s.includes("dedicaste") ? "balance" : "general",
          })),
        });
      }
    });

    return {
      freeSlots,
      adjustedFreeSlots,
      totalFreeMinutes,
      totalPendingMinutes,
      totalTransportMinutes,
      adjustedFreeMinutes,
      suggestions,
      sortedActivities,
    };
  },

  async getSuggestions(userId: string) {
    return prisma.suggestion.findMany({
      where: { userId },
      orderBy: { generatedAt: "desc" },
    });
  },
};
