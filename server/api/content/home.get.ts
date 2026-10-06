import { getHome } from '../../utils/admin-db'
export default defineEventHandler((event) => {
  setHeader(event, 'cache-control', 'no-store')
  return getHome().published
})
