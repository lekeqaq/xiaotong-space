// MDC components are not CommonMark: notably, a closing :: can become a table
// delimiter in Lute. Keep them editable as fenced source inside the rich editor.
const componentStart = /^\s*(:{2,})[a-zA-Z][\w-]*(?:\{|\s|$)/
const componentEnd = /^\s*(:{2,})\s*$/
const fenceStart = /^\s*(`{3,}|~{3,})/

export function toEditorMarkdown(markdown: string): string {
  const lines = markdown.split('\n')
  const result: string[] = []
  let fence = ''
  for (let index = 0; index < lines.length; index++) {
    const line = lines[index]!
    const marker = line.match(fenceStart)?.[1]
    if (fence) {
      result.push(line)
      if (marker && marker[0] === fence[0] && marker.length >= fence.length && /^\s*[`~]+\s*$/.test(line))
        fence = ''
      continue
    }
    if (marker) {
      fence = marker
      result.push(line)
      continue
    }
    const start = line.match(componentStart)
    if (!start) {
      result.push(line)
      continue
    }
    const stack = [start[1]!.length]
    let innerFence = ''
    let end = index + 1
    for (; end < lines.length; end++) {
      const inner = lines[end]!
      const code = inner.match(fenceStart)?.[1]
      if (innerFence) {
        if (
          code &&
          code[0] === innerFence[0] &&
          code.length >= innerFence.length &&
          /^\s*[`~]+\s*$/.test(inner)
        )
          innerFence = ''
        continue
      }
      if (code) {
        innerFence = code
        continue
      }
      const nested = inner.match(componentStart)
      if (nested) stack.push(nested[1]!.length)
      const close = inner.match(componentEnd)
      if (close && close[1]!.length === stack.at(-1)) stack.pop()
      if (!stack.length) break
    }
    if (stack.length) {
      result.push(line)
      continue
    }
    const block = lines.slice(index, end + 1).join('\n')
    const longest = Math.max(2, ...Array.from(block.matchAll(/`+/g), (match) => match[0].length))
    const wrapper = '`'.repeat(longest + 1)
    result.push(`${wrapper}xiaotong-mdc\n${block}\n${wrapper}`)
    index = end
  }
  return result.join('\n')
}

export function fromEditorMarkdown(markdown: string): string {
  return markdown.replace(
    /^(`{3,}|~{3,})xiaotong-mdc[ \t]*\n([\s\S]*?)\n\1[ \t]*$/gm,
    (_match, _fence: string, source: string) => source,
  )
}
