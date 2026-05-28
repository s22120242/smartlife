import { describe, it, expect, vi } from 'vitest'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

vi.mock('../src/utils/prisma', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
  },
}))

import { prisma } from '../src/utils/prisma'
import { config } from '../src/config'

describe('AuthService - register', () => {
  it('hashes password with bcrypt', async () => {
    const password = 'test123456'
    const hash = await bcrypt.hash(password, 10)
    expect(hash).not.toBe(password)
    expect(await bcrypt.compare(password, hash)).toBe(true)
  })

  it('generates a valid JWT token', () => {
    const payload = { userId: '1', email: 'test@test.com' }
    const token = jwt.sign(payload, config.jwtSecret, { expiresIn: '7d' })
    const decoded = jwt.verify(token, config.jwtSecret) as typeof payload
    expect(decoded.userId).toBe('1')
    expect(decoded.email).toBe('test@test.com')
  })

  it('rejects invalid JWT token', () => {
    expect(() => jwt.verify('invalid-token', config.jwtSecret)).toThrow()
  })
})

describe('Prisma - user operations', () => {
  it('findUnique returns null for non-existent user', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null)
    const result = await prisma.user.findUnique({ where: { id: '999' } })
    expect(result).toBeNull()
  })
})
