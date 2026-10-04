<script setup lang="ts">
import type { Project, Writing, Experiment } from '~/types/content'
defineProps<{ document: Project | Writing | Experiment }>()
</script>
<template>
  <div class="document-layout">
    <article class="prose-content"><slot /><ContentRenderer :value="document" /></article>
    <aside v-if="document.body.toc?.links.length" class="document-toc">
      <details open>
        <summary>ON THIS PAGE <UIcon name="i-lucide-list" /></summary>
        <ContentToc :links="document.body.toc.links" />
      </details>
    </aside>
  </div>
</template>
