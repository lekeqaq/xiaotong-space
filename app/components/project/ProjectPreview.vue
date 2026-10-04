<script setup lang="ts">
defineProps<{ kind: 'travel' | 'human' | 'assistant'; large?: boolean }>()
</script>
<template>
  <div class="project-preview" :class="[kind, { large }]" aria-hidden="true">
    <template v-if="kind === 'travel'"
      ><div class="phone">
        <div class="phone-camera" />
        <div class="phone-screen">
          <div class="phone-status">9:41 <span>▮▮▮ ▰</span></div>
          <div class="phone-brand">a little escape</div>
          <h3>逃个周末<span>✦</span></h3>
          <p>A weekend, well spent.</p>
          <div class="phone-tabs"><span>为你推荐</span><span>山野之间</span><span>海边放空</span></div>
          <div class="phone-places">
            <div>
              <NuxtImg
                format="webp"
                src="/images/personal/mountain.jpg"
                width="160"
                height="180"
                alt=""
                loading="lazy"
              /><strong>去山里，深呼吸</strong><small>自然 · 徒步 · 2 天</small>
            </div>
            <div>
              <NuxtImg
                format="webp"
                src="/images/personal/coast.jpg"
                width="160"
                height="180"
                alt=""
                loading="lazy"
              /><strong>等一场海边日落</strong><small>海岸 · 慢生活</small>
            </div>
          </div>
          <div class="phone-plan"><UIcon name="i-lucide-sparkles" />为你的周末，留一点惊喜。</div>
          <div class="phone-bottom">
            <UIcon name="i-lucide-compass" /><UIcon name="i-lucide-heart" /><UIcon
              name="i-lucide-user-round"
            />
          </div>
        </div>
      </div>
      <div class="project-sticky handwritten">周末不赶路，<br />只去有意思的地方。<span>✧</span></div>
      <div class="project-sparkle">✳</div></template
    >
    <template v-else-if="kind === 'human'"
      ><div class="human-orbit" />
      <NuxtImg
        format="webp"
        src="/images/projects/portrait.jpg"
        sizes="180px md:230px"
        width="350"
        height="400"
        alt=""
        loading="lazy"
      /><span class="human-play"><UIcon name="i-lucide-audio-lines" /></span
      ><span class="human-live"><span />REAL-TIME</span></template
    >
    <template v-else
      ><div class="assistant-window">
        <div class="window-bar"><span /><span /><span /><small>Xiaotong AI</small></div>
        <p>Ask about my work,<br />writing or what I’m learning.</p>
        <div class="assistant-prompt">Hi, what are you curious about?<UIcon name="i-lucide-arrow-up" /></div>
        <span class="assistant-star">✦</span>
      </div></template
    >
  </div>
</template>
