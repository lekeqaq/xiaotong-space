<script setup lang="ts">
const route = useRoute()
const { data: article } = await useFetch(`/api/content/articles/${route.params.slug}`, {
  key: `article-${route.path}`,
})
if (!article.value) throw createError({ statusCode: 404, statusMessage: 'Article not found' })
const { data: articles } = await useFetch('/api/content/articles', { key: 'article-navigation' })
const index = computed(() => articles.value?.findIndex((item) => item.path === route.path) ?? -1)
const previous = computed(() => articles.value?.[index.value - 1])
const next = computed(() => articles.value?.[index.value + 1])
useSiteSeo(
  computed(() => article.value?.title || 'Writing'),
  computed(() => article.value?.description || ''),
  article.value.cover,
)
useSeoMeta({
  ogType: 'article',
  articlePublishedTime: article.value.date,
  articleModifiedTime: article.value.updated || article.value.date,
  articleAuthor: ['Xiaotong'],
})
const origin = useRuntimeConfig().public.siteUrl || useRequestURL().origin
useHead({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: article.value.title,
        description: article.value.description,
        datePublished: article.value.date,
        dateModified: article.value.updated || article.value.date,
        image: new URL(article.value.cover, origin).href,
        author: { '@type': 'Person', name: 'Xiaotong', url: new URL('/about', origin).href },
        mainEntityOfPage: new URL(route.path, origin).href,
      }).replace(/</g, '\u003c'),
    },
  ],
})
</script>
<template>
  <div v-if="article" class="inner-page container article-detail">
    <NuxtLink to="/writing" class="back-link"><UIcon name="i-lucide-arrow-left" />All writing</NuxtLink>
    <WritingArticleView :article="article" />
    <nav class="article-navigation" aria-label="文章翻页">
      <NuxtLink v-if="previous" :to="previous.path"
        ><small>← 上一篇</small><span>{{ previous.title }}</span></NuxtLink
      ><NuxtLink v-if="next" :to="next.path"
        ><small>下一篇 →</small><span>{{ next.title }}</span></NuxtLink
      >
    </nav>
  </div>
</template>
