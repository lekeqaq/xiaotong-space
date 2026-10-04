import { queryCollection } from '@nuxt/content/server'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  const origin = config.public.siteUrl || getRequestURL(event).origin
  const [projects, articles, lab] = await Promise.all([
    queryCollection(event, 'projects').select('path').all(),
    queryCollection(event, 'writing').where('draft', '=', false).select('path', 'date', 'updated').all(),
    queryCollection(event, 'lab').select('path').all(),
  ])
  const escape = (text: string) =>
    text.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('"', '&quot;')
  const staticPaths = ['/', '/projects', '/writing', '/lab', '/about', '/subscribe']
  const items: { path: string; lastmod?: string }[] = [
    ...staticPaths.map((path) => ({ path })),
    ...projects,
    ...lab,
    ...articles.map((article) => ({ path: article.path, lastmod: article.updated || article.date })),
  ]
  setHeader(event, 'content-type', 'application/xml; charset=utf-8')
  return `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${items.map((item) => `<url><loc>${escape(new URL(item.path, origin).href)}</loc>${item.lastmod ? `<lastmod>${escape(item.lastmod)}</lastmod>` : ''}</url>`).join('')}</urlset>`
})
