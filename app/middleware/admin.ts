export default defineNuxtRouteMiddleware(async (to) => {
  const session = await useRequestFetch()<{ authenticated: boolean }>('/api/admin/session')
  if (!session.authenticated) return navigateTo({ path: '/admin/login', query: { next: to.fullPath } })
})
