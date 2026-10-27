<template>
  <div>
    <div
      class="border border-2 rounded p-4 text-center upload-area"
      @dragover.prevent="dragOver = true"
      @dragleave.prevent="dragOver = false"
      @drop.prevent="handleDrop"
      :class="{ 'border-success bg-success-subtle': dragOver }"
    >
      <h5 class="mb-3">Dateien hochladen</h5>
      <p class="text-muted">Drag & Drop, oder</p>
      <input type="file" class="form-control" :accept="accept" :multiple="multiple" @change="handleFileSelected" />
    </div>

    <div class="mt-4">
      <h5>Dateien ({{ props.files.length }})</h5>

      <ul class="list-group mt-3" v-if="props.files.length">
        <li class="list-group-item" v-for="(item, index) in props.files" :key="item.localFileId">
          <div class="d-flex justify-content-between align-items-center gap-3">
            <input v-if="props.fileSelectable" class="form-check-input" type="radio" name="flexRadioDefault" :id="item.localFileId" v-model="selectedId" :value="item.localFileId" />

            <div v-if="props.imagePreview">
              <img class="image-preview" :src="createObjectURL(item.file)" />
            </div>

            <div>
              <span class="fw-bold" v-if="item.file.size <= props.maxFileSize">{{ item.file.name }}</span>
              <del class="fw-bold" v-else>{{ item.file.name }}</del>

              <br />

              <small class="text-muted">{{ formatSize(item.file.size) }}</small>

              <div class="text-danger" v-if="item.file.size > props.maxFileSize">Die Datei ist zu groß. Bitte wählen Sie eine Datei &lt; {{ formatSize(props.maxFileSize) }}.</div>
            </div>

            <div class="d-none d-md-block text-center" v-if="props.fileSelectable && selectedId === item.localFileId">
              <p class="mb-0 text-uppercase fst-italic fw-bold">Titelbild</p>
            </div>

            <div class="d-flex gap-2 ms-auto">
              <button class="btn btn-danger btn-sm" @click="removeFile(index)"><i class="bi bi-trash me-2"></i>Entfernen</button>
            </div>
          </div>
        </li>
      </ul>

      <p v-else class="text-muted mt-3">Keine Dateien ausgewählt</p>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, reactive } from 'vue'

const props = defineProps({
  files: {
    type: Array,
    required: true,
  },
  accept: {
    type: String,
    default: '*',
  },
  multiple: {
    type: Boolean,
    default: false,
  },
  imagePreview: {
    type: Boolean,
    default: false,
  },
  maxFiles: {
    type: Number,
    default: -1,
  },
  maxFileSize: {
    type: Number,
    default: 1024 * 1024 * 1024, // 1GB
  },
  fileSelectable: {
    type: Boolean,
    default: false,
  },
})

const createObjectURL = window.URL.createObjectURL

const selectedId = defineModel('selectedId')

//const files = ref([]);
const dragOver = ref(false)
const fileCounter = ref(0)

const handleFileSelected = (e) => addFiles(e.target.files)
const handleDrop = (e) => {
  dragOver.value = false
  addFiles(e.dataTransfer.files)
}

const removeFile = (index) => {
  const fileToRemove = props.files[index]

  props.files.splice(index, 1)

  // If we removed the selected image
  if (fileToRemove.localFileId === selectedId.value) {
    // Select next best image
    if (props.files.length > 0) {
      const nextIndex = Math.min(index, props.files.length - 1)
      selectedId.value = props.files[nextIndex].localFileId
    } else {
      selectedId.value = null
    }
  }
}

const addFiles = (fileList) => {
  // Max files
  if (props.maxFiles > 0 && props.files.length >= props.maxFiles) {
    return
  }

  for (let file of fileList) {
    const entry = reactive({
      localFileId: fileCounter.value++,
      file,
      //progress: 0,
      //selected: (props.files.length == 0)
    })

    if (props.files.length == 0) {
      selectedId.value = entry.localFileId
    }

    const newLen = props.files.push(entry)
  }
}

const formatSize = (bytes) => {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  return (bytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB'
}

/*
const formattedDate = computed(() =>
  new Date(props.created_at).toLocaleDateString()
);
*/
</script>

<style scoped>
.upload-area {
  transition: 0.2s ease;
  cursor: pointer;
  user-select: none;
}

.upload-area:hover {
  background-color: var(--bs-primary-bg-subtle);
}

.image-preview {
  width: 64px;
  height: 64px;
  object-fit: contain;
}
</style>
