<script setup lang="ts">
useHead({ htmlAttrs: { class: 'admin-document' } })
const colorMode = useColorMode()
const theme = computed(() => (colorMode.value === 'dark' ? 'adminDark' : 'adminLight'))
</script>
<template>
  <VApp class="admin admin-vuetify" :theme="theme">
    <slot />
    <AdminConfirmation />
  </VApp>
</template>
<style src="~/assets/css/admin-vuetify.scss" lang="scss"></style>
