export interface JwtTimeStatus {
  claim: 'exp' | 'nbf' | 'iat'
  label: string
  value: number
  formatted: string
  state: 'ok' | 'warning' | 'info'
  message: string
}

export interface JwtResult {
  header: Record<string, unknown>
  payload: Record<string, unknown>
  signatureLength: number
  algorithm: string
  algorithmMessage: string
  algorithmState: 'ok' | 'warning' | 'error'
  timeStatuses: JwtTimeStatus[]
}

function bytesToBase64(bytes: Uint8Array): string {
  let binary = ''
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary)
}

export function encodeBase64Url(value: string): string {
  return bytesToBase64(new TextEncoder().encode(value))
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
}

function decodeBase64Url(segment: string): string {
  if (!segment || !/^[A-Za-z0-9_-]+$/.test(segment)) {
    throw new Error('Token 包含无效的 Base64URL 片段')
  }
  const normalized = segment.replace(/-/g, '+').replace(/_/g, '/')
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=')

  try {
    const binary = atob(padded)
    const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0))
    return new TextDecoder('utf-8', { fatal: true }).decode(bytes)
  } catch {
    throw new Error('Token 片段不是有效的 UTF-8 Base64URL 内容')
  }
}

function parseObject(segment: string, name: string): Record<string, unknown> {
  try {
    const value = JSON.parse(decodeBase64Url(segment))
    if (!value || Array.isArray(value) || typeof value !== 'object') {
      throw new Error()
    }
    return value
  } catch (error) {
    if (error instanceof Error && error.message.startsWith('Token')) throw error
    throw new Error(`${name} 不是有效的 JSON 对象`)
  }
}

function timeStatus(payload: Record<string, unknown>, claim: JwtTimeStatus['claim'], nowSeconds: number): JwtTimeStatus | null {
  const value = payload[claim]
  if (value === undefined) return null
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new Error(`${claim} 必须是 NumericDate 秒数`)
  }

  const formatted = new Date(value * 1000).toISOString()
  if (claim === 'exp') {
    const expired = value <= nowSeconds
    return {
      claim,
      label: '过期时间',
      value,
      formatted,
      state: expired ? 'warning' : 'ok',
      message: expired ? 'Token 已过期' : '尚未过期',
    }
  }
  if (claim === 'nbf') {
    const inactive = value > nowSeconds
    return {
      claim,
      label: '生效时间',
      value,
      formatted,
      state: inactive ? 'warning' : 'ok',
      message: inactive ? '尚未生效' : '已经生效',
    }
  }
  return {
    claim,
    label: '签发时间',
    value,
    formatted,
    state: 'info',
    message: value > nowSeconds ? '签发时间在未来' : '时间格式有效',
  }
}

function algorithmState(algorithm: string): Pick<JwtResult, 'algorithmMessage' | 'algorithmState'> {
  if (!algorithm || algorithm.toLowerCase() === 'none') {
    return { algorithmMessage: '未声明签名算法或使用 none', algorithmState: 'error' }
  }
  if (algorithm.startsWith('HS')) {
    return { algorithmMessage: '对称签名算法；解析结果不代表签名可信', algorithmState: 'warning' }
  }
  return { algorithmMessage: '已声明签名算法；本工具未验证签名', algorithmState: 'ok' }
}

export function parseJwt(token: string, now = Date.now()): JwtResult {
  const segments = token.trim().split('.')
  if (segments.length !== 3) throw new Error('JWT 必须由 Header、Payload、Signature 三段组成')

  const header = parseObject(segments[0], 'Header')
  const payload = parseObject(segments[1], 'Payload')
  const algorithm = typeof header.alg === 'string' ? header.alg : ''
  const statuses = (['exp', 'nbf', 'iat'] as const)
    .map((claim) => timeStatus(payload, claim, Math.floor(now / 1000)))
    .filter((status): status is JwtTimeStatus => status !== null)

  return {
    header,
    payload,
    signatureLength: segments[2].length,
    algorithm,
    ...algorithmState(algorithm),
    timeStatuses: statuses,
  }
}

export function createSampleJwt(now = Date.now()): string {
  const issuedAt = Math.floor(now / 1000)
  const header = { alg: 'HS256', typ: 'JWT' }
  const payload = {
    sub: 'vie-demo',
    name: 'Vie 工具示例',
    iat: issuedAt,
    exp: issuedAt + 3600,
  }
  return `${encodeBase64Url(JSON.stringify(header))}.${encodeBase64Url(JSON.stringify(payload))}.${encodeBase64Url('demo-signature')}`
}
