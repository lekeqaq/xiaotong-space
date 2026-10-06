<script setup lang="ts">
useSiteSeo('About', '我是小童，一名生活在深圳的前端开发者。记录 Web 与 AI 的项目实践，也分享生活里的小事。')
const profile = useTemplateRef<HTMLElement>('profile')
useScrollReveal(profile)
const interests = [
  { icon: 'i-lucide-mountain', label: '旅行' },
  { icon: 'i-lucide-camera', label: '摄影' },
  { icon: 'i-lucide-clapperboard', label: '电影' },
  { icon: 'i-lucide-cooking-pot', label: '做饭' },
]
</script>

<template>
  <div ref="profile" class="profile-page container">
    <section class="profile-intro" aria-labelledby="profile-title">
      <div class="profile-intro-copy">
        <span class="profile-eyebrow">ABOUT / 关于这个空间的主人</span>
        <h1 id="profile-title">你好，我是小童<span class="profile-star" aria-hidden="true">✳</span></h1>
        <p class="profile-location"><span />前端开发者，生活在深圳。</p>
        <p class="profile-description">
          喜欢把想法做成可以使用的东西，也喜欢把过程记录下来。这里是我的个人空间，放一些做过的项目、技术笔记，以及生活里的小事。
        </p>
        <span class="profile-handnote">Always curious. Still learning.</span>
      </div>
      <ProfileViewfinder />
    </section>

    <section class="profile-section" data-reveal aria-labelledby="profile-focus-title">
      <div class="profile-section-heading">
        <span>01 / IN PROGRESS</span>
        <h2 id="profile-focus-title">最近在做什么</h2>
      </div>
      <div class="profile-section-content">
        <p>
          我主要用 Vue、TypeScript 和 Nuxt 做 Web 开发，也在通过项目实践拓展对 AI
          应用的理解。目前正在开发「逃个周末」，用 AI 辅助周末旅行规划；另一个项目「声伴」则基于
          LiveTalking，整合本地语言模型与语音服务，实现数字人的实时对话。
        </p>
        <div class="profile-toolbox" aria-label="常用技术">
          <span>Vue</span><span>TypeScript</span><span>Nuxt</span><span>AI 应用</span>
        </div>
        <div class="profile-links">
          <NuxtLink to="/projects">看看项目 <UIcon name="i-lucide-arrow-up-right" /></NuxtLink>
          <NuxtLink to="/writing">读读笔记 <UIcon name="i-lucide-arrow-up-right" /></NuxtLink>
        </div>
      </div>
    </section>

    <section class="profile-section" data-reveal aria-labelledby="profile-life-title">
      <div class="profile-section-heading">
        <span>02 / OFF THE SCREEN</span>
        <h2 id="profile-life-title">工作之外</h2>
      </div>
      <div class="profile-section-content">
        <p>喜欢旅行、摄影，也会看电影、做饭。偶尔离开屏幕，走走看看，给日常留一点空白。</p>
        <div class="profile-interests">
          <span v-for="interest in interests" :key="interest.label"
            ><UIcon :name="interest.icon" />{{ interest.label }}</span
          >
        </div>
      </div>
    </section>
  </div>
</template>

<style src="../assets/css/about.css"></style>
