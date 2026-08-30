import { describe, expect, it } from 'vitest'
import { createSampleJwt, encodeBase64Url, parseJwt } from './jwt'

describe('jwt tools', () => {
  it('decodes header, payload, and standard time claims', () => {
    const now = Date.parse('2026-08-30T04:00:00Z')
    const result = parseJwt(createSampleJwt(now), now)
    expect(result.header.alg).toBe('HS256')
    expect(result.payload.sub).toBe('vie-demo')
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
