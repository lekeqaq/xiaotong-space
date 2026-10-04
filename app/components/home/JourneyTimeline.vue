<script setup lang="ts">
import { journey } from '~/utils/site'
</script>
<template>
  <div class="journey-timeline">
    <svg class="journey-line" viewBox="0 0 900 70" preserveAspectRatio="none" aria-hidden="true">
      <path
        d="M20 42 C100 45 110 15 190 25 S290 47 365 39 S455 52 540 43 S650 8 710 20 S800 15 880 32"
        fill="none"
        stroke="currentColor"
        stroke-width="1.2"
      />
    </svg>
    <ol>
      <li
        v-for="(step, index) in journey"
        :key="step.year"
        :class="{ current: index === journey.length - 1 }"
      >
        <div class="journey-year">
          {{ step.year }}<small v-if="index === 0">START</small
          ><small v-else-if="index === journey.length - 1">NOW</small
          ><small v-else aria-hidden="true">&nbsp;</small>
        </div>
        <span class="journey-node"><span v-if="index === journey.length - 1">✦</span></span>
        <h3>{{ step.title }}</h3>
        <p v-for="skill in step.skills" :key="skill">{{ skill }}</p>
      </li>
    </ol>
  </div>
</template>
