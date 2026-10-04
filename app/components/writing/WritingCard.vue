<script setup lang="ts">
import type { WritingSummary } from '~/types/content'
import { formatDate } from '~/utils/site'
defineProps<{ article: WritingSummary }>()
</script>
<template>
  <NuxtLink :to="article.path" class="writing-card"
    ><NuxtImg
      format="webp"
      :src="article.cover"
      :alt="article.title"
      width="500"
      height="200"
      sizes="100vw md:33vw xl:350px"
      loading="lazy" />
    <div class="writing-card-body">
      <time :datetime="article.date">{{ formatDate(article.date) }}</time>
      <h3>{{ article.title }}</h3>
      <p>{{ article.description }}</p>
      <div class="writing-card-bottom">
        <div class="tech-tags">
          <TechTag v-for="tag in article.tags.slice(0, 3)" :key="tag" :label="tag" />
        </div>
        <span>{{ article.readingTime }} min <UIcon name="i-lucide-arrow-right" /></span>
      </div></div
  ></NuxtLink>
</template>
