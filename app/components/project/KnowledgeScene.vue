<script setup lang="ts">
defineProps<{ sources: Array<{ title: string; path: string; type: 'project' | 'note' }> }>()
const sourceType = ref<'project' | 'note'>('project')
</script>
<template>
  <div class="knowledge-scene project-scene">
    <div class="scene-topline">
      <span><UIcon name="i-lucide-sparkles" /> CONNECT THE DOTS</span><span>KNOWLEDGE EXPLORER</span>
    </div>
    <div class="knowledge-map ambient-motion" aria-hidden="true">
      <svg viewBox="0 0 560 260">
        <path d="M95 100Q190 85 280 142T470 83M140 227Q205 150 280 142T438 225M260 32L280 142" /></svg
      ><span class="knowledge-node node-project"><UIcon name="i-lucide-box" />Projects</span
      ><span class="knowledge-node node-notes"><UIcon name="i-lucide-notebook-pen" />Notes</span
      ><span class="knowledge-node node-ideas"><UIcon name="i-lucide-lightbulb" />Ideas</span
      ><span class="knowledge-node node-me">X.</span
      ><span class="knowledge-node node-core"><UIcon name="i-lucide-sparkles" /></span
      ><i class="knowledge-pulse" />
    </div>
    <div class="source-browser">
      <div class="source-browser-header">
        <span>MY LITTLE UNIVERSE</span>
        <div role="group" aria-label="知识来源">
          <button type="button" :aria-pressed="sourceType === 'project'" @click="sourceType = 'project'">
            项目</button
          ><button type="button" :aria-pressed="sourceType === 'note'" @click="sourceType = 'note'">
            笔记
          </button>
        </div>
      </div>
      <div :key="sourceType" class="source-list" aria-live="polite">
        <NuxtLink
          v-for="(source, index) in sources.filter((item) => item.type === sourceType).slice(0, 3)"
          :key="source.path"
          :to="source.path"
          :style="{ '--source-delay': `${index * 60}ms` }"
          ><UIcon :name="sourceType === 'project' ? 'i-lucide-box' : 'i-lucide-file-text'" /><span>{{
            source.title
          }}</span
          ><UIcon name="i-lucide-arrow-up-right"
        /></NuxtLink>
      </div>
    </div>
    <span class="scene-interaction-hint"
      >每一个答案，都应该有出处。<UIcon name="i-lucide-arrow-up-right"
    /></span>
  </div>
</template>
