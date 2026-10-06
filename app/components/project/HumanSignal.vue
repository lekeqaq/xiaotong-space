<script setup lang="ts">
const props = withDefaults(defineProps<{ phase: number; animated?: boolean }>(), { animated: true })
const signal = useTemplateRef<HTMLElement>('signal')
const paused = useState('ambient-motion-paused', () => false)
let weights: number[] = [0, 1, 2].map((phase) => (phase === props.phase ? 1 : 0))
function scene(time: number) {
  const packets = [0, 0.5].map((offset) => {
    const progress = (time / 3.8 + offset) % 1
    return {
      left: 30 + progress * 210,
      right: 450 - progress * 210,
      opacity: Math.sin(Math.PI * progress) * 0.85,
    }
  })
  const rings = [0, 1 / 3, 2 / 3].map((offset) => {
    const progress = (time / 3.6 + offset) % 1
    return { radius: 7 + progress * 29, opacity: (1 - progress) ** 2 * 0.65 }
  })
  const breath = (Math.sin((time * Math.PI) / 2) + 1) / 2
  return { packets, rings, breath, weights: [...weights] }
}
const visual = ref(scene(0))
let frame = 0
let previous = 0
let time = 0
let inView = false
let reduceMotion = false
let observer: IntersectionObserver | undefined
let media: MediaQueryList | undefined
function paint(delta = 1, moving = true) {
  const blend = moving ? 1 - Math.exp(-delta * 6) : 1
  weights = weights.map((weight, phase) => weight + ((phase === props.phase ? 1 : 0) - weight) * blend)
  visual.value = scene(time)
}
function tick(now: number) {
  const delta = previous ? Math.min((now - previous) / 1000, 0.05) : 1 / 60
  previous = now
  time += delta
  paint(delta)
  frame = requestAnimationFrame(tick)
}
function syncAnimation() {
  cancelAnimationFrame(frame)
  previous = 0
  if (props.animated && inView && !document.hidden && !paused.value && !reduceMotion) {
    frame = requestAnimationFrame(tick)
  } else {
    paint(1, false)
  }
}
function updateMotionPreference() {
  reduceMotion = !!media?.matches
  syncAnimation()
}
watch(
  () => [props.phase, props.animated, paused.value],
  () => {
    if (import.meta.client) syncAnimation()
  },
)
onMounted(() => {
  media = window.matchMedia('(prefers-reduced-motion: reduce)')
  reduceMotion = media.matches
  media.addEventListener('change', updateMotionPreference)
  document.addEventListener('visibilitychange', syncAnimation)
  if ('IntersectionObserver' in window) {
    observer = new IntersectionObserver(([entry]) => {
      inView = !!entry?.isIntersecting
      syncAnimation()
    })
    if (signal.value) observer.observe(signal.value)
  } else {
    inView = true
    syncAnimation()
  }
})
onBeforeUnmount(() => {
  cancelAnimationFrame(frame)
  observer?.disconnect()
  media?.removeEventListener('change', updateMotionPreference)
  document.removeEventListener('visibilitychange', syncAnimation)
})
</script>

<template>
  <div ref="signal" class="voice-thread" :class="`thread-phase-${phase}`" aria-hidden="true">
    <svg viewBox="0 0 480 96" fill="none">
      <path class="thread-guide" d="M30 48H450" />
      <circle class="thread-end" cx="30" cy="48" r="2" />
      <circle class="thread-end" cx="450" cy="48" r="2" />
      <!-- All three states stay around the same anchor; only their opacity blends. -->
      <g class="thread-listening" :opacity="visual.weights[0]">
        <g v-for="(packet, index) in visual.packets" :key="index" :opacity="packet.opacity">
          <path :d="`M${packet.left - 10} 48H${packet.left}`" class="thread-trace" />
          <path :d="`M${packet.right + 10} 48H${packet.right}`" class="thread-trace" />
          <circle :cx="packet.left" cy="48" r="2.4" />
          <circle :cx="packet.right" cy="48" r="2.4" />
        </g>
      </g>
      <g class="thread-thinking" :opacity="visual.weights[1]">
        <circle
          cx="240"
          cy="48"
          :r="13 + visual.breath * 3"
          :opacity="0.12 + visual.breath * 0.12"
          class="thread-breath"
        />
        <circle cx="240" cy="48" :r="9 + visual.breath * 2" :opacity="0.25 + visual.breath * 0.15" />
      </g>
      <g class="thread-speaking" :opacity="visual.weights[2]">
        <circle
          v-for="(ring, index) in visual.rings"
          :key="index"
          cx="240"
          cy="48"
          :r="ring.radius"
          :opacity="ring.opacity"
        />
      </g>
      <circle
        class="thread-anchor"
        cx="240"
        cy="48"
        :r="4 + (visual.weights[1] ?? 0) * visual.breath * 0.6"
      />
    </svg>
  </div>
</template>

<style scoped>
.voice-thread {
  width: 100%;
  padding-bottom: 12px;
  color: var(--color-accent);
}
.voice-thread svg {
  display: block;
  width: 100%;
  height: 84px;
}
.thread-guide {
  stroke: var(--color-border);
  stroke-width: 0.7;
  opacity: 0.65;
}
.thread-end {
  fill: var(--color-surface);
  stroke: var(--color-text-muted);
  stroke-width: 0.7;
  opacity: 0.5;
}
.thread-listening circle,
.thread-anchor,
.thread-breath {
  fill: currentColor;
}
.thread-trace {
  stroke: currentColor;
  stroke-width: 1.2;
  stroke-linecap: round;
  opacity: 0.35;
}
.thread-thinking circle:not(.thread-breath),
.thread-speaking circle {
  stroke: currentColor;
  stroke-width: 1;
}
</style>
