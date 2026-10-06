<script setup lang="ts">
const props = defineProps<{ payload: Record<string, unknown>; loading?: boolean }>()
const emit = defineEmits<{ close: [] }>()
const colorMode = useColorMode()
const device = ref<'desktop' | 'mobile'>('desktop')
const frame = useTemplateRef<HTMLIFrameElement>('frame')
const stage = useTemplateRef<HTMLDivElement>('stage')
const bounds = ref({ width: 1000, height: 640 })
const ready = ref(false)
const width = computed(() => (device.value === 'desktop' ? 1280 : 390))
const scale = computed(() => Math.min(1, bounds.value.width / width.value))
const frameStyle = computed(() => ({
  width: `${width.value}px`,
  height: `${bounds.value.height / scale.value}px`,
  transform: `translateX(-50%) scale(${scale.value})`,
}))
let observer: ResizeObserver | undefined
function send() {
  frame.value?.contentWindow?.postMessage(
    { type: 'xiaotong-preview', payload: JSON.parse(JSON.stringify(props.payload)), theme: colorMode.value },
    window.location.origin,
  )
}
function receive(event: MessageEvent) {
  if (event.origin !== window.location.origin || event.source !== frame.value?.contentWindow) return
  if (event.data?.type === 'xiaotong-preview-ready') {
    ready.value = true
    send()
  } else if (event.data?.type === 'xiaotong-preview-close') {
    emit('close')
  }
}
watch(
  () => [props.payload, colorMode.value],
  () => {
    if (ready.value) send()
  },
  { deep: true },
)
onMounted(() => {
  window.addEventListener('message', receive)
  observer = new ResizeObserver(([entry]) => {
    if (entry)
      bounds.value = {
        width: Math.max(1, entry.contentRect.width),
        height: Math.max(1, entry.contentRect.height),
      }
  })
  if (stage.value) observer.observe(stage.value)
})
onBeforeUnmount(() => {
  observer?.disconnect()
  window.removeEventListener('message', receive)
})
</script>
<template>
  <div class="admin-preview-workspace">
    <div class="admin-preview-toolbar">
      <div class="admin-preview-note">
        <span class="admin-online-dot" /><span>{{
          loading ? '正在更新预览…' : '当前草稿 · 仅自己可见'
        }}</span>
      </div>
      <div class="admin-preview-devices" role="group" aria-label="预览设备">
        <VBtn
          size="small"
          :variant="device === 'desktop' ? 'tonal' : 'text'"
          :aria-pressed="device === 'desktop'"
          @click="device = 'desktop'"
          ><UIcon name="i-lucide-monitor" />桌面</VBtn
        >
        <VBtn
          size="small"
          :variant="device === 'mobile' ? 'tonal' : 'text'"
          :aria-pressed="device === 'mobile'"
          @click="device = 'mobile'"
          ><UIcon name="i-lucide-smartphone" />手机</VBtn
        >
      </div>
    </div>
    <VProgressLinear v-if="loading || !ready" indeterminate color="primary" aria-label="预览加载中" />
    <div ref="stage" class="admin-preview-stage">
      <iframe
        ref="frame"
        src="/admin/preview"
        title="网站草稿预览"
        class="admin-preview-frame"
        :style="frameStyle"
        @load="send"
      />
    </div>
    <p class="admin-preview-footnote">
      {{ width }} px · {{ Math.round(scale * 100) }}% 缩放 · 在预览内滚动查看完整页面
    </p>
  </div>
</template>
