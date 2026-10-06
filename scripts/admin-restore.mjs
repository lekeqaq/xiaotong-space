import { mkdtemp, readFile, rename, rm, mkdir, access } from 'node:fs/promises'
import { resolve, dirname } from 'node:path'
import { t, x } from 'tar'
import Database from 'better-sqlite3'

const archive = process.argv[2]
const directoryFlag = process.argv.indexOf('--data-dir')
const dataDir = resolve(
  directoryFlag >= 0 ? process.argv[directoryFlag + 1] : process.env.NUXT_ADMIN_DATA_DIR || '.data/admin',
)
if (!archive || archive.startsWith('--') || !process.argv.includes('--server-stopped')) {
  console.error(
    '先停止 Nuxt 服务，再运行：pnpm admin:restore /path/backup.tar.gz --server-stopped [--data-dir /persistent/admin]',
  )
  process.exit(1)
}
await mkdir(dirname(dataDir), { recursive: true })
const temporary = await mkdtemp(resolve(dirname(dataDir), '.admin-restore-'))
try {
  await t({
    file: resolve(archive),
    onReadEntry: (entry) => {
      const path = entry.path.replace(/\/$/, '')
      if (
        !['File', 'Directory'].includes(entry.type) ||
        !/^(content\.sqlite|manifest\.json|uploads(?:\/[a-f0-9-]{36}\.webp)?)$/.test(path)
      )
        throw new Error('备份包含不支持的路径或文件类型')
    },
  })
  await x({ file: resolve(archive), cwd: temporary, strict: true, preservePaths: false })
  const manifest = JSON.parse(await readFile(resolve(temporary, 'manifest.json'), 'utf8'))
  if (manifest.format !== 1) throw new Error('备份格式不支持')
  const db = new Database(resolve(temporary, 'content.sqlite'), { fileMustExist: true })
  try {
    if (db.pragma('integrity_check', { simple: true }) !== 'ok') throw new Error('数据库完整性检查失败')
    db.prepare('SELECT id, draft, published, revision FROM home').get()
    db.prepare('SELECT id, draft, published, revision FROM articles').all()
    const media = db.prepare('SELECT id FROM media').all()
    for (const item of media) await access(resolve(temporary, 'uploads', `${item.id}.webp`))
    db.exec('DELETE FROM sessions; DELETE FROM login_limits;')
  } finally {
    db.close()
  }
  await rm(resolve(temporary, 'manifest.json'))
  const previous = `${dataDir}.before-restore-${Date.now()}`
  let hasPrevious = false
  try {
    await rename(dataDir, previous)
    hasPrevious = true
  } catch (error) {
    if (error.code !== 'ENOENT') throw error
  }
  try {
    await rename(temporary, dataDir)
  } catch (error) {
    if (hasPrevious) await rename(previous, dataDir)
    throw error
  }
  console.log(
    `备份已恢复到 ${dataDir}。${hasPrevious ? `原数据保留在 ${previous}。` : ''}可以重新启动 Nuxt。`,
  )
} catch (error) {
  console.error(`恢复失败：${error.message}`)
  process.exitCode = 1
} finally {
  await rm(temporary, { recursive: true, force: true })
}
