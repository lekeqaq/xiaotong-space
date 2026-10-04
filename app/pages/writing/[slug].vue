<script setup lang="ts">
import { formatDate } from '~/utils/site'
const route = useRoute()
const { data: article } = await useAsyncData(`article-${route.path}`, () =>
  queryCollection('writing').where('draft', '=', false).path(route.path).first(),
)
if (!article.value) throw createError({ statusCode: 404, statusMessage: 'Article not found' })
const { data: articles } = await useAsyncData('article-navigation', () =>
  queryCollection('writing').where('draft', '=', false).order('date', 'DESC').select('title', 'path').all(),
)
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
    <div class="article-opening">
      <header class="detail-header article-title-page">
        <span class="eyebrow"><span class="opening-dot" /> {{ article.category }} / FIELD NOTES</span>
        <h1>{{ article.title }}</h1>
        <p>{{ article.description }}</p>
        <div class="article-meta">
          <time :datetime="article.date">{{ formatDate(article.date) }}</time
          ><span>{{ article.readingTime }} min read</span
          ><span v-if="article.updated">更新于 {{ formatDate(article.updated) }}</span>
          <div class="tech-tags"><TechTag v-for="tag in article.tags" :key="tag" :label="tag" /></div>
        </div>
      </header>
      <figure class="article-photo-page">
        <span class="photo-margin-note" aria-hidden="true">A THOUGHT, WORTH KEEPING.</span>
        <div class="article-photo-mount">
          <span class="photo-tape" aria-hidden="true" />
          <NuxtImg
            format="webp"
            class="article-opening-photo"
            :src="article.cover"
            :alt="article.title"
            width="720"
            height="860"
            sizes="sm:80vw md:35vw xl:440px"
          />
          <figcaption>
            <span>随想 / {{ article.date.slice(0, 4) }}</span
            ><span aria-hidden="true">↗</span>
          </figcaption>
        </div>
        <span class="photo-handnote">边做，边想，边记录。</span>
      </figure>
    </div>
    <div class="detail-divider article-reading-line">
      <span><UIcon name="i-lucide-align-left" /> {{ article.readingTime }} MIN READ</span
      ><span>把一个想法，慢慢展开。<UIcon name="i-lucide-arrow-down" /></span>
    </div>
    <ContentDocument :document="article" />
    <nav class="article-navigation" aria-label="文章翻页">
      <NuxtLink v-if="previous" :to="previous.path"
        ><small>← 上一篇</small><span>{{ previous.title }}</span></NuxtLink
      ><NuxtLink v-if="next" :to="next.path"
        ><small>下一篇 →</small><span>{{ next.title }}</span></NuxtLink
      >
    </nav>
  </div>
</template>
