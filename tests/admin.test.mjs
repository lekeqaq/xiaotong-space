import { test, before, after } from 'node:test'
import assert from 'node:assert/strict'
import { spawn, execFileSync } from 'node:child_process'
import { scryptSync } from 'node:crypto'
import { mkdtemp, readFile, writeFile, rm, mkdir } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { resolve } from 'node:path'
import { setTimeout as delay } from 'node:timers/promises'
import { x } from 'tar'
import Database from 'better-sqlite3'
import sharp from 'sharp'

const origin = 'http://127.0.0.1:3110'
const password = 'integration-test-password-only'
const salt = 'a'.repeat(32)
let directory, server, cookie, media, homeSnapshot
let logs = ''
const headers = () => ({ cookie, origin, 'x-admin-request': '1', 'content-type': 'application/json' })
async function api(path, method = 'GET', body, expected = 200) {
  const response = await fetch(`${origin}/api/admin/${path}`, {
    method,
    headers: headers(),
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  })
  const result = await response.json()
  assert.equal(response.status, expected, JSON.stringify(result))
  return result
}
async function start(dataDir, port = '3110') {
  const child = spawn(process.execPath, ['.output/server/index.mjs'], {
    env: {
      ...process.env,
      PORT: port,
      HOST: '127.0.0.1',
      NUXT_PUBLIC_SITE_URL: '',
      NUXT_ADMIN_DATA_DIR: dataDir,
      NUXT_ADMIN_USERNAME: 'admin',
      NUXT_ADMIN_PASSWORD_HASH: `scrypt:${salt}:${scryptSync(password, salt, 64).toString('hex')}`,
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  })
  child.stdout.on('data', (chunk) => {
    logs += chunk
  })
  child.stderr.on('data', (chunk) => {
    logs += chunk
  })
  for (let i = 0; i < 150; i++) {
    try {
      if ((await fetch(`http://127.0.0.1:${port}/api/admin/session`)).ok) return child
    } catch {
      /* Wait for startup. */
    }
    if (child.exitCode !== null) throw new Error(logs)
    await delay(100)
  }
  child.kill()
  throw new Error(`Startup timeout: ${logs}`)
}
async function stop(child) {
  if (child.exitCode !== null) return
  await new Promise((resolve) => {
    child.once('exit', resolve)
    child.kill('SIGTERM')
  })
}
before(async () => {
  directory = await mkdtemp(resolve(tmpdir(), 'xiaotong-admin-test-'))
  server = await start(resolve(directory, 'live'))
  const response = await fetch(`${origin}/api/admin/login`, {
    method: 'POST',
    headers: { origin, 'x-admin-request': '1', 'content-type': 'application/json' },
    body: JSON.stringify({ username: 'admin', password }),
  })
  assert.equal(response.status, 200)
  cookie = response.headers.get('set-cookie').split(';')[0]
  assert.match(response.headers.get('set-cookie'), /HttpOnly/i)
  assert.match(response.headers.get('set-cookie'), /SameSite=Strict/i)
})
after(async () => {
  if (server) await stop(server)
  if (directory) await rm(directory, { recursive: true, force: true })
})

test('anonymous access, cross-origin writes and missing CSRF header are rejected', async () => {
  assert.equal((await fetch(`${origin}/api/admin/articles`)).status, 401)
  assert.equal((await fetch(`${origin}/__nuxt_content/writing/sql_dump.txt`)).status, 404)
  assert.equal(
    (
      await fetch(`${origin}/__nuxt_content/writing/query`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: '{}',
      })
    ).status,
    404,
  )
  const redirect = await fetch(`${origin}/admin`, { redirect: 'manual' })
  assert.equal(redirect.status, 302)
  assert.match(redirect.headers.get('location'), /^\/admin\/login/)
  assert.equal(
    (
      await fetch(`${origin}/api/admin/home`, {
        method: 'PUT',
        headers: { ...headers(), origin: 'https://other.example' },
        body: '{}',
      })
    ).status,
    403,
  )
  assert.equal(
    (
      await fetch(`${origin}/api/admin/home`, {
        method: 'PUT',
        headers: { cookie, origin, 'content-type': 'application/json' },
        body: '{}',
      })
    ).status,
    403,
  )
  const adminPage = await fetch(`${origin}/admin`, { headers: { cookie } })
  assert.equal(adminPage.status, 200)
  assert.match(adminPage.headers.get('x-robots-tag'), /noindex/)
})

test('existing content imports once, with five photos and six thoughts', async () => {
  assert.equal((await api('articles')).length, 3)
  homeSnapshot = await api('home')
  assert.equal(homeSnapshot.draft.photos.length, 5)
  assert.equal(homeSnapshot.draft.thoughts.length, 6)
  const html = await (await fetch(`${origin}/writing/building-personal-ai`)).text()
  assert.match(html, /class="code-block"/)
  assert.match(html, /class="content-callout"/)
  assert.match(html, /class="toc-links"/)
  assert.match(html, /BlogPosting/)
})

test('article lifecycle isolates drafts, publishes immediately, locks slugs and restores historical drafts', async () => {
  const draft = {
    slug: 'admin-lifecycle-test',
    title: '后台生命周期验证',
    description: '验证草稿、发布、历史恢复。',
    markdown: '## 实际发布\n\n只有发布后的内容可见。\n\n```ts\nconst answer = 42\n```',
    tags: ['测试'],
    category: 'Engineering',
    cover: '/images/personal/notebook.jpg',
    date: '2026-01-01',
    featured: false,
  }
  let record = await api('articles', 'POST', draft)
  const endpoint = `articles/${record.id}`
  assert.equal((await fetch(`${origin}/writing/${draft.slug}`)).status, 404)
  assert.doesNotMatch(await (await fetch(`${origin}/rss.xml`)).text(), /后台生命周期验证/)
  await api(endpoint, 'PUT', { draft, revision: record.revision + 1 }, 409)
  await api(endpoint, 'PUT', { draft: { ...draft, date: '2026-02-30' }, revision: record.revision }, 400)
  await api('articles', 'POST', draft, 409)
  record = await api(`${endpoint}/publish`, 'POST', { revision: record.revision })
  assert.equal((await fetch(`${origin}/writing/${draft.slug}`)).status, 200)
  assert.match(await (await fetch(`${origin}/rss.xml`)).text(), /后台生命周期验证/)
  assert.match(await (await fetch(`${origin}/sitemap.xml`)).text(), /admin-lifecycle-test/)
  await api(endpoint, 'PUT', { draft: { ...draft, slug: 'changed-url' }, revision: record.revision }, 400)
  record = await api(endpoint, 'PUT', {
    draft: { ...draft, title: '尚未发布的新标题', markdown: '## 修改草稿\n\n新的草稿正文。' },
    revision: record.revision,
  })
  assert.doesNotMatch(await (await fetch(`${origin}/writing/${draft.slug}`)).text(), /尚未发布的新标题/)
  const firstVersion = (await api(`${endpoint}/history`))[0]
  record = await api(`${endpoint}/publish`, 'POST', { revision: record.revision })
  assert.match(await (await fetch(`${origin}/writing/${draft.slug}`)).text(), /尚未发布的新标题/)
  record = await api(`${endpoint}/history`, 'POST', { historyId: firstVersion.id, revision: record.revision })
  assert.equal(record.draft.title, draft.title)
  assert.equal(record.published.title, '尚未发布的新标题')
  record = await api(`${endpoint}/unpublish`, 'POST', { revision: record.revision })
  assert.equal((await fetch(`${origin}/writing/${draft.slug}`)).status, 404)
  record = await api(`${endpoint}/trash`, 'POST', { revision: record.revision })
  assert.ok(record.deletedAt)
  await api(endpoint, 'PUT', { draft, revision: record.revision }, 409)
  record = await api(`${endpoint}/restore`, 'POST', { revision: record.revision })
  assert.equal(record.deletedAt, null)
  await api(`${endpoint}/trash`, 'POST', { revision: record.revision })
})

test('preview uses the article renderer and does not activate arbitrary components or script URLs', async () => {
  const draft = (await api('articles'))[0].draft
  const rendered = await api('preview', 'POST', {
    ...draft,
    markdown:
      '## 标题\n\n```ts\nconst value = 1\n```\n\n::content-callout{title="提示"}\n正常提示。\n::\n\n::admin-shell\n不能挂载后台组件。\n::\n\n<script>alert(1)</script>\n\n[危险链接](javascript:alert%281%29)',
  })
  const nodes = JSON.stringify(rendered.body)
  assert.ok(rendered.body.toc.links.length)
  assert.match(nodes, /content-callout/)
  assert.doesNotMatch(nodes, /"tag":"(?:script|admin-shell)"/)
  assert.doesNotMatch(nodes, /"href":"javascript:/)
})

test('home drafts, order and published versions remain separate and restore without rebuilding', async () => {
  let home = await api('home')
  const draft = structuredClone(home.draft)
  draft.photos.reverse()
  draft.thoughts[0].text = '首页新的话术。'
  home = await api('home', 'PUT', { draft, revision: home.revision })
  assert.equal(
    (await (await fetch(`${origin}/api/content/home`)).json()).thoughts[0].text,
    homeSnapshot.published.thoughts[0].text,
  )
  await api('home', 'PUT', { draft, revision: home.revision - 1 }, 409)
  await api('home', 'PUT', {}, 400)
  home = await api('home/publish', 'POST', { revision: home.revision })
  const publicHome = await (await fetch(`${origin}/api/content/home`)).json()
  assert.equal(publicHome.photos[0].id, 'architecture')
  assert.equal(publicHome.thoughts[0].text, '首页新的话术。')
  const oldVersion = (await api('home/history')).at(-1)
  home = await api('home/history', 'POST', { historyId: oldVersion.id, revision: home.revision })
  assert.equal(home.draft.thoughts[0].text, homeSnapshot.draft.thoughts[0].text)
  assert.equal(home.published.thoughts[0].text, '首页新的话术。')
  await api('home/publish', 'POST', { revision: home.revision })
})

test('uploads are decoded and compressed, and referenced images cannot be deleted', async () => {
  const image = await sharp({ create: { width: 100, height: 80, channels: 3, background: '#bdb49b' } })
    .png()
    .toBuffer()
  const form = new FormData()
  form.append('file', new Blob([image], { type: 'image/png' }), 'test.png')
  const response = await fetch(`${origin}/api/admin/media`, {
    method: 'POST',
    headers: { cookie, origin, 'x-admin-request': '1' },
    body: form,
  })
  assert.equal(response.status, 200)
  media = await response.json()
  assert.equal(media.width, 100)
  assert.equal((await fetch(origin + media.src)).headers.get('content-type'), 'image/webp')
  const bad = new FormData()
  bad.append('file', new Blob(['<svg onload="alert(1)"></svg>'], { type: 'image/svg+xml' }), 'bad.svg')
  assert.equal(
    (
      await fetch(`${origin}/api/admin/media`, {
        method: 'POST',
        headers: { cookie, origin, 'x-admin-request': '1' },
        body: bad,
      })
    ).status,
    400,
  )
  let home = await api('home')
  const draft = structuredClone(home.draft)
  draft.photos[0].src = media.src
  home = await api('home', 'PUT', { draft, revision: home.revision })
  await api(`media/${media.id}`, 'DELETE', undefined, 409)
  await api('home/publish', 'POST', { revision: home.revision })
  const homeHTML = await (await fetch(origin)).text()
  assert.ok(homeHTML.includes(`src="${media.src}"`))
  assert.doesNotMatch(homeHTML, /_ipx[^"]*\/media\//)
  const missingDraft = { ...draft, photos: [{ ...draft.photos[0], src: '/images/missing.jpg' }] }
  await api('home', 'PUT', { draft: missingDraft, revision: home.revision + 1 }, 400)
})

test('permanent deletion removes only trashed articles and their history, releasing image references', async () => {
  const before = await api('articles')
  const db = new Database(resolve(directory, 'live', 'content.sqlite'), { readonly: true })
  const historyCount = db.prepare('SELECT count(*) AS count FROM history').get().count
  const image = await sharp({ create: { width: 12, height: 12, channels: 3, background: '#abcdef' } })
    .png()
    .toBuffer()
  const form = new FormData()
  form.append('file', new Blob([image], { type: 'image/png' }), 'delete-article.png')
  const upload = await fetch(`${origin}/api/admin/media`, {
    method: 'POST',
    headers: { cookie, origin, 'x-admin-request': '1' },
    body: form,
  })
  assert.equal(upload.status, 200)
  const picture = await upload.json()
  const draft = {
    ...before[0].draft,
    slug: 'permanent-deletion-test',
    title: '永久删除验证',
    description: '验证文章与历史版本的彻底删除。',
    markdown: `## 删除正文\n\n![历史图片](${picture.src})`,
    cover: picture.src,
    date: '2026-01-01',
  }
  let record = await api('articles', 'POST', draft)
  const endpoint = `articles/${record.id}`
  for (const [requestHeaders, expected] of [
    [{ origin, 'x-admin-request': '1', 'content-type': 'application/json' }, 401],
    [{ cookie, origin, 'content-type': 'application/json' }, 403],
    [{ ...headers(), origin: 'https://other.example' }, 403],
  ]) {
    const response = await fetch(`${origin}/api/admin/${endpoint}`, {
      method: 'DELETE',
      headers: requestHeaders,
      body: JSON.stringify({ revision: record.revision }),
    })
    assert.equal(response.status, expected)
  }
  await api(endpoint, 'DELETE', { revision: record.revision }, 409)
  record = await api(`${endpoint}/publish`, 'POST', { revision: record.revision })
  record = await api(endpoint, 'PUT', {
    draft: { ...draft, markdown: '只在旧版本中引用图片。', cover: '/images/personal/notebook.jpg' },
    revision: record.revision,
  })
  record = await api(`${endpoint}/publish`, 'POST', { revision: record.revision })
  const oldVersion = (await api(`${endpoint}/history`))[0]
  assert.equal((await api(`${endpoint}/history`)).length, 2)
  assert.deepEqual((await api('media')).find((item) => item.id === picture.id).references, ['发布历史'])
  await api(`media/${picture.id}`, 'DELETE', undefined, 409)
  record = await api(`${endpoint}/trash`, 'POST', { revision: record.revision })
  await api(endpoint, 'DELETE', {}, 400)
  await api(endpoint, 'DELETE', { revision: record.revision - 1 }, 409)
  const staleRevision = record.revision
  record = await api(`${endpoint}/restore`, 'POST', { revision: record.revision })
  await api(endpoint, 'DELETE', { revision: staleRevision }, 409)
  await api(endpoint, 'DELETE', { revision: record.revision }, 409)
  assert.equal((await fetch(`${origin}/writing/${draft.slug}`)).status, 200)
  record = await api(`${endpoint}/trash`, 'POST', { revision: record.revision })
  assert.deepEqual(await api(endpoint, 'DELETE', { revision: record.revision }), { deleted: true })
  await api(endpoint, 'GET', undefined, 404)
  await api(endpoint, 'DELETE', { revision: record.revision }, 404)
  await api(`${endpoint}/history`, 'GET', undefined, 404)
  await api(`${endpoint}/history`, 'POST', { historyId: oldVersion.id, revision: record.revision }, 404)
  await api(`${endpoint}/restore`, 'POST', { revision: record.revision }, 404)
  assert.equal(db.prepare('SELECT count(*) AS count FROM articles WHERE id = ?').get(record.id).count, 0)
  assert.equal(db.prepare('SELECT count(*) AS count FROM history WHERE target = ?').get(record.id).count, 0)
  assert.equal(db.prepare('SELECT count(*) AS count FROM history').get().count, historyCount)
  db.close()
  assert.deepEqual(await api('articles'), before)
  assert.equal((await fetch(`${origin}/writing/${draft.slug}`)).status, 404)
  assert.doesNotMatch(await (await fetch(`${origin}/rss.xml`)).text(), /永久删除验证/)
  assert.doesNotMatch(await (await fetch(`${origin}/sitemap.xml`)).text(), /permanent-deletion-test/)
  assert.deepEqual((await api('media')).find((item) => item.id === picture.id).references, [])
  assert.equal((await fetch(origin + picture.src)).status, 200)
  await api(`media/${picture.id}`, 'DELETE')
  const replacement = await api('articles', 'POST', { ...draft, cover: '', markdown: '' })
  const trashed = await api(`articles/${replacement.id}/trash`, 'POST', { revision: replacement.revision })
  await api(`articles/${replacement.id}`, 'DELETE', { revision: trashed.revision })
})

test('a backup restores SQLite and images, excludes sessions, and survives a process restart', async () => {
  const response = await fetch(`${origin}/api/admin/backup`, { headers: { cookie } })
  assert.equal(response.status, 200)
  assert.match(response.headers.get('content-type'), /gzip/)
  const backup = resolve(directory, 'backup.tar.gz')
  await writeFile(backup, Buffer.from(await response.arrayBuffer()))
  const extracted = resolve(directory, 'extracted')
  await mkdir(extracted)
  await x({ file: backup, cwd: extracted })
  const db = new Database(resolve(extracted, 'content.sqlite'))
  assert.equal(db.prepare('SELECT count(*) AS count FROM sessions').get().count, 0)
  db.close()
  assert.ok((await readFile(resolve(extracted, 'uploads', `${media.id}.webp`))).length)
  const restored = resolve(directory, 'restored')
  execFileSync(process.execPath, [
    'scripts/admin-restore.mjs',
    backup,
    '--server-stopped',
    '--data-dir',
    restored,
  ])
  const restoredServer = await start(restored, '3112')
  try {
    const restoredHome = await (await fetch('http://127.0.0.1:3112/api/content/home')).json()
    assert.equal(restoredHome.photos[0].src, media.src)
    assert.equal((await fetch(`http://127.0.0.1:3112${media.src}`)).status, 200)
  } finally {
    await stop(restoredServer)
  }
  await stop(server)
  server = await start(resolve(directory, 'live'))
  assert.equal((await api('articles')).length, 4)
  assert.equal((await (await fetch(`${origin}/api/content/home`)).json()).photos[0].src, media.src)
})

test('expired sessions and logout revoke access; login failures are rate limited', async () => {
  const db = new Database(resolve(directory, 'live', 'content.sqlite'))
  db.prepare('UPDATE sessions SET expires_at = 0').run()
  db.close()
  await api('articles', 'GET', undefined, 401)
  const loginResponse = await fetch(`${origin}/api/admin/login`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ username: 'admin', password }),
  })
  cookie = loginResponse.headers.get('set-cookie').split(';')[0]
  await api('logout', 'POST', {})
  await api('articles', 'GET', undefined, 401)
  for (let i = 0; i < 5; i++) await api('login', 'POST', { username: 'admin', password: 'incorrect' }, 401)
  await api('login', 'POST', { username: 'admin', password }, 429)
})
