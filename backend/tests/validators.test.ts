import { describe, it, expect } from 'vitest'
import { registerSchema, loginSchema } from '../src/utils/validators'

describe('registerSchema', () => {
  it('accepts valid registration data', () => {
    const data = registerSchema.parse({
      name: 'Test User',
      email: 'test@example.com',
      password: '123456',
    })
    expect(data.name).toBe('Test User')
    expect(data.email).toBe('test@example.com')
  })

  it('rejects missing name', () => {
    expect(() =>
      registerSchema.parse({ email: 'test@example.com', password: '123456' })
    ).toThrow()
  })

  it('rejects invalid email', () => {
    expect(() =>
      registerSchema.parse({ name: 'Test', email: 'not-email', password: '123456' })
    ).toThrow()
  })

  it('rejects short password', () => {
    expect(() =>
      registerSchema.parse({ name: 'Test', email: 'test@example.com', password: '123' })
    ).toThrow()
  })
})

describe('loginSchema', () => {
  it('accepts valid login data', () => {
    const data = loginSchema.parse({
      email: 'test@example.com',
      password: '123456',
    })
    expect(data.email).toBe('test@example.com')
  })

  it('rejects missing password', () => {
    expect(() =>
      loginSchema.parse({ email: 'test@example.com' })
    ).toThrow()
  })
})
