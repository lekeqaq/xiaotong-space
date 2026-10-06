<script setup lang="ts">
defineOptions({ inheritAttrs: false })
defineProps<{ src?: string; alt?: string }>()
</script>
<template>
  <img v-if="src?.startsWith('/media/')" :src="src" :alt="alt || ''" v-bind="$attrs" decoding="async" />
  <NuxtImg v-else-if="src" :src="src" :alt="alt || ''" v-bind="$attrs" />
</template>
