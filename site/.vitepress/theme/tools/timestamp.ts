export type TimestampMode = 'auto' | 'seconds' | 'milliseconds'

export interface ParsedTimestamp {
  date: Date
  sourceKind: string
}

export interface TimeOutput {
  label: string
  value: string
}

const isoWithZone = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2}(?:\.\d{1,3})?)?(?:Z|[+-]\d{2}:\d{2})$/i
const localIso = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2}(?:\.\d{1,3})?)?$/

function validDate(milliseconds: number): Date {
  const date = new Date(milliseconds)
  if (!Number.isFinite(milliseconds) || Number.isNaN(date.getTime())) {
    throw new Error('时间超出浏览器可处理的范围')
  }
  return date
}

export function parseTimestamp(input: string, mode: TimestampMode = 'auto'): ParsedTimestamp {
  const value = input.trim()
  if (!value) throw new Error('请输入时间戳或 ISO 8601 时间')

  if (/^-?\d+$/.test(value)) {
    const digits = value.replace('-', '').length
    let multiplier: number
    let sourceKind: string

    if (mode === 'seconds') {
      multiplier = 1000
      sourceKind = 'Unix 秒'
    } else if (mode === 'milliseconds') {
      multiplier = 1
      sourceKind = 'Unix 毫秒'
    } else if (digits === 10) {
      multiplier = 1000
      sourceKind = '自动识别为 Unix 秒'
    } else if (digits === 13) {
      multiplier = 1
      sourceKind = '自动识别为 Unix 毫秒'
    } else {
      throw new Error('自动识别只接受 10 位秒或 13 位毫秒，请手动选择单位')
    }

    return { date: validDate(Number(value) * multiplier), sourceKind }
  }

  if (!isoWithZone.test(value) && !localIso.test(value)) {
    throw new Error('请使用 ISO 8601，例如 2026-08-30T12:00:00+08:00')
  }

  const milliseconds = Date.parse(value)
  return {
    date: validDate(milliseconds),
    sourceKind: isoWithZone.test(value) ? 'ISO 8601（含时区）' : 'ISO 8601（浏览器本地时间）',
  }
}

function formatInZone(date: Date, timeZone: string): string {
  return new Intl.DateTimeFormat('zh-CN', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
    timeZoneName: 'short',
  }).format(date)
}

export function relativeTime(date: Date, now = Date.now()): string {
  const difference = date.getTime() - now
  const absolute = Math.abs(difference)
  const units: Array<[Intl.RelativeTimeFormatUnit, number]> = [
    ['year', 365 * 24 * 60 * 60 * 1000],
    ['month', 30 * 24 * 60 * 60 * 1000],
    ['day', 24 * 60 * 60 * 1000],
    ['hour', 60 * 60 * 1000],
    ['minute', 60 * 1000],
    ['second', 1000],
  ]
  const formatter = new Intl.RelativeTimeFormat('zh-CN', { numeric: 'auto' })
  const [unit, size] = units.find(([, value]) => absolute >= value) ?? units.at(-1)!
  return formatter.format(Math.round(difference / size), unit)
}

export function formatTimestamp(date: Date, timeZone: string, now = Date.now()): TimeOutput[] {
  const milliseconds = date.getTime()
  return [
    { label: 'Unix 秒', value: String(Math.trunc(milliseconds / 1000)) },
    { label: 'Unix 毫秒', value: String(milliseconds) },
    { label: 'ISO 8601', value: date.toISOString() },
    { label: '浏览器本地时间', value: date.toLocaleString('zh-CN', { hour12: false }) },
    { label: timeZone, value: formatInZone(date, timeZone) },
    { label: '相对现在', value: relativeTime(date, now) },
  ]
}

export function supportedTimeZones(): string[] {
  const intl = Intl as typeof Intl & { supportedValuesOf?: (key: 'timeZone') => string[] }
  return intl.supportedValuesOf?.('timeZone') ?? ['UTC', 'Asia/Shanghai', 'Asia/Tokyo', 'Europe/London', 'America/New_York']
}
