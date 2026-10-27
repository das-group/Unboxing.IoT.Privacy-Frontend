<template>
  <div class="form-check form-switch d-flex align-items-start">
    <input
      class="form-check-input mt-1"
      role="switch"
      type="checkbox"
      :id="id"
      :checked="modelValue"
      :disabled="disabled"
      :class="{
        'is-invalid': invalid,
        'is-valid': valid,
      }"
      @change="onChange"
    />

    <label class="form-check-label ms-2" :for="id">
      <span class="d-flex align-items-center gap-1">
        {{ label }}

        <!-- Info icon -->
        <span v-if="description" ref="tooltipEl" class="text-muted" role="button" tabindex="0" data-bs-toggle="tooltip" :title="description">
          <i class="bi bi-info-circle"></i>
        </span>
      </span>

      <div v-if="invalidFeedback" class="invalid-feedback d-block">
        {{ invalidFeedback }}
      </div>
    </label>
  </div>
</template>

<script setup>
import { onMounted, onBeforeUnmount, ref } from 'vue'
import { Tooltip } from 'bootstrap'

const props = defineProps({
  modelValue: Boolean,
  label: String,
  description: String,
  id: {
    type: String,
    default: () => `chk-${Math.random().toString(36).slice(2)}`,
  },
  disabled: Boolean,
  valid: Boolean,
  invalid: Boolean,
  invalidFeedback: String,
})

const emit = defineEmits(['update:modelValue'])

const tooltipEl = ref(null)
let tooltipInstance = null

const onChange = (e) => {
  emit('update:modelValue', e.target.checked)
}

onMounted(() => {
  if (tooltipEl.value && props.description) {
    tooltipInstance = new Tooltip(tooltipEl.value)
  }
})

onBeforeUnmount(() => {
  tooltipInstance?.dispose()
})
</script>
