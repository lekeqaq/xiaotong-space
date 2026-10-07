<script setup lang="ts">
import type { Project, Writing } from '~/types/content'
import ProsePre from '~/components/content/ProsePre.vue'
import ContentCallout from '~/components/content/ContentCallout.vue'
import SiteImage from './SiteImage.vue'
defineProps<{ document: Project | Writing }>()
</script>
<template>
  <div class="document-layout">
    <slot name="header" />
    <article class="prose-content">
      <slot />
      <MDCRenderer
        v-if="'markdown' in document"
        :body="document.body"
        :data="document"
        :components="{ pre: ProsePre, img: SiteImage, 'content-callout': ContentCallout }"
      />
      <ContentRenderer v-else :value="document" />
    </article>
    <aside v-if="$slots.aside || document.body.toc?.links.length" class="document-toc">
      <slot name="aside" />
      <AnimatedDetails v-if="document.body.toc?.links.length" default-open>
        <template #summary
          >ON THIS PAGE <UIcon name="i-lucide-chevron-down" class="disclosure-chevron"
        /></template>
        <ContentToc :links="document.body.toc.links" />
      </AnimatedDetails>
    </aside>
  </div>
</template>
