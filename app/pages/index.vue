<script setup lang="ts">
import { siteIdentity } from '#shared/site'
import { initialHome } from '#shared/home'
import type { HomeContent } from '#shared/content'
const home = useTemplateRef<HTMLElement>('home')
useScrollReveal(home)
useHead({ titleTemplate: null })
useSiteSeo(
  `${siteIdentity.title} — Frontend & AI`,
  '小童的个人数字空间。探索前端开发、AI 应用与有趣的产品，分享项目实践、技术写作和生活片段。',
)
const [projectFeed, writingFeed, homeFeed] = await Promise.all([
  useProjectSummaries(),
  useWritingSummaries(),
  useFetch<HomeContent>('/api/content/home', { key: 'home-settings', timeout: 8000, retry: 0 }),
])
const { data: projects, error: projectsError, status: projectsStatus, refresh: retryProjects } = projectFeed
const { data: writing, error: writingError, status: writingStatus, refresh: retryWriting } = writingFeed
const { data: settings, error: settingsError, status: settingsStatus, refresh: retrySettings } = homeFeed
</script>
<template>
  <div ref="home" class="home-page">
    <HeroSection
      :home-settings="settings || initialHome"
      :article="writingError ? undefined : writing?.[0]"
      :project="projectsError ? undefined : projects?.find((project) => project.workbench)"
    />
    <div id="space-feed" class="space-feed container">
      <ContentState
        v-if="settingsError"
        title="生活片段暂时没加载出来"
        description="先看看默认的风景，也可以重新加载。"
        :busy="settingsStatus === 'pending'"
        @retry="retrySettings()"
      />
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
        <ContentState
          v-if="projectsError"
          title="作品暂时没加载出来"
          description="请稍后重试，其他内容仍然可以浏览。"
          :busy="projectsStatus === 'pending'"
          @retry="retryProjects()"
        />
        <p v-else-if="!projects?.length">新的作品正在整理中。</p>
        <div v-else class="project-shelf">
          <NuxtLink
            v-for="project in projects"
            :key="project.path"
            :to="project.path"
            class="shelf-item"
            :class="`shelf-${project.kind}`"
          >
            <ProjectThumbnail :kind="project.kind" :summary="project.cardSummary" size="shelf" />
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
          <ContentState
            v-if="writingError"
            title="笔记暂时没加载出来"
            description="请稍后重试，作品和生活片段仍然可以浏览。"
            :busy="writingStatus === 'pending'"
            @retry="retryWriting()"
          />
          <p v-else-if="!writing?.length">还没有发布笔记，慢慢写，慢慢积累。</p>
          <NuxtLink
            v-for="article in writingError ? [] : writing?.slice(0, 3)"
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

<style src="../assets/css/space.css"></style>
<style src="../assets/css/home-motion.css"></style>
