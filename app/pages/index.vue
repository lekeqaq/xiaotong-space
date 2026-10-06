<script setup lang="ts">
import { siteIdentity } from '#shared/site'
const home = useTemplateRef<HTMLElement>('home')
useScrollReveal(home)
useHead({ titleTemplate: null })
useSiteSeo(
  `${siteIdentity.title} — Frontend & AI`,
  '小童的个人数字空间。探索前端开发、AI 应用与有趣的产品，分享项目实践、技术写作和生活片段。',
)
const { data } = await useAsyncData('home-content', async () => {
  const [projects, writing] = await Promise.all([
    queryCollection('projects')
      .select(
        'path',
        'title',
        'subtitle',
        'description',
        'cardSummary',
        'previewCaption',
        'showcase',
        'workbench',
        'year',
        'cover',
        'tech',
        'featured',
        'status',
        'order',
        'kind',
      )
      .order('order', 'ASC')
      .all(),
    $fetch('/api/content/articles'),
  ])
  return { projects, writing }
})
</script>
<template>
  <div ref="home" class="home-page">
    <HeroSection :article="data?.writing[0]" :project="data?.projects.find((project) => project.workbench)" />
    <div id="space-feed" class="space-feed container">
      <section class="work-shelf" data-reveal aria-labelledby="shelf-title">
        <div class="space-section-heading">
          <div>
            <span class="space-kicker">01 / THE THINGS I MAKE</span>
            <h2 id="shelf-title">把「如果」变成「可以」。</h2>
          </div>
          <NuxtLink to="/projects" class="space-text-link"
            >所有作品 <UIcon name="i-lucide-arrow-up-right"
          /></NuxtLink>
        </div>
        <div class="project-shelf">
          <NuxtLink
            v-for="project in data?.projects"
            :key="project.path"
            :to="project.path"
            class="shelf-item"
            :class="`shelf-${project.kind}`"
          >
            <ProjectThumbnail :kind="project.kind" :summary="project.cardSummary" />
            <div class="shelf-description">
              <span class="shelf-number">0{{ project.order }}</span>
              <div>
                <h3>{{ project.title }}</h3>
                <p>{{ project.cardSummary }}</p>
              </div>
              <UIcon name="i-lucide-arrow-up-right" />
            </div>
          </NuxtLink>
        </div>
      </section>
      <div class="space-columns">
        <section class="notebook-feed" data-reveal aria-labelledby="notebook-title">
          <div class="space-section-heading">
            <div>
              <span class="space-kicker">02 / THINKING OUT LOUD</span>
              <h2 id="notebook-title">写下来，就清楚了一点。</h2>
            </div>
            <NuxtLink to="/writing" class="space-text-link" aria-label="查看全部笔记"
              ><UIcon name="i-lucide-arrow-up-right"
            /></NuxtLink>
          </div>
          <NuxtLink
            v-for="article in data?.writing.slice(0, 3)"
            :key="article.path"
            :to="article.path"
            class="notebook-entry"
            ><div>
              <time :datetime="article.date">{{ article.date.slice(5).replace('-', '.') }}</time
              ><span>{{ article.category }}</span>
            </div>
            <h3>{{ article.title }}</h3>
            <UIcon name="i-lucide-arrow-up-right"
          /></NuxtLink>
          <NuxtLink to="/writing" class="space-text-link feed-more"
            >翻翻我的笔记本 <UIcon name="i-lucide-arrow-right"
          /></NuxtLink>
        </section>
        <aside class="practice-note" data-reveal aria-labelledby="practice-title">
          <span class="space-kicker">A NOTE ON PRACTICE</span>
          <span class="practice-mark" aria-hidden="true">✳</span>
          <h2 id="practice-title">从具体的问题，<br />慢慢做起。</h2>
          <p>一个周末规划产品，一套实时数字人。把新工具用进真实的需求，也把过程中的选择与问题记录下来。</p>
          <NuxtLink to="/about" class="space-text-link"
            >关于我的实践 <UIcon name="i-lucide-arrow-up-right"
          /></NuxtLink>
          <span class="practice-signature">Keep making. Keep learning.</span>
        </aside>
      </div>
      <section class="space-journey" data-reveal aria-labelledby="journey-title">
        <div class="space-section-heading">
          <div>
            <span class="space-kicker">03 / SMALL STEPS</span>
            <h2 id="journey-title">做一点，学一点，再往前一点。</h2>
          </div>
          <NuxtLink to="/about" class="space-text-link"
            >更多关于我 <UIcon name="i-lucide-arrow-up-right"
          /></NuxtLink>
        </div>
        <JourneyTimeline />
      </section>
      <div class="space-signoff">
        <span aria-hidden="true">✳</span>
        <p>这个小小的空间，<em>永远未完待续。</em></p>
        <NuxtLink to="/about">很高兴在这里遇见你 <UIcon name="i-lucide-arrow-up-right" /></NuxtLink>
      </div>
    </div>
  </div>
</template>
