export function parseTime(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

export function formatTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
}

export function parsePagination(query: { page?: string; limit?: string }) {
  const page = query.page ? Math.max(1, parseInt(query.page, 10) || 1) : undefined;
  const limit = query.limit ? Math.min(100, Math.max(1, parseInt(query.limit, 10) || 20)) : undefined;
  return { page, limit };
}

export async function paginatedQuery<T>(
  model: { findMany: (args: any) => Promise<T[]>; count: (args: any) => Promise<number> },
  where: any,
  page?: number,
  limit?: number,
  extra: { include?: any; orderBy?: any } = {}
): Promise<{ data: T[]; total: number; page?: number; limit?: number; totalPages?: number } | T[]> {
  if (page && limit) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      model.findMany({ where, ...extra, skip, take: limit }),
      model.count({ where }),
    ]);
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }
  return model.findMany({ where, ...extra });
}

export async function findOwnedOrThrow<T extends { id: string }>(
  model: { findFirst: (args: any) => Promise<T | null> },
  id: string,
  userId: string,
  entityName: string
): Promise<T> {
  const record = await model.findFirst({ where: { id, userId } });
  if (!record) throw new Error(`${entityName} no encontrado`);
  return record;
}

export function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  return "Error interno del servidor";
}
