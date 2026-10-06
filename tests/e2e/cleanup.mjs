import { rm } from 'node:fs/promises'
export default async function cleanup() {
  if (process.env.XIAOTONG_TEST_ADMIN_DIR)
    await rm(process.env.XIAOTONG_TEST_ADMIN_DIR, { recursive: true, force: true })
}
