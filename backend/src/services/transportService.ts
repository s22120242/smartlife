import { prisma } from "../utils/prisma";

export const transportService = {
  async getAll(userId: string, page?: number, limit?: number) {
    if (page && limit) {
      const skip = (page - 1) * limit;
      const [data, total] = await Promise.all([
        prisma.transport.findMany({
          where: { userId },
          orderBy: { id: "desc" },
          skip,
          take: limit,
        }),
        prisma.transport.count({ where: { userId } }),
      ]);
      return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
    }
    return prisma.transport.findMany({
      where: { userId },
      orderBy: { id: "desc" },
    });
  },

  async getById(id: string, userId: string) {
    return prisma.transport.findFirst({
      where: { id, userId },
    });
  },

  async create(data: { userId: string; origin: string; destination: string; duration: number; day?: string | null }) {
    return prisma.transport.create({
      data: {
        userId: data.userId,
        origin: data.origin,
        destination: data.destination,
        duration: data.duration,
        day: data.day ?? null,
      },
    });
  },

  async update(id: string, userId: string, data: Partial<{ origin: string; destination: string; duration: number; day?: string | null }>) {
    const existing = await prisma.transport.findFirst({ where: { id, userId } });
    if (!existing) throw new Error("Transporte no encontrado");

    return prisma.transport.update({
      where: { id },
      data,
    });
  },

  async remove(id: string, userId: string) {
    const existing = await prisma.transport.findFirst({ where: { id, userId } });
    if (!existing) throw new Error("Transporte no encontrado");

    return prisma.transport.delete({ where: { id } });
  },
};
