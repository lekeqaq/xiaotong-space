import { publicArticles, renderPublicArticle } from '../../../utils/public-content'
export default defineEventHandler(async (event) => {
  setHeader(event, 'cache-control', 'no-store')
  const article = publicArticles().find((item) => item.slug === getRouterParam(event, 'slug'))
  if (!article) throw createError({ statusCode: 404, statusMessage: 'Article not found' })
  return renderPublicArticle(article)
})
