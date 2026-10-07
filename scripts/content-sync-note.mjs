import { existsSync, mkdirSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import Database from 'better-sqlite3'

// Replace only known obsolete explanations; preserve all other authored content.
const replacements = [
  [
    '这里记录知识库的设计思路。本站已经用 Nuxt Content 管理项目与文章；检索、向量索引和模型问答仍处于规划阶段，接入方案需要继续验证。',
    '这里记录知识库的设计思路。截至 2026 年 10 月，本站用 Nuxt Content 管理项目手记，技术文章则通过公开接口读取已发布快照。检索、向量索引和模型问答仍处于规划阶段，接入方案需要继续验证。',
  ],
  [
    '文章与项目使用 Markdown 维护，在 frontmatter 中定义标题、日期、标签和描述。Nuxt Content 的集合 schema 在构建时校验这些字段，也为页面查询提供类型。',
    '项目手记维护在仓库的 Markdown 文件中，通过 Nuxt Content 在构建时校验和读取。技术文章同样以 Markdown 表达正文，但草稿与发布版本分开保存；公开页面只读取已发布快照，服务端解析正文并生成目录和代码高亮。仓库中的文章文件用于初始化内容，不代表运行时文章的唯一来源。',
  ],
  [
    '我选择继续用 Markdown 与 Git 维护内容，是因为文章、项目字段和代码可以一起审阅。代价是发布内容需要重新构建，暂时没有浏览器里的编辑与即时发布能力。对于当前规模，这个取舍让内容来源和更新过程更容易追踪。',
    '早期方案把所有内容放在 Markdown 与 Git 中，发布时需要重新构建。现在文章已经支持浏览器编辑与即时发布：发布会生成独立快照，保存草稿不会改变公开页面；项目手记仍随构建更新。这两条更新路径需要分别记录，不能把早期的静态方案当作当前实现。\n\n公开文章接口每次读取当前发布状态，不使用持久化的浏览器缓存。服务端仅按正文版本复用 Markdown 解析结果；使用解析缓存之前仍检查文章是否已发布。因此修改后重新发布会使用新版本，撤回后下一次读取返回 404，RSS 和 sitemap 也不再包含该文章。已经打开的页面会在重新访问或刷新后更新。',
  ],
]
function correctMarkdown(markdown) {
  for (const [old, corrected] of replacements) markdown = markdown.replace(old, corrected)
  return markdown.replace(
    /const \{ data: articles \} = await useAsyncData\('writing', \(\) =>\s*queryCollection\('writing'\)\.where\('draft', '=', false\)\.order\('date', 'DESC'\)\.all\(\),?\s*\)/,
    '// 当前站点只请求公开摘要，阅读时再请求已发布正文。\nconst { data: articles } = await useWritingSummaries()',
  )
}
const directory = resolve(process.env.NUXT_ADMIN_DATA_DIR || '.data/admin')
const file = resolve(directory, 'content.sqlite')
if (!existsSync(file)) {
  console.log('没有现有内容数据库；新站会直接使用已修正的初始化文章。')
  process.exit(0)
}
const seed = JSON.parse(readFileSync(new URL('../server/assets/admin-seed.json', import.meta.url), 'utf8'))
const corrected = seed.articles.find((item) => item.slug === 'building-personal-ai')
const db = new Database(file)
try {
  const row = db.prepare('SELECT * FROM articles WHERE slug = ?').get(corrected.slug)
  const matches = (raw) => raw && correctMarkdown(JSON.parse(raw).markdown) !== JSON.parse(raw).markdown
  if (!row || (!matches(row.draft) && !matches(row.published))) {
    console.log('文章已修改、已修正或不存在，保留现有内容。')
  } else {
    const backups = resolve(directory, 'content-backups')
    mkdirSync(backups, { recursive: true, mode: 0o700 })
    const now = new Date().toISOString()
    const backup = resolve(backups, `before-note-fix-${now.replaceAll(':', '-')}.sqlite`)
    await db.backup(backup)
    db.transaction(() => {
      const current = db.prepare('SELECT * FROM articles WHERE id = ?').get(row.id)
      if (!current || current.revision !== row.revision) throw new Error('文章已更新，未写入；请重新运行。')
      const update = (raw, published) => {
        if (!matches(raw)) return raw
        const article = JSON.parse(raw)
        if (published)
          db.prepare(
            'INSERT INTO history (kind, target, action, data, created_at) VALUES (?, ?, ?, ?, ?)',
          ).run('article', row.id, '修正架构说明前', raw, now)
        article.markdown = correctMarkdown(article.markdown)
        if (published) {
          article.updated = corrected.updated
          article.readingTime = Math.max(
            1,
            Math.ceil(
              (article.markdown.match(/[\u3400-\u9fff]/g) || []).length / 400 +
                (article.markdown.match(/[a-zA-Z0-9]+/g) || []).length / 200,
            ),
          )
          db.prepare(
            'INSERT INTO history (kind, target, action, data, created_at) VALUES (?, ?, ?, ?, ?)',
          ).run('article', row.id, '修正架构说明', JSON.stringify(article), now)
        }
        return JSON.stringify(article)
      }
      db.prepare(
        'UPDATE articles SET draft = ?, published = ?, revision = revision + 1, updated_at = ? WHERE id = ?',
      ).run(update(current.draft, false), update(current.published, true), now, row.id)
    })()
    console.log(`旧架构说明已修正，其他内容已保留。数据库备份：${backup}`)
  }
} finally {
  db.close()
}
