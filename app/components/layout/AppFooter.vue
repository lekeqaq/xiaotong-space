<script setup lang="ts">
import { siteIdentity } from '#shared/site'
import { navigation } from '~/utils/site'
const config = useRuntimeConfig()
</script>

<template>
  <footer class="app-footer site-footer container">
    <div>
      <NuxtLink to="/" class="wordmark"
        ><span class="wordmark-symbol" aria-hidden="true">✳</span
        ><span class="wordmark-name">{{ siteIdentity.name }}</span></NuxtLink
      >
      <p>Frontend Developer · Shenzhen<br />记录所做，分享所学。</p>
    </div>
    <div class="footer-center">
      <span class="footer-nav-label">EXPLORE</span>
      <nav aria-label="页脚导航">
        <NuxtLink v-for="(item, index) in navigation" :key="item.to" :to="item.to">
          <span aria-hidden="true">0{{ index + 1 }}</span
          >{{ item.label }}
        </NuxtLink>
      </nav>
    </div>
    <div class="footer-meta">
      <p class="footer-credit">
        Designed & built by Xiaotong.<br />Made with curiosity, and a little coffee.<br />©
        {{ new Date().getFullYear() }}
      </p>
      <div v-if="config.public.githubUrl || config.public.contactEmail" class="footer-contact">
        <a
          v-if="config.public.githubUrl"
          :href="config.public.githubUrl"
          aria-label="GitHub"
          target="_blank"
          rel="noopener noreferrer"
          >GitHub ↗</a
        >
        <a
          v-if="config.public.contactEmail"
          :href="`mailto:${config.public.contactEmail}`"
          aria-label="发送邮件"
          >Email ↗</a
        >
      </div>
    </div>
  </footer>
</template>

<style src="../../assets/css/footer.css"></style>
