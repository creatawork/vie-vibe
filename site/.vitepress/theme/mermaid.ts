// Hydrates ```mermaid fences (rendered as .vie-mermaid placeholders by
// config.mts) on pages that contain them, so the diagram runtime is only
// downloaded when a page actually uses it.
let initialized = false

async function ensureMermaid() {
  const mermaid = (await import('mermaid')).default
  if (!initialized) {
    // 'base' + themeVariables keeps diagrams in the site's green-on-white
    // palette instead of mermaid's default violet.
    mermaid.initialize({
      startOnLoad: false,
      securityLevel: 'strict',
      theme: 'base',
      themeVariables: {
        background: '#ffffff',
        fontFamily: "'Noto Sans SC', system-ui, sans-serif",
        fontSize: '14px',
        primaryColor: '#eaf6f0',
        primaryTextColor: '#16202a',
        primaryBorderColor: '#87c7a8',
        lineColor: '#6b7c8a',
        edgeLabelBackground: '#f6f8fb',
      },
    })
    initialized = true
  }
  return mermaid
}

export async function renderMermaidBlocks(): Promise<void> {
  const nodes = [
    ...document.querySelectorAll<HTMLElement>('.vie-mermaid:not([data-rendered])'),
  ]
  if (!nodes.length) return

  const mermaid = await ensureMermaid()
  let seq = 0
  for (const el of nodes) {
    const bytes = Uint8Array.from(atob(el.dataset.code ?? ''), (c) =>
      c.charCodeAt(0),
    )
    const code = new TextDecoder().decode(bytes)
    try {
      const { svg } = await mermaid.render(`vie-mermaid-${Date.now()}-${seq++}`, code)
      el.innerHTML = svg
      el.dataset.rendered = 'ok'
    } catch {
      const pre = document.createElement('pre')
      pre.textContent = code
      el.replaceChildren(pre)
      el.dataset.rendered = 'error'
    }
  }
}
