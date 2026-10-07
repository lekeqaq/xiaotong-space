import { writingSummaries } from '../../utils/public-content'
export default defineEventHandler((event) => {
  setHeader(event, 'cache-control', 'no-store')
  return writingSummaries()
})
