import { prisma } from "../utils/prisma";

export const habitService = {
  async getAll(userId: string, page?: number, limit?: number) {
    if (page && limit) {
      const skip = (page - 1) * limit;
      const [data, total] = await Promise.all([
        prisma.habit.findMany({
          where: { userId },
          orderBy: { createdAt: "desc" },
          skip,
          take: limit,
        }),
        prisma.habit.count({ where: { userId } }),
      ]);
      return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
    }

    return prisma.habit.findMany({ where: { userId }, orderBy: { createdAt: "desc" } });
  },

  async create(data: { userId: string; title: string; target?: number }) {
    return prisma.habit.create({ data: { ...data, target: data.target || 1 } });
  },

  async update(id: string, userId: string, data: Partial<{ title: string; streak: number; target: number; completed: number; lastCompletedAt: string | null }>) {
    const existing = await prisma.habit.findFirst({ where: { id, userId } });
    if (!existing) throw new Error("Hábito no encontrado");
    return prisma.habit.update({
      where: { id },
      data: {
        ...data,
        lastCompletedAt: data.lastCompletedAt === null ? null : data.lastCompletedAt ? new Date(data.lastCompletedAt) : undefined,
      },
    });
  },

  async remove(id: string, userId: string) {
    const existing = await prisma.habit.findFirst({ where: { id, userId } });
    if (!existing) throw new Error("Hábito no encontrado");
    return prisma.habit.delete({ where: { id } });
  },

  async removeBatch(ids: string[], userId: string) {
    const result = await prisma.habit.deleteMany({
      where: { id: { in: ids }, userId },
    });
    return { deleted: result.count };
  },
};
