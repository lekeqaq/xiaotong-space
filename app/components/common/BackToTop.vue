<script setup lang="ts">
const visible = ref(false)
let frame = 0
function updateVisibility() {
  if (frame) return
  frame = window.requestAnimationFrame(() => {
    visible.value = window.scrollY > 480
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
})
onBeforeUnmount(() => {
  window.removeEventListener('scroll', updateVisibility)
  window.removeEventListener('resize', updateVisibility)
  window.cancelAnimationFrame(frame)
})
</script>

<template>
  <Transition name="back-top">
    <button
      v-if="visible"
      type="button"
      class="back-to-top"
      aria-label="返回顶部"
      title="返回顶部"
      @click="scrollToTop"
    >
      <svg class="return-arrow" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path class="return-cap" d="M5 4H19" />
        <path class="return-stem" d="M7 13L12 8L17 13M12 8V21" />
      </svg>
      <span aria-hidden="true">页首</span>
    </button>
  </Transition>
</template>

<style scoped>
.back-to-top {
  position: fixed;
  z-index: 40;
  right: max(24px, env(safe-area-inset-right));
  bottom: max(24px, env(safe-area-inset-bottom));
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 5px;
  width: 44px;
  height: 64px;
  padding: 0;
  border: 1px solid var(--color-border);
  border-radius: 24px;
  background: var(--color-surface);
  color: var(--color-accent);
  box-shadow: 0 3px 12px rgb(0 0 0 / 4%);
  cursor: pointer;
  transition:
    border-color 200ms,
    background 200ms,
    translate 200ms;
}
.back-to-top:is(:hover, :focus-visible) {
  border-color: color-mix(in srgb, var(--color-accent) 55%, var(--color-border));
  background: color-mix(in srgb, var(--color-accent) 5%, var(--color-surface));
  translate: 0 -2px;
}
.return-arrow {
  width: 22px;
  height: 22px;
  stroke: currentColor;
  stroke-width: 1.5;
  stroke-linecap: round;
  stroke-linejoin: round;
}
.return-cap {
  opacity: 0.45;
}
.return-stem {
  transition: translate 220ms var(--ease);
}
.back-to-top:is(:hover, :focus-visible) .return-stem {
  translate: 0 -2px;
}
.back-to-top > span {
  color: var(--color-text-muted);
  font-size: 9px;
  line-height: 1;
  letter-spacing: 0.08em;
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
  transform: translateY(10px);
}
@media (max-width: 540px) {
  .back-to-top {
    right: max(16px, env(safe-area-inset-right));
    bottom: max(16px, env(safe-area-inset-bottom));
  }
}
@media (prefers-reduced-motion: reduce) {
  .back-to-top,
  .back-top-enter-active,
  .back-top-leave-active,
  .return-stem {
    transition: none;
    animation: none;
  }
  .back-to-top:is(:hover, :focus-visible),
  .back-to-top:is(:hover, :focus-visible) .return-stem {
    translate: none;
  }
}
</style>
