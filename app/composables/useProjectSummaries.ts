import type { ProjectSummary } from '~/types/content'

export function useProjectSummaries() {
  return useAsyncData('project-summaries', () => $fetch<ProjectSummary[]>('/api/content/projects'), {
    // Projects are build-time content. Reuse the home payload throughout this visit,
    // including after navigating through pages that do not display projects.
    getCachedData: (key, nuxtApp, { cause }) =>
      cause === 'refresh:manual' || cause === 'refresh:hook'
        ? undefined
        : (nuxtApp.payload.data[key] ?? nuxtApp.static.data[key]),
  })
}
