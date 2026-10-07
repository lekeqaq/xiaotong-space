import { siteIdentity } from './shared/site'
import { fileURLToPath } from 'node:url'

export default defineNuxtConfig({
  compatibilityDate: '2026-10-03',
  devtools: { enabled: false },
  modules: ['./modules/admin-vuetify', '@nuxt/ui', '@nuxt/content', '@nuxt/image', '@nuxt/eslint'],
  // Import shared CSS directly, outside Vue's external SFC style descriptor cache.
  css: ['~/assets/css/main.css', '~/assets/css/motion.css'],
  features: { inlineStyles: true },
  build: { transpile: ['vuetify'] },
  components: [{ path: '~/components', pathPrefix: false }],
  typescript: { strict: true },
  ui: {
    fonts: false,
    theme: { colors: ['primary'] },
    experimental: { componentDetection: true },
  },
  colorMode: { preference: 'system', fallback: 'light', classSuffix: '' },
  image: { format: ['webp'], quality: 80 },
  hooks: {
    'build:manifest': (manifest) => {
      // Nuxt's entry references every layout and middleware. Its SSR prefetch
      // hints otherwise fetch the admin layout on public pages as well.
      const isAdmin = (key: string) =>
        /(?:^|\/)(?:pages|layouts|middleware|components)\/admin(?:\/|\.|$)/i.test(key)
      const collect = (roots: string[]) => {
        const found = new Set<string>()
        const visit = (key: string) => {
          if (found.has(key)) return
          found.add(key)
          const chunk = manifest[key]
          for (const dependency of [
            ...(chunk?.imports || []),
            ...(chunk?.css || []),
            ...(chunk?.assets || []),
          ])
            visit(dependency)
        }
        roots.forEach(visit)
        return found
      }
      const entries = Object.entries(manifest)
      const publicResources = collect(
        entries
          .filter(([key, chunk]) => !isAdmin(key) && (chunk.isEntry || chunk.isDynamicEntry))
          .map(([key]) => key),
      )
      const adminResources = collect(entries.filter(([key]) => isAdmin(key)).map(([key]) => key))
      for (const key of adminResources) {
        if (!publicResources.has(key) && manifest[key]) manifest[key].prefetch = false
      }
    },
  },
  routeRules: {
    '/': { prerender: false, headers: { 'cache-control': 'no-store' } },
    '/writing': { prerender: false, headers: { 'cache-control': 'no-store' } },
    '/writing/**': { prerender: false, headers: { 'cache-control': 'no-store' } },
    '/rss.xml': { prerender: false, headers: { 'cache-control': 'no-store' } },
    '/sitemap.xml': { prerender: false, headers: { 'cache-control': 'no-store' } },
    '/admin/**': {
      prerender: false,
      headers: { 'cache-control': 'no-store', 'x-robots-tag': 'noindex, nofollow' },
    },
    '/api/**': { prerender: false },
    '/subscribe': { redirect: { to: '/writing', statusCode: 301 } },
    '/lab': { redirect: { to: '/writing', statusCode: 301 } },
    '/lab/**': { redirect: { to: '/writing', statusCode: 301 } },
    '/projects/personal-assistant': { redirect: { to: '/projects', statusCode: 301 } },
    '/_ipx/**': { headers: { 'cache-control': 'public, max-age=31536000, immutable' } },
    '/images/**': { headers: { 'cache-control': 'public, max-age=604800' } },
  },
  // Runtime Markdown previews need the MDC highlighter endpoint (Content otherwise disables it).
  mdc: {
    highlight: {
      noApiRoute: false,
      theme: { light: 'github-light', default: 'github-light', dark: 'github-dark-default' },
    },
  },
  content: {
    build: {
      markdown: {
        highlight: {
          theme: { light: 'github-light', default: 'github-light', dark: 'github-dark-default' },
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
  runtimeConfig: {
    adminUsername: 'admin',
    adminPasswordHash: '',
    adminDataDir: '.data/admin',
    public: { siteUrl: '', githubUrl: siteIdentity.githubUrl, contactEmail: '' },
  },
  nitro: {
    // Serve the editor's runtime assets locally, including during development.
    publicAssets: ['js', 'css', 'images'].map((directory) => ({
      dir: fileURLToPath(new URL(`./node_modules/vditor/dist/${directory}`, import.meta.url)),
      baseURL: `/vendor/vditor/dist/${directory}`,
      maxAge: 604800,
    })),
    compressPublicAssets: true,
    prerender: {
      crawlLinks: true,
      routes: ['/projects', '/about', '/robots.txt'],
      ignore: ['/', '/writing', '/writing/**', '/admin', '/admin/**', '/api/**', '/rss.xml', '/sitemap.xml'],
    },
  },
})
