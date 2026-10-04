import { siteIdentity } from './shared/site'

export default defineNuxtConfig({
  compatibilityDate: '2026-10-03',
  devtools: { enabled: false },
  modules: ['@nuxt/ui', '@nuxt/content', '@nuxt/image', '@nuxt/eslint'],
  features: { inlineStyles: true },
  components: [{ path: '~/components', pathPrefix: false }],
  typescript: { strict: true },
  ui: {
    fonts: false,
    theme: { colors: ['primary'] },
    experimental: { componentDetection: true },
  },
  colorMode: { preference: 'system', fallback: 'light', classSuffix: '' },
  image: { format: ['webp'], quality: 80 },
  routeRules: {
    '/_ipx/**': { headers: { 'cache-control': 'public, max-age=31536000, immutable' } },
    '/images/**': { headers: { 'cache-control': 'public, max-age=604800' } },
  },
  content: {
    build: {
      markdown: {
        highlight: {
          theme: { default: 'github-light', dark: 'github-dark' },
          langs: ['ts', 'vue', 'python', 'bash', 'json'],
        },
      },
    },
  },
  app: {
    head: {
      htmlAttrs: { lang: 'zh-CN' },
      titleTemplate: `%s · ${siteIdentity.name}`,
      link: [{ rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg?v=2' }],
    },
    pageTransition: { name: 'page', mode: 'out-in' },
  },
  runtimeConfig: { public: { siteUrl: '', githubUrl: '', contactEmail: '' } },
  nitro: {
    compressPublicAssets: true,
    prerender: {
      crawlLinks: true,
      routes: [
        '/',
        '/projects',
        '/writing',
        '/lab',
        '/about',
        '/subscribe',
        '/sitemap.xml',
        '/rss.xml',
        '/robots.txt',
      ],
    },
  },
})
