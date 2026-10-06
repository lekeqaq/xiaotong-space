<script setup lang="ts">
import type { ArticleRecord, HomeRecord, Revision } from '#shared/admin'
const props = defineProps<{ endpoint: string; revision: number }>()
const emit = defineEmits<{ close: []; restored: [record: ArticleRecord | HomeRecord] }>()
const api = useAdminApi()
const { confirm } = useAdminConfirm()
const {
  data: versions,
  status: loadStatus,
  error: loadError,
  refresh,
} = await useAsyncData(`history-${props.endpoint}`, () => api<Revision[]>(`${props.endpoint}/history`))
const error = ref('')
const busy = ref(false)
async function restore(id: number) {
  if (
    !(await confirm({
      title: '恢复历史版本',
      message: '当前草稿将替换为这个版本，线上内容会在再次发布后更新。',
      confirmLabel: '恢复到草稿',
    }))
  )
    return
  busy.value = true
  try {
    const result = await api<ArticleRecord | HomeRecord>(`${props.endpoint}/history`, {
      method: 'POST',
      body: { historyId: id, revision: props.revision },
    })
    emit('restored', result)
  } catch (e) {
    error.value = adminError(e)
  } finally {
    busy.value = false
  }
}
</script>
<template>
  <AdminDialog title="发布历史" @close="emit('close')">
    <VAlert type="info">恢复只更新草稿，预览确认后再发布。</VAlert>
    <VProgressLinear v-if="loadStatus === 'pending'" indeterminate color="primary" />
    <VAlert v-if="error || loadError" type="error" role="alert" class="admin-feedback"
      >{{ error || adminError(loadError)
      }}<VBtn v-if="loadError" size="small" variant="text" @click="refresh()">重试</VBtn></VAlert
    >
    <div class="admin-history-list">
      <div v-for="item in versions" :key="item.id" class="admin-history-row">
        <span class="admin-history-icon"><UIcon name="i-lucide-history" /></span>
        <div class="admin-history-copy">
          <strong>{{ item.action }}</strong
          ><small>{{
            new Date(item.createdAt).toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })
          }}</small>
        </div>
        <VBtn variant="tonal" color="primary" size="small" :disabled="busy" @click="restore(item.id)"
          >恢复到草稿</VBtn
        >
      </div>
      <div v-if="!versions?.length && loadStatus !== 'pending'" class="admin-empty">
        <UIcon name="i-lucide-history" />
        <p>还没有发布记录。</p>
      </div>
    </div>
  </AdminDialog>
</template>
