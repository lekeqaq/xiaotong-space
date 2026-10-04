<script setup lang="ts">
const phases = [
  {
    key: 'listening',
    label: '倾听',
    caption: 'Every conversation starts with listening.',
    icon: 'i-lucide-audio-lines',
  },
  {
    key: 'thinking',
    label: '思考',
    caption: 'A little pause. A thought taking shape.',
    icon: 'i-lucide-sparkles',
  },
  { key: 'speaking', label: '回应', caption: 'Ideas find a voice.', icon: 'i-lucide-message-circle' },
]
const active = ref(0)
const phase = computed(() => phases[active.value]!)
const bars = [12, 24, 19, 46, 29, 60, 36, 72, 50, 87, 61, 100, 70, 48, 79, 53, 30, 60, 35, 46, 20, 28, 12]
</script>
<template>
  <div class="voice-scene project-scene" :class="`voice-${phase.key}`">
    <div class="scene-topline">
      <span><UIcon name="i-lucide-orbit" /> HUMAN, AFTER ALL</span><span>INTERACTION STUDY</span>
    </div>
    <div class="voice-scene-type" aria-hidden="true">A voice.<br /><em>A presence.</em></div>
    <div class="voice-entity ambient-motion" aria-hidden="true">
      <div class="voice-ring ring-a" />
      <div class="voice-ring ring-b" />
      <div class="voice-ring ring-c" />
      <div class="voice-ring ring-d" />
      <div class="voice-core"><UIcon :key="phase.key" :name="phase.icon" /></div>
      <span class="entity-point" />
    </div>
    <div class="voice-state">
      <div class="scene-waveform ambient-motion" aria-hidden="true">
        <i
          v-for="(height, index) in bars"
          :key="index"
          :style="{ '--wave-height': `${height}%`, '--wave-delay': `${index * -0.12}s` }"
        />
      </div>
      <p :key="phase.key" aria-live="polite">{{ phase.caption }}</p>
    </div>
    <div class="voice-switch" role="group" aria-label="预览对话阶段">
      <button
        v-for="(item, index) in phases"
        :key="item.key"
        type="button"
        :aria-pressed="active === index"
        @click="active = index"
      >
        <span>0{{ index + 1 }}</span
        >{{ item.label }}
      </button>
    </div>
    <span class="scene-interaction-hint">点击，感受对话的节奏 <UIcon name="i-lucide-mouse-pointer-2" /></span>
  </div>
</template>
