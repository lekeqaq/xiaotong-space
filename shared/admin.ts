import { z } from 'zod'
export type { RenderedArticle } from './content'
export { initialHome } from './home'

export const imagePath = z
  .string()
  .max(300)
  .regex(/^\/(?:images\/[a-zA-Z0-9/_-]+\.(?:jpg|jpeg|png|webp|avif)|media\/[a-f0-9-]+\.webp)$/)
export const articleSchema = z.object({
  slug: z
    .string()
    .min(1)
    .max(100)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, '文章地址只能包含小写英文、数字和连字符'),
  title: z.string().max(150),
  description: z.string().max(500),
  markdown: z.string().max(200_000),
  tags: z.array(z.string().trim().min(1).max(40)).max(20),
  category: z.string().max(60),
  cover: z.union([imagePath, z.literal('')]),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .refine((value) => {
      const date = new Date(value)
      return !isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
    }, '日期无效'),
  featured: z.boolean().default(false),
})
export const homeSchema = z
  .object({
    photos: z
      .array(
        z.object({
          id: z.string().min(1).max(100),
          src: imagePath,
          caption: z.string().trim().min(1).max(80),
          alt: z.string().trim().min(1).max(160),
        }),
      )
      .min(1)
      .max(30),
    thoughts: z
      .array(z.object({ id: z.string().min(1).max(100), text: z.string().trim().min(1).max(100) }))
      .min(1)
      .max(30),
  })
  .refine(
    (value) =>
      new Set(value.photos.map((item) => item.id)).size === value.photos.length &&
      new Set(value.thoughts.map((item) => item.id)).size === value.thoughts.length,
    '内容编号不能重复',
  )
export type ArticleInput = z.infer<typeof articleSchema>
export type HomeInput = z.infer<typeof homeSchema>
export interface Article extends ArticleInput {
  path: string
  readingTime: number
  updated?: string
}
export interface ArticleRecord {
  id: string
  draft: ArticleInput
  published: Article | null
  lockedSlug: string | null
  deletedAt: string | null
  revision: number
  updatedAt: string
}
export interface HomeRecord {
  draft: HomeInput
  published: HomeInput
  revision: number
  updatedAt: string
}
export interface Revision {
  id: number
  action: string
  createdAt: string
}
export interface MediaItem {
  id: string
  src: string
  name: string
  width: number
  height: number
  size: number
  builtin: boolean
  references: string[]
}
export function readingTime(markdown: string) {
  return Math.max(
    1,
    Math.ceil(
      (markdown.match(/[\u3400-\u9fff]/g) || []).length / 400 +
        (markdown.match(/[a-zA-Z0-9]+/g) || []).length / 200,
    ),
  )
}
export function shanghaiDate() {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date())
}
