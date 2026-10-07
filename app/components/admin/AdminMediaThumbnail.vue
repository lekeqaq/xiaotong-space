<script setup lang="ts">
defineProps<{ src: string; alt: string; eager?: boolean }>()
const image = useTemplateRef<HTMLImageElement>('image')
const loaded = ref(false)
const failed = ref(false)
onMounted(() => {
  if (image.value?.complete) {
    loaded.value = image.value.naturalWidth > 0
    failed.value = !loaded.value
  }
})
</script>

<template>
  <span class="admin-media-thumbnail" :aria-busy="!loaded && !failed">
    <span v-if="!loaded && !failed" class="admin-media-placeholder" aria-hidden="true">图片加载中…</span>
    <img
      ref="image"
      :src="src"
      :alt="alt"
      :loading="eager ? 'eager' : 'lazy'"
      decoding="async"
      :class="{ 'admin-media-thumbnail-failed': failed }"
      @load="loaded = true"
      @error="failed = true"
    />
    <span v-if="failed" class="admin-media-placeholder">图片加载失败，点击查看详情</span>
  </span>
</template>

<style scoped>
.admin-media-thumbnail {
  display: block;
  width: 100%;
  height: 100%;
  position: relative;
}
.admin-media-thumbnail img {
  position: relative;
}
.admin-media-thumbnail-failed {
  visibility: hidden;
}
.admin-media-placeholder {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  padding: 12px;
  background: var(--admin-tint);
  color: var(--admin-muted);
  font-size: 12px;
}
</style>
