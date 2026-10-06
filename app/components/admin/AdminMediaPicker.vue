<script setup lang="ts">
import type { MediaItem } from '#shared/admin'
const emit = defineEmits<{ close: []; select: [item: MediaItem] }>()
</script>
<template>
  <AdminDialog title="选择图片" wide @close="emit('close')"
    ><AdminMediaLibrary selectable @select="emit('select', $event)"
  /></AdminDialog>
</template>
