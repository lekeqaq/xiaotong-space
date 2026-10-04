import type { ProjectsCollectionItem, WritingCollectionItem, LabCollectionItem } from '@nuxt/content'
export type Project = ProjectsCollectionItem
export type Writing = WritingCollectionItem
export type Experiment = LabCollectionItem

export type ProjectSummary = Pick<
  Project,
  | 'path'
  | 'title'
  | 'subtitle'
  | 'description'
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
export type ExperimentSummary = Pick<
  Experiment,
  'path' | 'experiment' | 'title' | 'description' | 'status' | 'tech' | 'order' | 'icon'
>
