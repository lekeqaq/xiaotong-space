import type { ProjectsCollectionItem } from '@nuxt/content'
export type Project = ProjectsCollectionItem
export type Writing = import('#shared/admin').RenderedArticle

export type ProjectSummary = Pick<
  Project,
  | 'path'
  | 'title'
  | 'subtitle'
  | 'description'
  | 'cardSummary'
  | 'previewCaption'
  | 'showcase'
  | 'workbench'
  | 'year'
  | 'cover'
  | 'tech'
  | 'featured'
  | 'status'
  | 'order'
  | 'kind'
>
export type WritingSummary = Pick<
  Writing,
  'path' | 'title' | 'description' | 'date' | 'cover' | 'tags' | 'category' | 'readingTime'
>
