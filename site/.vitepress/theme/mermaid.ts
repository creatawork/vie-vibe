// Hydrates ```mermaid fences (rendered as .vie-mermaid placeholders by
// config.mts) on pages that contain them, so the diagram runtime is only
// downloaded when a page actually uses it.
let initialized = false

async function ensureMermaid() {
  const mermaid = (await import('mermaid')).default
  if (!initialized) {
    mermaid.initialize({ startOnLoad: false, securityLevel: 'strict' })
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
