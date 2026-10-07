import type { WritingSummary } from '#shared/content'

export async function useWritingSummaries() {
  const nuxtApp = useNuxtApp()
  // Share concurrent readers and the SSR hydration payload. New page visits fetch
  // the current publication state; there is no persistent or timed browser cache.
  const feed = useFetch<WritingSummary[]>('/api/content/articles', {
    key: 'writing-summaries',
    timeout: 8000,
    retry: 0,
    dedupe: 'defer',
  })
  // During a page transition the old page is still mounted, so Nuxt can retain
  // its successful data. Explicitly refresh on client visits, sharing in-flight work.
  if (import.meta.client && !nuxtApp.isHydrating) await feed.refresh({ dedupe: 'defer' })
  return feed
}
