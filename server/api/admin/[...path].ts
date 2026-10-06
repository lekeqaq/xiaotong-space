import { z } from 'zod'
import { checkAdminOrigin, configured, login, logout, requireAdmin } from '../../utils/admin-auth'
import { getArticle, getHome, listArticleRecords } from '../../utils/admin-db'
import {
  articleAction,
  createArticle,
  history,
  parseInput,
  publishHome,
  restoreHistory,
  saveArticle,
  saveHome,
} from '../../utils/admin-content'
import {
  deleteMedia,
  downloadBackup,
  ensureImagesExist,
  listMedia,
  uploadMedia,
} from '../../utils/admin-media'
import { renderArticle } from '../../utils/admin-markdown'
import { articleSchema, readingTime } from '../../../shared/admin'

export default defineEventHandler(async (event) => {
  setHeader(event, 'cache-control', 'no-store')
  setHeader(event, 'x-robots-tag', 'noindex, nofollow')
  const path = getRouterParam(event, 'path') || ''
  const method = event.method
  const length = Number(getHeader(event, 'content-length') || 0)
  if (length > (path === 'media' ? 11 * 1024 * 1024 : 1024 * 1024))
    throw createError({ statusCode: 413, statusMessage: '请求内容过大' })
  if (!['GET', 'HEAD'].includes(method)) checkAdminOrigin(event)
  if (path === 'session' && method === 'GET') {
    let authenticated = false
    try {
      requireAdmin(event)
      authenticated = true
    } catch {
      /* An anonymous visitor may view the login page. */
    }
    return { authenticated, configured: configured() }
  }
  if (path === 'login' && method === 'POST') return login(event)
  requireAdmin(event)
  if (path === 'logout' && method === 'POST') return logout(event)
  if (path === 'articles' && method === 'GET') return listArticleRecords()
  if (path === 'articles' && method === 'POST') return createArticle(await readBody(event))
  const article = path.match(/^articles\/([a-f0-9-]{36})(?:\/(publish|unpublish|trash|restore|history))?$/)
  if (article) {
    const id = article[1]!
    const action = article[2]
    if (!action && method === 'GET') return getArticle(id)
    if (!action && method === 'PUT') {
      const input = await readBody(event)
      ensureImagesExist(input?.draft)
      return saveArticle(id, input)
    }
    if (action === 'history' && method === 'GET') {
      getArticle(id)
      return history('article', id)
    }
    if (action === 'history' && method === 'POST') {
      const input = parseInput(
        z.object({ historyId: z.number().int().positive(), revision: z.number().int().positive() }),
        await readBody(event),
      )
      return restoreHistory('article', id, input.historyId, input.revision)
    }
    if (action && method === 'POST') {
      if (action === 'publish') ensureImagesExist(getArticle(id).draft)
      return articleAction(id, action, await readBody(event))
    }
  }
  if (path === 'home' && method === 'GET') return getHome()
  if (path === 'home' && method === 'PUT') {
    const input = await readBody(event)
    ensureImagesExist(input?.draft)
    return saveHome(input)
  }
  if (path === 'home/publish' && method === 'POST') {
    ensureImagesExist(getHome().draft)
    return publishHome(await readBody(event))
  }
  if (path === 'home/history' && method === 'GET') return history('home', 'home')
  if (path === 'home/history' && method === 'POST') {
    const input = parseInput(
      z.object({ historyId: z.number().int().positive(), revision: z.number().int().positive() }),
      await readBody(event),
    )
    return restoreHistory('home', 'home', input.historyId, input.revision)
  }
  if (path === 'preview' && method === 'POST') {
    const input = parseInput(articleSchema, await readBody(event))
    return renderArticle({
      ...input,
      path: `/writing/${input.slug}`,
      readingTime: readingTime(input.markdown),
    })
  }
  if (path === 'media' && method === 'GET') return listMedia()
  if (path === 'media' && method === 'POST') return uploadMedia(event)
  if (path.startsWith('media/') && method === 'DELETE') return deleteMedia(path.slice(6))
  if (path === 'backup' && method === 'GET') return downloadBackup(event)
  throw createError({ statusCode: 404, statusMessage: '接口不存在' })
})
