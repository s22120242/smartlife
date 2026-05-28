import { prisma } from "../utils/prisma";
import { parseTime } from "../utils/helpers";

const TYPE_COLORS: Record<string, string> = {
  clase: "#6C63FF",
  trabajo: "#9F7AEA",
  dormir: "#4FD1C5",
  comida: "#F6AD55",
  transporte: "#63B3ED",
  otro: "#A0AEC0",
};

function getPeriodFilter(period: string): { start: Date; end: Date } | null {
  if (period === "all") return null;
  const now = new Date();
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);

  if (period === "day") {
    end.setDate(end.getDate() + 1);
  } else if (period === "week") {
    const day = start.getDay();
    const diff = start.getDate() - day + (day === 0 ? -6 : 1);
    start.setDate(diff);
    end.setTime(start.getTime() + 7 * 24 * 60 * 60 * 1000);
  } else if (period === "month") {
    start.setDate(1);
    end.setMonth(end.getMonth() + 1);
    end.setDate(1);
  } else {
    return null;
  }
  return { start, end };
}

export const statsService = {
  async getStats(userId: string, period: string = "all") {
    const periodFilter = getPeriodFilter(period);

    const activityWhere: any = { userId };
    if (periodFilter) {
      activityWhere.deadline = {
        gte: periodFilter.start,
        lt: periodFilter.end,
      };
    }

    const activities = await prisma.activity.findMany({
      where: activityWhere,
      include: { category: true },
    });

    const categoryMap = new Map<string, { name: string; color: string }>();
    for (const a of activities) {
      if (a.category && !categoryMap.has(a.categoryId)) {
        categoryMap.set(a.categoryId, { name: a.category.name, color: a.category.color || "#6C63FF" });
      }
    }

    const catMinutes = new Map<string, number>();
    for (const a of activities) {
      catMinutes.set(a.categoryId, (catMinutes.get(a.categoryId) || 0) + a.duration);
    }

    const hoursByCategory = Array.from(catMinutes.entries())
      .filter(([, minutes]) => minutes > 0)
      .map(([catId, minutes]) => {
        const cat = categoryMap.get(catId) || { name: catId, color: "#6C63FF" };
        return {
          category: cat.name,
          color: cat.color,
          hours: Math.round((minutes / 60) * 10) / 10,
          percentage: 0,
        };
      });

    const totalHours = hoursByCategory.reduce((s, c) => s + c.hours, 0);
    for (const item of hoursByCategory) {
      item.percentage = totalHours > 0 ? Math.round((item.hours / totalHours) * 100) : 0;
    }

    const priorities = { alta: 0, media: 0, baja: 0 };
    for (const a of activities) {
      if (a.priority in priorities) {
        priorities[a.priority as keyof typeof priorities] += a.duration;
      }
    }

    const total = Object.values(priorities).reduce((a, b) => a + b, 0);

    const schedules = await prisma.fixedSchedule.findMany({ where: { userId } });

    const typeMinutes: Record<string, number> = {};
    for (const s of schedules) {
      const duration = parseTime(s.endTime) - parseTime(s.startTime);
      typeMinutes[s.type] = (typeMinutes[s.type] || 0) + duration;
    }

    const scheduleHoursByType = Object.entries(typeMinutes)
      .filter(([, minutes]) => minutes > 0)
      .map(([type, minutes]) => ({
        type,
        hours: Math.round((minutes / 60) * 10) / 10,
        color: TYPE_COLORS[type] || "#A0AEC0",
      }));

    const totalScheduleMinutes = Object.values(typeMinutes).reduce((a, b) => a + b, 0);

    const habits = await prisma.habit.findMany({ where: { userId } });

    const today = new Date().toISOString().split("T")[0];

    const completedToday = habits.filter((h) => {
      if (!h.lastCompletedAt) return false;
      return h.lastCompletedAt.toISOString().split("T")[0] === today;
    }).length;

    const habitStats = {
      totalHabits: habits.length,
      totalStreak: habits.reduce((sum, h) => sum + h.streak, 0),
      bestStreak: habits.length > 0 ? Math.max(...habits.map((h) => h.streak)) : 0,
      completedToday,
      averageStreak: habits.length > 0
        ? Math.round((habits.reduce((sum, h) => sum + h.streak, 0) / habits.length) * 10) / 10
        : 0,
      habitsByProgress: [
        { name: "Completados hoy", count: completedToday },
        { name: "Con racha > 0", count: habits.filter((h) => h.streak > 0).length },
        { name: "Sin completar hoy", count: habits.length - completedToday },
      ],
    };

    return {
      hoursByCategory,
      totalHours,
      totalActivities: activities.length,
      pendingActivities: activities.filter((a) => a.status === "pendiente").length,
      completedActivities: activities.filter((a) => a.status === "completada").length,
      priorityDistribution: Object.entries(priorities).map(([name, minutes]) => ({
        name,
        minutes,
        percentage: total > 0 ? Math.round((minutes / total) * 100) : 0,
      })),
      scheduleHoursByType,
      totalScheduleHours: Math.round((totalScheduleMinutes / 60) * 10) / 10,
      totalSchedules: schedules.length,
      habitStats,
      period,
    };
  },
};
