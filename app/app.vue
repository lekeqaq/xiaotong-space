<script setup lang="ts">
import { siteIdentity } from '#shared/site'
const config = useRuntimeConfig()
const motionPaused = useState('ambient-motion-paused', () => false)
useHead({ meta: [{ name: 'theme-color', content: '#7c3aed' }] })
useSeoMeta({ ogSiteName: siteIdentity.title, twitterCard: 'summary_large_image' })
const origin = config.public.siteUrl || useRequestURL().origin
useHead({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Person',
        name: 'Xiaotong',
        jobTitle: 'Frontend Developer & AI Explorer',
        url: origin,
        homeLocation: { '@type': 'Place', name: 'Shenzhen, China' },
      }).replace(/</g, '\u003c'),
    },
  ],
})
</script>

<template>
  <div class="site-app" :class="{ 'motion-paused': motionPaused }">
    <a class="skip-link" href="#main-content">跳转至主要内容</a>
    <AppHeader />
    <main id="main-content"><NuxtPage /></main>
    <AppFooter />
  </div>
</template>

<style src="./assets/css/main.css"></style>

<style src="./assets/css/space.css"></style>

<style src="./assets/css/motion.css"></style>

<style src="./assets/css/details.css"></style>
