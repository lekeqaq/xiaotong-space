<script setup lang="ts">
useSiteSeo('Projects', '小童的项目作品与 Case Study：逃个周末、AI 数字人和个人 AI 助手。')
const page = useTemplateRef<HTMLElement>('page')
useScrollReveal(page)
const { data } = await useAsyncData('project-gallery', async () => {
  const [projects, notes] = await Promise.all([
    queryCollection('projects').order('order', 'ASC').all(),
    queryCollection('writing')
      .where('draft', '=', false)
      .order('date', 'DESC')
      .limit(3)
      .select('title', 'path')
      .all(),
  ])
  return { projects, notes }
})
const sources = computed(() => [
  ...(data.value?.projects.map((item) => ({
    title: item.title,
    path: item.path,
    type: 'project' as const,
  })) || []),
  ...(data.value?.notes.map((item) => ({ title: item.title, path: item.path, type: 'note' as const })) || []),
])
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
        >THE COLLECTION <small>{{ String(data?.projects.length || 0).padStart(2, '0') }}</small></span
      >
      <nav aria-label="项目索引">
        <a v-for="project in data?.projects" :key="project.path" :href="`#project-${project.kind}`"
          ><span>0{{ project.order }}</span
          >{{ project.title }}<UIcon name="i-lucide-arrow-down-right"
        /></a>
      </nav>
      <MotionToggle />
    </div>
    <div class="project-gallery">
      <ProjectShowcase
        v-for="project in data?.projects"
        :key="project.path"
        :project="project"
        :sources="sources"
      />
    </div>
    <section class="project-next" data-reveal>
      <div>
        <span class="space-kicker">THE NEXT “WHAT IF”</span>
        <h2>还有一些想法，<em>正在发芽。</em></h2>
        <p>不完整，也可以先开始。</p>
      </div>
      <NuxtLink to="/lab"
        >去实验室逛逛 <span><UIcon name="i-lucide-arrow-up-right" /></span></NuxtLink
      ><span class="project-next-flower ambient-motion" aria-hidden="true">✳</span>
    </section>
    <p class="project-disclosure">
      这些手记记录示例项目的产品设计与技术探索；交互画面为概念预览，进展与实现边界见各项目详情。
    </p>
  </div>
</template>
<style src="../../assets/css/projects.css"></style>
