<script setup lang="ts">
interface TocLink {
  id: string
  text: string
  children?: TocLink[]
}
defineProps<{ links: TocLink[] }>()
</script>
<template>
  <ul class="toc-links">
    <li v-for="link in links" :key="link.id">
      <a :href="`#${link.id}`">{{ link.text }}</a
      ><ContentToc v-if="link.children?.length" :links="link.children" />
    </li>
  </ul>
</template>
