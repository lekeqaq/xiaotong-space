<script setup lang="ts">
const props = defineProps<{ code?: string; language?: string; filename?: string; class?: string }>()
const copied = ref(false)
const message = ref('')
async function copyCode() {
  try {
    await navigator.clipboard.writeText(props.code || '')
    copied.value = true
    message.value = '代码已复制'
  } catch {
    message.value = '复制失败，请手动选择代码复制'
  }
}
</script>
<template>
  <div class="code-block">
    <div class="code-toolbar">
      <span>{{ filename || language || 'code' }}</span
      ><button aria-label="复制代码" @click="copyCode">
        <UIcon :name="copied ? 'i-lucide-check' : 'i-lucide-copy'" />{{ copied ? '已复制' : '复制' }}
      </button>
    </div>
    <pre :class="props.class"><slot /></pre>
    <span class="sr-only" role="status">{{ message }}</span>
  </div>
</template>
