import { describe, expect, it } from 'vitest'
import { formatTimestamp, parseTimestamp } from './timestamp'

describe('timestamp tools', () => {
  it('detects ten digit seconds and thirteen digit milliseconds', () => {
    expect(parseTimestamp('1725004800').date.getTime()).toBe(1725004800000)
    expect(parseTimestamp('1725004800000').date.getTime()).toBe(1725004800000)
  })

  it('rejects ambiguous timestamp lengths in auto mode', () => {
    expect(() => parseTimestamp('123456')).toThrow('10 位秒或 13 位毫秒')
  })

  it('parses a timezone-aware ISO value', () => {
    const parsed = parseTimestamp('2026-08-30T12:00:00+08:00')
    expect(parsed.date.toISOString()).toBe('2026-08-30T04:00:00.000Z')
    expect(formatTimestamp(parsed.date, 'Asia/Shanghai')[0].value).toBe('1788062400')
  })
})
