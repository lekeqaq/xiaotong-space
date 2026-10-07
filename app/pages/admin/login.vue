<script setup lang="ts">
defineOptions({ name: 'AdminLoginPage' })
const api = useAdminApi()
const route = useRoute()
const { data: session } = await useFetch<{ authenticated: boolean; configured: boolean }>(
  '/api/admin/session',
)
if (session.value?.authenticated) await navigateTo('/admin')
useSeoMeta({ title: '后台登录', robots: 'noindex, nofollow' })
const username = ref('admin')
const password = ref('')
const error = ref('')
const showPassword = ref(false)
const busy = ref(false)
async function login() {
  if (busy.value) return
  busy.value = true
  error.value = ''
  try {
    await api('login', { method: 'POST', body: { username: username.value, password: password.value } })
    const next =
      typeof route.query.next === 'string' &&
      /^\/admin(?:\/|$)/.test(route.query.next) &&
      !route.query.next.startsWith('/admin/login')
        ? route.query.next
        : '/admin'
    await navigateTo(next)
  } catch (e) {
    error.value = adminError(e)
  } finally {
    busy.value = false
    password.value = ''
  }
}
</script>
<template>
  <AdminProvider>
    <div class="admin-login">
      <header class="admin-login-top">
        <NuxtLink to="/" class="admin-brand"
          ><span class="admin-brand-symbol">✳</span><span>XIAOTONG<small>内容工作台</small></span></NuxtLink
        >
        <AdminThemeToggle />
      </header>
      <div class="admin-login-layout">
        <VCard class="admin-login-card">
          <div class="admin-login-heading">
            <span class="admin-login-symbol"><UIcon name="i-lucide-lock-keyhole" /></span>
            <h1>登录工作台</h1>
            <p>输入管理员账号与密码，继续管理内容。</p>
          </div>
          <form class="admin-login-form" @submit.prevent="login">
            <div class="admin-login-field">
              <label for="admin-login-username">账号</label
              ><VTextField
                id="admin-login-username"
                v-model="username"
                aria-label="账号"
                single-line
                autocomplete="username"
                required
                maxlength="100"
                placeholder="请输入管理员账号"
                prepend-inner-icon="i-lucide-user-round"
                :disabled="busy"
                :error="!!error"
              />
            </div>
            <div class="admin-login-field">
              <label for="admin-login-password">密码</label
              ><VTextField
                id="admin-login-password"
                v-model="password"
                aria-label="密码"
                single-line
                :type="showPassword ? 'text' : 'password'"
                autocomplete="current-password"
                required
                maxlength="200"
                placeholder="请输入密码"
                prepend-inner-icon="i-lucide-lock-keyhole"
                :disabled="busy"
                :error="!!error"
                ><template #append-inner
                  ><VBtn
                    type="button"
                    icon
                    size="small"
                    variant="text"
                    class="admin-password-toggle"
                    :aria-label="showPassword ? '隐藏密码' : '显示密码'"
                    :aria-pressed="showPassword"
                    :disabled="busy"
                    @click="showPassword = !showPassword"
                    ><UIcon :name="showPassword ? 'i-lucide-eye-off' : 'i-lucide-eye'" /></VBtn></template
              ></VTextField>
            </div>
            <VAlert v-if="!session?.configured" type="info"
              >管理员尚未配置。请在项目目录运行 <code>pnpm admin:password</code>，完成后重启 Nuxt
              服务。</VAlert
            >
            <VAlert v-if="error" type="error" role="alert">{{ error }}</VAlert>
            <VBtn
              type="submit"
              color="primary"
              block
              height="48"
              :loading="busy"
              :disabled="busy || !session?.configured"
              >登录后台<UIcon name="i-lucide-arrow-right"
            /></VBtn>
          </form>
          <div class="admin-login-divider" />
          <VBtn to="/" variant="text" block class="admin-login-back"
            ><UIcon name="i-lucide-arrow-left" />回到网站</VBtn
          >
        </VCard>
      </div>
      <footer class="admin-login-foot">XIAOTONG · 记录所做，分享所学。</footer>
    </div>
  </AdminProvider>
</template>
