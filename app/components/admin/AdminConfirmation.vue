<script setup lang="ts">
const { pending, finish } = useAdminConfirm()
onBeforeUnmount(() => finish(false))
</script>
<template>
  <AdminDialog v-if="pending" :title="pending.title" @close="finish(false)">
    <p class="admin-confirm-message">{{ pending.message }}</p>
    <template #footer>
      <VBtn variant="outlined" @click="finish(false)">取消</VBtn>
      <VBtn :color="pending.danger ? 'error' : 'primary'" @click="finish(true)">{{
        pending.confirmLabel || '确认'
      }}</VBtn>
    </template>
  </AdminDialog>
</template>
