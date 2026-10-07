import type { MDCRoot, Toc } from '@nuxtjs/mdc'

/** Public content contracts contain no validation or management runtime. */
export interface WritingSummary {
  path: string
  title: string
  description: string
  date: string
  cover: string
  tags: string[]
  category: string
  readingTime: number
}

export interface PublicArticle extends WritingSummary {
  slug: string
  markdown: string
  featured: boolean
  updated?: string
}

export interface RenderedArticle extends PublicArticle {
  body: MDCRoot & { toc: Toc }
}

export interface HomeContent {
  photos: Array<{ id: string; src: string; caption: string; alt: string }>
  thoughts: Array<{ id: string; text: string }>
}
