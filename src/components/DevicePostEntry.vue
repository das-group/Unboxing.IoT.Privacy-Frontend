<template>
  <div class="card blog-card shadow-sm lazy-section">
    <img v-if="title_image" :src="title_image" class="card-img-top p-2" alt="Bild" role="button" @click="$emit('read-more')" @error="handleImageError" />

    <div class="card-body d-flex flex-column align-items-center" @click="$emit('read-more')">
      <span class="card-title text-uppercase fw-bold">
        {{ manufacturer }}
      </span>

      <h4 class="card-title">
        {{ model }}
      </h4>

      <span class="card-text line-clamp-3 mb-0">{{ description }}</span>

      <div class="" v-if="tags?.length">
        <span v-for="tag in tags" :key="tag" class="badge bg-secondary me-1 text-uppercase" role="button" @click.stop="onTagClicked(tag)">
          {{ tag }}
        </span>
      </div>
    </div>

    <div v-if="props.show_visibility" :class="['visibility-badge', 'ms-2', `status-${props.visibility}`]">
      <span class="pulsing-indicator"></span>
      {{ formatVisibility(props.visibility) }}
    </div>

    <div v-if="props.show_visibility" class="ms-2">
      {{ formatDateTime(props.created_at) }}
    </div>
  </div>
</template>

<script setup>
import { computed, defineProps, defineEmits } from 'vue'
import { formatDateTime, handleImageError } from '@/utils/helpers'

const emit = defineEmits(['onTagClick'])

const props = defineProps({
  manufacturer: String,
  model: String,

  model_year: String,
  model_version: String,
  description: String,

  link: String,

  created_by: String,
  created_at: String,
  tags: Array,
  title_image: String,

  visibility: String,
  show_visibility: {
    type: Boolean,
    default: false,
  },
})

const formatVisibility = (visibility) => {
  if (visibility === 'public') {
    return 'Öffentlich'
  }

  if (visibility === 'review') {
    return 'In Moderation'
  }

  if (visibility === 'delete_requested') {
    return 'Löschung beantragt'
  }

  return visibility
}

const formattedDate = computed(() => new Date(props.created_at).toLocaleDateString())

const onTagClicked = (tagName) => {
  emit('onTagClick', tagName)
}
</script>

<style scoped>
.blog-card {
  border-radius: 0.6rem;
  overflow: hidden;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.card-body {
  cursor: pointer;
}

.card-img-top {
  transition: filter 0.2s ease;
}
.blog-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 18px rgba(0, 0, 0, 0.15);
}

.blog-card:hover .card-img-top {
  filter: drop-shadow(0 0 5px var(--bs-link-hover-color));
}
.card-img-top {
  object-fit: contain;
  height: 180px;
}

.lazy-section {
  content-visibility: auto;
  contain-intrinsic-size: 350px;
}

.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  min-height: 3.2em;
}
/* Colored pulsing circle */
.pulsing-indicator {
  display: inline-block;
  /* ← critical: makes width/height apply */
  width: 10px;
  height: 10px;
  flex-shrink: 0;
  /* prevent squashing in flex container */

  border-radius: 50%;
  /* ← ensures perfect circle */
  background-color: #4caf50;
  /* default green */

  /* box-shadow for pulse */
  box-shadow: 0 0 0 0 rgba(76, 175, 80, 0.7);
}

.status-public .pulsing-indicator {
  background-color: #4caf50;
  box-shadow: 0 0 0 0 rgba(76, 175, 80, 0.7);
  animation: pulse-green 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

.status-review .pulsing-indicator {
  background-color: #ffda07;
  box-shadow: 0 0 0 0 rgba(255, 209, 2, 0.7);
  animation: pulse-orange 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

.status-delete_requested .pulsing-indicator {
  background-color: #ff0707;
  box-shadow: 0 0 0 0 rgba(243, 28, 28, 0.7);
  animation: pulse-red 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse-green {
  0% {
    opacity: 1;
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(76, 175, 80, 0.7);
  }

  70% {
    opacity: 1;
    transform: scale(1);
    box-shadow: 0 0 0 6px rgba(76, 175, 80, 0);
  }

  100% {
    opacity: 1;
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(76, 175, 80, 0);
  }
}

@keyframes pulse-orange {
  0% {
    opacity: 1;
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(255, 152, 0, 0.7);
  }

  70% {
    opacity: 1;
    transform: scale(1);
    box-shadow: 0 0 0 6px rgba(76, 175, 80, 0);
  }

  100% {
    opacity: 1;
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(76, 175, 80, 0);
  }
}

@keyframes pulse-red {
  0% {
    opacity: 1;
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(255, 0, 0, 0.7);
  }

  70% {
    opacity: 1;
    transform: scale(1);
    box-shadow: 0 0 0 6px rgba(76, 175, 80, 0);
  }

  100% {
    opacity: 1;
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(76, 175, 80, 0);
  }
}
</style>
