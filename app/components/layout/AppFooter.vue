<script setup lang="ts">
import '../../assets/css/footer.css'
import { siteIdentity } from '#shared/site'
</script>

<template>
  <footer class="app-footer site-footer container">
    <div class="footer-identity">
      <NuxtLink to="/" class="wordmark"
        ><span class="wordmark-symbol" aria-hidden="true">✳</span
        ><span class="wordmark-name">{{ siteIdentity.name }}</span></NuxtLink
      >
      <p>记录所做，分享所学。</p>
    </div>
    <span class="footer-copyright">© {{ new Date().getFullYear() }} Xiaotong</span>
  </footer>
</template>
