<script setup lang="ts">
import type { ProjectSummary } from '~/types/content'
const props = defineProps<{
  project: ProjectSummary
}>()
const notes = {
  travel: {
    label: 'WEEKENDS, REIMAGINED',
    heading: '把时间留给风景。',
    description:
      '从一个「这周末去哪」的问题出发，连接微信小程序、业务 API、运营后台和官网，把推荐与行程管理做成一条完整的使用路径。',
    focus: ['微信小程序', 'AI 行程规划', '全栈实践'],
    footnote: '周末不赶路，只去有意思的地方。',
  },
  human: {
    label: 'BEYOND THE INTERFACE',
    heading: '让对话，有一点温度。',
    description:
      '基于 LiveTalking，接入本地部署的千问／DeepSeek 和讯飞 ASR、TTS，让语言模型的回答成为可以听见的实时对话。',
    focus: ['开源方案集成', '本地模型', '实时语音对话'],
    footnote: '技术往前一步，距离再近一点。',
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
      <ProjectThumbnail :kind="project.kind" interactive />
      <div class="showcase-caption">
        <span>{{ note.footnote }}</span
        ><span>交互示意 <i /> {{ project.status === 'live' ? 'LIVE' : 'IN PROGRESS' }}</span>
      </div>
    </div>
  </article>
</template>
