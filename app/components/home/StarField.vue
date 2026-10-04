<script setup lang="ts">
const canvas = useTemplateRef<HTMLCanvasElement>('canvas')
const paused = useState('ambient-motion-paused', () => false)
const colorMode = useColorMode()
let refresh = () => {}
watch([paused, () => colorMode.value], () => refresh())

onMounted(() => {
  const surface = canvas.value
  const host = surface?.parentElement
  const context = surface?.getContext('2d')
  if (!surface || !host || !context) return

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
  const pointer = { x: 0, y: 0, active: false }
  const view = { x: 0, y: 0 }
  let width = 0
  let height = 0
  let frame = 0
  let previousTime = 0
  let elapsed = 0
  let visible = true
  let ink = ''
  let glow = ''
  let stars: Array<{
    x: number
    y: number
    depth: number
    radius: number
    phase: number
    offsetX: number
    offsetY: number
    sparkle: boolean
  }> = []

  const moving = () => !paused.value && !reducedMotion.matches

  function draw(delta = 0) {
    context!.clearRect(0, 0, width, height)
    const easing = 1 - Math.exp(-delta * 5)
    const targetX = pointer.active && moving() ? (pointer.x / width - 0.5) * 2 : 0
    const targetY = pointer.active && moving() ? (pointer.y / height - 0.5) * 2 : 0
    view.x += (targetX - view.x) * easing
    view.y += (targetY - view.y) * easing

    for (const star of stars) {
      const x = star.x * width + view.x * star.depth * 22 + Math.sin(elapsed * 0.18 + star.phase) * 7
      const y = star.y * height + view.y * star.depth * 16 + Math.cos(elapsed * 0.14 + star.phase) * 9
      const dx = pointer.x - x
      const dy = pointer.y - y
      const proximity = pointer.active && moving() ? Math.max(0, 1 - Math.hypot(dx, dy) / 170) : 0
      star.offsetX += (dx * proximity * 0.2 - star.offsetX) * easing
      star.offsetY += (dy * proximity * 0.2 - star.offsetY) * easing
      const px = x + star.offsetX
      const py = y + star.offsetY
      const twinkle = (Math.sin(elapsed * (0.7 + star.depth * 0.5) + star.phase) + 1) / 2
      const radius = star.radius * (1 + proximity * 0.65)
      const opacity = 0.25 + twinkle * 0.4 + proximity * 0.3

      if (star.sparkle || proximity > 0.15) {
        const halo = context!.createRadialGradient(px, py, 0, px, py, radius * 5)
        halo.addColorStop(0, glow)
        halo.addColorStop(1, `${glow}00`)
        context!.globalAlpha = opacity * 0.5
        context!.fillStyle = halo
        context!.beginPath()
        context!.arc(px, py, radius * 5, 0, Math.PI * 2)
        context!.fill()
      }

      context!.globalAlpha = opacity
      context!.fillStyle = ink
      context!.beginPath()
      if (star.sparkle) {
        const length = radius * (2.4 + twinkle)
        context!.moveTo(px, py - length)
        context!.quadraticCurveTo(px + radius * 0.4, py - radius * 0.4, px + length, py)
        context!.quadraticCurveTo(px + radius * 0.4, py + radius * 0.4, px, py + length)
        context!.quadraticCurveTo(px - radius * 0.4, py + radius * 0.4, px - length, py)
        context!.quadraticCurveTo(px - radius * 0.4, py - radius * 0.4, px, py - length)
      } else {
        context!.arc(px, py, radius, 0, Math.PI * 2)
      }
      context!.fill()
    }
    context!.globalAlpha = 1
  }

  function tick(time: number) {
    const delta = previousTime ? Math.min((time - previousTime) / 1000, 0.05) : 0
    previousTime = time
    elapsed += delta
    draw(delta)
    frame = requestAnimationFrame(tick)
  }

  function sync() {
    cancelAnimationFrame(frame)
    previousTime = 0
    ink = colorMode.value === 'dark' ? '#ded4ff' : '#8d79b6'
    glow = colorMode.value === 'dark' ? '#b39aff' : '#b4a0dc'
    // Reduced motion keeps a still sky, including when the preference changes live.
    if (reducedMotion.matches) {
      view.x = view.y = 0
      stars.forEach((star) => {
        star.offsetX = star.offsetY = 0
      })
    }
    draw()
    if (moving() && visible && !document.hidden && width && height) {
      frame = requestAnimationFrame(tick)
    }
  }

  function resize() {
    width = host!.clientWidth
    height = host!.clientHeight
    const ratio = Math.min(window.devicePixelRatio || 1, 2)
    surface!.width = Math.round(width * ratio)
    surface!.height = Math.round(height * ratio)
    context!.setTransform(ratio, 0, 0, ratio, 0, 0)
    const count = Math.min(115, Math.max(35, Math.round((width * height) / 7600)))
    // Preserve existing positions on resize to avoid a sudden reshuffle.
    stars = Array.from(
      { length: count },
      (_, index) =>
        stars[index] ?? {
          x: Math.random(),
          y: Math.random(),
          depth: 0.25 + Math.random() * 0.75,
          radius: 0.6 + Math.random() * 1.05,
          phase: Math.random() * Math.PI * 2,
          offsetX: 0,
          offsetY: 0,
          sparkle: index % 9 === 0,
        },
    )
    sync()
  }

  function onPointerMove(event: PointerEvent) {
    if (event.pointerType === 'touch' || !moving()) return
    const bounds = host!.getBoundingClientRect()
    pointer.x = event.clientX - bounds.left
    pointer.y = event.clientY - bounds.top
    pointer.active = true
  }

  function resetPointer() {
    pointer.active = false
  }

  const resizeObserver = new ResizeObserver(resize)
  const intersectionObserver = new IntersectionObserver(([entry]) => {
    visible = Boolean(entry?.isIntersecting)
    if (!visible) resetPointer()
    sync()
  })
  resizeObserver.observe(host)
  intersectionObserver.observe(host)
  host.addEventListener('pointermove', onPointerMove, { passive: true })
  host.addEventListener('pointerleave', resetPointer)
  window.addEventListener('blur', resetPointer)
  document.addEventListener('visibilitychange', sync)
  reducedMotion.addEventListener('change', sync)
  refresh = sync
  resize()

  onBeforeUnmount(() => {
    cancelAnimationFrame(frame)
    resizeObserver.disconnect()
    intersectionObserver.disconnect()
    host.removeEventListener('pointermove', onPointerMove)
    host.removeEventListener('pointerleave', resetPointer)
    window.removeEventListener('blur', resetPointer)
    document.removeEventListener('visibilitychange', sync)
    reducedMotion.removeEventListener('change', sync)
    refresh = () => {}
  })
})
</script>

<template>
  <canvas ref="canvas" class="star-field" aria-hidden="true" />
</template>

<style scoped>
.star-field {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
  mask-image: radial-gradient(ellipse at center, #000 38%, transparent 75%);
}
</style>
