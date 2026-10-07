import { queryCollection } from '@nuxt/content/server'

// Query Markdown on the server so navigation never initializes SQLite/WASM in the browser.
export default defineEventHandler((event) =>
  queryCollection(event, 'projects')
    .select(
      'path',
      'title',
      'subtitle',
      'description',
      'cardSummary',
      'previewCaption',
      'showcase',
      'workbench',
      'year',
      'cover',
      'tech',
      'featured',
      'status',
      'order',
      'kind',
    )
    .order('order', 'ASC')
    .all(),
)
