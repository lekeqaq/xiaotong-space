export type AdminToastKind = 'success' | 'error' | 'info' | 'warning'
export interface AdminToastMessage {
  id: string
  message: string
  kind: AdminToastKind
}

export function useAdminToast() {
  const messages = useState<AdminToastMessage[]>('admin-notifications', () => [])
  function dismiss(id: string) {
    messages.value = messages.value.filter((item) => item.id !== id)
  }
  function notify(message: string, kind: AdminToastKind = 'success') {
    messages.value = [
      ...messages.value.filter((item) => item.message !== message),
      { id: crypto.randomUUID(), message, kind },
    ].slice(-3)
  }
  return { messages, notify, dismiss }
}
