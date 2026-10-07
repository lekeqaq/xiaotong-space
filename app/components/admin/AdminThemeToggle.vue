<script setup lang="ts">
const { colorMode, toggleTheme } = useAdminTheme()
const mounted = ref(false)
onMounted(() => {
  mounted.value = true
})
const dark = computed(() => mounted.value && colorMode.value === 'dark')
const label = computed(() =>
  mounted.value ? (dark.value ? '切换到浅色主题' : '切换到深色主题') : '切换主题',
)
</script>
<template>
  <VBtn icon variant="text" :aria-label="label" :title="label" @click="toggleTheme">
    <UIcon :name="dark ? 'i-lucide-moon' : 'i-lucide-sun'" />
  </VBtn>
</template>
