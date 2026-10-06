<script setup lang="ts">
import type { ArticleRecord, HomeRecord, MediaItem } from '#shared/admin'
defineOptions({ name: 'AdminHomePage' })
definePageMeta({ middleware: 'admin', layout: 'admin', pageTransition: false, layoutTransition: false })
useSeoMeta({ title: '首页管理' })
const api = useAdminApi()
const { confirm } = useAdminConfirm()
const { data: initial } = await useAsyncData('admin-home', () => api<HomeRecord>('home'))
if (!initial.value) throw createError({ statusCode: 500, statusMessage: '首页内容读取失败' })
const { record, draft, dirty, saving, error, conflict, status, save, reset } = useAdminDraft(
  initial.value!,
  'home',
)
const { data: articles } = await useFetch('/api/content/articles')
const { data: projects } = await useAsyncData('admin-preview-project', () =>
  queryCollection('projects').order('order', 'ASC').all(),
)
const busy = ref(false)
const notice = ref('')
const pickerId = ref<string | null>(null)
const showPreview = ref(false)
const showHistory = ref(false)
let drag: { kind: 'photos' | 'thoughts'; index: number } | null = null
function reorder<T>(values: T[], from: number, to: number) {
  if (to < 0 || to >= values.length) return
  const [item] = values.splice(from, 1)
  if (item) values.splice(to, 0, item)
}
function move(kind: 'photos' | 'thoughts', from: number, to: number) {
  if (kind === 'photos') reorder(draft.value.photos, from, to)
  else reorder(draft.value.thoughts, from, to)
}
function drop(kind: 'photos' | 'thoughts', index: number) {
  if (drag?.kind === kind) move(kind, drag.index, index)
  drag = null
}
function addPhoto() {
  draft.value.photos.push({
    id: crypto.randomUUID(),
    src: draft.value.photos[0]!.src,
    caption: '新的风景。',
    alt: '生活照片',
  })
  pickerId.value = draft.value.photos.at(-1)!.id
}
function addThought() {
  draft.value.thoughts.push({ id: crypto.randomUUID(), text: '记下一点新的想法。' })
}
function selectMedia(item: MediaItem) {
  const photo = draft.value.photos.find((item) => item.id === pickerId.value)
  if (photo) photo.src = item.src
  pickerId.value = null
}
async function saveManually() {
  try {
    await save()
    notice.value = '首页草稿已保存'
  } catch {
    /* The error is shown alongside save status. */
  }
}
async function publish() {
  busy.value = true
  notice.value = ''
  try {
    await save()
    reset(
      await api<HomeRecord>('home/publish', { method: 'POST', body: { revision: record.value.revision } }),
    )
    notice.value = '首页已发布，照片和便签已更新'
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
    /* Keep unsaved edits intact. */
  }
}
function restored(value: ArticleRecord | HomeRecord) {
  reset(value as HomeRecord)
  showHistory.value = false
  notice.value = '历史版本已恢复到草稿，请预览后发布'
}
async function reload() {
  if (
    dirty.value &&
    !(await confirm({
      title: '重新加载首页',
      message: '当前未保存的修改会被放弃，请先复制需要保留的内容。',
      confirmLabel: '重新加载',
      danger: true,
    }))
  )
    return
  try {
    reset(await api<HomeRecord>('home'))
  } catch (e) {
    error.value = adminError(e)
  }
}
</script>
<template>
  <div class="admin-page">
    <AdminPageHeading title="首页" description="收集生活的切片，留下一点日常的想法。" editor>
      <template #status
        ><div class="admin-save-status" role="status">
          <span class="admin-online-dot" :class="{ 'is-dirty': dirty || error }" />{{ status }}
        </div></template
      >
      <template #actions
        ><VBtn variant="outlined" :disabled="busy" @click="showPreview = true"
          ><UIcon name="i-lucide-eye" />预览首页</VBtn
        ><VBtn
          variant="outlined"
          :loading="saving"
          :disabled="busy || saving || conflict"
          @click="saveManually"
          >保存草稿</VBtn
        ><VBtn color="primary" :loading="busy" :disabled="busy || saving || conflict" @click="publish"
          ><UIcon name="i-lucide-send" />发布首页</VBtn
        ></template
      >
    </AdminPageHeading>
    <VAlert type="info" class="admin-feedback"
      >修改自动保存到草稿，发布后更新首页。拖动把手或使用上下按钮调整顺序。</VAlert
    >
    <VAlert v-if="error" type="error" role="alert" class="admin-feedback"
      >{{ error }}<VBtn variant="text" size="small" @click="reload">重新加载</VBtn></VAlert
    >
    <VAlert v-if="notice" type="success" role="status" class="admin-feedback">{{ notice }}</VAlert>
    <fieldset class="admin-editor-fieldset" :disabled="busy">
      <VCard class="admin-panel admin-home-section">
        <div class="admin-section-heading">
          <div>
            <h2>
              生活照片 <VChip size="small" color="primary" variant="tonal">{{ draft.photos.length }}</VChip>
            </h2>
            <p>照片、配文和画面描述一起管理，保留 1–30 张。</p>
          </div>
          <VBtn
            variant="tonal"
            color="primary"
            :disabled="busy || draft.photos.length >= 30"
            @click="addPhoto"
            ><UIcon name="i-lucide-plus" />添加照片</VBtn
          >
        </div>
        <div class="admin-home-photos">
          <article
            v-for="(photo, index) in draft.photos"
            :key="photo.id"
            class="admin-home-photo"
            @dragover.prevent
            @drop.prevent="drop('photos', index)"
          >
            <div class="admin-home-photo-toolbar">
              <button
                type="button"
                class="admin-sort-handle"
                draggable="true"
                :aria-label="`拖动第 ${index + 1} 张照片排序`"
                @dragstart="drag = { kind: 'photos', index }"
                @dragend="drag = null"
              >
                <UIcon name="i-lucide-grip-vertical" />
              </button>
              <strong>照片 {{ String(index + 1).padStart(2, '0') }}</strong>
              <div class="admin-sort-actions">
                <VBtn
                  icon
                  variant="text"
                  size="small"
                  :disabled="busy || index === 0"
                  :aria-label="`上移第 ${index + 1} 张照片`"
                  @click="move('photos', index, index - 1)"
                  ><UIcon name="i-lucide-arrow-up" /></VBtn
                ><VBtn
                  icon
                  variant="text"
                  size="small"
                  :disabled="busy || index === draft.photos.length - 1"
                  :aria-label="`下移第 ${index + 1} 张照片`"
                  @click="move('photos', index, index + 1)"
                  ><UIcon name="i-lucide-arrow-down" /></VBtn
                ><VBtn
                  icon
                  variant="text"
                  color="error"
                  size="small"
                  :disabled="busy || draft.photos.length <= 1"
                  :aria-label="`删除第 ${index + 1} 张照片`"
                  @click="draft.photos.splice(index, 1)"
                  ><UIcon name="i-lucide-trash-2"
                /></VBtn>
              </div>
            </div>
            <button
              type="button"
              class="admin-home-photo-image"
              :aria-label="`更换第 ${index + 1} 张照片`"
              @click="pickerId = photo.id"
            >
              <img :src="photo.src" :alt="photo.alt" loading="lazy" /><span
                ><UIcon name="i-lucide-image" />更换照片</span
              >
            </button>
            <div class="admin-home-photo-fields">
              <VTextField
                v-model="photo.caption"
                label="配文"
                maxlength="80"
                :aria-label="`第 ${index + 1} 张照片配文`"
                :disabled="busy"
              /><VTextField
                v-model="photo.alt"
                label="图片描述"
                maxlength="160"
                :aria-label="`第 ${index + 1} 张照片描述`"
                hint="为无法看到图片的访客描述画面。"
                persistent-hint
                :disabled="busy"
              />
            </div>
          </article>
        </div>
      </VCard>
      <VCard class="admin-panel admin-home-section"
        ><div class="admin-section-heading">
          <div>
            <h2>
              便签话术 <VChip size="small" color="primary" variant="tonal">{{ draft.thoughts.length }}</VChip>
            </h2>
            <p>保留自然的换行，每个小想法都能装进便签。</p>
          </div>
          <VBtn
            variant="tonal"
            color="primary"
            :disabled="busy || draft.thoughts.length >= 30"
            @click="addThought"
            ><UIcon name="i-lucide-plus" />添加话术</VBtn
          >
        </div>
        <div class="admin-thought-grid">
          <VCard
            v-for="(thought, index) in draft.thoughts"
            :key="thought.id"
            class="admin-thought-card"
            @dragover.prevent
            @drop.prevent="drop('thoughts', index)"
            ><div class="admin-thought-top">
              <button
                type="button"
                class="admin-sort-handle"
                draggable="true"
                :aria-label="`拖动第 ${index + 1} 句话术排序`"
                @dragstart="drag = { kind: 'thoughts', index }"
                @dragend="drag = null"
              >
                <UIcon name="i-lucide-grip-vertical" /></button
              ><span>便签 {{ String(index + 1).padStart(2, '0') }}</span>
              <div class="admin-sort-actions">
                <VBtn
                  icon
                  variant="text"
                  size="small"
                  :disabled="busy || index === 0"
                  :aria-label="`上移第 ${index + 1} 句话术`"
                  @click="move('thoughts', index, index - 1)"
                  ><UIcon name="i-lucide-arrow-up" /></VBtn
                ><VBtn
                  icon
                  variant="text"
                  size="small"
                  :disabled="busy || index === draft.thoughts.length - 1"
                  :aria-label="`下移第 ${index + 1} 句话术`"
                  @click="move('thoughts', index, index + 1)"
                  ><UIcon name="i-lucide-arrow-down" /></VBtn
                ><VBtn
                  icon
                  variant="text"
                  color="error"
                  size="small"
                  :disabled="busy || draft.thoughts.length <= 1"
                  :aria-label="`删除第 ${index + 1} 句话术`"
                  @click="draft.thoughts.splice(index, 1)"
                  ><UIcon name="i-lucide-trash-2"
                /></VBtn>
              </div>
            </div>
            <VTextarea
              v-model="thought.text"
              :aria-label="`第 ${index + 1} 句话术`"
              rows="3"
              maxlength="100"
              counter="100"
              :disabled="busy"
          /></VCard>
        </div>
      </VCard>
    </fieldset>
    <VBtn variant="text" :disabled="busy || saving" @click="openHistory"
      ><UIcon name="i-lucide-history" />查看首页发布历史</VBtn
    >
    <AdminMediaPicker v-if="pickerId" @close="pickerId = null" @select="selectMedia" />
    <AdminHistory
      v-if="showHistory"
      endpoint="home"
      :revision="record.revision"
      @close="showHistory = false"
      @restored="restored"
    />
    <AdminDialog v-if="showPreview" title="首页工作台预览" wide @close="showPreview = false"
      ><AdminPreview
        :payload="{
          kind: 'home',
          home: draft,
          latestArticle: articles?.[0],
          project: projects?.find((project) => project.workbench),
        }"
        @close="showPreview = false"
    /></AdminDialog>
  </div>
</template>
