<script setup lang="ts">
import type { HomeContent } from '#shared/content'
import type { ProjectSummary, WritingSummary } from '~/types/content'
import StarField from './StarField.vue'
import SpaceDock from './SpaceDock.vue'
defineProps<{
  homeSettings?: HomeContent
  article?: WritingSummary
  project?: ProjectSummary
}>()
const clock = ref('--:--')
let timer: ReturnType<typeof setInterval> | undefined
onMounted(() => {
  const update = () => {
    clock.value = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Asia/Shanghai',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(new Date())
  }
  update()
  timer = setInterval(update, 30_000)
})
onUnmounted(() => clearInterval(timer))
</script>

<template>
  <section class="digital-desk" aria-labelledby="hero-title">
    <div class="desk-meta">
      <span><i /> PERSONAL SPACE · ALWAYS IN PROGRESS</span
      ><span
        >SHENZHEN, CN <time>{{ clock }}</time
        ><MotionToggle
      /></span>
    </div>
    <div class="desk-canvas">
      <StarField />
      <div class="desk-orbit" aria-hidden="true"><span /><i /></div>
      <div class="desk-satellite-track ambient-motion" aria-hidden="true"><i /></div>
      <div class="desk-intro">
        <span class="desk-hello"><span aria-hidden="true">✳</span> 嘿，我是小童。欢迎随便逛逛。</span>
        <h1 id="hero-title">
          A small space.<br /><em>A curious mind.</em
          ><span class="title-spark ambient-motion" aria-hidden="true">✧</span>
        </h1>
        <p>写一点代码，探索一点 AI，收集生活的切片。<br />这里存放我的作品、思考，和还没长大的想法。</p>
        <a class="desk-explore" href="#space-feed">往下探索 <UIcon name="i-lucide-arrow-down" /></a>
      </div>
      <NuxtLink v-if="article" :to="article.path" class="desk-note desk-object ambient-motion">
        <span class="desk-object-label"
          ><UIcon name="i-lucide-notebook-pen" /> LATEST NOTE <UIcon name="i-lucide-arrow-up-right"
        /></span>
        <span class="note-rule" aria-hidden="true" />
        <h2>{{ article.title }}</h2>
        <p>{{ article.description }}</p>
        <span class="desk-note-meta"
          >{{ article.date.replaceAll('-', '.') }} <span>{{ article.readingTime }} MIN READ</span></span
        >
      </NuxtLink>
      <div class="desk-photo-object ambient-motion"><DeskPostcard :photos="homeSettings?.photos" /></div>
      <NuxtLink v-if="project?.workbench" :to="project.path" class="desk-building desk-object ambient-motion">
        <span class="desk-object-label"
          ><span class="live-dot" /> ON MY WORKBENCH <UIcon name="i-lucide-arrow-up-right"
        /></span>
        <div class="mini-flow ambient-motion" aria-hidden="true">
          <span><UIcon name="i-lucide-mic" /></span><i /><span class="flow-core"
            ><UIcon name="i-lucide-brain-circuit" /></span
          ><i /><span><UIcon name="i-lucide-user-round" /></span>
        </div>
        <h2>{{ project.workbench.heading }}</h2>
        <p>{{ project.workbench.summary }}</p>
        <div class="building-progress ambient-motion">
          <span /><span /><span /><span /><span /><span /><span /><span /><span /><span /><span /><span />
        </div>
        <span class="building-caption"
          >{{ project.workbench.caption }}<UIcon name="i-lucide-arrow-right"
        /></span>
      </NuxtLink>
      <DeskThought :thoughts="homeSettings?.thoughts" />
      <span class="desk-scribble" aria-hidden="true"
        >make room<br />for curiosity
        <svg viewBox="0 0 80 45"><path d="M5 4C10 34 45 40 70 23M57 21l16 0-3 15" /></svg
      ></span>
      <span class="desk-coordinate" aria-hidden="true">22°32′ N<br />114°03′ E</span>
      <span class="desk-sticker" aria-hidden="true"
        ><UIcon name="i-lucide-code-xml" /><span>BUILT WITH<br />CURIOSITY</span></span
      >
    </div>
    <SpaceDock />
    <div class="desk-bottom">
      <span>没有终稿，持续生长。</span><span>SCROLL TO WANDER <UIcon name="i-lucide-arrow-down" /></span>
    </div>
  </section>
</template>
