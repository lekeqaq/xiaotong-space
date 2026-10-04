<script setup lang="ts">
const photos = [
  { src: 'coast', caption: '去有风的地方。', alt: '海岸、远山与开阔的海面' },
  { src: 'mountain', caption: '偶尔，让思绪离线。', alt: '云层之下的雪山' },
  { src: 'camera', caption: '收集日常的小瞬间。', alt: '记录生活的相机' },
  { src: 'notebook', caption: '好想法，先记下来。', alt: '摊开的笔记本' },
]
const index = ref(0)
const photo = computed(() => photos[index.value]!)
</script>

<template>
  <button
    class="desk-postcard"
    type="button"
    aria-label="翻看下一张生活照片"
    @click="index = (index + 1) % photos.length"
  >
    <span class="postcard-tape" aria-hidden="true" />
    <NuxtImg
      :key="photo.src"
      :src="`/images/personal/${photo.src}.jpg`"
      :alt="photo.alt"
      width="360"
      height="240"
      sizes="240px"
      format="webp"
    />
    <span class="postcard-caption" aria-live="polite"
      >{{ photo.caption }}<span>{{ String(index + 1).padStart(2, '0') }} / 04</span></span
    >
    <span class="postcard-hint"><UIcon name="i-lucide-repeat-2" /> 点击，换个风景</span>
  </button>
</template>
