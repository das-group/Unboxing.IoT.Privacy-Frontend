<template>
  <div ref="root" class="privacy-label-container" v-html="sanitizedSvg" />
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'

const props = defineProps({
  svg: { type: String, required: true },
})

const root = ref(null)
const sanitizedSvg = ref('')

const sanitize = (svg) => {
  if (!svg) return ''

  return svg.replace(/\.small\b/g, '.small-svg').replace(/"small"/g, '"small-svg"')
}

onMounted(() => {
  if (root.value && props.svg) {
    sanitizedSvg.value = sanitize(props.svg)
  }
})

watch(
  () => props.svg,
  (newSvg) => {
    if (newSvg && root.value) {
      sanitizedSvg.value = sanitize(newSvg)
    }
  },
)
</script>

<style>
.privacy-label-container {
  display: block;
}

.small-svg {
  font-size: 0.875em;
}
</style>
