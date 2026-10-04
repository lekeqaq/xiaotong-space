<script setup lang="ts">
import type { ProjectSummary } from '~/types/content'
const props = defineProps<{
  project: ProjectSummary
  sources: Array<{ title: string; path: string; type: 'project' | 'note' }>
}>()
const notes = {
  travel: {
    label: 'WEEKENDS, REIMAGINED',
    heading: '把时间留给风景。',
    description:
      '两天很短，不想花一天做攻略。从一个「这周末去哪」的问题出发，试着把复杂的规划变成一次轻松的出发。',
    focus: ['产品设计', 'AI 行程规划', '跨端体验'],
    footnote: '周末不赶路，只去有意思的地方。',
  },
  human: {
    label: 'BEYOND THE INTERFACE',
    heading: '让对话，有一点温度。',
    description:
      '比起「能回答问题」，更在意它何时倾听、何时回应，又如何自然地被打断。一次关于实时交互的探索。',
    focus: ['实时通信', '语音交互', '状态设计'],
    footnote: '技术往前一步，距离再近一点。',
  },
  assistant: {
    label: 'A SECOND BRAIN',
    heading: '让散落的知识，彼此连接。',
    description:
      '项目、文章、踩过的坑，都是思考的切片。把这些内容组织起来，探索一个有记忆、也有据可循的个人助手。',
    focus: ['知识检索', 'RAG', '来源引用'],
    footnote: '先有可信知识，再有有用的助手。',
  },
}
const note = computed(() => notes[props.project.kind])
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
        ><span>{{ note.label }}</span
        ><span>{{ project.year }}</span>
      </div>
      <h2 :id="`title-${project.kind}`">{{ project.title }}</h2>
      <span class="showcase-subtitle">{{ project.subtitle }}</span>
      <h3>{{ note.heading }}</h3>
      <p>{{ note.description }}</p>
      <div class="showcase-focus">
        <span v-for="item in note.focus" :key="item">{{ item }}</span>
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
      <TravelScene v-if="project.kind === 'travel'" /><VoiceScene
        v-else-if="project.kind === 'human'"
      /><KnowledgeScene v-else :sources="sources" />
      <div class="showcase-caption">
        <span>{{ note.footnote }}</span
        ><span>概念预览 <i /> {{ project.status === 'live' ? 'LIVE' : 'IN PROGRESS' }}</span>
      </div>
    </div>
  </article>
</template>
