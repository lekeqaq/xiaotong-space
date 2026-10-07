<script setup lang="ts">
import { useTheme } from 'vuetify'
import { installAdminVuetify } from '~/utils/adminVuetify'
installAdminVuetify(useNuxtApp().vueApp)
useHead({ htmlAttrs: { class: 'admin-document' } })
const colorMode = useColorMode()
// Local preference can resolve before hydration; start with the server's theme class
// and update it only after mounting. Site CSS tokens supply the correct colors meanwhile.
const mounted = ref(false)
onMounted(() => {
  mounted.value = true
})
const theme = computed(() => (mounted.value && colorMode.value === 'dark' ? 'adminDark' : 'adminLight'))
const vuetifyTheme = useTheme()
watch(
  theme,
  (name) => {
    void vuetifyTheme.change(name)
  },
  { immediate: true },
)
</script>
<template>
  <VApp class="admin admin-vuetify" :theme="theme">
    <slot />
    <AdminConfirmation />
    <AdminNotifications />
  </VApp>
</template>
<style src="~/assets/css/admin-vuetify.scss" lang="scss"></style>

<style src="~/assets/css/admin.css"></style>
