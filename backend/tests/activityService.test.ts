import { describe, it, expect, vi } from 'vitest'

vi.mock('../src/utils/prisma', () => ({
  prisma: {
    activity: {
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
import { activityService } from '../src/services/activityService'

const mockActivity = {
  id: '1',
  userId: 'u1',
  categoryId: 'Estudio',
  title: 'Test Activity',
  description: 'Test desc',
  duration: 60,
  priority: 'alta',
  deadline: new Date('2026-06-01'),
  splittable: false,
  status: 'pendiente',
  createdAt: new Date(),
  updatedAt: new Date(),
}

describe('ActivityService', () => {
  it('getAll returns activities with categories', async () => {
    vi.mocked(prisma.activity.findMany).mockResolvedValue([mockActivity])
    const result = await activityService.getAll('u1')
    expect(result).toHaveLength(1)
    expect(result[0].title).toBe('Test Activity')
  })

  it('getAll with pagination', async () => {
    vi.mocked(prisma.activity.findMany).mockResolvedValue([mockActivity])
    vi.mocked(prisma.activity.count).mockResolvedValue(1)
    const result = await activityService.getAll('u1', 1, 10)
    expect(result.data).toHaveLength(1)
    expect(result.total).toBe(1)
    expect(result.page).toBe(1)
  })

  it('getById returns null for non-existent', async () => {
    vi.mocked(prisma.activity.findFirst).mockResolvedValue(null)
    const result = await activityService.getById('999', 'u1')
    expect(result).toBeNull()
  })

  it('create activity with correct data', async () => {
    const newActivity = { ...mockActivity, id: '2', title: 'New Activity', duration: 30 }
    vi.mocked(prisma.activity.create).mockResolvedValue(newActivity)
    const result = await activityService.create({
      userId: 'u1',
      categoryId: 'Estudio',
      title: 'New Activity',
      duration: 30,
      priority: 'media',
      splittable: false,
    })
    expect(result.title).toBe('New Activity')
    expect(result.duration).toBe(30)
  })
})
