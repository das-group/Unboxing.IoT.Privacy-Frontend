<template>
  <button class="btn" @click="onButtonClick" :disabled="isLoadingData || props.extraDisabled">
    <span v-if="showSpinner && isLoadingData" class="spinner-border spinner-border-sm me-2"></span>

    <slot />
  </button>
</template>

<script setup>
import { defineProps, ref } from 'vue'

const isLoadingData = ref(false)

const props = defineProps({
  extraDisabled: {
    type: Boolean,
    required: false,
    default: false,
  },
  showSpinner: {
    type: Boolean,
    required: false,
    default: true,
  },
  onClick: {
    type: Function,
    required: true,

    /*
    validator: fn => {
      try {
        const result = fn();
        return result instanceof Promise || typeof result === 'undefined';
      } catch {
        return true; // can't test, assume okay
      }
    }*/
  },
})

async function onButtonClick() {
  try {
    isLoadingData.value = true

    await props?.onClick?.()
  } catch (err) {
    console.log(err)
  } finally {
    isLoadingData.value = false
  }
}
</script>

<style scoped></style>
