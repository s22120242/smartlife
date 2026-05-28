import { describe, it, expect, vi } from 'vitest'

const mockTx = {
  suggestion: { deleteMany: vi.fn(), create: vi.fn() },
}

vi.mock('../src/utils/prisma', () => ({
  prisma: {
    $transaction: vi.fn((cb: (tx: typeof mockTx) => unknown) => cb(mockTx)),
    fixedSchedule: { findMany: vi.fn() },
    activity: { findMany: vi.fn() },
    transport: { findMany: vi.fn() },
    category: { findMany: vi.fn() },
    suggestion: { deleteMany: vi.fn(), create: vi.fn() },
  },
}))

import { prisma } from '../src/utils/prisma'

describe('SchedulingService - analyzeTime', () => {
  it('returns free slots when no schedules', async () => {
    vi.mocked(prisma.fixedSchedule.findMany).mockResolvedValue([])
    vi.mocked(prisma.activity.findMany).mockResolvedValue([])
    vi.mocked(prisma.transport.findMany).mockResolvedValue([])
    vi.mocked(prisma.category.findMany).mockResolvedValue([])
    vi.mocked(prisma.suggestion.deleteMany).mockResolvedValue({ count: 0 } as any)

    const { schedulingService } = await import('../src/services/schedulingService')
    const result = await schedulingService.analyzeTime('u1')

    expect(result.freeSlots).toHaveLength(7) // 7 days
    expect(result.totalFreeMinutes).toBe(7 * 1440) // full week
    expect(result.suggestions).toContain('Buen balance. Tienes tiempo suficiente para tus actividades.')
  })
})
