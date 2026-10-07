<script setup lang="ts">
import type { RenderedArticle } from '#shared/content'
import { formatDate } from '~/utils/site'
defineProps<{ article: RenderedArticle }>()
</script>
<template>
  <div class="writing-article-view">
    <ContentDocument :document="article">
      <template #header>
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
          <AnimatedDetails v-if="article.body.toc?.links.length" class="article-mobile-toc">
            <template #summary
              >文章目录 <UIcon name="i-lucide-chevron-down" class="disclosure-chevron"
            /></template>
            <ContentToc :links="article.body.toc.links" />
          </AnimatedDetails>
        </header>
      </template>
      <template #aside>
        <figure class="article-photo-page">
          <div class="article-photo-mount">
            <span class="photo-tape" aria-hidden="true" />
            <SiteImage
              format="webp"
              class="article-opening-photo"
              :src="article.cover"
              :alt="article.title"
              width="440"
              height="330"
              sizes="sm:170px md:190px xl:220px"
            />
            <figcaption>
              <span>随想 / {{ article.date.slice(0, 4) }}</span
              ><span aria-hidden="true">↗</span>
            </figcaption>
          </div>
        </figure>
      </template>
    </ContentDocument>
  </div>
</template>
