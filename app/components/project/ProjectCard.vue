<script setup lang="ts">
import type { ProjectSummary } from '~/types/content'
defineProps<{ project: ProjectSummary }>()
</script>
<template>
  <NuxtLink :to="project.path" class="project-card"
    ><div class="project-card-copy">
      <span class="project-number">0{{ project.order }}</span>
      <h3>{{ project.title }}</h3>
      <p>{{ project.subtitle }}</p>
      <div class="tech-tags"><TechTag v-for="tech in project.tech" :key="tech" :label="tech" /></div>
    </div>
    <ProjectPreview :kind="project.kind" /><span class="circle-arrow"
      ><UIcon name="i-lucide-arrow-up-right" /></span
  ></NuxtLink>
</template>
