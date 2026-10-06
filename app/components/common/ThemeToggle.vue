<script setup lang="ts">
const { colorMode, toggleTheme } = useThemeTransition()
const label = computed(() => {
  if (colorMode.unknown) return '切换主题'
  return colorMode.value === 'dark' ? '切换到浅色主题' : '切换到深色主题'
})
</script>

<template>
  <button type="button" class="theme-toggle" :aria-label="label" :title="label" @click="toggleTheme">
    <UIcon name="i-lucide-sun" class="theme-sun" />
    <UIcon name="i-lucide-moon" class="theme-moon" />
  </button>
</template>
