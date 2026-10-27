<template>
  <div class="progress" role="progressbar" :aria-valuenow="normalizedValue" aria-valuemin="0" :aria-valuemax="max" :style="{ height }">
    <div class="progress-bar" :class="barClasses" :style="{ width: normalizedValue + '%' }">
      <span v-if="showLabel">
        <div v-if="showLabelMax">{{ normalizedValue }} / {{ max }}</div>
        <div v-else>{{ normalizedValue }}%</div>
      </span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  value: {
    type: Number,
    required: true,
  },
  max: {
    type: Number,
    default: 100,
  },
  height: {
    type: String,
    default: '1rem',
  },
  variant: {
    type: String,
    default: 'primary', // primary, success, warning, danger, etc.
  },
  striped: {
    type: Boolean,
    default: false,
  },
  animated: {
    type: Boolean,
    default: false,
  },
  showLabel: {
    type: Boolean,
    default: true,
  },
  showLabelMax: {
    type: Boolean,
    default: false,
  },
})

const normalizedValue = computed(() => {
  const percentage = (props.value / props.max) * 100
  return Math.min(100, Math.max(0, Math.round(percentage)))
})

const barClasses = computed(() => [
  `bg-${props.variant}`,
  {
    'progress-bar-striped': props.striped,
    'progress-bar-animated': props.animated,
  },
])
</script>
