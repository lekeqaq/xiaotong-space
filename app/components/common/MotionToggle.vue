<script setup lang="ts">
const paused = useState('ambient-motion-paused', () => false)
</script>
<template>
  <button
    type="button"
    class="motion-toggle"
    :aria-label="paused ? '播放装饰动效' : '暂停装饰动效'"
    :title="paused ? '播放装饰动效' : '暂停装饰动效'"
    :aria-pressed="paused"
    @click="paused = !paused"
  >
    <UIcon :name="paused ? 'i-lucide-play' : 'i-lucide-pause'" /><span>{{
      paused ? 'MOTION OFF' : 'MOTION ON'
    }}</span>
  </button>
</template>
