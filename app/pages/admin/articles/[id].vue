<script setup lang="ts">
import type { ArticleRecord, HomeRecord, MediaItem, RenderedArticle } from '#shared/admin'
import { readingTime } from '#shared/admin'
defineOptions({ name: 'AdminArticleEditor' })
definePageMeta({ middleware: 'admin', layout: 'admin', pageTransition: false, layoutTransition: false })
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
const notice = ref('')
const mediaTarget = ref<'cover' | 'body' | null>(null)
const showHistory = ref(false)
const showFullPreview = ref(false)
const mobileTab = ref('edit')
const editor = useTemplateRef<HTMLTextAreaElement>('editor')
const preview = ref<RenderedArticle | null>(null)
const previewError = ref('')
const previewLoading = ref(false)
let previewTimer: ReturnType<typeof setTimeout> | undefined
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
watch(
  draft,
  () => {
    clearTimeout(previewTimer)
    previewTimer = setTimeout(() => {
      void refreshPreview()
    }, 450)
  },
  { deep: true },
)
onMounted(() => {
  void refreshPreview()
  window.addEventListener('keydown', shortcut)
})
onBeforeUnmount(() => {
  clearTimeout(previewTimer)
  window.removeEventListener('keydown', shortcut)
})
function shortcut(event: KeyboardEvent) {
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') {
    event.preventDefault()
    void saveManually()
  }
}
function insert(before: string, after = '', placeholder = '') {
  const input = editor.value
  const start = input?.selectionStart ?? draft.value.markdown.length
  const end = input?.selectionEnd ?? start
  const selected = draft.value.markdown.slice(start, end) || placeholder
  draft.value.markdown =
    draft.value.markdown.slice(0, start) + before + selected + after + draft.value.markdown.slice(end)
  void nextTick(() => {
    input?.focus()
    input?.setSelectionRange(start + before.length, start + before.length + selected.length)
  })
}
function selectMedia(item: MediaItem) {
  if (mediaTarget.value === 'cover') draft.value.cover = item.src
  else insert(`\n![`, `](${item.src})\n`, '图片描述')
  mediaTarget.value = null
}
async function openPreview() {
  showFullPreview.value = true
  clearTimeout(previewTimer)
  await refreshPreview()
}
async function saveManually() {
  try {
    await save()
    notice.value = '草稿已保存'
  } catch {
    /* Save errors are displayed by the draft controller. */
  }
}
async function action(name: 'publish' | 'unpublish') {
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
  notice.value = ''
  try {
    await save()
    reset(
      await api<ArticleRecord>(`${endpoint}/${name}`, {
        method: 'POST',
        body: { revision: record.value.revision },
      }),
    )
    notice.value = name === 'publish' ? '文章已发布，网站内容已更新' : '已撤回发布，草稿与历史保留'
  } catch (e) {
    error.value = adminError(e)
  } finally {
    busy.value = false
  }
}
async function openHistory() {
  try {
    await save()
    showHistory.value = true
  } catch {
    /* Preserve unsaved changes on failure. */
  }
}
function restored(value: ArticleRecord | HomeRecord) {
  reset(value as ArticleRecord)
  showHistory.value = false
  notice.value = '历史版本已恢复到草稿，请预览后发布'
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
    <VAlert v-if="notice" type="success" role="status" class="admin-feedback">{{ notice }}</VAlert>
    <VAlert v-if="record.published" type="info" class="admin-feedback"
      >修改自动保存到草稿；再次发布后才会更新网站内容。</VAlert
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
            <div class="admin-markdown-toolbar" role="toolbar" aria-label="Markdown 工具">
              <VBtn
                variant="text"
                icon
                size="small"
                aria-label="插入标题"
                title="二级标题"
                @click="insert('\n## ', '\n', '章节标题')"
                >H2</VBtn
              >
              <VBtn
                variant="text"
                icon
                size="small"
                aria-label="加粗"
                title="加粗"
                @click="insert('**', '**', '文字')"
                ><UIcon name="i-lucide-bold"
              /></VBtn>
              <VBtn
                variant="text"
                icon
                size="small"
                aria-label="插入链接"
                title="链接"
                @click="insert('[', '](https://example.com)', '链接文字')"
                ><UIcon name="i-lucide-link"
              /></VBtn>
              <VBtn
                variant="text"
                icon
                size="small"
                aria-label="插入图片"
                title="图片"
                @click="mediaTarget = 'body'"
                ><UIcon name="i-lucide-image"
              /></VBtn>
              <VBtn
                variant="text"
                icon
                size="small"
                aria-label="插入列表"
                title="列表"
                @click="insert('\n- ', '\n', '列表项')"
                ><UIcon name="i-lucide-list"
              /></VBtn>
              <VBtn
                variant="text"
                icon
                size="small"
                aria-label="插入代码块"
                title="代码块"
                @click="insert('\n```ts\n', '\n```\n', '// 在这里写代码')"
                ><UIcon name="i-lucide-code"
              /></VBtn>
              <VBtn
                variant="text"
                icon
                size="small"
                aria-label="插入引用"
                title="引用"
                @click="insert('\n> ', '\n', '值得记下的一句话')"
                ><UIcon name="i-lucide-quote"
              /></VBtn>
              <span>Markdown · ⌘ / Ctrl + S</span>
            </div>
            <VTabs
              v-model="mobileTab"
              class="admin-mobile-editor-tabs"
              color="primary"
              density="comfortable"
              aria-label="正文视图"
              ><VTab value="edit">编辑</VTab><VTab value="preview">预览</VTab></VTabs
            >
            <div class="admin-writing-columns" :class="`show-${mobileTab}`">
              <div class="admin-markdown-editor">
                <span class="admin-overline">MARKDOWN</span
                ><textarea
                  ref="editor"
                  v-model="draft.markdown"
                  aria-label="文章正文"
                  maxlength="200000"
                  spellcheck="false"
                  placeholder="## 从一个想法开始&#10;&#10;在这里写下你的思考…"
                />
              </div>
              <div class="admin-inline-preview">
                <div class="admin-preview-label">
                  <span class="admin-overline">实时预览</span
                  ><small role="status">{{ previewLoading ? '正在更新…' : '与网站正文一致' }}</small>
                </div>
                <VAlert v-if="previewError" type="error" role="alert">{{ previewError }}</VAlert
                ><ContentDocument v-if="preview" :document="preview" />
                <p v-else class="admin-empty">正文预览会出现在这里。</p>
              </div>
            </div>
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
