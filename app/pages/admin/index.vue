<script setup lang="ts">
import type { ArticleInput, ArticleRecord } from '#shared/admin'
import { NuxtLink } from '#components'
import { shanghaiDate } from '#shared/admin'
definePageMeta({ middleware: 'admin', layout: 'admin', pageTransition: false, layoutTransition: false })
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
const error = ref('')
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
  error.value = ''
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
    error.value = adminError(e)
  } finally {
    busy.value = false
  }
}
async function action(item: ArticleRecord, action: 'trash' | 'restore') {
  if (
    action === 'trash' &&
    !(await confirm({
      title: '移入回收站',
      message: `将「${item.draft.title}」移入回收站？已发布内容会从网站隐藏，之后可以恢复。`,
      confirmLabel: '移入回收站',
      danger: true,
    }))
  )
    return
  busy.value = true
  try {
    await api(`articles/${item.id}/${action}`, { method: 'POST', body: { revision: item.revision } })
    await refresh()
  } catch (e) {
    error.value = adminError(e)
  } finally {
    busy.value = false
  }
}
</script>
<template>
  <div class="admin-page">
    <AdminPageHeading title="文章" description="记录想法，管理草稿，让内容慢慢生长。">
      <template #actions
        ><VBtn color="primary" :loading="busy" :disabled="busy" @click="create"
          ><UIcon name="i-lucide-plus" />新建文章</VBtn
        ></template
      >
    </AdminPageHeading>
    <div class="admin-stats-grid">
      <VCard
        v-for="stat in [
          { label: '全部文章', value: counts.all, icon: 'i-lucide-files' },
          { label: '已发布', value: counts.published, icon: 'i-lucide-circle-check' },
          { label: '草稿', value: counts.draft, icon: 'i-lucide-file-pen-line' },
        ]"
        :key="stat.label"
        class="admin-stat-card"
        ><div>
          <span>{{ stat.label }}</span
          ><strong>{{ stat.value }}</strong>
        </div>
        <span class="admin-stat-icon"><UIcon :name="stat.icon" /></span
      ></VCard>
    </div>
    <VAlert v-if="error" type="error" role="alert" class="admin-feedback">{{ error }}</VAlert>
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
        <span>共 {{ filtered.length }} 篇文章</span
        ><VPagination
          v-if="pageCount > 1"
          v-model="page"
          :length="pageCount"
          :total-visible="4"
          density="comfortable"
          rounded="lg"
        />
      </footer>
    </VCard>
  </div>
</template>
