import { createHash } from 'node:crypto'
import type { PublicArticle, RenderedArticle, WritingSummary } from '../../shared/content'
import { adminDb } from './admin-db'
import { renderArticle } from './admin-markdown'

/** Read only the published snapshot; drafts never enter the public data path. */
export function publicArticles(): PublicArticle[] {
  const rows = adminDb()
    .prepare('SELECT published FROM articles WHERE deleted_at IS NULL AND published IS NOT NULL')
    .all() as Array<{ published: string }>
  return rows
    .map((row) => JSON.parse(row.published) as PublicArticle)
    .sort((a, b) => b.date.localeCompare(a.date))
}

export function writingSummaries(): WritingSummary[] {
  return publicArticles().map(({ path, title, description, date, cover, tags, category, readingTime }) => ({
    path,
    title,
    description,
    date,
    cover,
    tags,
    category,
    readingTime,
  }))
}

const bodies = new Map<string, Promise<RenderedArticle['body']>>()
const maxBodies = 32

export async function renderPublicArticle(article: PublicArticle): Promise<RenderedArticle> {
  const version = createHash('sha256').update(article.markdown).digest('hex')
  const key = `${article.slug}:${version}`
  let body = bodies.get(key)
  if (!body) {
    // Keep one body per slug, including while a previous version is still parsing.
    for (const old of bodies.keys()) if (old.startsWith(`${article.slug}:`)) bodies.delete(old)
    body = renderArticle(article).then((rendered) => rendered.body)
    bodies.set(key, body)
    while (bodies.size > maxBodies) bodies.delete(bodies.keys().next().value!)
  } else {
    bodies.delete(key)
    bodies.set(key, body)
  }
  try {
    return { ...article, body: await body }
  } catch (error) {
    if (bodies.get(key) === body) bodies.delete(key)
    throw error
  }
}
