<script setup lang="ts">
withDefaults(defineProps<{ title: string; wide?: boolean }>(), { wide: false })
const emit = defineEmits<{ close: [] }>()
const titleId = useId()
const returnFocus = import.meta.client ? (document.activeElement as HTMLElement | null) : null
onUnmounted(() => {
  if (returnFocus?.isConnected) returnFocus.focus({ preventScroll: true })
})
</script>
<template>
  <VDialog
    :model-value="true"
    :max-width="wide ? 1440 : 560"
    scrollable
    scroll-strategy="block"
    class="admin-vuetify"
    content-class="admin-dialog-overlay"
    :aria-labelledby="titleId"
    @update:model-value="
      (value) => {
        if (!value) emit('close')
      }
    "
  >
    <VCard class="admin admin-vuetify admin-dialog-card" :class="{ 'admin-dialog-wide': wide }">
      <header class="admin-dialog-header">
        <div>
          <h2 :id="titleId">{{ title }}</h2>
        </div>
        <VBtn icon variant="text" aria-label="关闭弹窗" @click="emit('close')"
          ><UIcon name="i-lucide-x"
        /></VBtn>
      </header>
      <div class="admin-dialog-body"><slot /></div>
      <footer v-if="$slots.footer" class="admin-dialog-footer"><slot name="footer" /></footer>
    </VCard>
  </VDialog>
</template>
