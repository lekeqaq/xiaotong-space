<script setup lang="ts">
import type { RenderedArticle } from '#shared/content'
const route = useRoute()
const {
  data: article,
  error,
  status,
  refresh,
} = await useFetch<RenderedArticle>(`/api/content/articles/${route.params.slug}`, {
  key: `article-${route.path}`,
  timeout: 8000,
  retry: 0,
})
const missing = computed(() => error.value?.statusCode === 404)
if (import.meta.server && error.value) {
  const event = useRequestEvent()
  if (event) setResponseStatus(event, missing.value ? 404 : 503)
}
const { data: articles, error: navigationError } = await useWritingSummaries()
const index = computed(() => articles.value?.findIndex((item) => item.path === route.path) ?? -1)
const previous = computed(() =>
  !navigationError.value && index.value >= 0 ? articles.value?.[index.value - 1] : undefined,
)
const next = computed(() =>
  !navigationError.value && index.value >= 0 ? articles.value?.[index.value + 1] : undefined,
)
useSiteSeo(
  computed(() => article.value?.title || (missing.value ? 'Page not found' : 'Writing')),
  computed(() => article.value?.description || '页面暂时无法读取，请稍后重试。'),
  computed(() => article.value?.cover || '/og/default.png'),
)
useSeoMeta({
  robots: () => (article.value ? undefined : 'noindex'),
  ogType: () => (article.value ? 'article' : 'website'),
  articlePublishedTime: () => article.value?.date,
  articleModifiedTime: () => article.value?.updated || article.value?.date,
  articleAuthor: ['Xiaotong'],
})
const origin = useRuntimeConfig().public.siteUrl || useRequestURL().origin
useHead(() => ({
  script: article.value
    ? [
        {
          key: 'article-schema',
          type: 'application/ld+json',
          innerHTML: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BlogPosting',
            headline: article.value.title,
            description: article.value.description,
            datePublished: article.value.date,
            dateModified: article.value.updated || article.value.date,
            image: new URL(article.value.cover || '/og/default.png', origin).href,
            author: { '@type': 'Person', name: 'Xiaotong', url: new URL('/about', origin).href },
            mainEntityOfPage: new URL(route.path, origin).href,
          }).replace(/</g, '\\u003c'),
        },
      ]
    : [],
}))
</script>
<template>
  <div class="inner-page container article-detail">
    <NuxtLink to="/writing" class="back-link"><UIcon name="i-lucide-arrow-left" />All writing</NuxtLink>
    <ContentState
      v-if="error || !article"
      :title="missing ? 'A little off the path.' : '这篇笔记暂时没加载出来'"
      :description="
        missing ? '这篇笔记不存在或已撤回，去看看其他笔记吧。' : '读取遇到了一点问题，请重新加载试试。'
      "
      :busy="status === 'pending'"
      :retry="!missing"
      @retry="refresh()"
    >
      <NuxtLink to="/writing">返回笔记列表</NuxtLink>
    </ContentState>
    <template v-else>
      <WritingArticleView :article="article" />
      <nav v-if="previous || next" class="article-navigation" aria-label="文章翻页">
        <NuxtLink v-if="previous" :to="previous.path"
          ><small>← 上一篇</small><span>{{ previous.title }}</span></NuxtLink
        >
        <NuxtLink v-if="next" :to="next.path"
          ><small>下一篇 →</small><span>{{ next.title }}</span></NuxtLink
        >
      </nav>
    </template>
  </div>
</template>

<style src="../../assets/css/details.css"></style>
