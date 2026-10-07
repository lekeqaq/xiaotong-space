<script setup lang="ts">
const api = useAdminApi()
const route = useRoute()
const { notify } = useAdminToast()
const drawer = ref<boolean | null>(null)
const mounted = ref(false)
onMounted(() => {
  mounted.value = true
})
function navigateMenu(event: MouseEvent | KeyboardEvent, navigate: (event?: MouseEvent) => unknown) {
  closeMobileNavigation()
  if (event instanceof MouseEvent) navigate(event)
  else {
    event.preventDefault()
    navigate()
  }
}
function closeMobileNavigation() {
  if (window.matchMedia('(max-width: 959px)').matches) drawer.value = false
}
const items = [
  { title: '文章', to: '/admin', icon: 'i-lucide-notebook-pen', caption: '写作与发布' },
  { title: '首页', to: '/admin/home', icon: 'i-lucide-panels-top-left', caption: '照片与日常想法' },
  { title: '图片', to: '/admin/media', icon: 'i-lucide-images', caption: '封面与素材' },
]
const current = computed(() => items.find((item) => item.to === route.path) || items[0]!)
const isArticleEditor = computed(() => route.path.startsWith('/admin/articles/'))
function active(to: string) {
  return to === '/admin' ? route.path === to || route.path.startsWith('/admin/articles') : route.path === to
}
async function logout() {
  try {
    await api('logout', { method: 'POST' })
    await navigateTo('/admin/login')
  } catch (e) {
    notify(adminError(e), 'error')
  }
}
useSeoMeta({ robots: 'noindex, nofollow' })
</script>
<template>
  <AdminProvider :class="{ 'admin-shell-booting': !mounted }">
    <VNavigationDrawer v-model="drawer" :width="236" :mobile-breakpoint="960" class="admin-sidebar">
      <NuxtLink to="/admin" class="admin-brand"
        ><span class="admin-brand-symbol">✳</span><span>XIAOTONG<small>内容工作台</small></span></NuxtLink
      >
      <span class="admin-overline admin-nav-label">工作空间</span>
      <nav aria-label="后台导航">
        <VList class="admin-nav-list">
          <NuxtLink v-for="item in items" :key="item.to" v-slot="{ href, navigate }" :to="item.to" custom>
            <VListItem
              :href="href ?? undefined"
              :active="active(item.to)"
              :aria-current="active(item.to) ? 'page' : undefined"
              color="primary"
              rounded="lg"
              :aria-label="item.title"
              @click="(event) => navigateMenu(event, navigate)"
            >
              <template #prepend><UIcon :name="item.icon" /></template>
              <span class="admin-nav-title">{{ item.title }}</span
              ><small class="admin-nav-caption">{{ item.caption }}</small>
            </VListItem>
          </NuxtLink>
        </VList>
      </nav>
      <template #append>
        <div class="admin-sidebar-note">
          <UIcon name="i-lucide-hard-drive-download" /><strong>为你的记录留一份副本</strong>
          <p>导出文章、发布历史和上传图片。</p>
          <VBtn href="/api/admin/backup" variant="outlined" block download>下载完整备份</VBtn>
        </div>
        <div class="admin-sidebar-foot"><span class="admin-online-dot" />个人内容管理 · XIAOTONG</div>
      </template>
    </VNavigationDrawer>
    <VAppBar flat height="68" class="admin-header">
      <div class="admin-topbar">
        <VBtn
          icon
          variant="text"
          class="admin-menu-toggle"
          aria-label="打开后台导航"
          @click="drawer = !drawer"
          ><UIcon name="i-lucide-menu"
        /></VBtn>
        <NuxtLink v-if="isArticleEditor" v-slot="{ href, navigate }" to="/admin" custom>
          <VBtn
            :href="href ?? undefined"
            variant="tonal"
            color="primary"
            class="admin-return-button"
            aria-label="返回全部文章"
            @click="navigate"
            ><UIcon name="i-lucide-arrow-left" />全部文章</VBtn
          >
        </NuxtLink>
        <div class="admin-breadcrumb" :class="{ 'admin-editor-breadcrumb': isArticleEditor }">
          <span>工作台</span><UIcon name="i-lucide-chevron-right" /><strong>{{
            isArticleEditor ? '编辑文章' : current.title
          }}</strong>
        </div>
        <div class="admin-header-actions">
          <VBtn href="/" target="_blank" variant="text" class="admin-site-link"
            >查看网站<UIcon name="i-lucide-arrow-up-right"
          /></VBtn>
          <VBtn
            href="/api/admin/backup"
            icon
            variant="text"
            class="admin-mobile-backup"
            aria-label="下载完整备份"
            download
            ><UIcon name="i-lucide-download"
          /></VBtn>
          <AdminThemeToggle />
          <span class="admin-header-divider" />
          <VBtn icon variant="text" aria-label="退出登录" @click="logout"
            ><UIcon name="i-lucide-log-out"
          /></VBtn>
        </div>
      </div>
    </VAppBar>
    <VMain tag="section"
      ><div class="admin-content">
        <slot /></div
    ></VMain>
  </AdminProvider>
</template>
