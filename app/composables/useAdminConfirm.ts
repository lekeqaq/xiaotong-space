interface AdminConfirmOptions {
  title: string
  message: string
  confirmLabel?: string
  danger?: boolean
}
let resolvePending: ((confirmed: boolean) => void) | undefined

export function useAdminConfirm() {
  const pending = useState<AdminConfirmOptions | null>('admin-confirmation', () => null)
  function finish(confirmed: boolean) {
    pending.value = null
    resolvePending?.(confirmed)
    resolvePending = undefined
  }
  function confirm(options: AdminConfirmOptions) {
    if (!import.meta.client) return Promise.resolve(false)
    finish(false)
    pending.value = options
    return new Promise<boolean>((resolve) => {
      resolvePending = resolve
    })
  }
  return { pending, confirm, finish }
}
