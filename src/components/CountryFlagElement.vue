<template><span v-if="resolvedCode" class="fi me-1" :class="`fi-${resolvedCode}`" :title="fixedTitle"></span>{{ props.showName ? fixedTitle : '' }}</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  code: {
    type: String,
    required: true,
  },

  title: {
    type: String,
    default: '',
  },

  showName: {
    type: Boolean,
    default: false,
  },
})

const resolvedCode = computed(() => {
  if (!props.code) {
    return null
  }

  const isocode = props.code.toLowerCase().trim()

  // Check if it is ISO Code
  if (isocode.length !== 2) {
    return null
  }

  return isocode
})

const displName = new Intl.DisplayNames([new Intl.NumberFormat().resolvedOptions().locale], { type: 'region' })

const fixedTitle = computed(() => {
  if (props.title) {
    return props.title
  }
  if (resolvedCode.value) {
    try {
      return displName.of(resolvedCode.value.toUpperCase())
    } catch (ex) {
      return resolvedCode.value.toUpperCase()
    }
  }
  return '?'
})
</script>

<style scoped>
.fi {
}
</style>
