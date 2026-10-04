<script setup lang="ts">
const photos = [
  { src: 'coast', label: 'Travel', alt: '海岸与远方的山脉' },
  { src: 'code', label: 'Code', alt: '编辑器里的代码' },
  { src: 'camera', label: 'Life', alt: '记录生活的相机' },
  { src: 'mountain', label: 'Explore', alt: '云层下的雪山' },
  { src: 'notebook', label: 'Ideas', alt: '记录新想法的笔记本' },
]
const stream = useTemplateRef<HTMLDivElement>('stream')
let frame = 0
const paused = ref(false)
let pointer: { x: number; scroll: number } | null = null
let previous = 0
let offset = 0
function startDrag(event: PointerEvent) {
  if (!stream.value || event.pointerType === 'touch') return
  pointer = { x: event.clientX, scroll: stream.value.scrollLeft }
  stream.value.setPointerCapture(event.pointerId)
}
function drag(event: PointerEvent) {
  if (pointer && stream.value) stream.value.scrollLeft = pointer.scroll + pointer.x - event.clientX
}
function stopDrag() {
  pointer = null
  offset = stream.value?.scrollLeft || 0
}
function resume() {
  paused.value = false
  stopDrag()
}
onMounted(() => {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')
  const desktop = window.matchMedia('(min-width: 768px)')
  function step(time: number) {
    if (stream.value && !paused.value && !pointer && !reduced.matches && desktop.matches) {
      offset += Math.min(time - previous, 40) * 0.018
      if (offset >= stream.value.scrollWidth / 2) offset -= stream.value.scrollWidth / 2
      stream.value.scrollLeft = offset
    } else if (stream.value) {
      offset = stream.value.scrollLeft
    }
    previous = time
    frame = requestAnimationFrame(step)
  }
  frame = requestAnimationFrame(step)
})
onUnmounted(() => cancelAnimationFrame(frame))
</script>
<template>
  <section class="image-stream-section" aria-label="Work、Travel、Code、Life 与 Ideas 的个人图像流">
    <div
      ref="stream"
      class="image-stream"
      tabindex="0"
      aria-label="可横向滚动的照片流"
      @mouseenter="paused = true"
      @mouseleave="resume"
      @focusin="paused = true"
      @focusout="paused = false"
      @pointerdown="startDrag"
      @pointermove="drag"
      @pointerup="stopDrag"
      @pointercancel="stopDrag"
    >
      <figure
        v-for="(photo, index) in [...photos, ...photos]"
        :key="index"
        :aria-hidden="index >= photos.length"
      >
        <NuxtImg
          format="webp"
          :src="`/images/personal/${photo.src}.jpg`"
          :alt="index >= photos.length ? '' : photo.alt"
          width="360"
          height="250"
          sizes="sm:220px md:280px"
          loading="lazy"
          draggable="false"
        />
        <figcaption>{{ photo.label }} <UIcon name="i-lucide-arrow-up-right" /></figcaption>
      </figure>
    </div>
    <div class="stream-note handwritten" aria-hidden="true">
      Work<br />Travel<br />Code<br />Life<br />AI <span>✦</span>
    </div>
    <div class="stream-rule"><span /></div>
  </section>
</template>
