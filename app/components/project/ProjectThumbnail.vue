<script setup lang="ts">
import HumanPreview from './HumanPreview.vue'
import ProjectPreviewHeader from './ProjectPreviewHeader.vue'
const props = withDefaults(
  defineProps<{
    kind: 'travel' | 'human'
    summary: string
    interactive?: boolean
    size?: 'shelf' | 'showcase'
  }>(),
  {
    interactive: false,
    size: 'showcase',
  },
)
const destination = ref<'mountain' | 'coast'>('mountain')
const places = {
  mountain: {
    title: '去山里，深呼吸。',
    caption: '山野之间',
    route: ['出发', '走进山野', '住一晚'],
    code: 'MTN',
  },
  coast: {
    title: '等一场海边日落。',
    caption: '海边放空',
    route: ['出发', '沿海散步', '等日落'],
    code: 'SEA',
  },
}
const place = computed(() => places[destination.value])
const imageSizes = computed(() =>
  props.size === 'shelf' ? '140px md:210px lg:240px' : '140px sm:180px md:240px xl:300px',
)
const visited = ref(new Set(['mountain']))
watch(destination, (key) => {
  visited.value = new Set([...visited.value, key])
})
const loadedPlaces = computed(() => Object.entries(places).filter(([key]) => visited.value.has(key)))
</script>

<template>
  <HumanPreview v-if="kind === 'human'" :summary="summary" :interactive="interactive" :size="size" />
  <div
    v-else
    class="project-thumbnail thumbnail-travel"
    :class="{ 'thumbnail-interactive': interactive }"
    :aria-hidden="interactive ? undefined : true"
  >
    <ProjectPreviewHeader title="WEEKEND / 逃个周末" number="01" category="TRAVEL" icon="i-lucide-compass" />
    <div class="travel-study">
      <Transition name="study-note" mode="out-in"
        ><div :key="destination" class="study-travel-note">
          <span class="study-small-label">给周末，留一点空白</span>
          <strong>{{ place.title }}</strong>
          <span class="study-handwriting">A little escape.</span>
          <div class="study-route">
            <span v-for="stop in place.route" :key="stop"><i />{{ stop }}</span>
          </div>
          <small>02 DAYS / 随心出发</small>
        </div></Transition
      >
      <figure class="study-postcard">
        <span class="study-tape" />
        <div class="study-landscape-window">
          <SiteImage
            v-for="[key, item] in loadedPlaces"
            :key="key"
            :src="`/images/personal/${key}.jpg`"
            :alt="interactive && destination === key ? item.caption : ''"
            :aria-hidden="destination !== key"
            :class="{ 'landscape-visible': destination === key }"
            width="560"
            height="640"
            :sizes="imageSizes"
            format="webp"
            loading="lazy"
          />
        </div>
        <figcaption>
          <span>{{ place.caption }}</span
          ><span>{{ place.code }} ↗</span>
        </figcaption>
      </figure>
    </div>
    <div v-if="interactive" class="study-controls" role="group" aria-label="切换旅行场景">
      <button
        v-for="(item, key) in places"
        :key="key"
        type="button"
        :aria-pressed="destination === key"
        @click="destination = key"
      >
        <UIcon :name="key === 'mountain' ? 'i-lucide-mountain' : 'i-lucide-waves'" />{{ item.caption }}
      </button>
    </div>
    <div class="study-bottomline">
      <span>{{ summary }}</span
      ><span>{{ interactive ? '交互示意' : 'PROJECT NOTES ↗' }}</span>
    </div>
  </div>
</template>

<style src="../../assets/css/project-thumbnails.css"></style>
