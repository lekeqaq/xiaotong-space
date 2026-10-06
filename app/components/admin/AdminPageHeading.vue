<script setup lang="ts">
defineProps<{ title: string; description?: string; editor?: boolean }>()
</script>
<template>
  <div class="admin-page-heading" :class="{ 'admin-editor-heading': editor }">
    <div class="admin-heading-copy">
      <h1>{{ title }}</h1>
      <p v-if="description">{{ description }}</p>
      <slot name="status" />
    </div>
    <div v-if="$slots.actions" class="admin-editor-actions"><slot name="actions" /></div>
  </div>
</template>
