<script setup lang="ts">
const { messages, dismiss } = useAdminToast()
</script>

<template>
  <ClientOnly>
    <Teleport to="body">
      <TransitionGroup name="admin-toast" tag="div" class="admin admin-vuetify admin-notifications">
        <AdminToast v-for="item in messages" :key="item.id" :item="item" @dismiss="dismiss(item.id)" />
      </TransitionGroup>
    </Teleport>
  </ClientOnly>
</template>
