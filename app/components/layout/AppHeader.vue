<script setup lang="ts">
import { siteIdentity } from '#shared/site'
import { navigation } from '~/utils/site'
const route = useRoute()
const config = useRuntimeConfig()
const menu = useTemplateRef<HTMLDetailsElement>('menu')
watch(
  () => route.path,
  () => {
    if (menu.value) menu.value.open = false
  },
)
function isActive(to: string) {
  return to === '/' ? route.path === '/' : route.path.startsWith(to)
}
</script>

<template>
  <header class="app-header">
    <div class="container header-inner">
      <NuxtLink to="/" class="wordmark" :aria-label="`${siteIdentity.name} 首页`"
        ><span class="wordmark-symbol" aria-hidden="true">✳</span
        ><span class="wordmark-name">{{ siteIdentity.name }}</span></NuxtLink
      >
      <nav class="desktop-nav" aria-label="主要导航">
        <NuxtLink
          v-for="item in navigation"
          :key="item.to"
          :to="item.to"
          :class="{ active: isActive(item.to) }"
          >{{ item.label }}</NuxtLink
        >
      </nav>
      <div class="header-actions">
        <ThemeToggle />
        <a
          v-if="config.public.githubUrl"
          :href="config.public.githubUrl"
          class="github-button"
          target="_blank"
          rel="noopener noreferrer"
          ><UIcon name="i-simple-icons-github" /> GitHub</a
        >
        <details ref="menu" class="mobile-menu">
          <summary role="button" aria-label="打开导航菜单"><UIcon name="i-lucide-menu" /></summary>
          <nav aria-label="移动端导航">
            <NuxtLink
              v-for="item in navigation"
              :key="item.to"
              :to="item.to"
              :class="{ active: isActive(item.to) }"
              >{{ item.label }}<UIcon name="i-lucide-arrow-up-right"
            /></NuxtLink>
          </nav>
        </details>
      </div>
    </div>
  </header>
</template>
