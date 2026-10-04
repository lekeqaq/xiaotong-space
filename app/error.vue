<script setup lang="ts">
import { siteIdentity } from '#shared/site'
import type { NuxtError } from '#app'
const props = defineProps<{ error: NuxtError }>()
useSeoMeta({
  title:
    props.error.statusCode === 404
      ? `Page not found · ${siteIdentity.name}`
      : `Something went wrong · ${siteIdentity.name}`,
  robots: 'noindex',
})
</script>
<template>
  <div class="error-page">
    <NuxtLink class="wordmark" to="/">{{ siteIdentity.name }}</NuxtLink
    ><span class="error-code">{{ error.statusCode }}</span>
    <h1>{{ error.statusCode === 404 ? 'A little off the path.' : 'A small detour.' }}</h1>
    <p>
      {{
        error.statusCode === 404
          ? '这个页面还没被创造，或者已经去了别的地方。'
          : '页面暂时遇到了一点问题，请稍后再试。'
      }}
    </p>
    <button class="button button-primary" @click="clearError({ redirect: '/' })">
      Back home <UIcon name="i-lucide-arrow-right" /></button
    ><span class="handwritten">Let’s find another way. ✧</span>
  </div>
</template>
