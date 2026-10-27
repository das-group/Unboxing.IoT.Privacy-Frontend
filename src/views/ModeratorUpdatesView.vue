<template>
  <div class="container py-4">
    <h1 class="text-center mb-4">Ausstehende Bearbeitungen</h1>

    <div class="row g-4" v-if="pendingUpdates.length > 0">
      <div class="col-12" v-for="entry in pendingUpdates" :key="entry.update._id">

        <div class="card mb-3 shadow-sm">
          <div class="row g-0">
            <!-- Thumbnail -->
            <div class="col-md-2 d-flex align-items-center justify-content-center">
              <img v-if="entry.device?.title_image" :src="getThumbnailUrl(entry.device.title_image)" class="img-fluid rounded-start" alt="Bild" style="max-height: 100px; object-fit: cover" @error="handleImageError">
            </div>

            <!-- Meta + Diff -->
            <div class="col-md-10">
              <div class="card-body">
                <h5 class="card-title mb-1">
                  <strong>{{ entry.device?.manufacturer }} {{ entry.device?.model }}</strong>
                </h5>
                <div class="text-muted small mb-3">
                  Bearbeitet am {{ formatDateTime(entry.update.created_at) }} von
                  <strong v-if="entry.update.created_by">{{ entry.update.created_by_username || entry.update.created_by }}</strong>
                  <span v-else class="text-muted">(Unbekannt)</span>
                </div>

                <!-- Diff -->
                <div class="border-top pt-3">
                  <h6 class="text-secondary small fw-bold">Änderungen</h6>

                  <div v-if="getFieldDiffs(entry).length === 0" class="text-muted small fst-italic">Keine anzeigbaren Feldänderungen gefunden.</div>

                  <table v-else class="table table-sm mb-0">
                    <thead>
                      <tr>
                        <th style="width: 22%">Feld</th>
                        <th style="width: 39%">Vorher</th>
                        <th style="width: 39%">Nachher</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="diff in getFieldDiffs(entry)" :key="diff.label">
                        <td class="fw-semibold">{{ diff.label }}</td>
                        <td class="text-danger small">
                          <s>{{ diff.oldValue }}</s>
                        </td>
                        <td class="text-success small">{{ diff.newValue }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div class="d-flex gap-2 mt-3">
                  <router-link :to="'/device/' + entry.update.entry_id" class="btn btn-sm btn-outline-primary flex-fill"> Zugehörigen Post Öffnen </router-link>
                  <ButtonElement class="btn-success flex-fill" :onClick="() => approveUpdate(entry)" :extra-disabled="entry.applying"> Genehmigen </ButtonElement>
                </div>

                <div v-if="entry.errorMessage" class="text-danger small mt-2">{{ entry.errorMessage }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-else-if="loadError" class="text-center text-muted py-5">Fehler beim Laden der Einträge: {{ loadError }}</div>
    <div v-else class="text-center text-muted py-5">Aktuell stehen keine Bearbeitungen zur Prüfung aus.</div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { dataApi } from '@/api/dataApi'
import { localization } from '@/locales/localization'
import { handleImageError, formatDateTime } from '@/utils/helpers'
import { RouterLink } from 'vue-router'
import ButtonElement from '@/components/ButtonElement.vue'

const loadError = ref(null)
const pendingUpdates = ref([])

// Metadaten-Felder des Update-Objekts, die nicht als Änderung angezeigt werden
const META_FIELDS = ['id', 'entry_id', 'created_at', 'created_by']

const FIELD_LABELS = {
  manufacturer: 'Hersteller',
  model: 'Modell',
  description: 'Beschreibung',
  categories: 'Kategorie',
  tags: 'Schlagwörter',
  model_year: 'Modelljahr',
  model_version: 'Modellversion',
  companion_app_links: 'Companion-App-Links',
}

const formatValue = (value) => {
  if (value === null || value === undefined || value === '') return '(leer)'
  if (Array.isArray(value)) return value.length > 0 ? value.join(', ') : '(leer)'
  if (typeof value === 'object') {
    return Object.entries(value)
      .map(([k, v]) => `${k}: ${v || '(leer)'}`)
      .join(', ')
  }
  return String(value)
}

// baut die Zeilen für die Diff-Tabelle.
const getFieldDiffs = (entry) => {
  const { update, device } = entry
  const diffs = []
  const changes = update.diff || {}

  for (const key of Object.keys(changes)) {
    const newVal = changes[key]
    const label = FIELD_LABELS[key] || key
    const oldValue = device ? device[key] : undefined

    if (newVal && typeof newVal === 'object' && !Array.isArray(newVal)) {
      const changedEntries = Object.entries(newVal).filter(([, v]) => v !== null && v !== undefined)
      if (changedEntries.length === 0) continue // nichts davon wirklich geändert

      diffs.push({
        label,
        oldValue: formatValue(oldValue),
        newValue: changedEntries.map(([k, v]) => `${k}: ${v}`).join(', '),
      })
      continue
    }

    if (newVal === null || newVal === undefined) continue

    diffs.push({
      label,
      oldValue: formatValue(oldValue),
      newValue: formatValue(newVal),
    })
  }

  return diffs
}

const approveUpdate = async (entry) => {
  entry.applying = true
  entry.errorMessage = null

  try {
    await dataApi.patch('/management/apply_update', null, { params: { update_id: entry.update._id } })
    pendingUpdates.value = pendingUpdates.value.filter(e => e.update._id !== entry.update._id)
  } catch (err) {
    console.error(err)
    const error_code = err?.response?.data?.code
    entry.errorMessage = 'Fehler: ' + (error_code ? localization.t(error_code) : 'Unbekannter Fehler')
  } finally {
    entry.applying = false
  }
}

const getThumbnailUrl = (imageId) => {
  if (!imageId) return null
  const url = dataApi.baseURL + 'uploads/images/' + imageId
  const i = url.lastIndexOf('.')
  return i === -1 ? url + '_thumb' : url.slice(0, i) + '_thumb' + url.slice(i)
}

onMounted(async () => {
  try {
    const res = await dataApi.get('/management/updates')

    pendingUpdates.value = res.data.map((item) => {
      const isArrayTuple = Array.isArray(item)
      const update = isArrayTuple ? item[0] : item.update
      const device = isArrayTuple ? item[1] : item.device
      return { update, device, applying: false, errorMessage: null }
    })
  } catch (err) {
    console.error(err)
    if (err.response?.status === 502) {
      loadError.value = 'Backend nicht erreichbar.'
    } else {
      loadError.value = localization.t(err.response?.data?.code) || 'Unbekannter Fehler'
    }
  }
})
</script>
