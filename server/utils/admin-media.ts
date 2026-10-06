import { randomUUID } from 'node:crypto'
import { existsSync, createReadStream } from 'node:fs'
import { readFile, writeFile, rm, mkdtemp, cp } from 'node:fs/promises'
import { basename, resolve } from 'node:path'
import { tmpdir } from 'node:os'
import sharp from 'sharp'
import { c } from 'tar'
import type { H3Event } from 'h3'
import type { MediaItem } from '../../shared/admin'
import {
  adminDb,
  assertWritable,
  builtinImages,
  dataDirectory,
  getHome,
  listArticleRecords,
  setBackupInProgress,
} from './admin-db'

function references(src: string) {
  const refs: string[] = []
  for (const item of listArticleRecords())
    if (JSON.stringify([item.draft, item.published]).includes(src))
      refs.push(`${item.draft.title || '未命名文章'}${item.deletedAt ? '（回收站）' : ''}`)
  if (JSON.stringify(getHome()).includes(src)) refs.push('首页')
  if (adminDb().prepare('SELECT 1 FROM history WHERE instr(data, ?) > 0 LIMIT 1').get(src))
    refs.push('发布历史')
  return refs
}
export function listMedia(): MediaItem[] {
  const rows = adminDb().prepare('SELECT * FROM media ORDER BY created_at DESC').all() as {
    id: string
    name: string
    width: number
    height: number
    size: number
  }[]
  return [
    ...rows.map((row) => ({
      ...row,
      src: `/media/${row.id}.webp`,
      builtin: false,
      references: references(`/media/${row.id}.webp`),
    })),
    ...builtinImages.map((src) => ({
      id: src,
      src,
      name: basename(src),
      width: 0,
      height: 0,
      size: 0,
      builtin: true,
      references: references(src),
    })),
  ]
}
export function ensureImagesExist(value: unknown) {
  const paths = new Set(
    (JSON.stringify(value) || '').match(
      /\/(?:images\/[a-zA-Z0-9/_-]+\.(?:jpg|jpeg|png|webp|avif)|media\/[a-f0-9-]+\.webp)/g,
    ) || [],
  )
  for (const path of paths) {
    if (path.startsWith('/images/') && builtinImages.includes(path)) continue
    if (path.startsWith('/media/')) {
      const id = basename(path, '.webp')
      if (
        adminDb().prepare('SELECT id FROM media WHERE id = ?').get(id) &&
        existsSync(resolve(dataDirectory(), 'uploads', `${id}.webp`))
      )
        continue
    }
    throw createError({ statusCode: 400, statusMessage: `图片不存在：${path}` })
  }
}
export async function uploadMedia(event: H3Event) {
  assertWritable()
  const length = Number(getHeader(event, 'content-length'))
  if (!Number.isFinite(length) || !length)
    throw createError({ statusCode: 411, statusMessage: '请提供文件大小' })
  if (length > 11 * 1024 * 1024) throw createError({ statusCode: 413, statusMessage: '图片不能超过 10 MB' })
  const files = await readMultipartFormData(event)
  const file = files?.find((item) => item.name === 'file')
  if (!file?.filename || !file.data.length || file.data.length > 10 * 1024 * 1024)
    throw createError({ statusCode: 400, statusMessage: '请选择一张不超过 10 MB 的图片' })
  let result
  try {
    const metadata = await sharp(file.data, { limitInputPixels: 40_000_000 }).metadata()
    if (!['jpeg', 'png', 'webp', 'avif', 'heif'].includes(metadata.format || '')) throw new Error('format')
    result = await sharp(file.data, { limitInputPixels: 40_000_000 })
      .rotate()
      .resize({ width: 2560, height: 2560, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 85 })
      .toBuffer({ resolveWithObject: true })
  } catch {
    throw createError({ statusCode: 400, statusMessage: '请上传有效的 JPG、PNG、WebP 或 AVIF 图片' })
  }
  assertWritable()
  const id = randomUUID()
  const target = resolve(dataDirectory(), 'uploads', `${id}.webp`)
  await writeFile(target, result.data, { flag: 'wx' })
  // Recheck after the asynchronous write so a backup cannot include a half-registered upload.
  try {
    assertWritable()
    adminDb()
      .prepare('INSERT INTO media (id, name, width, height, size, created_at) VALUES (?, ?, ?, ?, ?, ?)')
      .run(
        id,
        basename(file.filename).slice(0, 150),
        result.info.width,
        result.info.height,
        result.info.size,
        new Date().toISOString(),
      )
  } catch (error) {
    await rm(target, { force: true })
    throw error
  }
  return listMedia().find((item) => item.id === id)!
}
export async function deleteMedia(id: string) {
  assertWritable()
  if (!/^[a-f0-9-]{36}$/.test(id) || !adminDb().prepare('SELECT id FROM media WHERE id = ?').get(id))
    throw createError({ statusCode: 404, statusMessage: '图片不存在' })
  if (references(`/media/${id}.webp`).length)
    throw createError({ statusCode: 409, statusMessage: '图片仍被草稿、首页或发布历史引用，不能删除' })
  adminDb().prepare('DELETE FROM media WHERE id = ?').run(id)
  await rm(resolve(dataDirectory(), 'uploads', `${id}.webp`), { force: true })
  return { ok: true }
}
export async function downloadBackup(event: H3Event) {
  assertWritable()
  setBackupInProgress(true)
  let temporary: string | undefined
  try {
    temporary = await mkdtemp(resolve(tmpdir(), 'xiaotong-backup-'))
    await adminDb().backup(resolve(temporary, 'content.sqlite'))
    // A portable backup should never carry live login sessions.
    const { default: Database } = await import('better-sqlite3')
    const snapshot = new Database(resolve(temporary, 'content.sqlite'))
    snapshot.exec('DELETE FROM sessions; DELETE FROM login_limits;')
    snapshot.close()
    await cp(resolve(dataDirectory(), 'uploads'), resolve(temporary, 'uploads'), { recursive: true })
    await writeFile(
      resolve(temporary, 'manifest.json'),
      JSON.stringify({ format: 1, createdAt: new Date().toISOString() }),
    )
    await c({ gzip: true, cwd: temporary, file: resolve(temporary, 'backup.tar.gz') }, [
      'content.sqlite',
      'uploads',
      'manifest.json',
    ])
    setBackupInProgress(false)
    setHeader(event, 'content-type', 'application/gzip')
    setHeader(
      event,
      'content-disposition',
      `attachment; filename="xiaotong-backup-${new Date().toISOString().slice(0, 10)}.tar.gz"`,
    )
    const stream = createReadStream(resolve(temporary, 'backup.tar.gz'))
    stream.on('close', () => {
      if (temporary) void rm(temporary, { recursive: true, force: true })
    })
    return sendStream(event, stream)
  } catch (error) {
    setBackupInProgress(false)
    if (temporary) await rm(temporary, { recursive: true, force: true })
    throw error
  }
}
export async function mediaFile(name: string) {
  if (
    !/^[a-f0-9-]{36}\.webp$/.test(name) ||
    !adminDb().prepare('SELECT id FROM media WHERE id = ?').get(name.slice(0, -5))
  )
    throw createError({ statusCode: 404 })
  try {
    return await readFile(resolve(dataDirectory(), 'uploads', name))
  } catch {
    throw createError({ statusCode: 404 })
  }
}
