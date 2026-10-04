<script setup lang="ts">
import type { ExperimentSummary } from '~/types/content'
defineProps<{ experiment: ExperimentSummary }>()
</script>
<template>
  <NuxtLink :to="experiment.path" class="lab-card" :class="{ planning: experiment.status === 'planning' }"
    ><div class="lab-card-top">
      <span>EXP. {{ experiment.experiment }}</span
      ><UIcon :name="experiment.icon" />
    </div>
    <h3>{{ experiment.title }}</h3>
    <p>{{ experiment.description }}</p>
    <div class="lab-card-bottom">
      <StatusBadge :status="experiment.status" /><UIcon name="i-lucide-arrow-up-right" /></div
  ></NuxtLink>
</template>
