<script setup lang="ts">
defineProps<{ title?: string }>()
</script>
<template>
  <div class="content-callout">
    <UIcon name="i-lucide-lightbulb" />
    <div>
      <strong v-if="title">{{ title }}</strong
      ><slot />
    </div>
  </div>
</template>
