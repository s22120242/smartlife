import { describe, it, expect, vi } from 'vitest'

vi.mock('../src/utils/prisma', () => ({
  prisma: {
    habit: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      count: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}))

import { prisma } from '../src/utils/prisma'
import { habitService } from '../src/services/habitService'

const mockHabit = {
  id: '1',
  userId: 'u1',
  title: 'Read 30 min',
  streak: 5,
  target: 1,
  completed: 1,
  lastCompletedAt: new Date(),
  createdAt: new Date(),
  updatedAt: new Date(),
}

describe('HabitService', () => {
  it('getAll returns habits', async () => {
    vi.mocked(prisma.habit.findMany).mockResolvedValue([mockHabit])
    const result = await habitService.getAll('u1')
    expect(result).toHaveLength(1)
    expect(result[0].title).toBe('Read 30 min')
  })

  it('getAll with pagination', async () => {
    vi.mocked(prisma.habit.findMany).mockResolvedValue([mockHabit])
    vi.mocked(prisma.habit.count).mockResolvedValue(1)
    const result = await habitService.getAll('u1', 1, 10)
    expect(result.data).toHaveLength(1)
    expect(result.total).toBe(1)
  })

  it('creates habit with default target 1', async () => {
    const created = { ...mockHabit, id: '2', title: 'Exercise' }
    vi.mocked(prisma.habit.create).mockResolvedValue(created)
    const result = await habitService.create({ userId: 'u1', title: 'Exercise' })
    expect(result.title).toBe('Exercise')
  })

  it('update throws if habit not found', async () => {
    vi.mocked(prisma.habit.findFirst).mockResolvedValue(null)
    await expect(habitService.update('999', 'u1', { title: 'New' })).rejects.toThrow('Hábito no encontrado')
  })

  it('remove deletes habit', async () => {
    vi.mocked(prisma.habit.findFirst).mockResolvedValue(mockHabit)
    vi.mocked(prisma.habit.delete).mockResolvedValue(mockHabit)
    const result = await habitService.remove('1', 'u1')
    expect(result.id).toBe('1')
  })
})
