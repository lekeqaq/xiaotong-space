<script setup lang="ts">
import type { AdminToastMessage } from '~/composables/useAdminToast'
const props = defineProps<{ item: AdminToastMessage }>()
const emit = defineEmits<{ dismiss: [] }>()
const icons = {
  success: 'i-lucide-circle-check',
  error: 'i-lucide-circle-alert',
  info: 'i-lucide-info',
  warning: 'i-lucide-triangle-alert',
}
let remaining = props.item.kind === 'error' || props.item.kind === 'warning' ? 6500 : 3500
let started = 0
let timer: ReturnType<typeof setTimeout> | undefined
const interaction = { hover: false, focus: false }
function pause() {
  if (!timer) return
  clearTimeout(timer)
  timer = undefined
  remaining = Math.max(0, remaining - (Date.now() - started))
}
function resume() {
  if (timer || interaction.hover || interaction.focus) return
  started = Date.now()
  timer = setTimeout(() => emit('dismiss'), remaining)
}
function setPaused(source: 'hover' | 'focus', value: boolean) {
  interaction[source] = value
  if (value) pause()
  else resume()
}
onMounted(resume)
onBeforeUnmount(pause)
</script>

<template>
  <div
    class="admin-toast-message"
    :class="`is-${item.kind}`"
    :role="item.kind === 'error' || item.kind === 'warning' ? 'alert' : 'status'"
    aria-atomic="true"
    @mouseenter="setPaused('hover', true)"
    @mouseleave="setPaused('hover', false)"
    @focusin="setPaused('focus', true)"
    @focusout="setPaused('focus', false)"
  >
    <UIcon :name="icons[item.kind]" />
    <p>{{ item.message }}</p>
    <button type="button" aria-label="关闭提示" @click="emit('dismiss')">
      <UIcon name="i-lucide-x" />
    </button>
  </div>
</template>
