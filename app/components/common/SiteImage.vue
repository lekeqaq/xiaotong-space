<script setup lang="ts">
defineOptions({ inheritAttrs: false })
const props = defineProps<{ src?: string; alt?: string }>()
const failed = ref(false)
const source = computed(() => props.src?.trim() || '/og/default.png')
watch(source, () => {
  failed.value = false
})
const displayed = computed(() => (failed.value ? '/og/default.png' : source.value))
</script>
<template>
  <img
    v-if="source.startsWith('/media/') || failed"
    :src="displayed"
    :alt="alt || ''"
    v-bind="$attrs"
    decoding="async"
    @error="failed = true"
  />
  <NuxtImg v-else :src="displayed" :alt="alt || ''" v-bind="$attrs" @error="failed = true" />
</template>
