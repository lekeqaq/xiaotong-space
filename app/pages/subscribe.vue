<script setup lang="ts">
import { siteIdentity } from '#shared/site'
import { formatDate } from '~/utils/site'

defineOptions({ name: 'SubscribePage' })

useSiteSeo(
  '订阅 · 保持好奇',
  '通过 RSS 订阅小童的前端、AI 与工程实践笔记。把新文章送到你自己的阅读器，按自己的节奏阅读。',
)
const config = useRuntimeConfig()
const origin = config.public.siteUrl || useRequestURL().origin
const feedUrl = ref(new URL('/rss.xml', origin).href)
// Static previews may run on a different origin from the build server.
onMounted(() => {
  if (!config.public.siteUrl) feedUrl.value = new URL('/rss.xml', window.location.origin).href
})
const {
  data: articles,
  error,
  refresh,
} = await useAsyncData('subscription-articles', () =>
  queryCollection('writing')
    .where('draft', '=', false)
    .order('date', 'DESC')
    .select('path', 'title', 'date', 'category', 'description')
    .limit(3)
    .all(),
)
const addressInput = useTemplateRef<HTMLInputElement>('addressInput')
const copyState = ref<'idle' | 'copied' | 'manual'>('idle')
async function copyAddress() {
  try {
    await navigator.clipboard.writeText(feedUrl.value)
    copyState.value = 'copied'
  } catch {
    copyState.value = 'manual'
    addressInput.value?.focus()
    addressInput.value?.select()
  }
}
</script>

<template>
  <div class="subscribe-page container">
    <NuxtLink to="/writing" class="subscribe-back"><UIcon name="i-lucide-arrow-left" /> 回到笔记本</NuxtLink>
    <section class="subscribe-hero" aria-labelledby="subscribe-title">
      <div class="subscribe-intro">
        <span class="space-kicker"><span class="live-dot" /> A QUIET SIGNAL, FROM ME TO YOU</span>
        <h1 id="subscribe-title">保持好奇。<br />也保持<em>联系。</em></h1>
        <p>偶尔写代码，时常冒出新想法。<br />把这里的新笔记，放进你自己的阅读日常。</p>
        <div class="subscribe-topics"><span>前端手记</span><span>AI 探索</span><span>边做边学</span></div>
        <p class="subscribe-signature">不定期更新，等一个值得分享的想法。<span>— 小童</span></p>
      </div>
      <div class="signal-card">
        <div class="signal-top">
          <span>{{ siteIdentity.name }} / NOTES</span><span>RSS 2.0</span>
        </div>
        <div class="signal-art" aria-hidden="true">
          <div class="signal-orbit orbit-outer" />
          <div class="signal-orbit orbit-inner" />
          <span class="signal-core"><UIcon name="i-lucide-rss" /></span><span class="signal-star">✳</span
          ><span class="signal-caption">a little signal.<br />a lasting connection.</span>
        </div>
        <div class="signal-copy">
          <h2>下一篇，在你的阅读器见。</h2>
          <p>复制地址，添加到你喜欢的 RSS 阅读器。</p>
          <label for="feed-address">RSS 订阅地址</label>
          <div class="feed-address">
            <input
              id="feed-address"
              ref="addressInput"
              :value="feedUrl"
              readonly
              spellcheck="false"
              @focus="addressInput?.select()"
            /><button
              type="button"
              :aria-label="copyState === 'copied' ? '重新复制订阅地址' : '复制订阅地址'"
              @click="copyAddress"
            >
              <UIcon :name="copyState === 'copied' ? 'i-lucide-check' : 'i-lucide-copy'" />{{
                copyState === 'copied' ? '已复制' : '复制地址'
              }}
            </button>
          </div>
          <p class="copy-status" role="status" aria-live="polite">
            {{
              copyState === 'copied'
                ? '已复制。去阅读器里粘贴，添加订阅就好。'
                : copyState === 'manual'
                  ? '地址已选中，请长按或使用系统快捷键复制。'
                  : '免费订阅 · 无需在本站注册 · 随时取消'
            }}
          </p>
          <a href="/rss.xml" class="raw-feed-link"
            >查看原始 RSS 文件 <UIcon name="i-lucide-arrow-up-right"
          /></a>
        </div>
      </div>
    </section>
    <section class="subscribe-guide" aria-labelledby="guide-title">
      <div>
        <span class="space-kicker">01 / TUNE IN</span>
        <h2 id="guide-title">第一次用 RSS？</h2>
        <p>它像一个由你挑选的收件箱。<br />新文章自动收进来，想读时再打开。</p>
      </div>
      <ol>
        <li>
          <span>01</span>
          <div>
            <h3>选一个阅读器</h3>
            <p>比如 Feedly、Inoreader，或 Mac / iPhone 上的 NetNewsWire。</p>
          </div>
        </li>
        <li>
          <span>02</span>
          <div>
            <h3>粘贴订阅地址</h3>
            <p>复制上方链接，在阅读器里找到「添加订阅」并粘贴。</p>
          </div>
        </li>
        <li>
          <span>03</span>
          <div>
            <h3>按你的节奏阅读</h3>
            <p>有新笔记时，阅读器会自动收取。无需反复回来刷新。</p>
          </div>
        </li>
      </ol>
    </section>
    <section class="subscribe-recent" aria-labelledby="recent-title">
      <div class="subscribe-section-heading">
        <div>
          <span class="space-kicker">02 / RECENT SIGNALS</span>
          <h2 id="recent-title">最近发出的信号</h2>
        </div>
        <NuxtLink to="/writing" class="space-text-link"
          >全部笔记 <UIcon name="i-lucide-arrow-up-right"
        /></NuxtLink>
      </div>
      <div v-if="error" class="subscribe-empty">
        <p>笔记暂时没加载出来，订阅地址仍可使用。</p>
        <button type="button" class="button button-secondary" @click="refresh()">重新加载</button>
      </div>
      <div v-else-if="articles?.length" class="signal-entries">
        <NuxtLink v-for="article in articles" :key="article.path" :to="article.path" class="signal-entry"
          ><div class="signal-entry-meta">
            <time :datetime="article.date">{{ formatDate(article.date) }}</time
            ><span>{{ article.category }}</span>
          </div>
          <h3>{{ article.title }}</h3>
          <p>{{ article.description }}</p>
          <span class="signal-entry-read">读这篇笔记 <UIcon name="i-lucide-arrow-up-right" /></span
        ></NuxtLink>
      </div>
      <p v-else class="subscribe-empty">第一篇笔记还在酝酿中。可以先订阅，让它来找你。</p>
    </section>
    <p class="subscribe-outro"><span aria-hidden="true">✳</span> 世界很吵，在这里慢慢接收。</p>
  </div>
</template>

<style src="../assets/css/subscribe.css"></style>
