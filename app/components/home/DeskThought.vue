<script setup lang="ts">
import { initialHome } from '#shared/admin'
import type { HomeInput } from '#shared/admin'
const props = defineProps<{ thoughts?: HomeInput['thoughts'] }>()
const { data: home } = await useFetch('/api/content/home', { key: 'home-settings' })
const thoughts = computed(() => props.thoughts || home.value?.thoughts || initialHome.thoughts)
const index = ref(0)
</script>

<template>
  <aside class="desk-thought ambient-motion">
    <span class="thought-pin" aria-hidden="true" />
    <div class="thought-label">NOTE TO SELF <span>✳</span></div>
    <p :key="index" class="thought-text" aria-live="polite">{{ thoughts[index % thoughts.length]?.text }}</p>
    <div class="thought-bottom">
      <button
        type="button"
        aria-label="换一个想法"
        title="换一个想法"
        @click="index = (index + 1) % thoughts.length"
      >
        <UIcon name="i-lucide-shuffle" />
      </button>
    </div>
  </aside>
</template>
