import { mediaFile } from '../../utils/admin-media'
export default defineEventHandler(async (event) => {
  const file = await mediaFile(getRouterParam(event, 'name') || '')
  setHeader(event, 'content-type', 'image/webp')
  setHeader(event, 'cache-control', 'public, max-age=31536000, immutable')
  setHeader(event, 'x-content-type-options', 'nosniff')
  return file
})
