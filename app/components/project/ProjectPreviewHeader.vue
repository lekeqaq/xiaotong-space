<script setup lang="ts">
defineProps<{
  title: string
  number: string
  category: string
  icon: string
}>()
</script>

<template>
  <div class="preview-header">
    <span class="preview-header-title"><UIcon :name="icon" aria-hidden="true" />{{ title }}</span>
    <span class="preview-header-meta"
      ><span>{{ number }}</span
      ><span aria-hidden="true">/</span>{{ category }}</span
    >
  </div>
</template>

<style scoped>
.preview-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px 20px;
  flex-wrap: wrap;
  min-height: 36px;
  padding-bottom: 17px;
  border-bottom: 1px solid var(--color-border);
  font-size: var(--font-size-caption);
  font-weight: 450;
  line-height: 1.5;
  letter-spacing: 0.07em;
}
.preview-header-title,
.preview-header-meta {
  display: inline-flex;
  align-items: center;
}
.preview-header-title {
  gap: 9px;
  color: var(--color-text);
}
.preview-header-title > .iconify {
  flex-shrink: 0;
  color: var(--color-accent);
  font-size: 15px;
}
.preview-header-meta {
  gap: 7px;
  color: var(--color-text-muted);
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}
@container (max-width: 410px) {
  .preview-header {
    align-items: flex-start;
    flex-direction: column;
    gap: 6px;
    letter-spacing: 0.04em;
  }
  .preview-header-meta {
    padding-left: 24px;
  }
}
</style>
