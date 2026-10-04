import { test, before, after } from 'node:test'
import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { setTimeout as delay } from 'node:timers/promises'

const origin = 'http://127.0.0.1:3100'
let server
let logs = ''
before(async () => {
  server = spawn(process.execPath, ['.output/server/index.mjs'], {
    env: { ...process.env, PORT: '3100', HOST: '127.0.0.1' },
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
after(() => {
  server?.kill('SIGTERM')
})

const routes = [
  '/',
  '/projects',
  '/writing',
  '/lab',
  '/about',
  '/subscribe',
  '/projects/weekend',
  '/projects/digital-human',
  '/projects/personal-assistant',
  '/writing/building-personal-ai',
  '/writing/voice-agent-notes',
  '/writing/webrtc-notes',
  '/lab/personal-rag',
  '/lab/voice-agent',
  '/lab/travel-planner',
  '/lab/more-ideas',
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
  assert.match(xml, /构建我的个人 AI Assistant/)
})

test('robots links to sitemap and OG image is available', async () => {
  assert.match(await (await fetch(origin + '/robots.txt')).text(), /Sitemap: .*\/sitemap.xml/)
  const image = await fetch(origin + '/og/default.png')
  assert.equal(image.status, 200)
  assert.match(image.headers.get('content-type'), /image\/png/)
})

for (const path of ['/missing-page', '/writing/missing', '/projects/missing', '/lab/missing']) {
  test(`${path} returns a real 404 with recovery navigation`, async () => {
    const response = await fetch(origin + path, { headers: { accept: 'text/html' } })
    assert.equal(response.status, 404)
    const html = await response.text()
    assert.match(html, /A little off the path/)
    assert.match(html, /noindex/)
  })
}
