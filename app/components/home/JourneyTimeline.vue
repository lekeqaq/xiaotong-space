<script setup lang="ts">
import { journey } from '~/utils/site'
const path = useTemplateRef<HTMLElement>('path')
const started = ref(false)
let observer: IntersectionObserver | undefined
onMounted(() => {
  if (!('IntersectionObserver' in window)) {
    started.value = true
    return
  }
  observer = new IntersectionObserver(
    (entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        started.value = true
        observer?.disconnect()
      }
    },
    { threshold: 0.25 },
  )
  if (path.value) observer.observe(path.value)
})
onBeforeUnmount(() => observer?.disconnect())
</script>
<template>
  <div ref="path" class="practice-path">
    <ol class="ambient-motion" :class="{ 'path-started': started }">
      <li v-for="(step, index) in journey" :key="step.title" :style="{ '--step-delay': `${index * 1800}ms` }">
        <span class="path-label">0{{ index + 1 }} / {{ step.note }}</span>
        <span class="path-node" aria-hidden="true"><UIcon :name="step.icon" /></span>
        <h3>{{ step.title }}</h3>
        <p>{{ step.description }}</p>
      </li>
    </ol>
  </div>
</template>
<style scoped>
.practice-path {
  --step-gap: clamp(20px, 2.4vw, 36px);
  margin: 42px 0 45px;
}
.practice-path ol {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  column-gap: var(--step-gap);
  list-style: none;
  padding: 0;
  margin: 0;
}
.practice-path li {
  position: relative;
  min-width: 0;
}
.practice-path li > :is(.path-label, h3, p) {
  text-align: left;
}
.path-label {
  display: block;
  font-size: 0.57rem;
  color: var(--color-text-muted);
  letter-spacing: 0.06em;
  line-height: 20px;
}
.path-node {
  position: relative;
  z-index: 1;
  display: grid;
  place-items: center;
  width: 30px;
  height: 30px;
  margin: 20px 0 24px;
  border: 1px solid var(--color-border);
  border-radius: 50%;
  color: var(--color-text-muted);
  background: var(--color-bg);
  font-size: 14px;
}
.practice-path li:not(:last-child)::before,
.practice-path li:not(:last-child)::after {
  content: '';
  position: absolute;
  top: 54px;
  left: 15px;
  width: calc(100% + var(--step-gap));
  height: 2px;
  background: var(--color-border);
}
.practice-path li:not(:last-child)::after {
  background: var(--color-accent);
  transform: scaleX(0);
  transform-origin: left;
}
.path-started li::after {
  animation: path-draw 1500ms calc(var(--step-delay) + 350ms) linear forwards;
}
.path-started .path-node {
  animation: path-light 550ms var(--step-delay) ease both;
}
.practice-path h3 {
  font-size: 1rem;
  font-weight: 500;
  margin-bottom: 12px;
}
.practice-path li > p {
  font-size: 0.78rem;
  line-height: 1.9;
  color: var(--color-text-muted);
}
@keyframes path-draw {
  to {
    transform: scaleX(1);
  }
}
@keyframes path-light {
  to {
    border-color: var(--color-accent);
    color: var(--color-accent);
    background: var(--color-accent-soft);
    box-shadow: 0 0 0 5px color-mix(in srgb, var(--color-accent) 9%, transparent);
  }
}
@media (max-width: 900px) {
  .practice-path ol {
    grid-template-columns: 1fr;
  }
  .practice-path li {
    padding: 0 0 32px 52px;
  }
  .path-node {
    position: absolute;
    left: 0;
    top: 0;
    margin: 0;
  }
  .practice-path li:not(:last-child)::before,
  .practice-path li:not(:last-child)::after {
    top: 15px;
    left: 14px;
    height: 100%;
    width: 2px;
  }
  .practice-path li:not(:last-child)::after {
    transform: scaleY(0);
    transform-origin: top;
  }
  .path-started li::after {
    animation-name: path-down;
  }
  .practice-path h3 {
    margin-top: 8px;
    margin-bottom: 8px;
  }
  .practice-path li > p {
    max-width: none;
  }
  .practice-path li:last-child {
    padding-bottom: 0;
  }
}
@keyframes path-down {
  to {
    transform: scaleY(1);
  }
}
@media (prefers-reduced-motion: reduce) {
  .practice-path li::after {
    animation: none !important;
    transform: none !important;
  }
  .practice-path .path-node {
    animation: none;
    color: var(--color-accent);
    border-color: var(--color-accent);
    background: var(--color-accent-soft);
  }
}
</style>
