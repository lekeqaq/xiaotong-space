import { siteIdentity } from '../../shared/site'
import { queryCollection } from '@nuxt/content/server'

export default defineEventHandler(async (event) => {
  const origin = useRuntimeConfig(event).public.siteUrl || getRequestURL(event).origin
  const articles = await queryCollection(event, 'writing')
    .where('draft', '=', false)
    .order('date', 'DESC')
    .all()
  const escape = (text: string) =>
    text.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;')
  setHeader(event, 'content-type', 'application/rss+xml; charset=utf-8')
  return `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom"><channel><title>${escape(siteIdentity.feedTitle)}</title><link>${escape(origin)}</link><description>前端、工程化与 AI 的实践笔记。</description><language>zh-CN</language><atom:link href="${escape(new URL('/rss.xml', origin).href)}" rel="self" type="application/rss+xml"/>${articles.map((article) => `<item><title>${escape(article.title)}</title><link>${escape(new URL(article.path, origin).href)}</link><guid isPermaLink="true">${escape(new URL(article.path, origin).href)}</guid><pubDate>${new Date(`${article.date}T00:00:00+08:00`).toUTCString()}</pubDate><description>${escape(article.description)}</description>${article.tags.map((tag) => `<category>${escape(tag)}</category>`).join('')}</item>`).join('')}</channel></rss>`
})
