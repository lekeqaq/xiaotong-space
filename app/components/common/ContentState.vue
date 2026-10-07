<script setup lang="ts">
withDefaults(defineProps<{ title: string; description: string; busy?: boolean; retry?: boolean }>(), {
  busy: false,
  retry: true,
})
defineEmits<{ retry: [] }>()
</script>

<template>
  <div class="content-state" :aria-busy="busy">
    <div role="status">
      <h2>{{ title }}</h2>
      <p>{{ description }}</p>
    </div>
    <button
      v-if="retry"
      type="button"
      class="button button-secondary"
      :disabled="busy"
      @click="$emit('retry')"
    >
      <UIcon :name="busy ? 'i-lucide-loader-circle' : 'i-lucide-rotate-ccw'" />
      {{ busy ? '正在重试…' : '重新加载' }}
    </button>
    <slot />
  </div>
</template>

<style scoped>
.content-state {
  padding: 28px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-surface);
}
.content-state h2 {
  font-size: 1.125rem;
  line-height: 1.5;
}
.content-state p {
  margin-top: 8px;
  color: var(--color-text-muted);
}
.content-state .button {
  margin-top: 20px;
}
.content-state a {
  display: inline-block;
  margin-left: 18px;
  color: var(--color-accent);
}
</style>
