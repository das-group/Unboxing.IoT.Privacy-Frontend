<template>
  <span v-if="status !== null && status !== undefined">
    {{ status ? titleT : titleF }}
    <i
      :class="['bi', status ? (colorInverted ? 'bi-check-lg text-danger' : 'bi-check-lg text-success') : colorInverted ? 'bi-x-lg text-success' : 'bi-x-lg text-danger']"
      :title="status ? titleT : titleF"
    />
  </span>
  <span v-else> {{ titleN }} <i class="bi bi-question-lg text-warning" /> </span>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  status: {
    type: [Boolean, null],
    required: true,
  },
  titleT: {
    type: String,
    default: 'Ja',
  },
  titleF: {
    type: String,
    default: 'Nein',
  },
  titleN: {
    type: String,
    default: 'Unbekannt',
  },
  colorInverted: {
    type: Boolean,
    default: false,
  },
})
</script>

<style scoped></style>
