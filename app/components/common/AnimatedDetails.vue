<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    defaultOpen?: boolean
    desktopAlwaysOpen?: boolean
    summaryClass?: string
    summaryLabel?: string
    panelId?: string
  }>(),
  {
    defaultOpen: false,
    desktopAlwaysOpen: false,
    summaryClass: '',
    summaryLabel: undefined,
    panelId: undefined,
  },
)
const route = useRoute()
const id = props.panelId || useId()
const details = useTemplateRef<HTMLDetailsElement>('details')
const summary = useTemplateRef<HTMLElement>('summary')
const panel = useTemplateRef<HTMLElement>('panel')
const content = useTemplateRef<HTMLElement>('content')
const expanded = ref(props.defaultOpen)
const ready = ref(false)
const motionEnabled = computed(() => !route.path.startsWith('/admin'))
let animation: Animation | undefined
let revision = 0
let desktop: MediaQueryList | undefined
let reducedMotion: MediaQueryList | undefined

function cancelAnimation() {
  if (!animation) return
  animation.onfinish = null
  animation.cancel()
  animation = undefined
}
function clearStyles() {
  if (!panel.value) return
  panel.value.style.height = ''
  panel.value.style.opacity = ''
  panel.value.style.overflow = ''
}
function settle(open: boolean) {
  revision++
  cancelAnimation()
  expanded.value = open
  if (details.value) details.value.open = open
  clearStyles()
}
async function setOpen(open: boolean) {
  const element = details.value
  const body = panel.value
  if (!element || !body || open === expanded.value) return
  if (!open && body.contains(document.activeElement)) summary.value?.focus({ preventScroll: true })
  if (!motionEnabled.value || reducedMotion?.matches || !body.animate) {
    settle(open)
    return
  }

  // Sample the current frame before cancelling so repeated clicks reverse smoothly.
  const height = element.open ? body.getBoundingClientRect().height : 0
  const opacity = element.open ? Number(getComputedStyle(body).opacity) : 0
  const currentRevision = ++revision
  body.style.height = `${height}px`
  body.style.opacity = String(opacity)
  body.style.overflow = 'hidden'
  cancelAnimation()
  expanded.value = open
  element.open = true
  await nextTick()
  if (revision !== currentRevision) return
  const targetHeight = open ? content.value?.getBoundingClientRect().height || 0 : 0
  animation = body.animate(
    [
      { height: `${height}px`, opacity },
      { height: `${targetHeight}px`, opacity: open ? 1 : 0 },
    ],
    { duration: open ? 300 : 240, easing: 'cubic-bezier(0.22, 0.61, 0.36, 1)', fill: 'both' },
  )
  animation.onfinish = () => {
    if (revision === currentRevision) settle(open)
  }
}
function onEscape(event: KeyboardEvent) {
  if (!expanded.value || (props.desktopAlwaysOpen && desktop?.matches)) return
  event.preventDefault()
  event.stopPropagation()
  summary.value?.focus({ preventScroll: true })
  void setOpen(false)
}
function syncViewport() {
  // A breakpoint change must not leave a fixed animation height on the new layout.
  settle(props.desktopAlwaysOpen && desktop?.matches ? true : props.defaultOpen)
}
function syncMotion() {
  if (reducedMotion?.matches) settle(expanded.value)
}
onMounted(() => {
  reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
  reducedMotion.addEventListener('change', syncMotion)
  if (props.desktopAlwaysOpen) {
    desktop = window.matchMedia('(min-width: 768px)')
    desktop.addEventListener('change', syncViewport)
    syncViewport()
  }
  ready.value = true
})
onBeforeUnmount(() => {
  revision++
  cancelAnimation()
  desktop?.removeEventListener('change', syncViewport)
  reducedMotion?.removeEventListener('change', syncMotion)
})
defineExpose({ setOpen })
</script>

<template>
  <details
    ref="details"
    class="animated-details"
    :class="{
      'disclosure-motion': motionEnabled,
      'desktop-disclosure': desktopAlwaysOpen,
      'disclosure-pending': !ready,
    }"
    :open="defaultOpen || desktopAlwaysOpen"
    :data-expanded="expanded"
    @keydown.esc="onEscape"
  >
    <summary
      ref="summary"
      role="button"
      :class="summaryClass"
      :aria-label="summaryLabel"
      :aria-expanded="expanded"
      :aria-controls="id"
      @click.prevent="setOpen(!expanded)"
    >
      <slot name="summary" :expanded="expanded" />
    </summary>
    <div :id="id" ref="panel" class="disclosure-panel" :inert="!expanded && ready">
      <div ref="content" class="disclosure-content"><slot /></div>
    </div>
  </details>
</template>

<style scoped>
.disclosure-content {
  display: flow-root;
}
.animated-details > summary::-webkit-details-marker {
  display: none;
}
.disclosure-motion > summary :deep(.disclosure-chevron) {
  rotate: -90deg;
  transition: rotate 260ms var(--ease);
}
.disclosure-motion[data-expanded='true'] > summary :deep(.disclosure-chevron) {
  rotate: 0deg;
}
@media (max-width: 767px) {
  /* Keep the mobile preview closed during server rendering and hydration. */
  .desktop-disclosure.disclosure-pending > .disclosure-panel {
    display: none;
  }
}
@media (prefers-reduced-motion: reduce) {
  .disclosure-motion > summary :deep(.disclosure-chevron) {
    transition: none;
  }
}
</style>
