<script setup lang="ts">
import type { RenderedArticle } from '#shared/admin'
import { formatDate } from '~/utils/site'
defineProps<{ article: RenderedArticle }>()
</script>
<template>
  <div class="writing-article-view">
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
          <SiteImage
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
  </div>
</template>
