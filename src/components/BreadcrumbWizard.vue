<template>
  <nav class="stepper">
    <ul class="stepper-list">
      <li
        v-for="(step, i) in steps"
        :key="step.id"
        class="stepper-item"
        :class="{
          completed: i < activeIndex,
          active: i === activeIndex,
          disabled: i > maxIndexVisited,
        }"
      >
        <div class="line" v-if="i !== steps.length - 1"></div>

        <button class="dot" :disabled="i > maxIndexVisited" @click="onClick(i)">
          <span v-if="i < activeIndex">✔</span>
          <span v-else>{{ i + 1 }}</span>
        </button>

        <div class="content" @click="onClick(i)" style="cursor: pointer">
          <div class="label">
            {{ step.label }}
          </div>

          <div v-if="i === activeIndex" class="description">
            {{ step.tooltip }}
          </div>
        </div>
      </li>
    </ul>
  </nav>
</template>

<script setup>
const props = defineProps({
  steps: Array,
  activeIndex: Number,
  maxIndexVisited: Number,
})

const emit = defineEmits(['change'])

function onClick(i) {
  if (i <= props.maxIndexVisited) emit('change', i)
}
</script>

<style scoped>
.stepper {
  display: flex;
  justify-content: center;
}

.stepper-list {
  list-style: none;
  margin: 0;
  padding: 0;
  width: 300px;
}

/* tighter spacing */
.stepper-item {
  position: relative;
  display: flex;
  align-items: flex-start;
  padding: 10px 0 10px 36px;
}

/* connector line */
.line {
  position: absolute;
  left: 11px;
  top: 30px;
  width: 2px;
  height: 100%;
  background: lightgray;
  transition: background 0.25s ease;
}

.completed .line {
  background: #198754;
}

.dot {
  position: absolute;
  left: 0;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 2px solid #ced4da;
  background: var(--bs-primary);
  font-size: 11px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.completed .dot {
  background: var(--bs-success);
  border-color: var(--bs-success);
  color: white;

  box-shadow: 0 0 6px 2px var(--bs-success);
}

.active .dot {
  border-color: #0d6efd;
  box-shadow: 0 0 0 3px rgba(13, 110, 253, 0.15);
  transform: scale(1.2);

  box-shadow: 0 0 6px 2px rgba(13, 110, 253, 0.95);
}

.content {
  margin-left: 8px;
  transition: all 0.25s ease;
}

/* label always visible */
.label {
  font-weight: 500;
  font-size: 14px;
  line-height: 1.2;
}

/* description only active */
.description {
  font-size: 12px;
  color: #6c757d;
  margin-top: 2px;

  /* smooth reveal */
  opacity: 1;
  transform: translateY(0);
  transition: all 0.25s ease;
}

.stepper-item:not(.active) .description {
  display: none;
}

/* locked state */
.disabled .dot {
  opacity: 1;
  cursor: not-allowed;
  pointer-events: none;
  background: var(--bs-gray);
}
</style>
