<script setup lang="ts">
import type { Project } from '~/types/content'
const route = useRoute()
const { data: project, error } = await useAsyncData(`project-${route.path}`, () =>
  $fetch<Project>(`/api/content/projects/${route.params.slug}`),
)
if (error.value) throw createError(error.value)
if (!project.value) throw createError({ statusCode: 404, statusMessage: 'Project not found' })
useSiteSeo(
  computed(() => project.value?.title || 'Project'),
  computed(() => project.value?.description || ''),
  project.value.cover,
)
</script>
<template>
  <div v-if="project" class="inner-page container project-detail">
    <NuxtLink to="/projects" class="back-link"><UIcon name="i-lucide-arrow-left" />All projects</NuxtLink>
    <div class="case-opening">
      <header class="detail-header case-copy">
        <span class="eyebrow">CASE STUDY / {{ project.year }} <StatusBadge :status="project.status" /></span>
        <h1>{{ project.title }}<span>.</span></h1>
        <span class="case-subtitle">{{ project.subtitle }}</span>
        <p>{{ project.description }}</p>
        <div class="detail-meta">
          <div class="tech-tags"><TechTag v-for="tech in project.tech" :key="tech" :label="tech" /></div>
          <a
            v-if="project.demo"
            :href="project.demo"
            target="_blank"
            rel="noopener noreferrer"
            class="text-link"
            >Live demo <UIcon name="i-lucide-arrow-up-right" /></a
          ><a
            v-if="project.repository"
            :href="project.repository"
            target="_blank"
            rel="noopener noreferrer"
            class="text-link"
            >Source code <UIcon name="i-simple-icons-github"
          /></a>
        </div>
        <a class="opening-read" href="#project-story"
          >读读这个项目的故事 <UIcon name="i-lucide-arrow-down-right"
        /></a>
      </header>
      <figure class="case-scene" :aria-label="project.previewCaption">
        <AnimatedDetails desktop-always-open summary-class="case-preview-toggle" panel-id="project-preview">
          <template #summary="{ expanded }">
            <span>{{ expanded ? '收起项目预览' : '展开项目预览' }}</span>
            <UIcon name="i-lucide-chevron-down" class="disclosure-chevron" />
          </template>
          <div class="case-preview-panel">
            <ProjectThumbnail :kind="project.kind" :summary="project.cardSummary" interactive />
          </div>
          <div class="case-preview-caption">
            <span>{{ project.previewCaption }}</span
            ><span>主题交互示意</span>
          </div>
        </AnimatedDetails>
      </figure>
    </div>
    <AnimatedDetails v-if="project.body.toc?.links.length" class="project-mobile-toc">
      <template #summary>项目目录 <UIcon name="i-lucide-chevron-down" class="disclosure-chevron" /></template>
      <ContentToc :links="project.body.toc.links" />
    </AnimatedDetails>
    <div id="project-story" class="detail-divider">
      <span>BEHIND THE BUILD</span><span>想法 / 过程 / 实践</span>
    </div>
    <ContentDocument :document="project" /><NuxtLink to="/projects" class="next-page-link"
      >Explore more work <UIcon name="i-lucide-arrow-right"
    /></NuxtLink>
  </div>
</template>

<style src="../../assets/css/projects.css"></style>

<style src="~/assets/css/details.css"></style>
