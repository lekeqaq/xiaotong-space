<script setup lang="ts">
import type { ProjectSummary } from '~/types/content'
defineProps<{
  project: ProjectSummary
}>()
</script>
<template>
  <article
    :id="`project-${project.kind}`"
    class="project-showcase"
    :class="`showcase-${project.kind}`"
    data-reveal
    :aria-labelledby="`title-${project.kind}`"
  >
    <div class="showcase-copy">
      <div class="showcase-overline">
        <span class="showcase-index">0{{ project.order }}</span
        ><span>{{ project.showcase.label }}</span
        ><span>{{ project.year }}</span>
      </div>
      <h2 :id="`title-${project.kind}`">{{ project.title }}</h2>
      <span class="showcase-subtitle">{{ project.subtitle }}</span>
      <h3>{{ project.showcase.heading }}</h3>
      <p>{{ project.description }}</p>
      <div class="showcase-focus">
        <span v-for="item in project.showcase.focus" :key="item">{{ item }}</span>
      </div>
      <NuxtLink :to="project.path" class="showcase-link"
        >打开项目手记 <span><UIcon name="i-lucide-arrow-up-right" /></span
      ></NuxtLink>
      <div class="showcase-stack">
        <span>BUILT WITH</span>
        <p>{{ project.tech.join(' / ') }}</p>
      </div>
    </div>
    <div class="showcase-visual">
      <ProjectThumbnail :kind="project.kind" :summary="project.cardSummary" interactive />
      <div class="showcase-caption">
        <span>{{ project.showcase.footnote }}</span>
      </div>
    </div>
  </article>
</template>
