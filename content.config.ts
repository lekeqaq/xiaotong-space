import { defineCollection, defineContentConfig, z } from '@nuxt/content'

export default defineContentConfig({
  collections: {
    projects: defineCollection({
      type: 'page',
      source: 'projects/*.md',
      schema: z.object({
        title: z.string(),
        subtitle: z.string().optional(),
        description: z.string(),
        cardSummary: z.string(),
        previewCaption: z.string(),
        showcase: z.object({
          label: z.string(),
          heading: z.string(),
          focus: z.array(z.string()),
          footnote: z.string(),
        }),
        workbench: z
          .object({
            heading: z.string(),
            summary: z.string(),
            caption: z.string(),
          })
          .optional(),
        year: z.number(),
        cover: z.string(),
        screenshots: z.array(z.string()).optional(),
        tech: z.array(z.string()),
        featured: z.boolean(),
        status: z.enum(['live', 'building', 'archived']),
        demo: z.string().url().optional(),
        repository: z.string().url().optional(),
        order: z.number(),
        kind: z.enum(['travel', 'human']),
      }),
    }),
  },
})
