import { describe, it, expect, vi } from 'vitest'

vi.mock('../src/services/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}))

import api from '../src/services/api'
import { activityService } from '../src/services/activityService'

describe('activityService', () => {
  it('getAll calls correct endpoint', () => {
    activityService.getAll()
    expect(api.get).toHaveBeenCalledWith('/activities')
  })

  it('create calls correct endpoint', () => {
    const data = { title: 'Test', categoryId: '1', duration: 30, priority: 'media', splittable: false }
    activityService.create(data)
    expect(api.post).toHaveBeenCalledWith('/activities', data)
  })

  it('remove calls correct endpoint', () => {
    activityService.remove('123')
    expect(api.delete).toHaveBeenCalledWith('/activities/123')
  })
})
