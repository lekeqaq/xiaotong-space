<script setup lang="ts">
import type { ArticleRecord, HomeRecord, MediaItem, RenderedArticle } from '#shared/admin'
import { readingTime } from '#shared/admin'
defineOptions({ name: 'AdminArticleEditor' })
definePageMeta({
  middleware: 'admin',
  layout: 'admin',
  pageTransition: { name: 'admin-page', mode: 'out-in' },
  layoutTransition: false,
})
useSeoMeta({ title: '编辑文章' })
const route = useRoute()
const id = String(route.params.id)
const api = useAdminApi()
const { confirm } = useAdminConfirm()
const endpoint = `articles/${id}`
const { data: initial } = await useAsyncData(`admin-article-${id}`, () => api<ArticleRecord>(endpoint))
if (!initial.value) throw createError({ statusCode: 404, statusMessage: 'Article not found' })
if (initial.value.deletedAt) await navigateTo('/admin')
const { record, draft, dirty, saving, error, conflict, status, save, reset } = useAdminDraft(
  initial.value!,
  endpoint,
)
// The API stores a calendar date, so preserve the local day without UTC conversion.
const publicationDate = computed<Date | null>({
  get: () => {
    if (!draft.value.date) return null
    const [year, month, day] = draft.value.date.split('-').map(Number)
    return new Date(year!, month! - 1, day!)
  },
  set: (value) => {
    draft.value.date = value
      ? [
          value.getFullYear(),
          String(value.getMonth() + 1).padStart(2, '0'),
          String(value.getDate()).padStart(2, '0'),
        ].join('-')
      : ''
  },
})
const busy = ref(false)
const { notify } = useAdminToast()
const mediaTarget = ref<'cover' | 'body' | null>(null)
const showHistory = ref(false)
const showFullPreview = ref(false)
const editor = useTemplateRef<{ flush: () => void; insertImage: (src: string) => void }>('editor')
const preview = ref<RenderedArticle | null>(null)
const previewError = ref('')
const previewLoading = ref(false)
let previewSequence = 0
async function refreshPreview() {
  const sequence = ++previewSequence
  previewLoading.value = true
  try {
    const result = await api<RenderedArticle>('preview', { method: 'POST', body: draft.value })
    if (sequence === previewSequence) {
      preview.value = result
      previewError.value = ''
    }
  } catch (e) {
    if (sequence === previewSequence) previewError.value = adminError(e)
  } finally {
    if (sequence === previewSequence) previewLoading.value = false
  }
}
onMounted(() => window.addEventListener('keydown', shortcut))
onBeforeUnmount(() => window.removeEventListener('keydown', shortcut))
function shortcut(event: KeyboardEvent) {
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') {
    event.preventDefault()
    void saveManually()
  }
}
function selectMedia(item: MediaItem) {
  if (mediaTarget.value === 'cover') draft.value.cover = item.src
  else editor.value?.insertImage(item.src)
  mediaTarget.value = null
}
async function openPreview() {
  editor.value?.flush()
  showFullPreview.value = true
  await refreshPreview()
}
async function saveManually() {
  editor.value?.flush()
  try {
    await save()
    notify(dirty.value ? '本次草稿已保存，新增修改仍待保存' : '草稿已保存')
  } catch {
    notify(error.value || '草稿保存失败，请重试。', 'error')
  }
}
async function action(name: 'publish' | 'unpublish') {
  editor.value?.flush()
  if (dirty.value) {
    notify('请先点击「保存草稿」，再进行发布操作。', 'warning')
    return
  }
  if (
    name === 'unpublish' &&
    !(await confirm({
      title: '撤回发布',
      message: '文章将从网站、RSS 和 sitemap 中隐藏，草稿与历史版本会保留。',
      confirmLabel: '撤回发布',
      danger: true,
    }))
  )
    return
  busy.value = true
  try {
    reset(
      await api<ArticleRecord>(`${endpoint}/${name}`, {
        method: 'POST',
        body: { revision: record.value.revision },
      }),
    )
    notify(name === 'publish' ? '文章已发布，网站内容已更新' : '已撤回发布，草稿与历史保留')
  } catch (e) {
    error.value = adminError(e)
    notify(error.value, 'error')
  } finally {
    busy.value = false
  }
}
function openHistory() {
  showHistory.value = true
}
function restored(value: ArticleRecord | HomeRecord) {
  reset(value as ArticleRecord)
  showHistory.value = false
  notify('历史版本已恢复到草稿，请预览后发布')
}
async function reload() {
  if (
    dirty.value &&
    !(await confirm({
      title: '重新加载文章',
      message: '当前未保存的修改会被放弃，请先复制需要保留的内容。',
      confirmLabel: '重新加载',
      danger: true,
    }))
  )
    return
  try {
    reset(await api<ArticleRecord>(endpoint))
  } catch (e) {
    error.value = adminError(e)
    notify(error.value, 'error')
  }
}
</script>
<template>
  <div class="admin-page">
    <AdminPageHeading title="编辑文章" editor>
      <template #status
        ><div class="admin-save-status" role="status">
          <span class="admin-online-dot" :class="{ 'is-dirty': dirty || error }" />{{ status
          }}<VChip size="x-small" :color="record.published ? 'success' : 'primary'" variant="tonal">{{
            record.published ? '线上已有发布版本' : '草稿'
          }}</VChip>
        </div></template
      >
      <template #actions
        ><VBtn variant="outlined" :disabled="busy" @click="openPreview"
          ><UIcon name="i-lucide-eye" />预览</VBtn
        ><VBtn
          variant="outlined"
          :loading="saving"
          :disabled="busy || saving || conflict"
          @click="saveManually"
          >保存草稿</VBtn
        ><VBtn
          color="primary"
          :loading="busy"
          :disabled="busy || saving || conflict"
          @click="action('publish')"
          ><UIcon name="i-lucide-send" />发布文章</VBtn
        ></template
      >
    </AdminPageHeading>
    <VAlert v-if="error" type="error" role="alert" class="admin-feedback"
      >{{ error }}<VBtn variant="text" size="small" @click="reload">重新加载</VBtn></VAlert
    >
    <VAlert v-if="record.published" type="info" class="admin-feedback"
      >修改后点击「保存草稿」；再次发布后才会更新网站内容。</VAlert
    >
    <fieldset class="admin-editor-fieldset" :disabled="busy">
      <div class="admin-editor-layout">
        <div class="admin-editor-main">
          <VCard class="admin-panel admin-article-fields"
            ><div class="admin-panel-heading">
              <h2>标题与摘要</h2>
              <span>让读者先认识这个想法</span>
            </div>
            <VTextField
              v-model="draft.title"
              label="标题"
              maxlength="150"
              placeholder="给这个想法起个名字"
              :disabled="busy"
            />
            <VTextarea
              v-model="draft.description"
              label="摘要"
              maxlength="500"
              rows="2"
              auto-grow
              counter="500"
              placeholder="用一两句话介绍这篇文章"
              :disabled="busy"
            />
          </VCard>
          <VCard class="admin-writing-panel">
            <div class="admin-writing-header">
              <h2>正文</h2>
              <span>{{ readingTime(draft.markdown) }} 分钟阅读 · {{ draft.markdown.length }} 字符</span>
            </div>
            <AdminArticleBody
              ref="editor"
              v-model="draft.markdown"
              :disabled="busy"
              @select-image="mediaTarget = 'body'"
            />
          </VCard>
        </div>
        <aside class="admin-editor-meta">
          <VCard class="admin-panel"
            ><div class="admin-panel-heading">
              <h2>发布设置</h2>
              <UIcon name="i-lucide-sliders-horizontal" />
            </div>
            <div class="admin-form-stack">
              <VTextField
                v-model="draft.slug"
                label="文章地址"
                :disabled="busy || !!record.lockedSlug"
                maxlength="100"
                pattern="[a-z0-9]+(-[a-z0-9]+)*"
                :hint="record.lockedSlug ? '已发布的地址固定，保留已有链接。' : `/writing/${draft.slug}`"
                persistent-hint
              />
              <VCombobox
                v-model="draft.category"
                label="分类"
                :items="['AI', 'Frontend', 'Engineering', '随想']"
                maxlength="60"
                :disabled="busy"
              />
              <VCombobox
                v-model="draft.tags"
                label="标签"
                multiple
                chips
                closable-chips
                :delimiters="[',', '，']"
                hint="输入后按回车添加，最多 20 个。"
                persistent-hint
                :disabled="busy"
              />
              <VDateInput v-model="publicationDate" label="发布日期" :disabled="busy" /></div
          ></VCard>
          <VCard class="admin-panel"
            ><div class="admin-panel-heading">
              <h2>文章封面</h2>
              <UIcon name="i-lucide-image" />
            </div>
            <button
              type="button"
              class="admin-cover-picker"
              aria-label="选择文章封面"
              @click="mediaTarget = 'cover'"
            >
              <img v-if="draft.cover" :src="draft.cover" alt="当前文章封面" /><span v-else
                ><UIcon name="i-lucide-image-plus" />选择一张封面</span
              ></button
            ><VBtn variant="tonal" color="primary" block :disabled="busy" @click="mediaTarget = 'cover'">{{
              draft.cover ? '更换封面' : '从图片库选择'
            }}</VBtn></VCard
          >
          <VCard class="admin-panel admin-management"
            ><div class="admin-panel-heading">
              <h2>版本管理</h2>
              <UIcon name="i-lucide-history" />
            </div>
            <VBtn variant="outlined" block :disabled="busy || saving" @click="openHistory">查看发布历史</VBtn
            ><VBtn
              v-if="record.published"
              variant="text"
              color="error"
              block
              :disabled="busy || saving"
              @click="action('unpublish')"
              >撤回发布</VBtn
            >
            <p class="admin-hint">草稿仅自己可见，发布后才会出现在网站。</p></VCard
          >
        </aside>
      </div>
    </fieldset>
    <AdminMediaPicker v-if="mediaTarget" @close="mediaTarget = null" @select="selectMedia" />
    <AdminHistory
      v-if="showHistory"
      :endpoint="endpoint"
      :revision="record.revision"
      @close="showHistory = false"
      @restored="restored"
    />
    <AdminDialog v-if="showFullPreview" title="文章预览" wide @close="showFullPreview = false"
      ><VAlert v-if="previewError" type="error" role="alert">{{ previewError }}</VAlert
      ><AdminPreview
        v-if="preview"
        :payload="{ kind: 'article', article: preview }"
        :loading="previewLoading"
        @close="showFullPreview = false"
      />
      <p v-else class="admin-empty" role="status">正在生成预览…</p></AdminDialog
    >
  </div>
</template>
