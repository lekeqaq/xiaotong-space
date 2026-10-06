<script setup lang="ts">
defineOptions({ name: 'AdminMediaPage' })
definePageMeta({ middleware: 'admin', layout: 'admin', pageTransition: false, layoutTransition: false })
useSeoMeta({ title: '图片管理' })
</script>
<template>
  <div class="admin-page">
    <AdminPageHeading
      title="图片"
      description="文章封面、正文插图与生活照片，统一收集和管理。"
    /><AdminMediaLibrary />
  </div>
</template>
