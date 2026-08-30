export type ToolId = 'json' | 'timestamp' | 'jwt'
export type ToolTone = 'pink' | 'cyan' | 'blue'

export interface ToolDefinition {
  id: ToolId
  name: string
  shortName: string
  description: string
  href: string
  category: string
  icon: 'braces' | 'timer' | 'key-round'
  tone: ToolTone
}

export const tools: ToolDefinition[] = [
  {
    id: 'json',
    name: 'JSON 工作台',
    shortName: 'JSON',
    description: '严格校验、格式化和压缩 JSON，错误精确到行列。',
    href: '/tools/json',
    category: '格式化转换',
    icon: 'braces',
    tone: 'pink',
  },
  {
    id: 'timestamp',
    name: '时间戳转换',
    shortName: 'TIME',
    description: '在 Unix 时间戳、ISO 8601、本地时间和指定时区之间转换。',
    href: '/tools/timestamp',
    category: '开发效率',
    icon: 'timer',
    tone: 'cyan',
  },
  {
    id: 'jwt',
    name: 'JWT 解析器',
    shortName: 'JWT',
    description: '解码 Header 与 Payload，并检查标准 Claims 的时间状态。',
    href: '/tools/jwt',
    category: '接口调试',
    icon: 'key-round',
    tone: 'blue',
  },
]

export function getTool(id: ToolId): ToolDefinition {
  const tool = tools.find((item) => item.id === id)
  if (!tool) throw new Error(`Unknown tool: ${id}`)
  return tool
}
