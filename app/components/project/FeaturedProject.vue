<script setup lang="ts">
import type { ProjectSummary } from '~/types/content'
defineProps<{ project: ProjectSummary }>()
</script>
<template>
  <NuxtLink :to="project.path" class="featured-project"
    ><div class="featured-copy">
      <span class="project-number">0{{ project.order }}</span>
      <div>
        <h3>{{ project.title }}</h3>
        <p class="project-subtitle">{{ project.subtitle }}</p>
        <p class="project-description">{{ project.description }}</p>
        <div class="tech-tags"><TechTag v-for="tech in project.tech" :key="tech" :label="tech" /></div>
        <span class="text-link">View case study <UIcon name="i-lucide-arrow-right" /></span>
      </div>
    </div>
    <ProjectPreview :kind="project.kind" large
  /></NuxtLink>
</template>
