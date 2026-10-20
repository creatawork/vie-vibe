declare module '@localSearchIndex' {
  const indexes: Record<string, () => Promise<{ default: string }>>
  export default indexes
}
