<template>
  <div class="form-floating custom-floating">
    <input ref="input" :type="type" class="form-control" :id="inputId" :placeholder="label" :value="modelValue" @input="onInput" @focus="isFocused = true" @blur="isFocused = false" v-bind="$attrs" />
    <label :for="inputId">{{ label }}</label>

    <!-- Custom placeholder overlay -->
    <span v-if="showCustomPlaceholder" class="custom-placeholder">
      {{ placeholder }}
    </span>
  </div>
</template>

<script>
export default {
  name: 'FloatingInput',

  inheritAttrs: false,

  props: {
    modelValue: {
      type: String,
      default: '',
    },
    label: {
      type: String,
      required: true,
    },
    placeholder: {
      type: String,
      default: '',
    },
    type: {
      type: String,
      default: 'text',
    },
    id: {
      type: String,
      default: null,
    },
  },

  emits: ['update:modelValue'],

  data() {
    return {
      isFocused: false,
    }
  },

  computed: {
    inputId() {
      return this.id || `floating-input-${this.$.uid}`
    },
    showCustomPlaceholder() {
      return this.placeholder && this.isFocused && !this.modelValue
    },
  },

  methods: {
    onInput(event) {
      this.$emit('update:modelValue', event.target.value)

      // Sync DOM after external formatters modify the value
      this.$nextTick(() => {
        if (this.$refs.input && this.$refs.input.value !== this.modelValue) {
          this.$refs.input.value = this.modelValue
        }
      })
    },
  },
}
</script>

<style scoped>
.custom-floating {
  position: relative;
}

/* Hide the native placeholder - Bootstrap uses it for label positioning */
.custom-floating .form-control::placeholder {
  color: transparent;
}

/* Custom placeholder styling */
.custom-placeholder {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  padding: 1.625rem 0.75rem 0.625rem;
  pointer-events: none;
  color: #6c757d;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
