<script setup lang="ts">
const visible = ref(false)
const progress = ref(0)
let frame = 0
let resizeObserver: ResizeObserver | undefined
function updateVisibility() {
  if (frame) return
  frame = window.requestAnimationFrame(() => {
    const scrollable = document.documentElement.scrollHeight - window.innerHeight
    visible.value = window.scrollY > 480
    progress.value = scrollable > 0 ? Math.min(1, Math.max(0, window.scrollY / scrollable)) : 0
    frame = 0
  })
}
function scrollToTop() {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  window.scrollTo({ top: 0, behavior: reduceMotion ? 'instant' : 'smooth' })
  // Move focus out of a button that disappears at the top of the page.
  document.querySelector<HTMLAnchorElement>('.app-header .wordmark')?.focus({ preventScroll: true })
}
onMounted(() => {
  updateVisibility()
  window.addEventListener('scroll', updateVisibility, { passive: true })
  window.addEventListener('resize', updateVisibility)
  resizeObserver = new ResizeObserver(updateVisibility)
  resizeObserver.observe(document.body)
})
onBeforeUnmount(() => {
  window.removeEventListener('scroll', updateVisibility)
  window.removeEventListener('resize', updateVisibility)
  resizeObserver?.disconnect()
  window.cancelAnimationFrame(frame)
})
</script>

<template>
  <Transition name="back-top">
    <button v-if="visible" type="button" class="back-to-top" aria-label="返回顶部" @click="scrollToTop">
      <span class="return-hint" aria-hidden="true">回到起点</span>
      <svg class="return-orbit" viewBox="0 0 64 64" fill="none" aria-hidden="true">
        <circle class="return-track" cx="32" cy="32" r="28" />
        <circle
          class="return-progress"
          cx="32"
          cy="32"
          r="28"
          pathLength="100"
          :stroke-dasharray="`${progress * 100} 100`"
          transform="rotate(-90 32 32)"
        />
        <path class="return-ticks" d="M32 9V12M55 32H52M32 55V52M9 32H12" />
      </svg>
      <span class="return-core" aria-hidden="true">
        <svg class="return-arrow" viewBox="0 0 24 24" fill="none">
          <path d="M6 12L12 6L18 12M12 6V21" />
        </svg>
        <span>TOP</span>
      </span>
      <span class="return-star" aria-hidden="true">✳</span>
    </button>
  </Transition>
</template>

<style scoped>
.back-to-top {
  position: fixed;
  z-index: 40;
  right: max(22px, env(safe-area-inset-right));
  bottom: max(22px, env(safe-area-inset-bottom));
  display: grid;
  place-items: center;
  width: 64px;
  height: 64px;
  padding: 0;
  border: 0;
  border-radius: 50%;
  background: var(--color-bg);
  color: var(--color-accent);
  box-shadow: 0 4px 20px rgb(0 0 0 / 6%);
  cursor: pointer;
  transition:
    background 250ms,
    translate 250ms;
}
.return-orbit {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  stroke-width: 1;
  pointer-events: none;
}
.return-track,
.return-ticks {
  stroke: var(--color-border);
}
.return-progress {
  stroke: currentColor;
  stroke-linecap: round;
}
.return-core {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
}
.return-arrow {
  width: 23px;
  height: 23px;
  stroke: currentColor;
  stroke-width: 1.4;
  stroke-linecap: round;
  stroke-linejoin: round;
  transition: translate 250ms var(--ease);
}
.return-core > span {
  font-size: 7px;
  letter-spacing: 0.16em;
  line-height: 1;
  color: var(--color-text-muted);
}
.return-star {
  position: absolute;
  top: -2px;
  left: 50%;
  display: grid;
  place-items: center;
  width: 15px;
  height: 15px;
  background: var(--color-bg);
  font-size: 15px;
  line-height: 1;
  translate: -50% 0;
  transition: rotate 450ms var(--ease);
}
.return-hint {
  position: absolute;
  right: calc(100% + 10px);
  padding: 6px 10px;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  background: var(--color-surface);
  color: var(--color-text-muted);
  font-size: 10px;
  letter-spacing: 0.06em;
  white-space: nowrap;
  pointer-events: none;
  opacity: 0;
  translate: 5px 0;
  transition:
    opacity 200ms,
    translate 200ms;
}
.back-to-top:is(:hover, :focus-visible) {
  background: var(--color-surface);
  translate: 0 -3px;
}
.back-to-top:is(:hover, :focus-visible) .return-arrow {
  translate: 0 -3px;
}
.back-to-top:is(:hover, :focus-visible) .return-star {
  rotate: 90deg;
}
.back-to-top:is(:hover, :focus-visible) .return-hint {
  opacity: 1;
  translate: 0;
}
.back-to-top:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 4px;
}
.back-top-enter-active,
.back-top-leave-active {
  transition:
    opacity 220ms,
    transform 220ms;
}
.back-top-enter-from,
.back-top-leave-to {
  opacity: 0;
  transform: translateY(10px) rotate(12deg);
}
@media (max-width: 540px) {
  .back-to-top {
    width: 56px;
    height: 56px;
    right: max(14px, env(safe-area-inset-right));
    bottom: max(14px, env(safe-area-inset-bottom));
  }
  .return-hint {
    display: none;
  }
}
@media (prefers-reduced-motion: reduce) {
  .back-to-top,
  .back-to-top *,
  .back-top-enter-active,
  .back-top-leave-active {
    transition: none;
    animation: none;
  }
}
</style>
