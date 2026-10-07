<script setup lang="ts">
import type { ArticleInput, ArticleRecord } from '#shared/admin'
import { NuxtLink } from '#components'
import { shanghaiDate } from '#shared/admin'
definePageMeta({
  middleware: 'admin',
  layout: 'admin',
  pageTransition: { name: 'admin-page', mode: 'out-in' },
  layoutTransition: false,
})
useSeoMeta({ title: '文章管理' })
const api = useAdminApi()
const { confirm } = useAdminConfirm()
const page = ref(1)
const pageSize = 10
const { data: articles, refresh } = await useAsyncData('admin-articles', () =>
  api<ArticleRecord[]>('articles'),
)
const search = ref('')
const filter = ref('all')
const busy = ref(false)
const { notify } = useAdminToast()
const filtered = computed(
  () =>
    articles.value?.filter((item) => {
      const statusMatch =
        filter.value === 'trash'
          ? !!item.deletedAt
          : !item.deletedAt &&
            (filter.value === 'all' || (filter.value === 'published' ? !!item.published : !item.published))
      return (
        statusMatch &&
        `${item.draft.title} ${item.draft.tags.join(' ')}`
          .toLowerCase()
          .includes((search.value || '').toLowerCase())
      )
    }) || [],
)
const counts = computed(() => ({
  all: articles.value?.filter((item) => !item.deletedAt).length || 0,
  published: articles.value?.filter((item) => !item.deletedAt && item.published).length || 0,
  draft: articles.value?.filter((item) => !item.deletedAt && !item.published).length || 0,
  trash: articles.value?.filter((item) => item.deletedAt).length || 0,
}))
const pageCount = computed(() => Math.max(1, Math.ceil(filtered.value.length / pageSize)))
const pagedArticles = computed(() => filtered.value.slice((page.value - 1) * pageSize, page.value * pageSize))
watch([search, filter], () => {
  page.value = 1
})
watch(pageCount, (count) => {
  page.value = Math.min(page.value, count)
})
async function create() {
  busy.value = true
  try {
    const draft: ArticleInput = {
      slug: `note-${Date.now()}-${crypto.randomUUID().slice(0, 8)}`,
      title: '未命名文章',
      description: '',
      markdown: '',
      tags: [],
      category: '随想',
      cover: '',
      date: shanghaiDate(),
      featured: false,
    }
    const article = await api<ArticleRecord>('articles', { method: 'POST', body: draft })
    await navigateTo(`/admin/articles/${article.id}`)
  } catch (e) {
    notify(adminError(e), 'error')
  } finally {
    busy.value = false
  }
}
async function action(item: ArticleRecord, action: 'trash' | 'restore' | 'delete') {
  if (busy.value) return
  if (
    action !== 'restore' &&
    !(await confirm({
      title: action === 'delete' ? '永久删除文章' : '移入回收站',
      message:
        action === 'delete'
          ? `永久删除「${item.draft.title || '未命名文章'}」？文章正文、草稿和全部发布历史将被彻底删除，无法恢复。`
          : `将「${item.draft.title}」移入回收站？已发布内容会从网站隐藏，之后可以恢复。`,
      confirmLabel: action === 'delete' ? '永久删除' : '移入回收站',
      danger: true,
    }))
  )
    return
  busy.value = true
  try {
    if (action === 'delete')
      await api(`articles/${item.id}`, { method: 'DELETE', body: { revision: item.revision } })
    else await api(`articles/${item.id}/${action}`, { method: 'POST', body: { revision: item.revision } })
    await refresh()
    notify(action === 'delete' ? '文章已永久删除' : action === 'trash' ? '文章已移入回收站' : '文章已恢复')
  } catch (e) {
    notify(adminError(e), 'error')
  } finally {
    busy.value = false
  }
}
</script>
<template>
  <div class="admin-page">
    <AdminPageHeading title="文章">
      <template #actions
        ><VBtn color="primary" :loading="busy" :disabled="busy" @click="create"
          ><UIcon name="i-lucide-plus" />新建文章</VBtn
        ></template
      >
    </AdminPageHeading>
    <VCard class="admin-list-panel">
      <div class="admin-list-tools">
        <VTabs v-model="filter" color="primary" aria-label="文章状态" density="comfortable"
          ><VTab
            v-for="(label, key) in { all: '全部', published: '已发布', draft: '草稿', trash: '回收站' }"
            :key="key"
            :value="key"
            >{{ label }}<span class="admin-tab-count">{{ counts[key] }}</span></VTab
          ></VTabs
        >
        <VTextField
          v-model="search"
          type="search"
          aria-label="搜索文章"
          placeholder="搜索标题或标签"
          prepend-inner-icon="i-lucide-search"
          density="compact"
          hide-details
          clearable
          @click:clear="search = ''"
        />
      </div>
      <div class="admin-list-column-head"><span>文章</span><span>分类 / 日期</span><span>操作</span></div>
      <div class="admin-article-list">
        <article v-for="item in pagedArticles" :key="item.id" class="admin-article-row">
          <component
            :is="item.deletedAt ? 'div' : NuxtLink"
            :to="item.deletedAt ? undefined : `/admin/articles/${item.id}`"
            class="admin-article-main"
          >
            <img v-if="item.draft.cover" :src="item.draft.cover" alt="" loading="lazy" />
            <div v-else class="admin-article-placeholder">
              <UIcon :name="item.deletedAt ? 'i-lucide-trash-2' : 'i-lucide-file-text'" />
            </div>
            <div class="admin-article-copy">
              <div class="admin-article-title">
                <h2>{{ item.draft.title || '未命名文章' }}</h2>
                <VChip
                  size="x-small"
                  :color="item.deletedAt ? undefined : item.published ? 'success' : 'primary'"
                  variant="tonal"
                  >{{ item.deletedAt ? '回收站' : item.published ? '已发布' : '草稿' }}</VChip
                >
              </div>
              <p>{{ item.draft.description || '添加摘要，让读者先认识这个想法。' }}</p>
              <small>{{ item.draft.tags.join(' / ') || '暂无标签' }}</small>
            </div>
          </component>
          <div class="admin-article-date">
            <strong>{{ item.draft.category }}</strong
            ><time>{{ item.draft.date }}</time>
          </div>
          <div class="admin-row-actions">
            <VBtn
              v-if="!item.deletedAt"
              :to="`/admin/articles/${item.id}`"
              variant="text"
              color="primary"
              size="small"
              >编辑</VBtn
            ><VBtn
              variant="text"
              :color="item.deletedAt ? 'primary' : 'error'"
              size="small"
              :disabled="busy"
              @click="action(item, item.deletedAt ? 'restore' : 'trash')"
              >{{ item.deletedAt ? '恢复文章' : '移入回收站' }}</VBtn
            ><VBtn
              v-if="item.deletedAt"
              variant="text"
              color="error"
              size="small"
              :disabled="busy"
              @click="action(item, 'delete')"
              >永久删除</VBtn
            >
          </div>
        </article>
        <div v-if="!filtered.length" class="admin-empty">
          <span class="admin-empty-icon"><UIcon name="i-lucide-notebook-pen" /></span>
          <h2>
            {{ filter === 'trash' ? '回收站是空的' : search ? '没有找到匹配的文章' : '从第一篇记录开始' }}
          </h2>
          <p>{{ search ? '试试其他标题或标签。' : '写下一个想法，随时保存，准备好再发布。' }}</p>
          <VBtn
            v-if="!search && filter !== 'trash'"
            variant="tonal"
            color="primary"
            :disabled="busy"
            @click="create"
            >新建文章</VBtn
          >
        </div>
      </div>
      <footer class="admin-list-footer">
        <span>共 {{ filtered.length }} 篇 · 每页 {{ pageSize }} 篇</span
        ><VPagination
          v-model="page"
          :length="pageCount"
          aria-label="文章分页"
          previous-aria-label="上一页"
          next-aria-label="下一页"
          page-aria-label="第 {0} 页"
          current-page-aria-label="当前第 {0} 页"
          :total-visible="4"
          density="comfortable"
          rounded="lg"
        />
      </footer>
    </VCard>
  </div>
</template>
