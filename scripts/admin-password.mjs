import { randomBytes, scryptSync } from 'node:crypto'
import { readFile, writeFile, chmod } from 'node:fs/promises'
import { emitKeypressEvents } from 'node:readline'

if (!process.stdin.isTTY) {
  console.error('请在交互式终端运行 pnpm admin:password，密码不会回显。')
  process.exit(1)
}
function hiddenInput(prompt) {
  process.stdout.write(prompt)
  emitKeypressEvents(process.stdin)
  process.stdin.setRawMode(true)
  process.stdin.resume()
  return new Promise((resolve, reject) => {
    let value = ''
    function cleanup() {
      process.stdin.off('keypress', onKey)
      process.stdin.setRawMode(false)
      process.stdin.pause()
      process.stdout.write('\n')
    }
    function onKey(text, key = {}) {
      if (key.ctrl && key.name === 'c') {
        cleanup()
        reject(new Error('已取消'))
        return
      }
      if (key.name === 'return') {
        cleanup()
        resolve(value)
        return
      }
      if (key.name === 'backspace') {
        value = value.slice(0, -1)
        return
      }
      if (text && !key.ctrl && !key.meta) value += text
    }
    process.stdin.on('keypress', onKey)
  })
}
try {
  const password = await hiddenInput('管理员密码（至少 8 字符）：')
  if (password.length < 8 || password.length > 12) throw new Error('密码长度需要为 8–12 个字符')
  const confirmation = await hiddenInput('再次输入密码：')
  if (password !== confirmation) throw new Error('两次输入的密码不一致')
  const salt = randomBytes(16).toString('hex')
  const hash = `scrypt:${salt}:${scryptSync(password, salt, 64).toString('hex')}`
  if (process.argv.includes('--print-hash')) console.log(hash)
  else {
    let env = ''
    try {
      env = await readFile('.env', 'utf8')
    } catch (error) {
      if (error.code !== 'ENOENT') throw error
    }
    env = env.replace(/^NUXT_ADMIN_PASSWORD_HASH=.*\r?\n?/gm, '').trimEnd()
    if (!/^NUXT_ADMIN_USERNAME=/m.test(env)) env += '\nNUXT_ADMIN_USERNAME=admin'
    env += `\nNUXT_ADMIN_PASSWORD_HASH=${hash}\n`
    await writeFile('.env', env.trimStart(), { mode: 0o600 })
    await chmod('.env', 0o600)
    console.log('管理员密码哈希已写入 .env，账号默认 admin。重启服务后访问 /admin。')
  }
} catch (error) {
  console.error(error.message)
  process.exitCode = 1
}
