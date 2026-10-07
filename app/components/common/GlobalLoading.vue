<script setup lang="ts">
defineProps<{ admin: boolean }>()
const ready = ref(false)
const { isLoading } = useLoadingIndicator({ throttle: 120, hideDelay: 150 })
const nuxtApp = useNuxtApp()
const stopMounted = nuxtApp.hook('app:mounted', () => {
  ready.value = true
})
const stopError = nuxtApp.hook('app:error', () => {
  ready.value = true
})
onBeforeUnmount(() => {
  stopMounted()
  stopError()
})
useHead({ noscript: [{ innerHTML: '<style>.app-boot-loading{display:none!important}</style>' }] })
</script>

<template>
  <NuxtLoadingIndicator color="var(--color-accent)" :height="3" />
  <div v-if="admin && !ready" class="app-boot-loading" role="status" aria-live="polite">
    <span class="app-loading-symbol" aria-hidden="true">✳</span>
    <strong>正在准备工作台</strong>
    <span>马上就好…</span>
  </div>
  <div v-else-if="isLoading" class="app-navigation-loading" role="status" aria-live="polite">
    <span class="app-loading-spinner" aria-hidden="true" />正在加载页面…
  </div>
</template>

<style scoped>
.app-boot-loading {
  position: fixed;
  inset: 0;
  z-index: 10000;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  background: var(--color-bg);
  color: var(--color-text-muted);
  font-size: 13px;
}
.app-boot-loading strong {
  color: var(--color-text);
  font-size: 16px;
}
.app-loading-symbol {
  color: var(--color-accent);
  font-size: 44px;
  animation: app-loading-spin 2.4s linear infinite;
}
.app-navigation-loading {
  position: fixed;
  top: 16px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10000;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 16px;
  border: 1px solid var(--color-border);
  border-radius: 999px;
  background: var(--color-surface);
  color: var(--color-text-muted);
  box-shadow: var(--shadow-soft);
  font-size: 13px;
  pointer-events: none;
}
.app-loading-spinner {
  width: 14px;
  height: 14px;
  border: 2px solid var(--color-border);
  border-top-color: var(--color-accent);
  border-radius: 50%;
  animation: app-loading-spin 0.8s linear infinite;
}
@keyframes app-loading-spin {
  to {
    transform: rotate(360deg);
  }
}
@media (prefers-reduced-motion: reduce) {
  .app-loading-symbol,
  .app-loading-spinner {
    animation: none;
  }
}
</style>
