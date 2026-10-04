<script setup lang="ts">
import type { WritingSummary } from '~/types/content'
import StarField from './StarField.vue'
defineProps<{
  article?: WritingSummary
  projectCount: number
  articleCount: number
  experimentCount: number
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
      <div class="desk-photo-object ambient-motion"><DeskPostcard /></div>
      <NuxtLink to="/lab/personal-rag" class="desk-building desk-object ambient-motion">
        <span class="desk-object-label"
          ><span class="live-dot" /> ON MY WORKBENCH <UIcon name="i-lucide-arrow-up-right"
        /></span>
        <div class="mini-flow ambient-motion" aria-hidden="true">
          <span><UIcon name="i-lucide-files" /></span><i /><span class="flow-core"
            ><UIcon name="i-lucide-sparkles" /></span
          ><i /><span><UIcon name="i-lucide-message-circle" /></span>
        </div>
        <h2>一个更懂我的 AI。</h2>
        <p>Personal RAG · 正在探索中</p>
        <div class="building-progress ambient-motion">
          <span /><span /><span /><span /><span /><span /><span /><span /><span /><span /><span /><span />
        </div>
        <span class="building-caption">从零开始，把想法连起来。<UIcon name="i-lucide-arrow-right" /></span>
      </NuxtLink>
      <DeskThought />
      <span class="desk-scribble" aria-hidden="true"
        >make room<br />for curiosity
        <svg viewBox="0 0 80 45"><path d="M5 4C10 34 45 40 70 23M57 21l16 0-3 15" /></svg
      ></span>
      <span class="desk-coordinate" aria-hidden="true">22°32′ N<br />114°03′ E</span>
      <span class="desk-sticker" aria-hidden="true"
        ><UIcon name="i-lucide-code-xml" /><span>BUILT WITH<br />CURIOSITY</span></span
      >
    </div>
    <nav class="space-dock" aria-label="探索我的空间">
      <NuxtLink to="/projects"
        ><UIcon name="i-lucide-box" /><span
          >作品<small>{{ String(projectCount).padStart(2, '0') }}</small></span
        ></NuxtLink
      >
      <NuxtLink to="/writing"
        ><UIcon name="i-lucide-notebook-pen" /><span
          >笔记<small>{{ String(articleCount).padStart(2, '0') }}</small></span
        ></NuxtLink
      >
      <NuxtLink to="/lab"
        ><UIcon name="i-lucide-flask-conical" /><span
          >实验<small>{{ String(experimentCount).padStart(2, '0') }}</small></span
        ></NuxtLink
      >
      <NuxtLink to="/about"
        ><UIcon name="i-lucide-smile" /><span>关于我<UIcon name="i-lucide-arrow-up-right" /></span
      ></NuxtLink>
    </nav>
    <div class="desk-bottom">
      <span>没有终稿，持续生长。</span><span>SCROLL TO WANDER <UIcon name="i-lucide-arrow-down" /></span>
    </div>
  </section>
</template>
