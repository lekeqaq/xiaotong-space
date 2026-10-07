import { queryCollection } from '@nuxt/content/server'

export default defineEventHandler(async (event) => {
  const project = await queryCollection(event, 'projects')
    .path(`/projects/${getRouterParam(event, 'slug')}`)
    .first()
  if (!project) throw createError({ statusCode: 404, statusMessage: 'Project not found' })
  return project
})
