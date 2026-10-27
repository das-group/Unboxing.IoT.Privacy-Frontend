<template>
  <div class="container py-4 d-flex flex-column align-items-center">
    <h1 class="mb-4"><i class="bi bi-pencil-square me-2"></i> Gerät bearbeiten</h1>

    <div class="col-12 col-lg-8">
      <div v-if="loadError" class="alert alert-danger">
        {{ loadError }}
      </div>

      <div v-else-if="!canEdit && loaded" class="alert alert-danger">Du bist nicht berechtigt, diesen Beitrag zu bearbeiten.</div>

      <template v-else-if="loaded">
        <TextInputElement class="mb-3" v-model="form.manufacturer" label="Hersteller" placeholder="z.B. 'Philips'" list="manufacturerOptions" required />
        <TextInputElement class="mb-3" v-model="form.modelName" label="Modell" placeholder="z.B. 'Hue Bridge Pro'" />

        <div class="mb-3">
          <label class="form-label">Produktkategorie:</label>
          <select class="form-select" v-model="form.productCategory">
            <option value="Household">Haushalt</option>
            <option value="Health">Medizinisch</option>
            <option value="Security">Sicherheit</option>
            <option value="Garden">Garten</option>
            <option value="Office">Büro</option>
            <option value="Industrial">Industriell</option>
          </select>
        </div>

        <div class="mb-3">
          <label class="form-label">Kurzbeschreibung:</label>
          <textarea class="form-control" v-model="form.descriptionSummary" rows="3" placeholder="Bitte beschreiben Sie das Produkt in wenigen Sätzen, nennen Sie besondere Merkmale etc."></textarea>
        </div>

        <div class="mb-3">
          <label class="form-label">Schlagwörter:</label>
          <TagSelectorElement v-model="form.tags" placeholder="Geben Sie ein Schlagwort ein und drücken Sie Enter, um ein Schlagwort hinzuzufügen" />
        </div>

        <h4 class="mt-4"><i class="bi bi-images"></i> Bilder:</h4>

        <div class="d-flex flex-wrap gap-3 mb-3">
          <div v-for="img in images" :key="img.id" class="position-relative" style="width: 140px">
            <img :src="img.thumb" class="img-thumbnail" style="width: 140px; height: 140px; object-fit: cover" @error="handleImageError" />

            <span v-if="img.id === titleImageId" class="badge bg-primary position-absolute top-0 start-0 m-1">Titelbild</span>

            <button type="button" class="btn btn-sm btn-danger position-absolute top-0 end-0 m-1" :disabled="imageActionBusy" @click="removeImage(img)" title="Bild entfernen">
              <i class="bi bi-x-lg"></i>
            </button>

            <button v-if="img.id !== titleImageId" type="button" class="btn btn-sm btn-outline-primary w-100 mt-1" :disabled="imageActionBusy" @click="setTitleImage(img)">Als Titelbild</button>
          </div>

          <div v-if="images.length === 0" class="text-muted small">Noch keine Bilder vorhanden.</div>
        </div>

        <div class="mb-3">
          <label class="form-label">Neue Bilder hinzufügen:</label>
          <input type="file" class="form-control" accept="image/png, image/jpeg" multiple @change="onNewImagesSelected" ref="newImageInputRef" :disabled="imageActionBusy" />
          <div v-if="imageUploadMessage" class="small text-muted mt-1">{{ imageUploadMessage }}</div>
        </div>

        <h4 class="mt-4"><i class="bi bi-google-play"></i> Android-App:</h4>
        <TextInputElement v-model="form.androidAppLink" label="Link zu der Android-App" placeholder="z.B. https://play.google.com/store/apps/details?id=..." autocomplete="false" class="mb-3" />

        <h4><i class="bi bi-apple"></i> iOS-App:</h4>
        <TextInputElement v-model="form.iosAppLink" label="Link zu der iOS-App" placeholder="z.B. https://apps.apple.com/de/app/..." autocomplete="false" class="mb-3" />

        <h4 class="mt-4"><i class="bi bi-cpu"></i> Firmware:</h4>

        <div v-if="deviceData?.firmware_reports?.length > 0" class="small text-muted mb-2">
          <i class="bi bi-check-circle text-success me-1"></i>
          Firmware bereits vorhanden (zuletzt analysiert am {{ formatFirmwareDate(deviceData.firmware_reports[deviceData.firmware_reports.length - 1]?.created_at) }}). Ein neuer Upload ersetzt die
          aktuelle Analyse nicht sofort - es wird eine neue Analyse gestartet, deren Ergebnis nach einiger Zeit im Firmware-Tab erscheint.
        </div>
        <div v-else class="small text-muted mb-2">
          <i class="bi bi-info-circle me-1"></i>
          Noch keine Firmware vorhanden.
        </div>

        <input type="file" class="form-control" @change="onFirmwareSelected" ref="firmwareInputRef" :disabled="firmwareUploading" />
        <div v-if="firmwareUploadMessage" class="small mt-1" :class="firmwareUploadMessage.startsWith('Fehler') ? 'text-danger' : 'text-muted'">{{ firmwareUploadMessage }}</div>

        <h4 class="mt-4"><i class="bi bi-file-text"></i> Datenschutzerklärung:</h4>

        <div v-if="currentPolicySource" class="small text-muted mb-2">
          <i class="bi bi-check-circle text-success me-1"></i>
          Aktuell hinterlegt: <a :href="currentPolicySource" target="_blank">{{ currentPolicySource }}</a>
        </div>
        <div v-else class="small text-muted mb-2">
          <i class="bi bi-info-circle me-1"></i>
          Noch keine Datenschutzerklärung hinterlegt.
        </div>

        <TextInputElement v-model="form.privacyPolicyLink" label="Link zu der Datenschutzerklärung" placeholder="https://..." autocomplete="false" class="mb-2" />

        <div v-if="form.privacyPolicyLink">
          <label class="form-label small">Optional: zusätzlich eine Datei (.txt oder .html) hochladen, falls der Link nicht automatisch auswertbar ist:</label>
          <input type="file" class="form-control" accept=".txt,.html" @change="onPolicyFileSelected" ref="policyInputRef" :disabled="policyUpdating" />
        </div>

        <div class="d-flex justify-content-end mt-2">
          <ButtonElement class="btn-outline-primary" :onClick="updatePolicy" :extra-disabled="policyUpdating || !form.privacyPolicyLink"> Datenschutzerklärung aktualisieren </ButtonElement>
        </div>
        <div v-if="policyUpdateMessage" class="small mt-1" :class="policyUpdateMessage.startsWith('Fehler') ? 'text-danger' : 'text-muted'">{{ policyUpdateMessage }}</div>

        <div v-if="message" class="alert" :class="messageClass">{{ message }}</div>

        <div class="d-flex justify-content-between mt-3">
          <ButtonElement class="btn-secondary" :onClick="cancel">Abbrechen</ButtonElement>
          <ButtonElement class="btn-primary" :onClick="handleSubmit" :extra-disabled="isSubmitting || !form.manufacturer || !form.modelName"> Speichern </ButtonElement>
        </div>
      </template>

      <div v-else class="text-center text-muted py-5">Lade...</div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter, onBeforeRouteLeave } from 'vue-router'
import { dataApi } from '@/api/dataApi'
import { handleImageError } from '@/utils/helpers'
import { useAuth } from '@/stores/auth'
import { localization } from '@/locales/localization'

import TagSelectorElement from '@/components/TagSelectorElement.vue'
import ButtonElement from '@/components/ButtonElement.vue'
import TextInputElement from '@/components/TextInputElement.vue'

const props = defineProps({
  id: { type: String, required: true },
})

const router = useRouter()
const auth = useAuth()

const loaded = ref(false)
const loadError = ref(null)
const canEdit = ref(false)
const isSubmitting = ref(false)
const deviceData = ref(null)

const message = ref(null)
const messageClass = ref('alert-info')
const setMessage = (text, cls = 'alert-info') => {
  message.value = text
  messageClass.value = cls
}

const form = reactive({
  manufacturer: '',
  modelName: '',
  descriptionSummary: '',
  productCategory: '',
  tags: [],
  androidAppLink: '',
  iosAppLink: '',
  privacyPolicyLink: '',
})

const original = reactive({
  manufacturer: '',
  modelName: '',
  descriptionSummary: '',
  categories: [],
  tags: [],
  androidAppLink: '',
  iosAppLink: '',
})

function cancel() {
  router.push('/device/' + props.id)
}

onMounted(async () => {
  try {
    const res = await dataApi.get('/entry/' + props.id)
    const entry = res.data
    deviceData.value = entry

    canEdit.value = auth.isLoggedIn && (auth.hasAnyPermission('manage_posts') || auth.user?.id === entry?.created_by_user_id)

    if (canEdit.value) {
      form.manufacturer = entry?.manufacturer || ''
      form.modelName = entry?.model || ''
      form.descriptionSummary = entry?.description || ''
      form.productCategory = entry?.categories?.[0] || ''
      form.tags = entry?.tags ? [...entry.tags] : []
      form.androidAppLink = entry?.companion_apps?.android?.store_link || ''
      form.iosAppLink = entry?.companion_apps?.ios?.store_link || ''
      form.privacyPolicyLink = entry?.policy_reports?.[0]?.data?.report?.source || ''

      // Snapshot für den späteren Diff
      original.manufacturer = form.manufacturer
      original.modelName = form.modelName
      original.descriptionSummary = form.descriptionSummary
      original.categories = entry?.categories ? [...entry.categories] : []
      original.tags = [...form.tags]
      original.androidAppLink = form.androidAppLink
      original.iosAppLink = form.iosAppLink

      loadImagesFromEntry(entry)
    }

    loaded.value = true
  } catch (err) {
    console.log('Failed to load entry for editing', err)
    loadError.value = 'Der Beitrag konnte nicht geladen werden.'
    loaded.value = true
  }
})

// --- BILDER START ---
const images = ref([])
const titleImageId = ref(null)
const imageActionBusy = ref(false)
const imageUploadMessage = ref(null)
const newImageInputRef = ref(null)

// Merkt sich, ob während dieser Sitzung schon etwas (Bilder, Firmware,
// Datenschutzerklärung) direkt gespeichert wurde - diese Aktionen laufen
// unabhängig vom "Speichern"-Button für die Text-Felder. Wird gebraucht,
// damit "Keine Änderungen zum Speichern" nicht fälschlich angezeigt wird,
// wenn eigentlich schon was gespeichert wurde.
const otherChangesSaved = ref(false)

const insertBeforeExtension = (url, insert) => {
  const u = new URL(url)
  const parts = u.pathname.split('/')
  const file = parts.pop()
  const i = file.lastIndexOf('.')
  const newFile = i === -1 ? file + insert : file.slice(0, i) + insert + file.slice(i)
  parts.push(newFile)
  u.pathname = parts.join('/')
  return u.toString()
}

const extendImagePath = (id, thumbnail = false) => {
  if (!id) return id
  let url = dataApi.baseURL + 'uploads/images/' + id
  if (thumbnail) url = insertBeforeExtension(url, '_thumb')
  return url
}

const loadImagesFromEntry = (entry) => {
  images.value = (entry?.images || []).map((img) => ({
    id: img.id,
    url: extendImagePath(img.id),
    thumb: extendImagePath(img.id, true),
    uploaded_by: img.uploaded_by,
    uploaded_at: img.uploaded_at,
  }))
  const rawTitleImage = entry?.title_image
  const match = images.value.find((img) => rawTitleImage && rawTitleImage.includes(img.id))
  titleImageId.value = match ? match.id : null
}

const setTitleImage = async (img) => {
  imageActionBusy.value = true
  try {
    await dataApi.post('/upload/title_image', { entry_id: props.id, image_id: img.id })
    titleImageId.value = img.id
    otherChangesSaved.value = true
  } catch (err) {
    console.log('Failed to set title image', err)
    setMessage('Titelbild konnte nicht gesetzt werden.', 'alert-danger')
  } finally {
    imageActionBusy.value = false
  }
}

const removeImage = async (img) => {
  imageActionBusy.value = true
  try {
    await dataApi.delete('/images/' + img.id)
    images.value = images.value.filter((i) => i.id !== img.id)
    otherChangesSaved.value = true
    if (titleImageId.value === img.id) {
      titleImageId.value = null
    }
  } catch (err) {
    console.log('Failed to remove image', err)
    setMessage('Bild konnte nicht entfernt werden.', 'alert-danger')
  } finally {
    imageActionBusy.value = false
  }
}

const onNewImagesSelected = async (event) => {
  const files = Array.from(event.target.files || [])
  if (files.length === 0) return

  imageActionBusy.value = true

  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    imageUploadMessage.value = `Lade Bild ${i + 1}/${files.length} hoch...`
    try {
      const formData = new FormData()
      formData.append('file_upload', file)
      const res = await dataApi.post('/upload/image/' + props.id, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      const created = res.data
      images.value.push({
        id: created.image_id,
        url: extendImagePath(created.image_id),
        thumb: extendImagePath(created.image_id, true),
        uploaded_by: auth.user?.username,
        uploaded_at: new Date().toISOString(),
      })
      otherChangesSaved.value = true
    } catch (err) {
      console.log('Failed to upload image', err)
      setMessage(`Bild "${file.name}" konnte nicht hochgeladen werden.`, 'alert-danger')
    }
  }

  imageUploadMessage.value = null
  imageActionBusy.value = false
  if (newImageInputRef.value) newImageInputRef.value.value = ''
}
// --- BILDER ENDE ---

// --- FIRMWARE START ---
const firmwareUploading = ref(false)
const firmwareUploadMessage = ref(null)
const firmwareInputRef = ref(null)

const formatFirmwareDate = (date) => {
  if (!date) return ''
  try {
    return new Date(date).toLocaleDateString('de-DE')
  } catch {
    return date
  }
}

const onFirmwareSelected = async (event) => {
  const file = event.target.files?.[0]
  if (!file) return

  firmwareUploading.value = true
  firmwareUploadMessage.value = 'Lade Firmware hoch...'

  try {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('entry_id', props.id)
    formData.append('model_name', form.modelName)
    formData.append('manufacturer_name', form.manufacturer)

    await dataApi.post('/upload/firmware', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (p) => {
        const progress = Math.round((p.loaded / p.total) * 100)
        firmwareUploadMessage.value = `Lade Firmware hoch... ${progress}%`
      },
    })

    firmwareUploadMessage.value = 'Firmware hochgeladen, Analyse gestartet. Das kann einige Zeit dauern - das Ergebnis erscheint automatisch im Firmware-Tab der Geräteseite.'
    otherChangesSaved.value = true
  } catch (err) {
    console.log('Failed to upload firmware', err)
    const error_code = err?.response?.data?.code
    firmwareUploadMessage.value = 'Fehler beim Hochladen: ' + (error_code ? localization.t(error_code) : 'Unbekannter Fehler')
  } finally {
    firmwareUploading.value = false
    if (firmwareInputRef.value) firmwareInputRef.value.value = ''
  }
}
// --- FIRMWARE ENDE ---

// --- DATENSCHUTZERKLÄRUNG START ---
const currentPolicySource = computed(() => deviceData.value?.policy_reports?.[0]?.data?.report?.source || null)

const policyUpdating = ref(false)
const policyUpdateMessage = ref(null)
const policyInputRef = ref(null)
const selectedPolicyFile = ref(null)

const onPolicyFileSelected = (event) => {
  selectedPolicyFile.value = event.target.files?.[0] || null
}

const updatePolicy = async () => {
  if (!form.privacyPolicyLink) return

  policyUpdating.value = true
  policyUpdateMessage.value = 'Aktualisiere Datenschutzerklärung...'

  try {
    await dataApi.post('/upload/policy/direct', {
      entry_id: props.id,
      type: 'url',
      content: form.privacyPolicyLink,
    })

    if (selectedPolicyFile.value) {
      const uploadIdRes = await dataApi.get('/upload-id/' + props.id)
      const uploadId = uploadIdRes.data.upload_id

      const fileType = selectedPolicyFile.value.name.split('.').pop()
      const formData = new FormData()
      formData.append('chunk', selectedPolicyFile.value)
      formData.append('upload_id', uploadId)
      formData.append('chunk_index', 0)
      formData.append('total_chunks', 1)
      formData.append('file_type', fileType)

      await dataApi.post('/upload/policy/chunk', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (p) => {
          const progress = Math.round((p.loaded / p.total) * 100)
          policyUpdateMessage.value = `Lade Datei hoch... ${progress}%`
        },
      })

      await dataApi.post('/upload/policy/complete', { upload_id: uploadId })
    }

    policyUpdateMessage.value = 'Datenschutzerklärung aktualisiert. Die neue Auswertung erscheint in Kürze auf der Geräteseite.'
    otherChangesSaved.value = true
    selectedPolicyFile.value = null
    if (policyInputRef.value) policyInputRef.value.value = ''
  } catch (err) {
    console.log('Failed to update policy', err)
    const error_code = err?.response?.data?.code
    policyUpdateMessage.value = 'Fehler: ' + (error_code ? localization.t(error_code) : 'Unbekannter Fehler')
  } finally {
    policyUpdating.value = false
  }
}
// --- DATENSCHUTZERKLÄRUNG ENDE ---

// Baut das Diff-Objekt
const arraysEqual = (a, b) => a.length === b.length && a.every((v, i) => v === b[i])

const buildChangedFields = () => {
  const changed = {}

  if (form.manufacturer !== original.manufacturer) {
    changed.manufacturer = form.manufacturer
  }
  if (form.modelName !== original.modelName) {
    changed.model = form.modelName
  }
  if (form.descriptionSummary !== original.descriptionSummary) {
    changed.description = form.descriptionSummary
  }

  const newCategories = [form.productCategory, ...original.categories.slice(1)]
  if (!arraysEqual(newCategories, original.categories)) {
    changed.categories = newCategories
  }

  if (!arraysEqual(form.tags, original.tags)) {
    changed.tags = [...form.tags]
  }

  if (form.androidAppLink !== original.androidAppLink || form.iosAppLink !== original.iosAppLink) {
    changed.companion_app_links = { ios: form.iosAppLink, android: form.androidAppLink }
  }

  return changed
}

// --- UNGESPEICHERTE ÄNDERUNGEN WARNEN START ---
const hasUnsavedChanges = () => Object.keys(buildChangedFields()).length > 0

onBeforeRouteLeave((to, from, next) => {
  try {
    if (hasUnsavedChanges()) {
      const confirmed = window.confirm('Du hast ungespeicherte Änderungen. Möchtest du diese Seite wirklich verlassen?')
      next(confirmed)
    } else {
      next()
    }
  } catch (err) {
    console.error('Fehler in der Verlassen-Warnung, navigiere trotzdem weiter:', err)
    next()
  }
})

// Tab schließen / neu laden
const handleBeforeUnload = (e) => {
  if (hasUnsavedChanges()) {
    e.preventDefault()
    e.returnValue = ''
  }
}
window.addEventListener('beforeunload', handleBeforeUnload)
onBeforeUnmount(() => {
  window.removeEventListener('beforeunload', handleBeforeUnload)
})
// --- UNGESPEICHERTE ÄNDERUNGEN WARNEN ENDE ---

const handleSubmit = async () => {
  const changedFields = buildChangedFields()

  if (Object.keys(changedFields).length === 0) {
    if (otherChangesSaved.value) {
      setMessage('Änderungen wurden bereits gespeichert.', 'alert-success')
      await new Promise((resolve) => setTimeout(resolve, 1000))
      router.push('/device/' + props.id)
    } else {
      setMessage('Keine Änderungen zum Speichern.', 'alert-info')
    }
    return
  }

  isSubmitting.value = true
  setMessage('Speichere Änderungen...')

  try {
    const updatePayload = {
      id: window.crypto?.randomUUID ? window.crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      entry_id: props.id,
      created_at: new Date().toISOString(),
      created_by: auth.user?.username ?? auth.user?.id ?? '',
      ...changedFields,
    }

    await dataApi.patch('/entry/' + props.id + '/update', updatePayload)

    original.manufacturer = form.manufacturer
    original.modelName = form.modelName
    original.descriptionSummary = form.descriptionSummary
    original.categories = [form.productCategory, ...original.categories.slice(1)]
    original.tags = [...form.tags]
    original.androidAppLink = form.androidAppLink
    original.iosAppLink = form.iosAppLink

    const isAdmin = auth.hasAnyPermission('manage_posts')
    setMessage(isAdmin ? 'Gespeichert.' : 'Gespeichert. Der Beitrag muss erneut von einem Admin freigegeben werden.', 'alert-success')

    await new Promise((resolve) => setTimeout(resolve, 1200))
    router.push('/device/' + props.id)
  } catch (err) {
    console.log('Failed to save entry', err)
    const error_code = err?.response?.data?.code
    setMessage('Fehler beim Speichern: ' + (error_code ? localization.t(error_code) : 'Unbekannter Fehler'), 'alert-danger')
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped></style>
