import { readdir, readFile, writeFile } from 'node:fs/promises'
import { parse } from 'yaml'
const articles = []
for (const file of await readdir('content/writing')) {
  if (!file.endsWith('.md')) continue
  const source = await readFile(`content/writing/${file}`, 'utf8')
  const [, frontmatter, markdown] = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/)
  articles.push({ ...parse(frontmatter), slug: file.slice(0, -3), markdown: markdown.trim() })
}
const images = []
for (const folder of ['personal', 'writing', 'projects']) {
  for (const file of await readdir(`public/images/${folder}`)) images.push(`/images/${folder}/${file}`)
}
await writeFile('server/assets/admin-seed.json', JSON.stringify({ articles, images }, null, 2) + '\n')
console.log(`Seed: ${articles.length} articles, ${images.length} images`)
