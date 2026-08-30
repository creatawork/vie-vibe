import { describe, expect, it } from 'vitest'
import { formatJson, jsonStats, minifyJson, validateJson } from './json'

describe('json tools', () => {
  it('formats valid JSON while preserving large numeric text', () => {
    const result = formatJson('{"id":9007199254740993,"ok":true}')
    expect(result.output).toContain('9007199254740993')
    expect(result.output).toContain('\n  "ok"')
  })

  it('minifies JSON without removing spaces inside strings', () => {
    expect(minifyJson('{ "message": "hello world", "ok": true }').output).toBe('{"message":"hello world","ok":true}')
  })

  it('reports a line and column for invalid JSON', () => {
    expect(validateJson('{\n  "name": "Vie"\n}')).toBeNull()
    const diagnostic = validateJson('{\n  "name": "Vie"\n  "ok": true\n}')
    expect(diagnostic?.line).toBe(3)
    expect(diagnostic?.column).toBe(3)
  })

  it('counts UTF-8 bytes', () => {
    expect(jsonStats('中').bytes).toBe(3)
  })
})
