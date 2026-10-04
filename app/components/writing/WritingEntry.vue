<script setup lang="ts">
import type { WritingSummary } from '~/types/content'
import { formatDate } from '~/utils/site'
defineProps<{ article: WritingSummary; index: number }>()
</script>

<template>
  <NuxtLink :to="article.path" class="writing-entry">
    <span class="entry-number">{{ String(index + 1).padStart(2, '0') }}</span>
    <div class="entry-copy">
      <div class="entry-meta">
        <time :datetime="article.date">{{ formatDate(article.date) }}</time
        ><span>{{ article.category }}</span
        ><span>{{ article.readingTime }} 分钟阅读</span>
      </div>
      <h2>{{ article.title }}<UIcon name="i-lucide-arrow-up-right" /></h2>
      <p>{{ article.description }}</p>
      <div class="entry-tags">
        <span v-for="tag in article.tags" :key="tag"># {{ tag }}</span>
      </div>
    </div>
    <NuxtImg
      class="entry-image"
      :src="article.cover"
      alt=""
      width="320"
      height="230"
      sizes="180px"
      format="webp"
      loading="lazy"
    />
  </NuxtLink>
</template>
