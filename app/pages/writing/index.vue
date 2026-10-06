<script setup lang="ts">
useSiteSeo('Writing', '关于前端、工程化和 AI 的实践笔记。记录我学到的、踩过的坑，以及一些有意思的想法。')
const { data: articles } = await useAsyncData('writing', () =>
  queryCollection('writing').where('draft', '=', false).order('date', 'DESC').all(),
)
const search = ref('')
const category = ref('All')
const visible = ref(6)
const searchInput = useTemplateRef<HTMLInputElement>('searchInput')
const categories = computed(() => ['All', ...new Set(articles.value?.map((article) => article.category))])
const hasFilters = computed(() => Boolean(search.value || category.value !== 'All'))
const filtered = computed(
  () =>
    articles.value?.filter(
      (article) =>
        (category.value === 'All' || article.category === category.value) &&
        `${article.title} ${article.description} ${article.tags.join(' ')}`
          .toLowerCase()
          .includes(search.value.trim().toLowerCase()),
    ) || [],
)
function clearFilters() {
  search.value = ''
  category.value = 'All'
}
function clearSearch() {
  search.value = ''
  searchInput.value?.focus()
}
watch([search, category], () => {
  visible.value = 6
})
</script>

<template>
  <div class="writing-page container">
    <header class="notebook-intro">
      <div>
        <span class="space-kicker"><span class="notebook-dot" /> THE OPEN NOTEBOOK</span>
        <h1>Thinking, <em>out loud.</em></h1>
        <p>把模糊的想法写清楚，把踩过的坑记下来。<br />一些关于前端、AI，以及边做边学的笔记。</p>
      </div>
      <div class="notebook-doodle" aria-hidden="true">
        <UIcon name="i-lucide-notebook-pen" /><span>learn. build. repeat.</span><i>✳</i>
      </div>
    </header>
    <section class="notebook-filters" aria-label="筛选笔记">
      <div class="notebook-toolbar">
        <div class="notebook-categories" role="group" aria-label="文章分类">
          <button
            v-for="item in categories"
            :key="item"
            type="button"
            :class="{ active: category === item }"
            :aria-pressed="category === item"
            @click="category = item"
          >
            {{ item === 'All' ? '全部笔记' : item
            }}<small>{{
              item === 'All'
                ? articles?.length
                : articles?.filter((article) => article.category === item).length
            }}</small>
          </button>
        </div>
        <div class="notebook-search" role="search">
          <UIcon name="i-lucide-search" aria-hidden="true" />
          <input
            ref="searchInput"
            v-model="search"
            type="search"
            placeholder="找个关键词…"
            aria-label="搜索文章"
            autocomplete="off"
            @keydown.esc="clearSearch"
          />
          <button v-if="search" type="button" aria-label="清除搜索" @click="clearSearch">
            <UIcon name="i-lucide-x" />
          </button>
        </div>
      </div>
    </section>
    <div class="notebook-results">
      <p role="status">
        {{ hasFilters ? '找到' : '共' }} <strong>{{ filtered.length }}</strong> 篇笔记<span
          v-if="search.trim()"
        >
          · “{{ search.trim() }}”</span
        >
      </p>
      <button v-if="hasFilters" type="button" class="reset-filters" @click="clearFilters">
        重置筛选 <UIcon name="i-lucide-rotate-ccw" /></button
      ><span v-else>最近的思考，在最前面 <UIcon name="i-lucide-arrow-down" /></span>
    </div>
    <div v-if="filtered.length" class="notebook-entries">
      <WritingEntry
        v-for="(article, index) in filtered.slice(0, visible)"
        :key="article.path"
        :article="article"
        :index="index"
      />
    </div>
    <div v-else class="empty-state notebook-empty">
      <UIcon name="i-lucide-notebook-pen" />
      <h2>这一页，暂时还是空白。</h2>
      <p>换个关键词试试，或把筛选条件放宽一点。</p>
      <button type="button" class="button button-secondary" @click="clearFilters">
        查看全部笔记 <UIcon name="i-lucide-arrow-right" />
      </button>
    </div>
    <button
      v-if="filtered.length > visible"
      type="button"
      class="button button-secondary load-more"
      @click="visible += 6"
    >
      再翻几页 <UIcon name="i-lucide-plus" />
    </button>
    <div v-else-if="filtered.length" class="notebook-end"><span>✳</span> 写作和成长一样，慢慢来。</div>
  </div>
</template>

<style src="../../assets/css/writing.css"></style>
