<script setup lang="ts">
useSiteSeo('Projects', '小童的项目作品与 Case Study：逃个周末与声伴，旅行规划与实时 AI 交流。')
const page = useTemplateRef<HTMLElement>('page')
useScrollReveal(page)
const { data, error } = await useProjectSummaries()
if (error.value) throw createError({ statusCode: 503, statusMessage: '项目读取失败，请稍后重试' })
</script>
<template>
  <div ref="page" class="projects-page container">
    <header class="projects-intro">
      <div class="projects-intro-copy">
        <span class="space-kicker"><span class="notebook-dot" /> A FEW THINGS I'VE BEEN MAKING</span>
        <h1>
          It starts with<br /><em>“what if?”</em
          ><span class="project-title-star ambient-motion" aria-hidden="true">✳</span>
        </h1>
        <p>好奇心是起点，代码是把手。<br />一些认真对待的小想法，以及把它们做出来的过程。</p>
      </div>
      <div class="project-intro-aside">
        <div class="project-stack-sketch" aria-hidden="true">
          <span><UIcon name="i-lucide-sparkles" /></span><span><UIcon name="i-lucide-audio-lines" /></span
          ><span><UIcon name="i-lucide-compass" /></span>
        </div>
        <p>small ideas.<br /><em>real possibilities.</em></p>
        <span>持续构建，持续修正。</span>
      </div>
    </header>
    <div class="project-directory">
      <span
        >THE COLLECTION <small>{{ String(data?.length || 0).padStart(2, '0') }}</small></span
      >
      <nav aria-label="项目索引">
        <a v-for="project in data" :key="project.path" :href="`#project-${project.kind}`"
          ><span>0{{ project.order }}</span
          >{{ project.title }}<UIcon name="i-lucide-arrow-down-right"
        /></a>
      </nav>
      <MotionToggle />
    </div>
    <div class="project-gallery">
      <ProjectShowcase v-for="project in data" :key="project.path" :project="project" />
    </div>
    <section class="project-next" data-reveal>
      <div>
        <span class="space-kicker">NOTES FROM THE PROCESS</span>
        <h2>作品之外，<em>把过程写下来。</em></h2>
        <p>记录实现、选择，以及一路遇到的问题。</p>
      </div>
      <NuxtLink to="/writing"
        >翻翻实践笔记 <span><UIcon name="i-lucide-arrow-up-right" /></span></NuxtLink
      ><span class="project-next-flower ambient-motion" aria-hidden="true">✳</span>
    </section>
    <p class="project-disclosure">
      两个实际项目的开发与集成记录。展览画面是主题交互示意，具体实现见项目手记。
    </p>
  </div>
</template>
<style src="../../assets/css/projects.css"></style>
