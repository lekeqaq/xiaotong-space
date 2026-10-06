import { defineCollection, defineContentConfig, z } from '@nuxt/content'

export default defineContentConfig({
  collections: {
    writing: defineCollection({
      type: 'page',
      source: 'writing/*.md',
      schema: z.object({
        title: z.string(),
        description: z.string(),
        date: z.string(),
        updated: z.string().optional(),
        cover: z.string(),
        tags: z.array(z.string()),
        category: z.string(),
        draft: z.boolean().default(false),
        featured: z.boolean().default(false),
        readingTime: z.number(),
      }),
    }),
    projects: defineCollection({
      type: 'page',
      source: 'projects/*.md',
      schema: z.object({
        title: z.string(),
        subtitle: z.string().optional(),
        description: z.string(),
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
