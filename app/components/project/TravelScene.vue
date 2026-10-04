<script setup lang="ts">
const destination = ref<'mountain' | 'coast'>('mountain')
const places = {
  mountain: {
    title: 'Into the wild.',
    label: '去山里，深呼吸。',
    route: '城市 → 山野',
    code: 'MTN',
    alt: '山谷与远方的雪山',
  },
  coast: {
    title: 'Follow the tide.',
    label: '等一场海边日落。',
    route: '城市 → 海边',
    code: 'SEA',
    alt: '波浪起伏的海面',
  },
}
const place = computed(() => places[destination.value])
</script>
<template>
  <div class="travel-scene project-scene" :class="`destination-${destination}`">
    <div class="travel-landscape">
      <NuxtImg
        v-for="(item, key) in places"
        :key="key"
        :src="`/images/personal/${key}.jpg`"
        :alt="destination === key ? item.alt : ''"
        :aria-hidden="destination !== key"
        :class="{ visible: destination === key }"
        width="1000"
        height="850"
        sizes="100vw md:60vw xl:760px"
        format="webp"
        loading="lazy"
      />
    </div>
    <div class="scene-topline">
      <span><UIcon name="i-lucide-compass" /> A LITTLE ESCAPE</span><span>CONCEPT / 01</span>
    </div>
    <div class="travel-scene-title">
      <span>LESS PLANNING. MORE LIVING.</span>
      <p :key="destination">{{ place.title }}</p>
    </div>
    <svg class="travel-route ambient-motion" viewBox="0 0 600 320" aria-hidden="true">
      <path class="route-base" d="M52 252C145 215 132 72 271 112S403 270 534 52" />
      <path class="route-drawn" d="M52 252C145 215 132 72 271 112S403 270 534 52" />
      <circle cx="52" cy="252" r="5" />
      <circle cx="534" cy="52" r="6" />
    </svg>
    <div :key="place.code" class="escape-ticket" aria-live="polite">
      <div><span>YOUR WEEKEND PASS</span><UIcon name="i-lucide-arrow-up-right" /></div>
      <strong>{{ place.label }}</strong>
      <p>{{ place.route }}<span>02 DAYS</span></p>
      <div class="ticket-perforation" />
      <div class="ticket-code">
        <span>SZX <UIcon name="i-lucide-move-right" /> {{ place.code }}</span
        ><i />
      </div>
    </div>
    <div class="travel-switch" role="group" aria-label="切换旅行场景">
      <button type="button" :aria-pressed="destination === 'mountain'" @click="destination = 'mountain'">
        <UIcon name="i-lucide-mountain" /> 山野之间</button
      ><button type="button" :aria-pressed="destination === 'coast'" @click="destination = 'coast'">
        <UIcon name="i-lucide-waves" /> 海边放空
      </button>
    </div>
    <span class="scene-interaction-hint">换个风景，换种心情 <UIcon name="i-lucide-mouse-pointer-2" /></span>
  </div>
</template>
