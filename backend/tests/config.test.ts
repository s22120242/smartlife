import { describe, it, expect } from 'vitest'
import { config } from '../src/config'

describe('config', () => {
  it('has a port number', () => {
    expect(config.port).toBeGreaterThan(0)
  })

  it('has a JWT secret', () => {
    expect(config.jwtSecret).toBeTruthy()
  })

  it('has a JWT expiration', () => {
    expect(config.jwtExpiresIn).toBeTruthy()
  })
})
