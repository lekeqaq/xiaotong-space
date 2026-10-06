export default defineEventHandler((event) => {
  const origin = useRuntimeConfig(event).public.siteUrl || getRequestURL(event).origin
  setHeader(event, 'content-type', 'text/plain; charset=utf-8')
  return `User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /api/admin/\nSitemap: ${new URL('/sitemap.xml', origin).href}\n`
})
