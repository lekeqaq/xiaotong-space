<script setup lang="ts">
const entries = [
  { to: '/projects', title: '作品' },
  { to: '/writing', title: '笔记' },
  { to: '/about', title: '关于我' },
]
</script>

<template>
  <nav class="space-dock" aria-label="探索我的空间">
    <NuxtLink v-for="entry in entries" :key="entry.to" :to="entry.to" class="dock-link">
      <span>{{ entry.title }}</span>
      <UIcon name="i-lucide-arrow-up-right" class="dock-arrow" aria-hidden="true" />
    </NuxtLink>
  </nav>
</template>

<style scoped>
.space-dock {
  display: flex;
  justify-content: center;
  gap: clamp(8px, 2.5vw, 32px);
  width: fit-content;
  max-width: 100%;
  margin: 24px auto 32px;
}
.dock-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 9px;
  min-height: 44px;
  padding: 8px 12px;
  border-radius: 4px;
  color: var(--color-text-muted);
  font-size: 0.875rem;
  line-height: 1.5;
  white-space: nowrap;
  text-underline-offset: 6px;
  text-decoration-color: var(--color-accent);
  transition: color 220ms;
}
.dock-arrow {
  color: var(--color-accent);
  font-size: 14px;
}
.dock-link:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 4px;
  color: var(--color-text);
}
@media (hover: hover) {
  .dock-link:hover {
    color: var(--color-text);
    text-decoration-line: underline;
  }
}
@media (max-width: 767px) {
  .space-dock {
    margin-block: 16px 24px;
  }
}
@media (prefers-reduced-motion: reduce) {
  .dock-link {
    transition: none;
  }
}
</style>
