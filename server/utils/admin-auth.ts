import { createHash, randomBytes, scryptSync, timingSafeEqual } from 'node:crypto'
import type { H3Event } from 'h3'
import { adminDb } from './admin-db'

const cookieName = 'xiaotong_admin'
const digest = (token: string) => createHash('sha256').update(token).digest('hex')
export function configured() {
  return Boolean(useRuntimeConfig().adminPasswordHash)
}
export function requireAdmin(event: H3Event) {
  const token = getCookie(event, cookieName)
  const session =
    token &&
    (adminDb().prepare('SELECT expires_at FROM sessions WHERE token_hash = ?').get(digest(token)) as
      { expires_at: number } | undefined)
  if (!session || session.expires_at <= Date.now())
    throw createError({ statusCode: 401, statusMessage: '请先登录后台' })
}
export function checkAdminOrigin(event: H3Event) {
  const expected = useRuntimeConfig(event).public.siteUrl || getRequestURL(event).origin
  if (getHeader(event, 'origin') !== new URL(expected).origin || getHeader(event, 'x-admin-request') !== '1')
    throw createError({ statusCode: 403, statusMessage: '请求来源无效' })
}
export async function login(event: H3Event) {
  if (!configured())
    throw createError({ statusCode: 503, statusMessage: '管理员尚未配置，请运行 pnpm admin:password' })
  const ip = getRequestIP(event) || 'unknown'
  const db = adminDb()
  db.prepare('DELETE FROM login_limits WHERE expires_at < ?').run(Date.now())
  const limit = db.prepare('SELECT attempts FROM login_limits WHERE ip = ?').get(ip) as
    { attempts: number } | undefined
  if ((limit?.attempts || 0) >= 5) {
    setHeader(event, 'retry-after', 900)
    throw createError({ statusCode: 429, statusMessage: '尝试次数过多，请 15 分钟后再试' })
  }
  const body = await readBody(event)
  const config = useRuntimeConfig(event)
  const [algorithm, salt, hash] = String(config.adminPasswordHash).split(':')
  if (algorithm !== 'scrypt' || !/^[a-f0-9]{32}$/.test(salt || '') || !/^[a-f0-9]{128}$/.test(hash || ''))
    throw createError({ statusCode: 503, statusMessage: '管理员密码配置无效' })
  const password = typeof body?.password === 'string' && body.password.length <= 200 ? body.password : ''
  const actual = scryptSync(password, salt!, 64)
  const valid = timingSafeEqual(actual, Buffer.from(hash!, 'hex')) && body?.username === config.adminUsername
  if (!valid) {
    db.prepare(
      'INSERT INTO login_limits (ip, attempts, expires_at) VALUES (?, 1, ?) ON CONFLICT(ip) DO UPDATE SET attempts = attempts + 1',
    ).run(ip, Date.now() + 900_000)
    throw createError({ statusCode: 401, statusMessage: '账号或密码不正确' })
  }
  db.prepare('DELETE FROM login_limits WHERE ip = ?').run(ip)
  db.prepare('DELETE FROM sessions WHERE expires_at < ?').run(Date.now())
  const previous = getCookie(event, cookieName)
  if (previous) db.prepare('DELETE FROM sessions WHERE token_hash = ?').run(digest(previous))
  const token = randomBytes(32).toString('hex')
  db.prepare('INSERT INTO sessions (token_hash, expires_at) VALUES (?, ?)').run(
    digest(token),
    Date.now() + 12 * 3600_000,
  )
  setCookie(event, cookieName, token, {
    httpOnly: true,
    secure: new URL(config.public.siteUrl || getRequestURL(event).origin).protocol === 'https:',
    sameSite: 'strict',
    path: '/',
    maxAge: 12 * 3600,
  })
  return { authenticated: true }
}
export function logout(event: H3Event) {
  const token = getCookie(event, cookieName)
  if (token) adminDb().prepare('DELETE FROM sessions WHERE token_hash = ?').run(digest(token))
  deleteCookie(event, cookieName, { path: '/' })
  return { authenticated: false }
}
