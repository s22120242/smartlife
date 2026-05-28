import { prisma } from "../utils/prisma";

export const scheduleService = {
  async getAll(userId: string, page?: number, limit?: number) {
    if (page && limit) {
      const skip = (page - 1) * limit;
      const [data, total] = await Promise.all([
        prisma.fixedSchedule.findMany({
          where: { userId },
          orderBy: [{ day: "asc" }, { startTime: "asc" }],
          skip,
          take: limit,
        }),
        prisma.fixedSchedule.count({ where: { userId } }),
      ]);
      return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
    }

    return prisma.fixedSchedule.findMany({
      where: { userId },
      orderBy: [{ day: "asc" }, { startTime: "asc" }],
    });
  },

  async create(data: {
    userId: string;
    title: string;
    day: string;
    startTime: string;
    endTime: string;
    type: string;
  }) {
    return prisma.fixedSchedule.create({ data });
  },

  async createBatch(data: {
    userId: string;
    title: string;
    days: string[];
    startTime: string;
    endTime: string;
    type: string;
  }) {
    const { userId, title, days, startTime, endTime, type } = data;
    const entries = days.map((day) => ({
      userId,
      title,
      day,
      startTime,
      endTime,
      type,
    }));
    return prisma.fixedSchedule.createMany({ data: entries });
  },

  async update(
    id: string,
    userId: string,
    data: Partial<{
      title: string;
      day: string;
      startTime: string;
      endTime: string;
      type: string;
    }>
  ) {
    const existing = await prisma.fixedSchedule.findFirst({ where: { id, userId } });
    if (!existing) throw new Error("Horario no encontrado");
    return prisma.fixedSchedule.update({ where: { id }, data });
  },

  async remove(id: string, userId: string) {
    const existing = await prisma.fixedSchedule.findFirst({ where: { id, userId } });
    if (!existing) throw new Error("Horario no encontrado");
    return prisma.fixedSchedule.delete({ where: { id } });
  },
};
