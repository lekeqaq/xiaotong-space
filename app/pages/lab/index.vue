<script setup lang="ts">
useSiteSeo('AI Lab', '小童的 AI 实验场：探索 RAG、Voice Agent、旅行规划与 AI 应用。')
const { data: experiments } = await useAsyncData('lab', () =>
  queryCollection('lab').order('order', 'ASC').all(),
)
const status = ref('all')
const filtered = computed(() =>
  experiments.value?.filter((item) => status.value === 'all' || item.status === status.value),
)
</script>
<template>
  <div class="inner-page container">
    <div class="page-intro lab-intro">
      <span class="eyebrow"><UIcon name="i-lucide-flask-conical" /> A WORK IN PROGRESS</span>
      <h1>Curiosity is the<br />starting point<span>.</span></h1>
      <p>
        A playground for things I’m currently exploring.<br />一些小实验，一些不确定性，还有一些值得试试的想法。
      </p>
      <span class="content-note">实验路线与设计记录 · 在线 AI 能力将在后续版本接入</span>
    </div>
    <div class="filter-tabs lab-filter">
      <button
        v-for="item in ['all', 'building', 'experimenting', 'planning']"
        :key="item"
        :aria-pressed="status === item"
        :class="{ active: status === item }"
        @click="status = item"
      >
        {{ item === 'all' ? 'All experiments' : item }}
      </button>
    </div>
    <div class="lab-grid lab-list">
      <LabCard v-for="experiment in filtered" :key="experiment.path" :experiment="experiment" />
    </div>
    <p v-if="!filtered?.length" class="empty-state">这个状态下还没有实验，看看其他方向吧。</p>
    <div class="lab-footnote handwritten">Small experiments. Real possibilities. ✧</div>
  </div>
</template>
