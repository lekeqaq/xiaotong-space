<script setup lang="ts">
const thoughts = [
  '比起标准答案，\n更想做点有意思的东西。',
  '先做一个小小的版本，\n再让它慢慢长大。',
  '保持好奇，\n允许自己绕一点远路。',
]
const index = ref(0)
</script>

<template>
  <aside class="desk-thought ambient-motion">
    <span class="thought-pin" aria-hidden="true" />
    <div class="thought-label">NOTE TO SELF <span>✳</span></div>
    <p :key="index" class="thought-text" aria-live="polite">{{ thoughts[index] }}</p>
    <div class="thought-bottom">
      <span>— 小童</span
      ><button
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
