<script setup lang="ts">
import { initialHome } from '#shared/home'
import type { HomeContent } from '#shared/content'
const props = defineProps<{ photos?: HomeContent['photos'] }>()
const photos = computed(() => (props.photos?.length ? props.photos : initialHome.photos))
const index = ref(0)
const photo = computed(() => photos.value[index.value % photos.value.length]!)
</script>

<template>
  <button
    class="desk-postcard"
    type="button"
    aria-label="翻看下一张生活照片"
    @click="index = (index + 1) % photos.length"
  >
    <span class="postcard-tape" aria-hidden="true" />
    <SiteImage
      :key="photo.src"
      :src="photo.src"
      :alt="photo.alt"
      width="360"
      height="240"
      sizes="260px sm:360px md:240px"
      format="webp"
      loading="lazy"
    />
    <span class="postcard-caption" aria-live="polite"
      >{{ photo.caption
      }}<span
        >{{ String(index + 1).padStart(2, '0') }} / {{ String(photos.length).padStart(2, '0') }}</span
      ></span
    >
    <span class="postcard-hint"><UIcon name="i-lucide-repeat-2" /> 点击，换个风景</span>
  </button>
</template>
