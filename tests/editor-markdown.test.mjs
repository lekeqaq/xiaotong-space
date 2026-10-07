import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import vm from 'node:vm'
import { toEditorMarkdown, fromEditorMarkdown } from '../app/utils/adminEditorMarkdown.ts'

// Use the actual editor parser to check compatibility, not just our string codec.
const context = { console, TextDecoder, TextEncoder, setTimeout, clearTimeout, performance }
vm.createContext(context)
vm.runInContext(readFileSync('node_modules/vditor/dist/js/lute/lute.min.js', 'utf8'), context)
const lute = context.Lute.New()
function roundtrip(markdown) {
  return fromEditorMarkdown(lute.VditorDOM2Md(lute.Md2VditorDOM(toEditorMarkdown(markdown))))
}

test('MDC callouts survive the rich editor without their closing delimiter becoming a table', () => {
  const callout =
    '::content-callout{title="一个小原则"}\n内容里的 **加粗** 和 [链接](https://example.com)。\n::'
  const source = `## 标题\n\n${callout}\n\n后续正文。\n`
  assert.equal(fromEditorMarkdown(toEditorMarkdown(source)), source)
  assert.ok(roundtrip(source).includes(callout))
  assert.ok(!roundtrip(source).includes('xiaotong-mdc'))
})

test('nested MDC and code fences inside a component survive a parser roundtrip', () => {
  const source = ':::outer\n::inner{title="内部"}\n内容\n::\n\n```ts\nconst value = "::"\n```\n:::'
  assert.equal(fromEditorMarkdown(toEditorMarkdown(source)), source)
  assert.ok(roundtrip(source).includes(source))
})

test('standard Markdown, tables, and component examples inside code stay intact', () => {
  const source =
    '## 标题\n\n**加粗**\n\n| 名称 | 值 |\n| --- | --- |\n| 答案 | 42 |\n\n```md\n::example\n普通代码，不是组件\n::\n```\n'
  assert.equal(toEditorMarkdown(source), source)
  const output = roundtrip(source)
  assert.ok(output.includes('**加粗**'))
  assert.ok(output.includes('答案'))
  assert.ok(output.includes('```md\n::example\n普通代码，不是组件\n::\n```'))
})

test('existing imported article retains its callout and code', () => {
  const source = readFileSync('content/writing/building-personal-ai.md', 'utf8').replace(
    /^---[\s\S]*?---\n/,
    '',
  )
  const output = roundtrip(source)
  assert.ok(
    output.includes(
      '::content-callout{title="一个小原则"}\n如果一段答案找不到明确来源，就先不要把它当成可靠的个人知识。\n::',
    ),
  )
  assert.ok(output.includes('## 检索与生成分开评估'))
  assert.ok(!output.includes('xiaotong-mdc'))
})
