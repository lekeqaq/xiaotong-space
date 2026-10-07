<script setup lang="ts">
import { siteIdentity } from '#shared/site'
import { navigation } from '~/utils/site'
import AnimatedDetails from '~/components/common/AnimatedDetails.vue'
const route = useRoute()
const config = useRuntimeConfig()
const menu = useTemplateRef<InstanceType<typeof AnimatedDetails>>('menu')
watch(
  () => route.path,
  () => {
    menu.value?.setOpen(false)
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
          :aria-current="isActive(item.to) ? 'page' : undefined"
          >{{ item.label }}</NuxtLink
        >
      </nav>
      <div class="header-actions">
        <a
          :href="config.public.githubUrl || siteIdentity.githubUrl"
          class="github-icon-link"
          aria-label="查看 GitHub 仓库（新窗口打开）"
          title="GitHub 仓库"
          target="_blank"
          rel="noopener noreferrer"
          ><UIcon name="i-simple-icons-github" aria-hidden="true"
        /></a>
        <ThemeToggle />
        <AnimatedDetails ref="menu" class="mobile-menu" summary-label="打开导航菜单">
          <template #summary>
            <span class="disclosure-menu-icon" aria-hidden="true"><i /><i /><i /></span>
          </template>
          <nav aria-label="移动端导航">
            <NuxtLink
              v-for="item in navigation"
              :key="item.to"
              :to="item.to"
              :class="{ active: isActive(item.to) }"
              :aria-current="isActive(item.to) ? 'page' : undefined"
              >{{ item.label }}<UIcon name="i-lucide-arrow-up-right"
            /></NuxtLink>
          </nav>
        </AnimatedDetails>
      </div>
    </div>
  </header>
</template>
