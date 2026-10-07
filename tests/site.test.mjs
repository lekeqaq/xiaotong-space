import { test, before, after } from 'node:test'
import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { setTimeout as delay } from 'node:timers/promises'
import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { resolve } from 'node:path'
import Database from 'better-sqlite3'

const origin = 'http://127.0.0.1:3100'
let server
let directory
let logs = ''
before(async () => {
  directory = await mkdtemp(resolve(tmpdir(), 'xiaotong-site-test-'))
  server = spawn(process.execPath, ['.output/server/index.mjs'], {
    env: { ...process.env, PORT: '3100', HOST: '127.0.0.1', NUXT_ADMIN_DATA_DIR: directory },
    stdio: ['ignore', 'pipe', 'pipe'],
  })
  server.stdout.on('data', (chunk) => {
    logs += chunk
  })
  server.stderr.on('data', (chunk) => {
    logs += chunk
  })
  for (let attempt = 0; attempt < 60; attempt++) {
    try {
      if ((await fetch(origin)).ok) return
    } catch {
      /* Server is starting. */
    }
    if (server.exitCode !== null) throw new Error(`Server exited: ${logs}`)
    await delay(100)
  }
  throw new Error(`Server did not become ready: ${logs}`)
})
after(async () => {
  if (server && server.exitCode === null) {
    await new Promise((resolve) => {
      server.once('exit', resolve)
      server.kill('SIGTERM')
    })
  }
  if (directory) await rm(directory, { recursive: true, force: true })
})

const routes = [
  '/',
  '/projects',
  '/writing',
  '/about',
  '/projects/weekend',
  '/projects/digital-human',
  '/writing/building-personal-ai',
  '/writing/voice-agent-notes',
  '/writing/webrtc-notes',
]
for (const path of routes) {
  test(`${path} renders content and SEO on the server`, async () => {
    const response = await fetch(origin + path)
    assert.equal(response.status, 200)
    const html = await response.text()
    assert.match(html, /<h1[\s>]/)
    assert.match(html, /name="description" content="[^"]+"/)
    assert.match(html, /rel="canonical"/)
    assert.match(html, /property="og:title"/)
    assert.match(html, /aria-label="切换主题/)
  })
}

test('article renders highlighted code, callouts, TOC and structured data', async () => {
  const html = await (await fetch(origin + '/writing/building-personal-ai')).text()
  assert.match(html, /class="code-block"/)
  assert.match(html, /class="content-callout"/)
  assert.match(html, /class="toc-links"/)
  assert.match(html, /BlogPosting/)
  assert.match(html, /aria-label="复制代码"/)
})

test('sitemap includes every published page', async () => {
  const response = await fetch(origin + '/sitemap.xml')
  assert.match(response.headers.get('content-type'), /xml/)
  const xml = await response.text()
  assert.equal((xml.match(/<loc>/g) || []).length, routes.length)
  for (const path of routes.slice(1)) assert.ok(xml.includes(path + '</loc>'))
})

test('RSS includes three articles and publication dates', async () => {
  const response = await fetch(origin + '/rss.xml')
  assert.match(response.headers.get('content-type'), /(?:rss\+)?xml/)
  const xml = await response.text()
  assert.equal((xml.match(/<item>/g) || []).length, 3)
  assert.equal((xml.match(/<pubDate>/g) || []).length, 3)
  assert.match(xml, /个人 AI 助手的知识库设计思路/)
})

test('robots links to sitemap and OG image is available', async () => {
  assert.match(await (await fetch(origin + '/robots.txt')).text(), /Sitemap: .*\/sitemap.xml/)
  const image = await fetch(origin + '/og/default.png')
  assert.equal(image.status, 200)
  assert.match(image.headers.get('content-type'), /image\/png/)
})

test('public article summaries use a stable allowlist without body or management fields', async () => {
  const response = await fetch(origin + '/api/content/articles')
  assert.equal(response.headers.get('cache-control'), 'no-store')
  const articles = await response.json()
  assert.equal(articles.length, 3)
  const expected = ['path', 'title', 'description', 'date', 'cover', 'tags', 'category', 'readingTime'].sort()
  for (const article of articles) assert.deepEqual(Object.keys(article).sort(), expected)
  const html = await (await fetch(origin + '/writing/building-personal-ai')).text()
  assert.match(html, /公开接口读取已发布快照/)
  assert.doesNotMatch(html, /暂时没有浏览器里的编辑与即时发布能力/)
})

test('SSR reports temporary article failures as 503 with recovery navigation', async () => {
  // Corrupt only this test's isolated data to exercise real server fetch failures.
  const db = new Database(resolve(directory, 'content.sqlite'))
  const article = db.prepare('SELECT id, published FROM articles LIMIT 1').get()
  try {
    db.prepare('UPDATE articles SET published = ? WHERE id = ?').run('{', article.id)
    for (const path of ['/writing', '/writing/building-personal-ai']) {
      const response = await fetch(origin + path)
      assert.equal(response.status, 503)
      const html = await response.text()
      assert.match(html, /暂时没加载出来/)
      assert.match(html, /重新加载/)
      assert.match(html, /noindex/)
    }
  } finally {
    db.prepare('UPDATE articles SET published = ? WHERE id = ?').run(article.published, article.id)
    db.close()
  }
})

for (const path of ['/missing-page', '/writing/missing', '/projects/missing']) {
  test(`${path} returns a real 404 with recovery navigation`, async () => {
    const response = await fetch(origin + path, { headers: { accept: 'text/html' } })
    assert.equal(response.status, 404)
    const html = await response.text()
    assert.match(html, /A little off the path/)
    assert.match(html, /noindex/)
  })
}

for (const [path, target] of [
  ['/subscribe', '/writing'],
  ['/lab', '/writing'],
  ['/lab/personal-rag', '/writing'],
  ['/projects/personal-assistant', '/projects'],
]) {
  test(`${path} redirects to its current section`, async () => {
    const response = await fetch(origin + path, { redirect: 'manual' })
    assert.equal(response.status, 301)
    assert.equal(response.headers.get('location'), target)
  })
}
