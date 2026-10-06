<script setup lang="ts">
const phases = [
  {
    key: 'listening',
    label: '倾听',
    service: '讯飞 ASR',
    detail: '把语音转换成文字',
    status: '正在倾听',
    speaker: '你',
    subtitle: '你好，可以介绍一下自己吗？',
    icon: 'i-lucide-mic',
  },
  {
    key: 'thinking',
    label: '思考',
    service: 'Qwen / DeepSeek',
    detail: '本地模型组织回答',
    status: '正在生成回答',
    speaker: '模型',
    subtitle: '根据识别到的内容，组织这一轮回应。',
    icon: 'i-lucide-brain-circuit',
  },
  {
    key: 'speaking',
    label: '回应',
    service: '讯飞 TTS',
    detail: '合成语音，驱动数字人',
    status: '正在回应',
    speaker: '数字人',
    subtitle: '你好，我可以通过语音和你交流。',
    icon: 'i-lucide-volume-2',
  },
]
const active = ref(0)
const phase = computed(() => phases[active.value]!)
</script>

<template>
  <div class="human-session" :class="`session-${phase.key}`">
    <div class="session-header">
      <span><UIcon name="i-lucide-user-round" /> LiveTalking</span><span>实时数字人 / 交互示意</span>
    </div>
    <div class="session-body">
      <div class="session-portrait">
        <NuxtImg
          src="/images/projects/portrait.jpg"
          alt="数字人形象构图参考"
          width="600"
          height="750"
          sizes="sm:60vw md:400px"
          format="webp"
          loading="lazy"
        />
        <span class="session-status"><i />{{ phase.status }}</span>
        <div class="session-viewfinder" aria-hidden="true"><i /><i /><i /><i /></div>
        <span class="session-portrait-label">形象示意</span>
      </div>
      <div class="session-process">
        <span class="session-process-title">一次对话的背后</span>
        <div
          v-for="(item, index) in phases"
          :key="item.key"
          class="session-step"
          :class="{ 'step-active': active === index, 'step-complete': active > index }"
        >
          <span class="session-step-icon"><UIcon :name="item.icon" /></span>
          <div>
            <span>0{{ index + 1 }} / {{ item.label }}</span
            ><strong>{{ item.service }}</strong>
            <p>{{ item.detail }}</p>
          </div>
        </div>
        <span class="session-local"><UIcon name="i-lucide-hard-drive" /> 语言模型本地部署</span>
      </div>
    </div>
    <div class="session-dialogue" aria-live="polite">
      <span>{{ phase.speaker }}<small>示例对话</small></span>
      <p>“{{ phase.subtitle }}”</p>
    </div>
    <div class="session-controls" role="group" aria-label="预览对话阶段">
      <button
        v-for="(item, index) in phases"
        :key="item.key"
        type="button"
        :aria-pressed="active === index"
        @click="active = index"
      >
        <UIcon :name="item.icon" /><span>{{ item.label }}</span>
      </button>
    </div>
  </div>
</template>

<style src="../../assets/css/digital-human.css"></style>
