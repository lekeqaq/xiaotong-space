import { publishedArticles } from '../../utils/admin-db'
export default defineEventHandler((event) => {
  setHeader(event, 'cache-control', 'no-store')
  return publishedArticles().map(({ markdown: _markdown, ...article }) => article)
})
