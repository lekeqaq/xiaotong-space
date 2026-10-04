<script setup lang="ts">
defineProps<{ number: string; title: string; description?: string; to?: string; linkLabel?: string }>()
</script>
<template>
  <div class="section-heading">
    <span class="section-number">{{ number }}</span>
    <h2>{{ title }}</h2>
    <p v-if="description">{{ description }}</p>
    <NuxtLink v-if="to" :to="to" class="text-link"
      >{{ linkLabel || 'Explore more' }} <UIcon name="i-lucide-arrow-right"
    /></NuxtLink>
  </div>
</template>
