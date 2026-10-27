<template>
  <div class="container mt-5">
    <div class="card shadow mx-auto" style="max-width: 600px">
      <div class="card-body p-4">
        <!-- Step Header -->
        <div class="d-flex justify-content-between align-items-center mb-4">
          <span class="badge bg-secondary">Schritt {{ currentIndex + 1 }} von {{ privacyProperties.length }}</span>
        </div>

        <!-- Content Area -->
        <div v-if="currentProperty" class="fade-in">
          <h2 class="h4 mb-3">{{ currentProperty.property_id }}) {{ currentProperty.name }}</h2>
          <p class="text-muted mb-4">{{ currentProperty.description }}</p>

          <hr />

          <!-- Metric Section -->
          <div class="metric-container py-3">
            <label class="form-label fw-bold text-secondary">Metrik:</label>

            <!-- Dynamic Metric Text -->
            <p class="fs-5 mb-4">
              {{ formatMetricText(currentProperty.metric.metric_value, currentProperty.metric.metric_type) }}
            </p>

            <div v-if="!(currentProperty.metric.raw_metric_methods == currentProperty.metric.tool)">
              {{ currentProperty.metric.raw_metric_methods }}
            </div>

            <!-- Input Logic based on Type -->
            <div class="input-area">
              <!-- BINARY: Bootstrap Slider -->
              <div v-if="currentProperty.metric.metric_type === 'binary' || currentProperty.metric.metric_type === 'bool'" class="px-3">
                <input type="range" class="form-range" min="0" max="1" step="1" v-model="sliderValue" />
                <div class="d-flex justify-content-between small text-muted mt-1">
                  <span>{{ currentProperty.metric.metric_type === 'binary' ? 'Ja' : 'Option A' }}</span>
                  <span>{{ currentProperty.metric.metric_type === 'binary' ? 'Nein' : 'Option B' }}</span>
                </div>
              </div>

              <!-- LIST: Simple Text Area (Placeholder for real data entry) -->
              <div v-else-if="currentProperty.metric.metric_type === 'list' || currentProperty.metric.metric_type === 'datetime'" class="mt-2">
                <textarea class="form-control" rows="3" placeholder="Daten hier eingeben..." v-model="listInput"></textarea>
              </div>

              <!-- RESOURCE: Placeholder -->
              <div v-else class="alert alert-info py-2">Dokument hochladen TODO</div>

              <label class="form-label fw-bold text-secondary mt-4">Werkzeug:</label>
              <p class="fs-6">
                {{ currentProperty.metric.tool }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Progress Bar -->
      <div class="progress rounded-0" style="height: 10px">
        <div class="progress-bar bg-primary" :style="{ width: progress + '%' }"></div>
      </div>

      <!-- Footer Controls -->
      <div class="card-footer d-flex justify-content-between p-3">
        <button class="btn btn-outline-secondary" @click="prevStep" :disabled="currentIndex === 0">Zurück</button>

        <button v-if="currentIndex < privacyProperties.length - 1" class="btn btn-primary px-4" @click="nextStep">Weiter</button>
        <button v-else class="btn btn-success px-4" @click="finish">Abschließen</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
// Import your data array here
import { privacyProperties } from '../privacyproperties.js'

const props = defineProps(['data'])
const properties = props.data || privacyProperties

// State
const currentIndex = ref(0)
const sliderValue = ref(0) // 0 or 1
const listInput = ref('')

// Computed
const currentProperty = computed(() => properties[currentIndex.value])

const progress = computed(() => {
  return ((currentIndex.value + 1) / properties.length) * 100
})

const formatMetricText = (text, type) => {
  if (type !== 'binary' && type !== 'bool') return text

  // Regex to find content between { and }
  // Matches: {text1 / text2}
  const regex = /\{([^/]+)\s*\/\s*([^}]+)\}/
  const match = text.match(regex)

  if (match) {
    const optionA = match[1].trim()
    const optionB = match[2].trim()

    const result = text.replace(/\{([^/]+)\/([^}]+)\}/, (match, opt1, opt2) => {
      return sliderValue.value == 0 ? opt1 : opt2
    })
    return result
  }

  return text
}

// Methods
const nextStep = () => {
  saveCurrentValue()
  currentIndex.value++
  resetInputs()
}

const prevStep = () => {
  saveCurrentValue()
  currentIndex.value--
  resetInputs()
}

const saveCurrentValue = () => {
  // TODO Push
  console.log(`Saving ID ${currentProperty.value.id}:`, currentProperty.value.metric.metric_type === 'binary' ? (sliderValue.value == 0 ? 'A' : 'B') : listInput.value)
}

const resetInputs = () => {
  sliderValue.value = 0
  listInput.value = ''
}

const finish = () => {
  saveCurrentValue()
  alert('Alle Privacy-Properties abgearbeitet!')
}
</script>

<style scoped>
.fade-in {
  animation: fadeIn 0.4s ease-in;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.metric-container {
  background-color: var(--bs-body-bg);
  border-radius: 8px;
}

/* Custom Slider Styling */
.form-range::-webkit-slider-thumb {
  background: #0d6efd;
}
</style>
