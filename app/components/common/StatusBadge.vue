<script setup lang="ts">
defineProps<{ status: 'live' | 'building' | 'experimenting' | 'planning' | 'archived' }>()
</script>
<template>
  <span class="status-badge" :class="status"><span />{{ status }}</span>
</template>
