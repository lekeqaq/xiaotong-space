<script setup lang="ts">
const route = useRoute()
const { data: experiment } = await useAsyncData(`experiment-${route.path}`, () =>
  queryCollection('lab').path(route.path).first(),
)
if (!experiment.value) throw createError({ statusCode: 404, statusMessage: 'Experiment not found' })
useSiteSeo(
  computed(() => experiment.value?.title || 'AI Lab'),
  computed(() => experiment.value?.description || ''),
)
</script>
<template>
  <div v-if="experiment" class="inner-page container lab-detail">
    <NuxtLink to="/lab" class="back-link"><UIcon name="i-lucide-arrow-left" />Back to the lab</NuxtLink>
    <header class="detail-header">
      <span class="eyebrow">EXP. {{ experiment.experiment }} <StatusBadge :status="experiment.status" /></span
      ><UIcon :name="experiment.icon" class="experiment-icon" />
      <h1>{{ experiment.title }}<span>.</span></h1>
      <p>{{ experiment.description }}</p>
      <div class="tech-tags"><TechTag v-for="tech in experiment.tech" :key="tech" :label="tech" /></div>
      <div v-if="experiment.demo || experiment.repository" class="detail-meta">
        <a
          v-if="experiment.demo"
          :href="experiment.demo"
          class="button button-primary"
          target="_blank"
          rel="noopener noreferrer"
          >Open demo <UIcon name="i-lucide-arrow-up-right" /></a
        ><a
          v-if="experiment.repository"
          :href="experiment.repository"
          class="text-link"
          target="_blank"
          rel="noopener noreferrer"
          >GitHub <UIcon name="i-simple-icons-github"
        /></a>
      </div>
    </header>
    <ContentDocument :document="experiment" /><NuxtLink to="/lab" class="next-page-link"
      >Keep exploring <UIcon name="i-lucide-arrow-right"
    /></NuxtLink>
  </div>
</template>
