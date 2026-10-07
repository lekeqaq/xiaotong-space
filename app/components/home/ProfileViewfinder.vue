<script setup lang="ts">
const scenes = [
  { file: 'mountain', label: '山野', caption: '把目光，放远一点。', alt: '雪山与山谷间的森林' },
  { file: 'coast', label: '海岸', caption: '留一点时间，听听海。', alt: '安静的海面与层层波浪' },
  { file: 'camera', label: '日常', caption: '普通日子，也值得留住。', alt: '生活里的相机与摄影片段' },
]
const active = ref(0)
const scene = computed(() => scenes[active.value]!)
const visited = ref(new Set([0]))
watch(active, (index) => {
  visited.value = new Set([...visited.value, index])
})
const loadedScenes = computed(() =>
  scenes.map((item, index) => ({ ...item, index })).filter((item) => visited.value.has(item.index)),
)
</script>
<template>
  <figure class="profile-finder">
    <div class="finder-overline"><span>OUTSIDE THE SCREEN</span><UIcon name="i-lucide-aperture" /></div>
    <div class="finder-print">
      <button
        class="finder-window"
        type="button"
        aria-label="切换下一处风景"
        @click="active = (active + 1) % scenes.length"
      >
        <SiteImage
          v-for="item in loadedScenes"
          :key="item.file"
          :src="`/images/personal/${item.file}.jpg`"
          :alt="active === item.index ? item.alt : ''"
          :aria-hidden="active !== item.index"
          :class="{ 'finder-visible': active === item.index }"
          width="620"
          height="780"
          sizes="sm:80vw md:300px"
          format="webp"
        />
        <span class="finder-grid" aria-hidden="true"><i /><i /><i /><i /></span>
        <span class="finder-cross" aria-hidden="true">+</span>
        <span class="finder-counter" aria-hidden="true">0{{ active + 1 }} / 03</span>
        <span class="finder-action"><UIcon name="i-lucide-arrow-right" /></span>
      </button>
      <figcaption aria-live="polite">
        <Transition name="finder-caption" mode="out-in"
          ><span :key="active">{{ scene.caption }}</span></Transition
        >
      </figcaption>
    </div>
    <div class="finder-selector" role="group" aria-label="选择风景">
      <button
        v-for="(item, index) in scenes"
        :key="item.file"
        type="button"
        :aria-pressed="active === index"
        @click="active = index"
      >
        <span>0{{ index + 1 }}</span
        >{{ item.label }}
      </button>
    </div>
    <span class="finder-margin-note">换个风景，透一口气。</span>
  </figure>
</template>
<style scoped>
.profile-finder {
  position: relative;
  width: 100%;
  animation: finder-arrive 900ms 100ms var(--ease) both;
}
.finder-overline {
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: var(--color-text-muted);
  font-size: 0.5rem;
  letter-spacing: 0.12em;
  margin-bottom: 15px;
}
.finder-overline .iconify {
  color: var(--color-accent);
  font-size: 18px;
}
.finder-print {
  position: relative;
  padding: 9px 9px 0;
  border: 1px solid var(--color-border);
  border-radius: 5px;
  isolation: isolate;
}
.finder-print::before {
  content: '';
  position: absolute;
  inset: 5px -5px -5px 5px;
  z-index: -2;
  border: 1px solid var(--color-border);
  border-radius: inherit;
  background: var(--color-bg);
  transform: rotate(3deg);
  transform-origin: 50% 90%;
  pointer-events: none;
}
.finder-print::after {
  content: '';
  position: absolute;
  inset: 0;
  z-index: -1;
  border-radius: inherit;
  background: var(--color-surface);
  pointer-events: none;
}
.finder-window {
  position: relative;
  display: block;
  width: 100%;
  aspect-ratio: 0.94;
  overflow: hidden;
  border: 1px solid var(--color-border);
  border-radius: 2px;
  background: var(--color-mint);
  padding: 0;
  isolation: isolate;
}
.finder-window img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: saturate(0.65);
  opacity: 0;
  clip-path: inset(0 50%);
  scale: 1.08;
  transition:
    clip-path 850ms cubic-bezier(0.2, 0.7, 0.2, 1),
    scale 1200ms var(--ease),
    opacity 550ms;
}
.finder-window img.finder-visible {
  opacity: 1;
  clip-path: inset(0);
  scale: 1;
  z-index: 1;
}
.finder-window::after {
  content: '';
  position: absolute;
  inset: 0;
  z-index: 2;
  background: linear-gradient(transparent 60%, #18252080);
  pointer-events: none;
}
.finder-grid {
  position: absolute;
  z-index: 3;
  inset: 12% 10% 20%;
  opacity: 0.5;
  transition:
    inset 500ms,
    opacity 500ms;
}
.finder-grid i {
  position: absolute;
  width: 16px;
  height: 16px;
  border: 1px solid #fff;
}
.finder-grid i:nth-child(1) {
  left: 0;
  top: 0;
  border-right: 0;
  border-bottom: 0;
}
.finder-grid i:nth-child(2) {
  right: 0;
  top: 0;
  border-left: 0;
  border-bottom: 0;
}
.finder-grid i:nth-child(3) {
  left: 0;
  bottom: 0;
  border-right: 0;
  border-top: 0;
}
.finder-grid i:nth-child(4) {
  right: 0;
  bottom: 0;
  border-left: 0;
  border-top: 0;
}
.finder-cross {
  position: absolute;
  z-index: 3;
  top: 48%;
  left: 50%;
  color: #fff9;
  font: 20px var(--font-editorial);
  translate: -50% -50%;
}
.finder-counter {
  position: absolute;
  z-index: 3;
  bottom: 18px;
  left: 20px;
  font-size: 0.57rem;
  letter-spacing: 0.15em;
  color: #fff;
}
.finder-action {
  position: absolute;
  z-index: 3;
  bottom: 13px;
  right: 15px;
  border: 1px solid #ffffff70;
  color: white;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  display: grid;
  place-items: center;
  transition: transform 400ms;
}
.finder-window:is(:hover, :focus-visible) .finder-grid {
  inset: 15% 13% 23%;
  opacity: 0.9;
}
.finder-window:is(:hover, :focus-visible) .finder-action {
  transform: rotate(-35deg);
}
.profile-finder figcaption {
  height: 52px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
}
.finder-selector {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  margin-top: 24px;
  border-bottom: 1px solid var(--color-border);
}
.finder-selector button {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  min-height: 44px;
  border: 0;
  background: transparent;
  font-size: 0.65rem;
  color: var(--color-text-muted);
  transition:
    background 250ms,
    color 250ms;
}
.finder-selector button > span {
  font: italic 0.65rem var(--font-editorial);
}
.finder-selector button[aria-pressed='true'] {
  color: var(--color-accent);
}
.finder-selector button::after {
  content: '';
  position: absolute;
  bottom: -1px;
  height: 2px;
  left: 16%;
  right: 16%;
  background: var(--color-accent);
  scale: 0 1;
  transition: scale 250ms var(--ease);
}
.finder-selector button[aria-pressed='true']::after {
  scale: 1;
}
.finder-selector button:hover {
  color: var(--color-accent);
}
.finder-margin-note {
  display: block;
  color: var(--color-text-muted);
  text-align: center;
  font-size: 0.59rem;
  letter-spacing: 0.1em;
  margin-top: 13px;
}
.finder-caption-enter-active,
.finder-caption-leave-active {
  transition:
    opacity 200ms,
    translate 200ms;
}
.finder-caption-enter-from {
  opacity: 0;
  translate: 0 6px;
}
.finder-caption-leave-to {
  opacity: 0;
  translate: 0 -6px;
}
@keyframes finder-arrive {
  from {
    opacity: 0;
    translate: 0 16px;
  }
  to {
    opacity: 1;
    translate: 0;
  }
}
@media (max-width: 767px) {
  .profile-finder {
    width: min(85%, 300px);
    justify-self: center;
  }
  .finder-window {
    aspect-ratio: 1;
  }
}
@media (prefers-reduced-motion: reduce) {
  .profile-finder,
  .profile-finder * {
    animation: none;
    transition: none !important;
  }
}
</style>
