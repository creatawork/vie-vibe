import {
  ParseErrorCode,
  SyntaxKind,
  applyEdits,
  createScanner,
  format,
  parseTree,
  type ParseError,
} from 'jsonc-parser'

export const JSON_MAX_BYTES = 1024 * 1024

export interface JsonDiagnostic {
  message: string
  line: number
  column: number
}

export interface JsonStats {
  bytes: number
  lines: number
  characters: number
}

export interface JsonResult {
  output: string
  stats: JsonStats
}

const errorMessages: Partial<Record<ParseErrorCode, string>> = {
  [ParseErrorCode.InvalidSymbol]: '包含无效字符',
  [ParseErrorCode.InvalidNumberFormat]: '数字格式不正确',
  [ParseErrorCode.PropertyNameExpected]: '这里需要属性名',
  [ParseErrorCode.ValueExpected]: '这里需要一个值',
  [ParseErrorCode.ColonExpected]: '属性名后缺少冒号',
  [ParseErrorCode.CommaExpected]: '相邻项目之间缺少逗号',
  [ParseErrorCode.CloseBraceExpected]: '对象缺少右花括号',
  [ParseErrorCode.CloseBracketExpected]: '数组缺少右方括号',
  [ParseErrorCode.EndOfFileExpected]: 'JSON 结束后仍有多余内容',
  [ParseErrorCode.InvalidCommentToken]: '严格 JSON 不允许注释',
  [ParseErrorCode.UnexpectedEndOfComment]: '注释没有正确结束',
  [ParseErrorCode.UnexpectedEndOfString]: '字符串没有正确结束',
  [ParseErrorCode.UnexpectedEndOfNumber]: '数字没有正确结束',
  [ParseErrorCode.InvalidUnicode]: 'Unicode 转义不正确',
  [ParseErrorCode.InvalidEscapeCharacter]: '字符串转义不正确',
  [ParseErrorCode.InvalidCharacter]: '字符串中包含无效字符',
}

function byteLength(value: string): number {
  return new TextEncoder().encode(value).byteLength
}

function positionAt(source: string, offset: number): { line: number; column: number } {
  const before = source.slice(0, offset)
  const lines = before.split(/\r?\n/)
  return { line: lines.length, column: (lines.at(-1)?.length ?? 0) + 1 }
}

function diagnosticFor(source: string, error: ParseError): JsonDiagnostic {
  const position = positionAt(source, error.offset)
  return {
    message: errorMessages[error.error] ?? 'JSON 语法不正确',
    ...position,
  }
}

export function validateJson(source: string): JsonDiagnostic | null {
  if (!source.trim()) {
    return { message: '请先输入 JSON 内容', line: 1, column: 1 }
  }

  if (byteLength(source) > JSON_MAX_BYTES) {
    return { message: '内容超过 1 MB，请缩小后再处理', line: 1, column: 1 }
  }

  const errors: ParseError[] = []
  parseTree(source, errors, { allowTrailingComma: false, disallowComments: true })
  return errors.length ? diagnosticFor(source, errors[0]) : null
}

export function jsonStats(source: string): JsonStats {
  return {
    bytes: byteLength(source),
    lines: source ? source.split(/\r?\n/).length : 0,
    characters: source.length,
  }
}

function assertValid(source: string): void {
  const diagnostic = validateJson(source)
  if (diagnostic) {
    const error = new Error(diagnostic.message) as Error & { diagnostic: JsonDiagnostic }
    error.diagnostic = diagnostic
    throw error
  }
}

export function formatJson(source: string): JsonResult {
  assertValid(source)
  const edits = format(source, undefined, {
    insertSpaces: true,
    tabSize: 2,
    eol: '\n',
  })
  const output = applyEdits(source, edits)
  return { output, stats: jsonStats(output) }
}

export function minifyJson(source: string): JsonResult {
  assertValid(source)
  const scanner = createScanner(source, false)
  let output = ''
  let token = scanner.scan()

  while (token !== SyntaxKind.EOF) {
    if (token !== SyntaxKind.Trivia && token !== SyntaxKind.LineBreakTrivia) {
      const start = scanner.getTokenOffset()
      output += source.slice(start, start + scanner.getTokenLength())
    }
    token = scanner.scan()
  }

  return { output, stats: jsonStats(output) }
}
