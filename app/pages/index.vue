<script setup lang="ts">
import { siteIdentity } from '#shared/site'
const home = useTemplateRef<HTMLElement>('home')
useScrollReveal(home)
useHead({ titleTemplate: null })
useSiteSeo(
  `${siteIdentity.title} — Frontend & AI`,
  '小童的个人数字空间。探索前端开发、AI Agent 与有趣的产品，分享项目实践、技术写作和生活片段。',
)
const { data } = await useAsyncData('home-content', async () => {
  const [projects, writing, lab] = await Promise.all([
    queryCollection('projects')
      .select(
        'path',
        'title',
        'subtitle',
        'description',
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
    queryCollection('writing')
      .select('path', 'title', 'description', 'date', 'cover', 'tags', 'category', 'readingTime')
      .where('draft', '=', false)
      .order('date', 'DESC')
      .all(),
    queryCollection('lab')
      .select('path', 'experiment', 'title', 'description', 'status', 'tech', 'order', 'icon')
      .order('order', 'ASC')
      .all(),
  ])
  return { projects, writing, lab }
})
</script>
<template>
  <div ref="home" class="home-page">
    <HeroSection
      :article="data?.writing[0]"
      :project-count="data?.projects.length || 0"
      :article-count="data?.writing.length || 0"
      :experiment-count="data?.lab.length || 0"
    />
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
            <div class="shelf-art" aria-hidden="true">
              <template v-if="project.kind === 'travel'"
                ><div class="travel-ticket">
                  <span>WEEKEND PASS</span><UIcon name="i-lucide-move-up-right" /><strong>逃个周末</strong
                  ><small>DESTINATION: ANYWHERE</small><i />
                </div>
                <span class="shelf-art-caption">less planning, more living.</span></template
              >
              <template v-else-if="project.kind === 'human'"
                ><div class="voice-bars">
                  <i
                    v-for="n in 15"
                    :key="n"
                    :style="{
                      '--bar-height': `${[18, 28, 45, 65, 40, 84, 56, 100, 58, 80, 43, 65, 38, 26, 17][n - 1]}%`,
                    }"
                  />
                </div>
                <span class="shelf-art-caption">a more human connection.</span></template
              >
              <template v-else
                ><div class="knowledge-orbit"><span /><span /><span /><UIcon name="i-lucide-sparkles" /></div>
                <span class="shelf-art-caption">connecting my little universe.</span></template
              >
              <span class="shelf-open"><UIcon name="i-lucide-arrow-up-right" /></span>
            </div>
            <div class="shelf-description">
              <span class="shelf-number">0{{ project.order }}</span>
              <div>
                <h3>{{ project.title }}</h3>
                <p>{{ project.subtitle }}</p>
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
        <section class="experiment-feed" data-reveal aria-labelledby="experiment-title">
          <div class="space-section-heading">
            <div>
              <span class="space-kicker">03 / WORK IN PROGRESS</span>
              <h2 id="experiment-title">还没完成，也很有趣。</h2>
            </div>
            <UIcon name="i-lucide-flask-conical" />
          </div>
          <NuxtLink
            v-for="experiment in data?.lab.slice(0, 4)"
            :key="experiment.path"
            :to="experiment.path"
            class="experiment-entry"
            ><UIcon :name="experiment.icon" />
            <div>
              <h3>{{ experiment.title }}</h3>
              <StatusBadge :status="experiment.status" />
            </div>
            <UIcon name="i-lucide-arrow-up-right"
          /></NuxtLink>
        </section>
      </div>
      <section class="space-journey" data-reveal aria-labelledby="journey-title">
        <div class="space-section-heading">
          <div>
            <span class="space-kicker">04 / CONNECTING THE DOTS</span>
            <h2 id="journey-title">一路走，一路长出新的自己。</h2>
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
        <NuxtLink to="/about#contact">很高兴在这里遇见你 <UIcon name="i-lucide-arrow-up-right" /></NuxtLink>
      </div>
    </div>
  </div>
</template>
