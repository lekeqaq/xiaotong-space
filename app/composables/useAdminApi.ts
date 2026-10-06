import type { NitroFetchOptions, NitroFetchRequest } from 'nitropack'
export function adminError(error: unknown) {
  const value = error as { data?: { statusMessage?: string; message?: string }; message?: string }
  return value.data?.statusMessage || value.data?.message || value.message || '操作失败，请重试'
}
export function useAdminApi() {
  const requestFetch = useRequestFetch()
  return <T>(path: string, options: NitroFetchOptions<NitroFetchRequest> = {}) =>
    requestFetch<T>(`/api/admin/${path}`, {
      ...options,
      headers: { ...options.headers, 'x-admin-request': '1' },
    }) as Promise<T>
}
