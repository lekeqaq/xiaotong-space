<script setup lang="ts">
import type { MediaItem } from '#shared/admin'
const props = defineProps<{ selectable?: boolean }>()
const emit = defineEmits<{ select: [item: MediaItem] }>()
const api = useAdminApi()
const { confirm } = useAdminConfirm()
const fileInput = useTemplateRef<HTMLInputElement>('fileInput')
const source = ref('all')
const inspected = ref<MediaItem | null>(null)
const deleting = ref<string | null>(null)
const {
  data: media,
  refresh,
  status: loadStatus,
  error: loadError,
} = await useAsyncData('admin-media', () => api<MediaItem[]>('media'))
const search = ref('')
const visible = computed(
  () =>
    media.value?.filter(
      (item) =>
        item.name.toLowerCase().includes((search.value || '').toLowerCase()) &&
        (source.value === 'all' || (source.value === 'builtin' ? item.builtin : !item.builtin)),
    ) || [],
)
const uploading = ref(false)
const { notify } = useAdminToast()
async function upload(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  if (file.size > 10 * 1024 * 1024) {
    notify('图片不能超过 10 MB', 'error')
    input.value = ''
    return
  }
  uploading.value = true
  try {
    const body = new FormData()
    body.set('file', file)
    const item = await api<MediaItem>('media', { method: 'POST', body })
    await refresh()
    notify('图片已上传')
    if (props.selectable) emit('select', item)
  } catch (e) {
    notify(adminError(e), 'error')
  } finally {
    uploading.value = false
    input.value = ''
  }
}
async function remove(item: MediaItem) {
  if (
    !(await confirm({
      title: '删除图片',
      message: `删除「${item.name}」？文件删除后无法恢复。`,
      confirmLabel: '删除图片',
      danger: true,
    }))
  )
    return
  deleting.value = item.id
  try {
    await api(`media/${item.id}`, { method: 'DELETE' })
    await refresh()
    notify('图片已删除')
    inspected.value = null
  } catch (e) {
    notify(adminError(e), 'error')
  } finally {
    deleting.value = null
  }
}
async function copy(src: string) {
  try {
    await navigator.clipboard.writeText(src)
    notify('图片地址已复制')
  } catch {
    notify('未能复制，请从图片详情手动复制地址。', 'warning')
  }
}
</script>
<template>
  <div class="admin-media-library">
    <VCard class="admin-media-tools">
      <div class="admin-toolbar">
        <VTextField
          v-model="search"
          type="search"
          aria-label="搜索图片"
          placeholder="搜索图片名称"
          prepend-inner-icon="i-lucide-search"
          density="compact"
          hide-details
          clearable
        />
        <VBtn color="primary" :loading="uploading" :disabled="uploading" @click="fileInput?.click()"
          ><UIcon name="i-lucide-upload" />上传图片</VBtn
        ><input
          ref="fileInput"
          class="admin-file-input"
          type="file"
          aria-label="上传图片文件"
          accept="image/jpeg,image/png,image/webp,image/avif"
          :disabled="uploading"
          @change="upload"
        />
      </div>
      <div class="admin-media-tools-foot">
        <VTabs v-model="source" density="comfortable" color="primary" aria-label="图片来源"
          ><VTab value="all">全部图片</VTab><VTab value="uploaded">上传图片</VTab
          ><VTab value="builtin">网站素材</VTab></VTabs
        ><span class="admin-hint">JPG / PNG / WebP / AVIF · 最大 10 MB</span>
      </div>
    </VCard>
    <VProgressLinear
      v-if="uploading || loadStatus === 'pending'"
      indeterminate
      color="primary"
      aria-label="图片加载中"
    />
    <VAlert v-if="loadError" type="error" role="alert" class="admin-feedback"
      >{{ adminError(loadError)
      }}<VBtn v-if="loadError" variant="text" size="small" @click="refresh()">重试</VBtn></VAlert
    >
    <div class="admin-media-summary">
      <span>{{ selectable ? '点击图片即可选择，也可以上传新的图片。' : '点击图片查看原图与引用信息。' }}</span
      ><span>{{ visible.length }} 张图片</span>
    </div>
    <div class="admin-media-grid">
      <VCard v-for="(item, index) in visible" :key="item.id" class="admin-media-card">
        <button
          type="button"
          class="admin-media-image"
          :aria-label="`${selectable ? '选择图片' : '查看图片'} ${item.name}`"
          @click="selectable ? emit('select', item) : (inspected = item)"
        >
          <AdminMediaThumbnail :src="item.src" :alt="item.name" :eager="index < 8" /><span
            class="admin-media-hover"
            ><UIcon :name="selectable ? 'i-lucide-check' : 'i-lucide-expand'" />{{
              selectable ? '选择图片' : '查看原图'
            }}</span
          >
        </button>
        <div class="admin-media-info">
          <strong :title="item.name">{{ item.name }}</strong
          ><small
            >{{ item.builtin ? '随网站提供' : `${item.width} × ${item.height}`
            }}<template v-if="!item.builtin"> · {{ Math.ceil(item.size / 1024) }} KB</template></small
          >
          <div class="admin-media-labels">
            <VChip size="x-small" :color="item.builtin ? undefined : 'primary'" variant="tonal">{{
              item.builtin ? '网站素材' : '上传图片'
            }}</VChip
            ><span class="admin-hint" :title="item.references.join('、')">{{
              item.references.length ? `${item.references.length} 处引用` : '未引用'
            }}</span>
          </div>
          <div v-if="!selectable" class="admin-inline-actions">
            <VBtn variant="text" size="small" @click="copy(item.src)">复制地址</VBtn
            ><VBtn
              v-if="!item.builtin"
              variant="text"
              color="error"
              size="small"
              :disabled="!!item.references.length || !!deleting"
              :loading="deleting === item.id"
              :title="item.references.length ? '引用中的图片不能删除' : '删除图片'"
              @click="remove(item)"
              >删除</VBtn
            >
          </div>
        </div>
      </VCard>
    </div>
    <VCard v-if="!visible.length && loadStatus !== 'pending'" class="admin-empty"
      ><span class="admin-empty-icon"><UIcon name="i-lucide-images" /></span>
      <h2>还没有匹配的图片</h2>
      <p>试试其他关键词，或上传一张新的图片。</p></VCard
    >
    <AdminDialog v-if="inspected" :title="inspected.name" wide @close="inspected = null"
      ><div class="admin-media-detail">
        <div class="admin-media-original"><img :src="inspected.src" :alt="inspected.name" /></div>
        <aside>
          <h3>图片信息</h3>
          <p>
            {{ inspected.builtin ? '网站内置素材' : `${inspected.width} × ${inspected.height}`
            }}<template v-if="!inspected.builtin"> · {{ Math.ceil(inspected.size / 1024) }} KB</template>
          </p>
          <VTextField :model-value="inspected.src" label="图片地址" readonly /><VBtn
            color="primary"
            block
            @click="copy(inspected.src)"
            >复制地址</VBtn
          >
          <h3>引用位置</h3>
          <ul v-if="inspected.references.length">
            <li v-for="reference in inspected.references" :key="reference">{{ reference }}</li>
          </ul>
          <p v-else class="admin-hint">这张图片暂未被内容引用。</p>
        </aside>
      </div></AdminDialog
    >
  </div>
</template>
