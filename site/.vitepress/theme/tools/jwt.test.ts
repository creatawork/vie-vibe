import { describe, expect, it } from 'vitest'
import { parseJwt } from './jwt'

function encodeBase64Url(value: string): string {
  return Buffer.from(value, 'utf8').toString('base64url')
}

describe('jwt tools', () => {
  it('decodes header, payload, and standard time claims', () => {
    const now = Date.parse('2026-08-30T04:00:00Z')
    const issuedAt = Math.floor(now / 1000)
    const header = encodeBase64Url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
    const payload = encodeBase64Url(JSON.stringify({ sub: 'test-user', iat: issuedAt, exp: issuedAt + 3600 }))
    const result = parseJwt(`${header}.${payload}.signature`, now)
    expect(result.header.alg).toBe('HS256')
    expect(result.payload.sub).toBe('test-user')
    expect(result.timeStatuses.find((item) => item.claim === 'exp')?.message).toBe('尚未过期')
    expect(result.algorithmState).toBe('warning')
  })

  it('rejects malformed structure and non-object payloads', () => {
    expect(() => parseJwt('one.two')).toThrow('三段')
    const header = encodeBase64Url('{"alg":"HS256"}')
    const arrayPayload = encodeBase64Url('[]')
    expect(() => parseJwt(`${header}.${arrayPayload}.signature`)).toThrow('Payload')
  })
})
