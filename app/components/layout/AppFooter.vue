<script setup lang="ts">
import { siteIdentity } from '#shared/site'
import { navigation } from '~/utils/site'
const config = useRuntimeConfig()
</script>

<template>
  <footer class="app-footer container">
    <div>
      <NuxtLink to="/" class="wordmark"
        ><span class="wordmark-symbol" aria-hidden="true">✳</span
        ><span class="wordmark-name">{{ siteIdentity.name }}</span></NuxtLink
      >
      <p>Frontend Developer<br />Based in Shenzhen.</p>
    </div>
    <div class="footer-center">
      <nav aria-label="页脚导航">
        <NuxtLink v-for="item in navigation" :key="item.to" :to="item.to">{{ item.label }}</NuxtLink>
      </nav>
      <div class="social-links">
        <a
          v-if="config.public.githubUrl"
          :href="config.public.githubUrl"
          aria-label="GitHub"
          target="_blank"
          rel="noopener noreferrer"
          ><UIcon name="i-simple-icons-github"
        /></a>
        <a
          v-if="config.public.contactEmail"
          :href="`mailto:${config.public.contactEmail}`"
          aria-label="发送邮件"
          ><UIcon name="i-lucide-mail"
        /></a>
        <NuxtLink to="/subscribe" aria-label="订阅 RSS" :title="`订阅 ${siteIdentity.name}`"
          ><UIcon name="i-lucide-rss"
        /></NuxtLink>
        <NuxtLink to="/about#contact" aria-label="联系小童"
          ><UIcon name="i-lucide-message-circle"
        /></NuxtLink>
      </div>
    </div>
    <p class="footer-credit">
      Designed & built by Xiaotong.<br />Made with curiosity, and a little coffee.<br />©
      {{ new Date().getFullYear() }}
    </p>
  </footer>
</template>
