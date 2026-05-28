import { prisma } from "../utils/prisma";

export const activityService = {
  async getAll(userId: string, page?: number, limit?: number) {
    if (page && limit) {
      const skip = (page - 1) * limit;
      const [data, total] = await Promise.all([
        prisma.activity.findMany({
          where: { userId },
          include: { category: true },
          orderBy: { createdAt: "desc" },
          skip,
          take: limit,
        }),
        prisma.activity.count({ where: { userId } }),
      ]);
      return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
    }

    return prisma.activity.findMany({
      where: { userId },
      include: { category: true },
      orderBy: { createdAt: "desc" },
    });
  },

  async getById(id: string, userId: string) {
    return prisma.activity.findFirst({
      where: { id, userId },
      include: { category: true },
    });
  },

  async create(data: {
    userId: string;
    categoryId: string;
    title: string;
    description?: string;
    duration: number;
    priority: string;
    deadline?: string;
    startTime?: string;
    splittable: boolean;
  }) {
    return prisma.activity.create({
      data: {
        userId: data.userId,
        categoryId: data.categoryId,
        title: data.title,
        description: data.description,
        duration: data.duration,
        priority: data.priority,
        deadline: data.deadline ? new Date(data.deadline) : null,
        startTime: data.startTime,
        splittable: data.splittable,
      },
      include: { category: true },
    });
  },

  async update(
    id: string,
    userId: string,
    data: Partial<{
      categoryId: string;
      title: string;
      description: string;
      duration: number;
      priority: string;
      deadline: string | null;
      startTime: string | null;
      splittable: boolean;
      status: string;
    }>
  ) {
    const existing = await prisma.activity.findFirst({ where: { id, userId } });
    if (!existing) throw new Error("Actividad no encontrada");

    return prisma.activity.update({
      where: { id },
      data: {
        ...data,
        deadline: data.deadline === null ? null : data.deadline ? new Date(data.deadline) : undefined,
      },
      include: { category: true },
    });
  },

  async remove(id: string, userId: string) {
    const existing = await prisma.activity.findFirst({ where: { id, userId } });
    if (!existing) throw new Error("Actividad no encontrada");

    return prisma.activity.delete({ where: { id } });
  },

  async removeBatch(ids: string[], userId: string) {
    const result = await prisma.activity.deleteMany({
      where: { id: { in: ids }, userId },
    });
    return { deleted: result.count };
  },
};
