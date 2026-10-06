<script setup lang="ts">
import type { HomeInput, RenderedArticle } from '#shared/admin'
import type { ProjectSummary, WritingSummary } from '~/types/content'
defineOptions({ name: 'AdminDraftPreviewPage' })
definePageMeta({ middleware: 'admin' })
useSeoMeta({ title: '草稿预览', robots: 'noindex, nofollow' })
const colorMode = useColorMode()
const payload = shallowRef<{
  kind: 'article' | 'home'
  article?: RenderedArticle
  home?: HomeInput
  latestArticle?: WritingSummary
  project?: ProjectSummary
} | null>(null)
function receive(event: MessageEvent) {
  if (
    event.origin !== window.location.origin ||
    event.source !== window.parent ||
    event.data?.type !== 'xiaotong-preview'
  )
    return
  const value = event.data.payload
  if (value?.kind !== 'article' && value?.kind !== 'home') return
  payload.value = value
  colorMode.preference = event.data.theme === 'dark' ? 'dark' : 'light'
}
function preventNavigation(event: MouseEvent) {
  // Keep website links inside the preview from navigating away from the draft.
  if ((event.target as Element).closest('a')) {
    event.preventDefault()
    event.stopPropagation()
  }
}
function shortcut(event: KeyboardEvent) {
  if (event.key === 'Escape' && window.parent !== window) {
    event.preventDefault()
    window.parent.postMessage({ type: 'xiaotong-preview-close' }, window.location.origin)
  }
}
onMounted(() => {
  window.addEventListener('keydown', shortcut)
  window.addEventListener('message', receive)
  if (window.parent !== window)
    window.parent.postMessage({ type: 'xiaotong-preview-ready' }, window.location.origin)
})
onBeforeUnmount(() => {
  window.removeEventListener('message', receive)
  window.removeEventListener('keydown', shortcut)
})
</script>
<template>
  <div v-if="payload" class="admin-public-preview" @click.capture="preventNavigation">
    <AppHeader />
    <div v-if="payload.kind === 'article' && payload.article" class="container inner-page article-detail">
      <WritingArticleView :article="payload.article" />
    </div>
    <div v-else-if="payload.kind === 'home'" class="container">
      <HeroSection
        :home-settings="payload.home"
        :article="payload.latestArticle"
        :project="payload.project"
      />
    </div>
    <AppFooter />
  </div>
  <p v-else class="admin-preview-waiting" role="status">正在载入草稿预览…</p>
</template>
<style scoped>
.admin-preview-waiting {
  padding: 48px;
  text-align: center;
  color: var(--color-text-muted);
}
</style>
