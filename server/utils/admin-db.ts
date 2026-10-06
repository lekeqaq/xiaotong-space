import Database from 'better-sqlite3'
import { mkdirSync } from 'node:fs'
import { resolve } from 'node:path'
import { createHash, randomUUID } from 'node:crypto'
import seed from '../assets/admin-seed.json'
import { articleSchema, initialHome, readingTime } from '../../shared/admin'
import type { Article, ArticleRecord, HomeRecord } from '../../shared/admin'

let database: Database.Database | undefined
let backupInProgress = false
export function setBackupInProgress(value: boolean) {
  backupInProgress = value
}
export function dataDirectory() {
  return resolve(useRuntimeConfig().adminDataDir || '.data/admin')
}
export function assertWritable() {
  if (backupInProgress) throw createError({ statusCode: 503, statusMessage: '正在备份，请稍后保存' })
}
export function adminDb() {
  if (database) return database
  mkdirSync(dataDirectory(), { recursive: true, mode: 0o700 })
  mkdirSync(resolve(dataDirectory(), 'uploads'), { recursive: true, mode: 0o700 })
  const db = new Database(resolve(dataDirectory(), 'content.sqlite'))
  db.pragma('journal_mode = WAL')
  db.pragma('foreign_keys = ON')
  db.pragma('busy_timeout = 5000')
  db.exec(`
    CREATE TABLE IF NOT EXISTS articles (id TEXT PRIMARY KEY, slug TEXT NOT NULL UNIQUE, draft TEXT NOT NULL, published TEXT, locked_slug TEXT, deleted_at TEXT, revision INTEGER NOT NULL DEFAULT 1, updated_at TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS home (id INTEGER PRIMARY KEY CHECK(id = 1), draft TEXT NOT NULL, published TEXT NOT NULL, revision INTEGER NOT NULL DEFAULT 1, updated_at TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS history (id INTEGER PRIMARY KEY AUTOINCREMENT, kind TEXT NOT NULL, target TEXT NOT NULL, action TEXT NOT NULL, data TEXT NOT NULL, created_at TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS media (id TEXT PRIMARY KEY, name TEXT NOT NULL, width INTEGER NOT NULL, height INTEGER NOT NULL, size INTEGER NOT NULL, created_at TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS sessions (token_hash TEXT PRIMARY KEY, expires_at INTEGER NOT NULL);
    CREATE TABLE IF NOT EXISTS login_limits (ip TEXT PRIMARY KEY, attempts INTEGER NOT NULL, expires_at INTEGER NOT NULL);
    CREATE TABLE IF NOT EXISTS metadata (key TEXT PRIMARY KEY, value TEXT NOT NULL);
  `)
  db.transaction(() => {
    if (db.prepare('SELECT value FROM metadata WHERE key = ?').get('seeded')) return
    const now = new Date().toISOString()
    for (const item of seed.articles) {
      const draft = articleSchema.parse(item)
      const article: Article = {
        ...draft,
        path: `/writing/${draft.slug}`,
        readingTime: readingTime(draft.markdown),
        ...('updated' in item ? { updated: String(item.updated) } : {}),
      }
      const id = randomUUID()
      db.prepare(
        'INSERT INTO articles (id, slug, draft, published, locked_slug, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
      ).run(
        id,
        draft.slug,
        JSON.stringify(draft),
        item.draft ? null : JSON.stringify(article),
        item.draft ? null : draft.slug,
        now,
      )
      if (!item.draft)
        db.prepare('INSERT INTO history (kind, target, action, data, created_at) VALUES (?, ?, ?, ?, ?)').run(
          'article',
          id,
          '导入文章',
          JSON.stringify(article),
          now,
        )
    }
    db.prepare('INSERT INTO home (id, draft, published, updated_at) VALUES (1, ?, ?, ?)').run(
      JSON.stringify(initialHome),
      JSON.stringify(initialHome),
      now,
    )
    db.prepare('INSERT INTO history (kind, target, action, data, created_at) VALUES (?, ?, ?, ?, ?)').run(
      'home',
      'home',
      '初始内容',
      JSON.stringify(initialHome),
      now,
    )
    db.prepare('INSERT INTO metadata (key, value) VALUES (?, ?)').run('seeded', now)
  })()
  const config = useRuntimeConfig()
  const fingerprint = createHash('sha256')
    .update(`${config.adminUsername}:${config.adminPasswordHash}`)
    .digest('hex')
  db.transaction(() => {
    const previous = db.prepare('SELECT value FROM metadata WHERE key = ?').get('credentials') as
      { value: string } | undefined
    if (previous?.value !== fingerprint) {
      db.prepare('DELETE FROM sessions').run()
      db.prepare(
        'INSERT INTO metadata (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value',
      ).run('credentials', fingerprint)
    }
  })()
  database = db
  return db
}
interface ArticleRow {
  id: string
  draft: string
  published: string | null
  locked_slug: string | null
  deleted_at: string | null
  revision: number
  updated_at: string
}
export function articleRecord(row: ArticleRow): ArticleRecord {
  return {
    id: row.id,
    draft: JSON.parse(row.draft),
    published: row.published ? JSON.parse(row.published) : null,
    lockedSlug: row.locked_slug,
    deletedAt: row.deleted_at,
    revision: row.revision,
    updatedAt: row.updated_at,
  }
}
export function getArticle(id: string) {
  const row = adminDb().prepare('SELECT * FROM articles WHERE id = ?').get(id) as ArticleRow | undefined
  if (!row) throw createError({ statusCode: 404, statusMessage: '文章不存在' })
  return articleRecord(row)
}
export function listArticleRecords() {
  return (adminDb().prepare('SELECT * FROM articles ORDER BY updated_at DESC').all() as ArticleRow[]).map(
    articleRecord,
  )
}
export function publishedArticles(): Article[] {
  return listArticleRecords()
    .filter((item) => !item.deletedAt && item.published)
    .map((item) => item.published!)
    .sort((a, b) => b.date.localeCompare(a.date))
}
export function getHome(): HomeRecord {
  const row = adminDb().prepare('SELECT * FROM home WHERE id = 1').get() as {
    draft: string
    published: string
    revision: number
    updated_at: string
  }
  return {
    draft: JSON.parse(row.draft),
    published: JSON.parse(row.published),
    revision: row.revision,
    updatedAt: row.updated_at,
  }
}
export function addHistory(kind: 'article' | 'home', target: string, action: string, data: unknown) {
  adminDb()
    .prepare('INSERT INTO history (kind, target, action, data, created_at) VALUES (?, ?, ?, ?, ?)')
    .run(kind, target, action, JSON.stringify(data), new Date().toISOString())
}
export function checkRevision(current: number, expected: number) {
  if (current !== expected)
    throw createError({ statusCode: 409, statusMessage: '内容已在其他页面更新，请重新加载后再编辑' })
}
export const builtinImages = seed.images
