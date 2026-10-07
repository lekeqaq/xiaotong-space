<script setup lang="ts">
import { siteIdentity } from '#shared/site'
import BackToTop from '~/components/common/BackToTop.vue'
const config = useRuntimeConfig()
const route = useRoute()
const isAdmin = computed(() => route.path === '/admin' || route.path.startsWith('/admin/'))
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
    <GlobalLoading :admin="isAdmin" />
    <a class="skip-link" href="#main-content">跳转至主要内容</a>
    <AppHeader v-if="!isAdmin" />
    <main id="main-content">
      <NuxtLayout><NuxtPage /></NuxtLayout>
    </main>
    <AppFooter v-if="!isAdmin" />
    <BackToTop v-if="!isAdmin" />
  </div>
</template>

<style src="./assets/css/main.css"></style>

<style src="./assets/css/space.css"></style>

<style src="./assets/css/motion.css"></style>

<style src="./assets/css/details.css"></style>

<style src="./assets/css/admin.css"></style>
