import { publishedArticles } from '../../../utils/admin-db'
import { renderArticle } from '../../../utils/admin-markdown'
export default defineEventHandler(async (event) => {
  setHeader(event, 'cache-control', 'no-store')
  const article = publishedArticles().find((item) => item.slug === getRouterParam(event, 'slug'))
  if (!article) throw createError({ statusCode: 404, statusMessage: 'Article not found' })
  return renderArticle(article)
})
