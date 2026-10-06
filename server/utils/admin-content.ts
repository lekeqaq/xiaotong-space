import { randomUUID } from 'node:crypto'
import { z } from 'zod'
import { articleSchema, homeSchema, readingTime, shanghaiDate } from '../../shared/admin'
import { addHistory, adminDb, assertWritable, checkRevision, getArticle, getHome } from './admin-db'
import type { ArticleInput, HomeInput } from '../../shared/admin'

export function parseInput<T>(schema: z.ZodType<T>, input: unknown): T {
  const result = schema.safeParse(input)
  if (!result.success)
    throw createError({
      statusCode: 400,
      statusMessage: result.error.issues
        .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
        .join('；')
        .slice(0, 500),
    })
  return result.data
}
export const revisionSchema = z.object({ revision: z.number().int().positive() })
function uniqueSlug(slug: string, id: string) {
  if (adminDb().prepare('SELECT id FROM articles WHERE slug = ? AND id != ?').get(slug, id))
    throw createError({ statusCode: 409, statusMessage: '这个文章地址已被使用' })
}
export function createArticle(input: unknown) {
  assertWritable()
  const draft = parseInput(articleSchema, input)
  const id = randomUUID()
  uniqueSlug(draft.slug, id)
  adminDb()
    .prepare('INSERT INTO articles (id, slug, draft, updated_at) VALUES (?, ?, ?, ?)')
    .run(id, draft.slug, JSON.stringify(draft), new Date().toISOString())
  return getArticle(id)
}
export function saveArticle(id: string, input: unknown) {
  assertWritable()
  const { draft, revision } = parseInput(
    z.object({ draft: articleSchema, revision: z.number().int().positive() }),
    input,
  )
  return adminDb().transaction(() => {
    const current = getArticle(id)
    checkRevision(current.revision, revision)
    if (current.deletedAt) throw createError({ statusCode: 409, statusMessage: '请先从回收站恢复文章' })
    if (current.lockedSlug && current.lockedSlug !== draft.slug)
      throw createError({ statusCode: 400, statusMessage: '已发布文章的地址不能修改' })
    uniqueSlug(draft.slug, id)
    adminDb()
      .prepare(
        'UPDATE articles SET slug = ?, draft = ?, revision = revision + 1, updated_at = ? WHERE id = ?',
      )
      .run(draft.slug, JSON.stringify(draft), new Date().toISOString(), id)
    return getArticle(id)
  })()
}
export function articleAction(id: string, action: string, input: unknown) {
  assertWritable()
  const { revision } = parseInput(revisionSchema, input)
  return adminDb().transaction(() => {
    const current = getArticle(id)
    checkRevision(current.revision, revision)
    const now = new Date().toISOString()
    if (current.deletedAt && action !== 'restore')
      throw createError({ statusCode: 409, statusMessage: '请先从回收站恢复文章' })
    if (action === 'publish') {
      const draft = current.draft
      if (
        ![draft.title, draft.description, draft.markdown, draft.cover, draft.category].every((value) =>
          value.trim(),
        )
      )
        throw createError({ statusCode: 400, statusMessage: '发布前请填写标题、摘要、正文、分类和封面' })
      if (draft.date > shanghaiDate())
        throw createError({ statusCode: 400, statusMessage: '发布日期不能晚于今天，暂不支持定时发布' })
      const article = {
        ...draft,
        path: `/writing/${draft.slug}`,
        readingTime: readingTime(draft.markdown),
        ...(current.lockedSlug ? { updated: shanghaiDate() } : {}),
      }
      addHistory('article', id, '发布', article)
      adminDb()
        .prepare(
          'UPDATE articles SET published = ?, locked_slug = ?, revision = revision + 1, updated_at = ? WHERE id = ?',
        )
        .run(JSON.stringify(article), draft.slug, now, id)
    } else if (action === 'unpublish') {
      if (current.published) addHistory('article', id, '撤回发布', current.published)
      adminDb()
        .prepare('UPDATE articles SET published = NULL, revision = revision + 1, updated_at = ? WHERE id = ?')
        .run(now, id)
    } else if (action === 'trash' || action === 'restore') {
      adminDb()
        .prepare('UPDATE articles SET deleted_at = ?, revision = revision + 1, updated_at = ? WHERE id = ?')
        .run(action === 'trash' ? now : null, now, id)
    } else throw createError({ statusCode: 404, statusMessage: '操作不存在' })
    return getArticle(id)
  })()
}
export function saveHome(input: unknown) {
  assertWritable()
  const { draft, revision } = parseInput(
    z.object({ draft: homeSchema, revision: z.number().int().positive() }),
    input,
  )
  checkRevision(getHome().revision, revision)
  adminDb()
    .prepare('UPDATE home SET draft = ?, revision = revision + 1, updated_at = ? WHERE id = 1')
    .run(JSON.stringify(draft), new Date().toISOString())
  return getHome()
}
export function publishHome(input: unknown) {
  assertWritable()
  const { revision } = parseInput(revisionSchema, input)
  return adminDb().transaction(() => {
    const current = getHome()
    checkRevision(current.revision, revision)
    addHistory('home', 'home', '发布', current.draft)
    adminDb()
      .prepare('UPDATE home SET published = draft, revision = revision + 1, updated_at = ? WHERE id = 1')
      .run(new Date().toISOString())
    return getHome()
  })()
}
export function history(kind: string, target: string) {
  return adminDb()
    .prepare(
      'SELECT id, action, created_at AS createdAt FROM history WHERE kind = ? AND target = ? ORDER BY id DESC',
    )
    .all(kind, target)
}
export function restoreHistory(
  kind: 'article' | 'home',
  target: string,
  historyId: number,
  revision: number,
) {
  assertWritable()
  const row = adminDb()
    .prepare('SELECT data FROM history WHERE id = ? AND kind = ? AND target = ?')
    .get(historyId, kind, target) as { data: string } | undefined
  if (!row) throw createError({ statusCode: 404, statusMessage: '版本不存在' })
  if (kind === 'home') return saveHome({ draft: JSON.parse(row.data) as HomeInput, revision })
  return saveArticle(target, { draft: JSON.parse(row.data) as ArticleInput, revision })
}
