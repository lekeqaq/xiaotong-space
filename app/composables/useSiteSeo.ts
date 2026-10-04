import { siteIdentity } from '#shared/site'

export function useSiteSeo(
  title: string | Ref<string>,
  description: string | Ref<string>,
  image = '/og/default.png',
) {
  const route = useRoute()
  const config = useRuntimeConfig()
  const origin = config.public.siteUrl || useRequestURL().origin
  const url = computed(() => new URL(route.path, origin).href)
  useSeoMeta({
    title,
    description,
    ogTitle: title,
    ogDescription: description,
    ogImage: new URL(image, origin).href,
    ogUrl: url,
    twitterCard: 'summary_large_image',
  })
  useHead({
    link: [
      { rel: 'canonical', href: url },
      { rel: 'alternate', type: 'application/rss+xml', title: siteIdentity.feedTitle, href: '/rss.xml' },
    ],
  })
}
