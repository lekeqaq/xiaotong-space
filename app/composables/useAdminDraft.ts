export function useAdminDraft<R extends { draft: unknown; revision: number }>(initial: R, endpoint: string) {
  type T = R['draft']
  const api = useAdminApi()
  const { confirm } = useAdminConfirm()
  const record = ref(initial) as Ref<R>
  const draft = ref(JSON.parse(JSON.stringify(initial.draft))) as Ref<T>
  const saved = ref(JSON.stringify(initial.draft))
  const dirty = computed(() => JSON.stringify(draft.value) !== saved.value)
  const saving = ref(false)
  const error = ref('')
  const conflict = ref(false)
  const savedAt = ref('')
  let timer: ReturnType<typeof setTimeout> | undefined
  let active: Promise<void> | undefined
  async function save() {
    if (active) await active
    if (!dirty.value) return
    if (conflict.value) throw new Error(error.value)
    active = (async () => {
      saving.value = true
      try {
        while (dirty.value) {
          const snapshot = JSON.parse(JSON.stringify(draft.value)) as T
          const result = await api<R>(endpoint, {
            method: 'PUT',
            body: { draft: snapshot, revision: record.value.revision },
          })
          record.value = result
          saved.value = JSON.stringify(snapshot)
          error.value = ''
          savedAt.value = new Intl.DateTimeFormat('zh-CN', {
            timeZone: 'Asia/Shanghai',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          }).format(new Date())
        }
      } catch (e) {
        error.value = adminError(e)
        conflict.value = (e as { statusCode?: number }).statusCode === 409
        throw e
      } finally {
        saving.value = false
      }
    })()
    try {
      await active
    } finally {
      active = undefined
    }
  }
  function reset(value: R) {
    record.value = value
    draft.value = JSON.parse(JSON.stringify(value.draft))
    saved.value = JSON.stringify(value.draft)
    error.value = ''
    conflict.value = false
  }
  watch(
    draft,
    () => {
      clearTimeout(timer)
      if (!conflict.value)
        timer = setTimeout(() => {
          void save().catch(() => {})
        }, 1500)
    },
    { deep: true },
  )
  function beforeUnload(event: BeforeUnloadEvent) {
    if (dirty.value) {
      event.preventDefault()
      event.returnValue = ''
    }
  }
  onMounted(() => window.addEventListener('beforeunload', beforeUnload))
  onBeforeUnmount(() => {
    clearTimeout(timer)
    window.removeEventListener('beforeunload', beforeUnload)
  })
  onBeforeRouteLeave(async () => {
    if (
      dirty.value &&
      !(await confirm({
        title: '离开编辑页面',
        message: '仍有未保存的修改，离开会丢失这些内容。',
        confirmLabel: '放弃修改并离开',
        danger: true,
      }))
    )
      return false
  })
  const status = computed(() =>
    conflict.value
      ? '存在版本冲突'
      : error.value
        ? '保存失败'
        : saving.value
          ? '保存中…'
          : dirty.value
            ? '待保存'
            : savedAt.value
              ? `已保存 · ${savedAt.value}`
              : '已保存',
  )
  return { record, draft, dirty, saving, error, conflict, status, save, reset }
}
