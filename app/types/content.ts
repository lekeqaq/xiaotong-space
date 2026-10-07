import type { ProjectsCollectionItem } from '@nuxt/content'
export type Project = ProjectsCollectionItem
export type Writing = import('#shared/content').RenderedArticle
export type { WritingSummary } from '#shared/content'

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
