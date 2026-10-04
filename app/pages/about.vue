<script setup lang="ts">
useSiteSeo(
  'About · 关于我',
  '我是小童，一名生活在深圳的前端开发者。关注 Web 与 AI，记录开发中的实践，也分享生活里的小事。',
)

const config = useRuntimeConfig()
</script>

<template>
  <div class="profile-page container">
    <section class="profile-intro" aria-labelledby="profile-title">
      <div class="profile-intro-copy">
        <span class="profile-eyebrow">ABOUT</span>
        <h1 id="profile-title">你好，我是小童。</h1>
        <p class="profile-location">前端开发者，生活在深圳。</p>
        <p class="profile-description">
          喜欢把想法做成可以使用的东西，也喜欢把过程记录下来。这里是我的个人空间，放一些做过的项目、技术笔记，以及生活里的小事。
        </p>
      </div>
      <figure class="profile-photo">
        <NuxtImg
          src="/images/personal/mountain.jpg"
          alt="云层之下的雪山"
          width="620"
          height="520"
          sizes="sm:100vw md:280px"
          format="webp"
        />
        <figcaption>写代码，也看看远方。</figcaption>
      </figure>
    </section>

    <section class="profile-section" aria-labelledby="profile-focus-title">
      <h2 id="profile-focus-title">最近在做什么</h2>
      <div class="profile-section-content">
        <p>
          主要用 Vue、TypeScript 和 Nuxt 做 Web 开发。最近也在探索 AI 应用，从 RAG 到
          Agent，尝试把新工具用到实际的需求里。
        </p>
        <div class="profile-links">
          <NuxtLink to="/projects">看看项目 <UIcon name="i-lucide-arrow-up-right" /></NuxtLink>
          <NuxtLink to="/writing">读读笔记 <UIcon name="i-lucide-arrow-up-right" /></NuxtLink>
          <NuxtLink to="/lab">AI 实验室 <UIcon name="i-lucide-arrow-up-right" /></NuxtLink>
        </div>
      </div>
    </section>

    <section class="profile-section" aria-labelledby="profile-life-title">
      <h2 id="profile-life-title">工作之外</h2>
      <div class="profile-section-content">
        <p>喜欢旅行、摄影，也会看电影、做饭。偶尔离开屏幕，走走看看，给日常留一点空白。</p>
      </div>
    </section>

    <section id="contact" class="profile-section profile-contact" aria-labelledby="profile-contact-title">
      <h2 id="profile-contact-title">保持联系</h2>
      <div class="profile-section-content">
        <p v-if="config.public.contactEmail || config.public.githubUrl">
          欢迎聊聊技术、产品，或一个有趣的想法。
        </p>
        <p v-else>新的实践和想法会继续写在这里，欢迎常来看看。</p>
        <div class="profile-links">
          <a v-if="config.public.contactEmail" :href="`mailto:${config.public.contactEmail}`">
            写封邮件 <UIcon name="i-lucide-arrow-up-right" />
          </a>
          <a
            v-if="config.public.githubUrl"
            :href="config.public.githubUrl"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub <UIcon name="i-lucide-arrow-up-right" />
          </a>
          <NuxtLink to="/subscribe">订阅更新 <UIcon name="i-lucide-arrow-up-right" /></NuxtLink>
        </div>
      </div>
    </section>
  </div>
</template>

<style src="../assets/css/about.css"></style>
