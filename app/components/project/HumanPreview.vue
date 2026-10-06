<script setup lang="ts">
import HumanSignal from './HumanSignal.vue'
import ProjectPreviewHeader from './ProjectPreviewHeader.vue'
withDefaults(defineProps<{ summary: string; interactive?: boolean }>(), { interactive: false })
const active = ref(0)
const phases = [
  {
    label: '倾听',
    speaker: '你',
    text: '今天有点累，想聊一会儿。',
    note: '不用想好怎么说。',
    service: '讯飞 ASR',
  },
  {
    label: '思考',
    speaker: '声伴',
    text: '在听，也在认真想。',
    note: '给每一句话，一点时间。',
    service: 'Qwen / DeepSeek',
  },
  {
    label: '回应',
    speaker: '声伴',
    text: '我在。慢慢说，今天怎么了？',
    note: '让回应，离你近一点。',
    service: '讯飞 TTS · LiveTalking',
  },
]
const phase = computed(() => phases[active.value]!)
</script>

<template>
  <div
    class="project-thumbnail thumbnail-human human-preview"
    :class="{ 'thumbnail-interactive': interactive, 'companion-static': !interactive }"
    :aria-hidden="interactive ? undefined : true"
  >
    <ProjectPreviewHeader
      title="SHENGBAN / 声伴"
      number="02"
      category="VOICE COMPANION"
      icon="i-lucide-audio-lines"
    />
    <div class="companion-scene">
      <div class="companion-copy">
        <span class="companion-overline" aria-hidden="true">A VOICE, A LITTLE CLOSER.</span>
        <strong>开口，<br />就有回应。</strong>
        <div class="companion-notes">
          <span
            v-for="(item, index) in phases"
            :key="item.label"
            :class="{ current: active === index }"
            :aria-hidden="active !== index"
            >{{ item.note }}</span
          >
        </div>
        <div class="companion-dialogue">
          <div
            v-for="(item, index) in phases"
            :key="item.label"
            class="companion-message"
            :class="{ current: active === index }"
            :aria-hidden="active !== index"
          >
            <span>{{ item.speaker }}<small>示例对话</small></span>
            <p>{{ item.text }}</p>
          </div>
        </div>
      </div>
      <figure class="companion-portrait">
        <div class="companion-photo">
          <NuxtImg
            src="/images/projects/portrait.jpg"
            :alt="interactive ? '声伴数字人形象示意' : ''"
            width="600"
            height="750"
            sizes="sm:35vw md:240px"
            format="webp"
            loading="lazy"
          />
          <span class="companion-photo-note">hello,<br /><em>I'm here.</em></span>
        </div>
        <figcaption><span>声伴</span><span>形象示意</span></figcaption>
      </figure>
    </div>
    <HumanSignal :phase="active" :animated="interactive" />
    <div
      v-if="interactive"
      class="companion-controls"
      role="group"
      aria-label="预览对话阶段"
      :style="{ '--phase': active }"
    >
      <button
        v-for="(item, index) in phases"
        :key="item.label"
        type="button"
        :aria-pressed="active === index"
        @click="active = index"
      >
        <span class="companion-step">0{{ index + 1 }}</span
        ><span>{{ item.label }}</span
        ><i aria-hidden="true" />
      </button>
    </div>
    <div class="companion-bottomline">
      <span>{{ interactive ? phase.service : summary }}</span
      ><span>{{ interactive ? '交互示意' : 'PROJECT NOTES ↗' }}</span>
    </div>
    <span v-if="interactive" class="sr-only" aria-live="polite" aria-atomic="true"
      >{{ phase.label }}：{{ phase.speaker }}。{{ phase.text }}</span
    >
  </div>
</template>

<style scoped>
.human-preview {
  padding: 22px 26px 0;
}
.companion-bottomline {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  line-height: 1.5;
  color: var(--color-text-muted);
  font-size: var(--font-size-caption);
  letter-spacing: 0.07em;
}
.companion-scene {
  display: grid;
  grid-template-columns: 1.35fr 0.85fr;
  align-items: center;
  gap: 30px;
  padding-block: 30px 12px;
  min-height: 275px;
}
.companion-overline {
  display: block;
  font-size: var(--font-size-caption);
  color: var(--color-text-muted);
  letter-spacing: 0.08em;
}
.companion-copy > strong {
  display: block;
  font-size: clamp(1.4rem, 5cqi, 2.1rem);
  font-weight: 500;
  line-height: 1.35;
  letter-spacing: -0.04em;
  margin-top: 13px;
}
.companion-notes {
  display: grid;
  margin-top: 12px;
  font-size: var(--font-size-caption);
  color: var(--color-text-muted);
}
.companion-notes > span,
.companion-message {
  grid-area: 1 / 1;
  opacity: 0;
  visibility: hidden;
  translate: 0 5px;
  transition:
    opacity 280ms,
    translate 400ms var(--ease);
}
.companion-notes > .current,
.companion-message.current {
  opacity: 1;
  visibility: visible;
  translate: 0;
}
.companion-dialogue {
  display: grid;
  margin-top: 20px;
  min-height: 72px;
}
.companion-message {
  border-left: 1px solid var(--color-accent);
  padding-left: 12px;
  align-self: start;
}
.companion-message > span {
  display: flex;
  align-items: center;
  gap: 10px;
  color: var(--color-text-muted);
  font-size: var(--font-size-caption);
}
.companion-message small {
  font-size: var(--font-size-caption);
}
.companion-message p {
  font-size: 0.875rem;
  line-height: 1.8;
  margin-top: 7px;
}
.companion-portrait {
  max-width: 200px;
  width: 100%;
  justify-self: end;
}
.companion-photo {
  position: relative;
  overflow: hidden;
  height: 220px;
  border-radius: 5px 48px 5px 5px;
  background: var(--color-lilac);
}
.companion-photo img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: 50% 32%;
  filter: saturate(0.5);
}
.companion-photo::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(0deg, #15192288, transparent 55%);
  pointer-events: none;
}
.companion-photo-note {
  position: absolute;
  z-index: 1;
  bottom: 16px;
  left: 16px;
  color: #fff;
  font-family: var(--font-editorial);
  font-size: 1rem;
  line-height: 1.25;
}
.companion-photo-note em {
  font-weight: 400;
}
.companion-portrait figcaption {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 10px;
  font-size: var(--font-size-caption);
  color: var(--color-text-muted);
}
.companion-controls {
  position: relative;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  margin-top: 18px;
  padding-block: 12px;
  border-top: 1px solid var(--color-border);
}
.companion-controls::after {
  content: '';
  position: absolute;
  top: -1px;
  left: 0;
  height: 2px;
  width: calc((100% - 24px) / 3);
  background: var(--color-accent);
  transform: translateX(calc(var(--phase) * (100% + 12px)));
  transition: transform 500ms cubic-bezier(0.22, 1, 0.36, 1);
}
.companion-controls button {
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 44px;
  padding: 0 10px;
  border: 0;
  border-radius: 4px;
  background: transparent;
  color: var(--color-text-muted);
  font-size: var(--font-size-caption);
  transition:
    color 250ms,
    background 250ms;
}
.companion-step {
  font-size: var(--font-size-caption);
  opacity: 0.55;
}
.companion-controls button i {
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: currentColor;
  margin-left: auto;
  opacity: 0;
  transform: scale(0);
  transition:
    opacity 250ms,
    transform 350ms;
}
.companion-controls button[aria-pressed='true'] {
  color: var(--color-accent);
  background: color-mix(in srgb, var(--color-accent) 5%, transparent);
}
.companion-controls button[aria-pressed='true'] i {
  opacity: 1;
  transform: scale(1);
}
.companion-controls button:hover {
  color: var(--color-accent);
}
.companion-controls button:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}
.companion-bottomline {
  border-top: 1px solid var(--color-border);
  min-height: 47px;
  margin-top: 13px;
  font-size: var(--font-size-caption);
  letter-spacing: 0;
}
.companion-controls + .companion-bottomline {
  margin-top: 0;
}
.companion-static .companion-scene {
  min-height: 224px;
  padding-block: 22px 0;
}
.companion-static .companion-photo {
  height: 176px;
}
.companion-static .companion-dialogue {
  display: none;
}
.companion-static :deep(.voice-thread svg) {
  height: 64px;
}
.companion-static .companion-bottomline {
  margin-top: 0;
}
.dark .companion-photo img {
  filter: saturate(0.4) brightness(0.88);
}
@container (max-width: 410px) {
  .companion-scene {
    gap: 18px;
    grid-template-columns: 1.15fr 0.85fr;
    min-height: 265px;
    padding-top: 24px;
  }
  .companion-overline {
    display: none;
  }
  .companion-copy > strong {
    font-size: 1.4rem;
  }
  .companion-notes {
    font-size: var(--font-size-caption);
  }
  .companion-dialogue {
    margin-top: 16px;
    min-height: 85px;
  }
  .companion-message p {
    font-size: 0.875rem;
  }
  .companion-photo {
    height: 200px;
    border-top-right-radius: 32px;
  }
  .companion-photo-note {
    left: 10px;
    bottom: 12px;
    font-size: 0.82rem;
  }
  .companion-controls {
    gap: 6px;
  }
  .companion-controls::after {
    width: calc((100% - 12px) / 3);
    transform: translateX(calc(var(--phase) * (100% + 6px)));
  }
  .companion-controls button {
    gap: 8px;
    padding-inline: 7px;
    font-size: var(--font-size-caption);
  }
  .companion-static .companion-scene {
    min-height: 194px;
  }
  .companion-static .companion-photo {
    height: 148px;
  }
}
@media (max-width: 540px) {
  .human-preview {
    padding: 18px 18px 0;
  }
}
@media (prefers-reduced-motion: reduce) {
  .human-preview *,
  .companion-controls::after {
    transition: none !important;
  }
}
</style>
