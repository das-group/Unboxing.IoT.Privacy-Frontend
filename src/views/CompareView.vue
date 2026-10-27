<template>
  <div class="d-flex flex-column h-100">
    <div class="compare-layout">
      <div class="pane left-pane">
        <div class="p-3 bg-body-tertiary border-bottom sticky-top z-3 align-banner">
          <div class="d-flex justify-content-between align-items-center w-100 banner-inner">
            <h5 class="mb-0">{{ device1Name || 'Lade Gerät 1...' }}</h5>
            <button class="btn btn-outline-danger btn-sm" @click="startSelectingDevice1" v-if="!isSelectingDevice1"><i class="bi bi-arrow-left-right"></i> Ändern</button>
            <button class="btn btn-outline-secondary btn-sm" @click="isSelectingDevice1 = false" v-else>Abbrechen</button>
          </div>
        </div>

        <div class="hide-compare-btn pane-side" v-if="!isSelectingDevice1" ref="leftPane" @scroll="onScrollLeft">
          <DeviceView :id="id1" :key="id1" :activeTab="sharedTab" @tab-changed="handleSharedTabChange" @loaded="(name) => (device1Name = name)" />
        </div>

        <div v-else class="p-4 pane-side">
          <h4 class="mb-4">Neues Gerät für Seite 1 wählen</h4>
          <form class="d-flex mb-4" @submit.prevent="searchPosts">
            <input class="form-control me-2" type="search" placeholder="Gerät suchen..." v-model="searchQuery" />
          </form>

          <div class="row g-3" v-if="postEntries.length > 0">
            <div class="col-12" v-for="post in postEntries" :key="post.id">
              <div @click="selectFirstDevice(post.id)" class="cursor-pointer">
                <DevicePostEntry :manufacturer="post.manufacturer" :model="post.model" :description="post.description" :title_image="post.title_image" :link="''" />
              </div>
            </div>
          </div>
          <div class="text-muted text-center py-5" v-else>Keine Geräte gefunden.</div>
        </div>
      </div>

      <div class="pane right-pane border-start">
        <template v-if="id2 && !isSelectingDevice2">
          <div class="p-3 bg-body-tertiary border-bottom sticky-top z-3 align-banner">
            <div class="d-flex justify-content-between align-items-center w-100 banner-inner">
              <h5 class="mb-0">{{ device2Name || 'Lade Gerät 2...' }}</h5>
              <button class="btn btn-outline-danger btn-sm" @click="startSelectingDevice2"><i class="bi bi-arrow-left-right"></i> Ändern</button>
            </div>
          </div>
          <div class="hide-compare-btn pane-side" ref="rightPane" @scroll="onScrollRight">
            <DeviceView :id="id2" :key="id2" :activeTab="sharedTab" @tab-changed="handleSharedTabChange" @loaded="(name) => (device2Name = name)" />
          </div>
        </template>

        <div v-else class="p-4 pane-side">
          <div class="d-flex justify-content-between align-items-center mb-4">
            <h4 class="mb-0">Gerät zum Vergleichen wählen</h4>
            <button class="btn btn-outline-secondary btn-sm" @click="isSelectingDevice2 = false" v-if="id2">Abbrechen</button>
          </div>
          <form class="d-flex mb-4" @submit.prevent="searchPosts">
            <input class="form-control me-2" type="search" placeholder="Gerät suchen..." v-model="searchQuery" />
          </form>

          <div class="row g-3" v-if="postEntries.length > 0">
            <div class="col-12" v-for="post in postEntries" :key="post.id">
              <div @click="selectSecondDevice(post.id)" class="cursor-pointer">
                <DevicePostEntry :manufacturer="post.manufacturer" :model="post.model" :description="post.description" :title_image="post.title_image" :link="''" />
              </div>
            </div>
          </div>
          <div class="text-muted text-center py-5" v-else>Keine Geräte gefunden.</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { dataApi } from '@/api/dataApi'
import DeviceView from './DeviceView.vue'
import DevicePostEntry from '@/components/DevicePostEntry.vue'

const props = defineProps({
  id1: { type: String, required: true },
  id2: { type: String, default: null },
})

const router = useRouter()

const leftPane = ref(null)
const rightPane = ref(null)
let activePane = null

const device1Name = ref('')
const device2Name = ref('')
const isSelectingDevice1 = ref(false)
const isSelectingDevice2 = ref(!props.id2)

// Ermittelt für eine Pane den "Fixpunkt": wo der Inhalt des gerade aktiven
// Tabs beginnt (start) und wie hoch er ist (height). Alles VOR diesem Punkt
// (Banner + Tab-Navigation) ist bei beiden Geräten praktisch gleich hoch und
// wird 1:1 synchronisiert. Der Bereich AB diesem Punkt kann je nach Gerät
// unterschiedlich lang sein (z.B. die Datenschutzerklärung) und wird relativ
// zur jeweils eigenen Höhe synchronisiert.
const getFixPoint = (paneEl) => {
  if (!paneEl) return null
  const activeEl = paneEl.querySelector('.tab-pane.show.active')
  if (!activeEl) return null
  const paneRect = paneEl.getBoundingClientRect()
  const elRect = activeEl.getBoundingClientRect()
  const start = paneEl.scrollTop + (elRect.top - paneRect.top)
  const height = activeEl.offsetHeight || 0
  return { start, height }
}

const getSyncPoints = (paneEl, paneName = 'left') => {
  if (!paneEl) return []

  const activeEl = paneEl.querySelector('.tab-pane.show.active')

  if (!activeEl) return []

  /*
  const bannerOffset = paneName === 'left' ? bannerOffsets.value.left : bannerOffsets.value.right
  if (bannerOffset === 0) {
    // Fallback if banner missing — assume 0 (e.g., mobile / no banner)
    return []
  }
  */

  const elements = activeEl.querySelectorAll('[data-sync]')
  if (!elements.length) return []

  const paneRect = paneEl.getBoundingClientRect()
  return Array.from(elements).map((el) => {
    const rect = el.getBoundingClientRect()
    const topInScroll = paneEl.scrollTop + (rect.top - paneRect.top) - 90
    return {
      id: el.dataset.sync,
      top: Math.max(0, topInScroll), // safety clamp
      offsetTop: rect.top - paneRect.top, // for scroll positioning
    }
  })
}

let isSyncScrolling = false

const scrollPaneTo = (paneEl, top) => {
  // behavior: 'instant' explizit setzen, damit das CSS "scroll-behavior: smooth"
  // auf .pane diese programmatischen Sync-Sprünge NICHT animiert. Eine Animation
  // würde während ihres Ablaufs weitere scroll-Events auslösen, die dann wieder
  // in die Sync-Logik laufen und sich gegenseitig stören ("Fixpunkte" wackeln).

  paneEl.scrollTo({ top, behavior: 'instant' })
  /*
    isSyncScrolling = true

    paneEl.scrollTo({ top, behavior: 'smooth' })

    setTimeout(() => {
      isSyncScrolling = false
    }, 250)
  */
}

// Add to scroll handler after sync:
const highlightSyncPoint = (pane, syncId) => {
  if (!pane || !syncId) return
  pane.querySelectorAll('[data-sync]').forEach((el) => el.classList.remove('sync-highlight'))
  const target = pane.querySelector(`[data-sync="${syncId}"]`)
  if (target) target.classList.add('sync-highlight')
}

const bannerOffsets = ref({ left: 0, right: 0 })

const measureBannerOffset = (paneEl) => {
  if (!paneEl) return 0
  const banner = paneEl.querySelector('.align-banner')
  if (!banner) return 0
  return banner.offsetHeight || 0
}

const syncScroll = (sourcePane, targetPane) => {
  if (!sourcePane || !targetPane) return

  const srcPoints = getSyncPoints(sourcePane, sourcePane === leftPane.value ? 'left' : 'right')
  const tgtPoints = getSyncPoints(targetPane, targetPane === leftPane.value ? 'left' : 'right')

  // Fall back to old behavior if no sync points exist
  if (!srcPoints.length || !tgtPoints.length) {
    scrollPaneTo(targetPane, sourcePane.scrollTop)
    return
  }

  const sourceScrollTop = sourcePane.scrollTop

  const sourceIndex = srcPoints.findIndex((p) => p.top > sourceScrollTop)
  const activeSourcePoint = srcPoints[Math.max(0, sourceIndex - 1)]

  if (!activeSourcePoint) {
    scrollPaneTo(targetPane, tgtPoints[0]?.top ?? 0)
    return
  }

  const targetSyncPoint = tgtPoints.find((p) => p.id === activeSourcePoint.id)

  highlightSyncPoint(sourcePane, activeSourcePoint.id)
  highlightSyncPoint(targetPane, activeSourcePoint.id)

  /*
  // Mark equal attributes
  const srcEntries = Array.from(sourcePane.querySelectorAll('[data-sync] ul li ul li'));
  const targetEntries = Array.from(targetPane.querySelectorAll('[data-sync] ul li ul li'));


const targetTexts = new Set(
  targetEntries.map(li => li.textContent.trim())
);
const srcTexts = new Set(
  srcEntries.map(li => li.textContent.trim())
);
srcEntries.forEach(srcLi => {
  const srcText = srcLi.textContent.trim();
  const hasMatch = targetTexts.has(srcText);
  if (hasMatch) {
  } else {
    srcLi.classList.add('sync-compare-difference');
  }
});

targetEntries.forEach(targetE => {
  const targetT = targetE.textContent.trim();
  const hasMatch = srcTexts.has(targetT);
  if (hasMatch) {
  } else {
    targetE.classList.add('sync-compare-difference');
  }
});

*/

  function sortListAlphabetically(listElement) {
    const items = Array.from(listElement.querySelectorAll('li'))

    items.sort((a, b) =>
      a.textContent.trim().localeCompare(b.textContent.trim(), 'de', {
        sensitivity: 'accent',
        numeric: true,
      }),
    )

    items.forEach((item) => listElement.appendChild(item))
  }
  sortListAlphabetically(sourcePane.querySelector('[data-sync] ul li ul'))
  sortListAlphabetically(targetPane.querySelector('[data-sync] ul li ul'))

  /*

  targetEntries.forEach(targetLi => {
    const targetText = targetLi.textContent.trim();
    const hasMatch = targetTexts.has(targetText); // always true here
    if (hasMatch) {
      targetLi.classList.add('sync-compare-equal');
    } else {
      targetLi.classList.remove('sync-compare-equal');
    }
  });
  */

  //console.log('SCROLL2')

  if (targetSyncPoint) {
    scrollPaneTo(targetPane, targetSyncPoint.top)
  } else {
    scrollPaneTo(targetPane, sourcePane.scrollTop)
  }
}

/*
const syncScroll = (sourcePane, targetPane) => {
  if (!sourcePane || !targetPane) return

  const src = getFixPoint(sourcePane)
  const tgt = getFixPoint(targetPane)

  // Fallback, falls die Fixpunkte gerade nicht ermittelt werden können
  // (z.B. während des ersten Renders): einfach 1:1 synchronisieren.
  if (!src || !tgt) {
    scrollPaneTo(targetPane, sourcePane.scrollTop)
    return
  }

  const scrollTop = sourcePane.scrollTop

  if (scrollTop <= src.start) {
    // Noch im Banner-/Navigationsbereich vor dem Tab-Inhalt - 1:1 synchron.
    scrollPaneTo(targetPane, Math.min(scrollTop, tgt.start))
    return
  }

  // Innerhalb des aktiven Tab-Inhalts - relativ zur jeweils eigenen Höhe
  // skalieren, damit Anfang und Ende des Tabs bei beiden Geräten die
  // gleichen Fixpunkte bleiben, auch wenn der Inhalt unterschiedlich lang ist.
  const ratio = src.height > 0 ? (scrollTop - src.start) / src.height : 0
  const clampedRatio = Math.min(Math.max(ratio, 0), 1)
  scrollPaneTo(targetPane, tgt.start + clampedRatio * tgt.height)
}
*/

const onScrollLeft = (e) => {
  return

  if (!props.id2 || !rightPane.value) return
  if (activePane === 'right') return
  if (isSyncScrolling) return
  activePane = 'left'
  syncScroll(e.target, rightPane.value)
  setTimeout(() => {
    if (activePane === 'left') activePane = null
  }, 50)
}

const onScrollRight = (e) => {
  return

  if (!leftPane.value) return
  if (activePane === 'left') return
  if (isSyncScrolling) return
  activePane = 'right'
  syncScroll(e.target, leftPane.value)
  setTimeout(() => {
    if (activePane === 'right') activePane = null
  }, 50)
}

const searchQuery = ref('')
const postEntries = ref([])
let debounceTimer = null

const extendImagePath = (url, thumbnail = false) => {
  if (!url) return url
  let imageUrl = dataApi.baseURL + 'uploads/images/' + url
  if (thumbnail) {
    const u = new URL(imageUrl)
    const parts = u.pathname.split('/')
    const file = parts.pop()
    const i = file.lastIndexOf('.')
    parts.push(i === -1 ? file + '_thumb' : file.slice(0, i) + '_thumb' + file.slice(i))
    u.pathname = parts.join('/')
    return u.toString()
  }
  return imageUrl
}

const loadEntries = async (params = null) => {
  try {
    const res = await dataApi.get('/entry/list', { params })
    postEntries.value = res.data.map((entry) => ({
      ...entry,
      title_image: extendImagePath(entry.title_image, true),
    }))
  } catch (err) {
    console.error(err)
  }
}

const searchPosts = () => {
  loadEntries({ query: searchQuery.value.toLowerCase().trim() })
}

watch(searchQuery, (newValue) => {
  clearTimeout(debounceTimer)
  if (newValue.length === 0) {
    searchPosts()
    return
  }
  debounceTimer = setTimeout(() => {
    searchPosts()
  }, 200)
})

const startSelectingDevice1 = () => {
  isSelectingDevice1.value = true
  isSelectingDevice2.value = false
  searchQuery.value = ''
  loadEntries()
}

const startSelectingDevice2 = () => {
  isSelectingDevice2.value = true
  isSelectingDevice1.value = false
  searchQuery.value = ''
  loadEntries()
}

const selectFirstDevice = (firstId) => {
  isSelectingDevice1.value = false
  device1Name.value = ''
  router.push({ name: 'CompareView', params: { id1: firstId, id2: props.id2 } })
}

const selectSecondDevice = (secondId) => {
  isSelectingDevice2.value = false
  device2Name.value = ''
  router.push({ name: 'CompareView', params: { id1: props.id1, id2: secondId } })
}

onMounted(() => {
  if (!props.id2) loadEntries()

  //
  //bannerOffsets.value.left = measureBannerOffset(leftPane.value)
  //bannerOffsets.value.right = measureBannerOffset(rightPane.value)
})

const sharedTab = ref('general')
const handleSharedTabChange = (newTabId) => {
  sharedTab.value = newTabId
}

watch(sharedTab, async () => {
  await nextTick()
  // Re-measure in case banner layout changes (e.g., device1 has "Ändern", device2 has just title)
  //if (leftPane.value) bannerOffsets.value.left = measureBannerOffset(leftPane.value)
  //if (rightPane.value) bannerOffsets.value.right = measureBannerOffset(rightPane.value)
})

// Beim (synchronen) Tab-Wechsel beide Panes an den Anfang des jeweils neuen
// Tab-Inhalts scrollen, statt die alte (evtl. jetzt unpassende) Scroll-Position
// beizubehalten.
watch(sharedTab, async () => {
  await nextTick()
  const l = getFixPoint(leftPane.value)
  const r = getFixPoint(rightPane.value)
  if (leftPane.value && l) scrollPaneTo(leftPane.value, l.start)
  if (rightPane.value && r) scrollPaneTo(rightPane.value, r.start)
})
</script>

<style scoped>
.compare-layout {
  display: flex;
  /*height: calc(100vh - 160px);
  overflow: hidden;
  */
}

.pane {
  flex: 1;
  /*
  overflow-y: auto;
  scroll-behavior: smooth;
  */
}

.pane-side {
  overflow-y: auto;
  scroll-behavior: smooth;
  max-height: calc(100dvh - 160px);
}

.align-banner {
  height: 70px !important;
  min-height: 70px !important;
  display: flex !important;
  align-items: center !important;
  box-sizing: border-box !important;
}

.banner-inner {
  height: 100%;
}

.cursor-pointer {
  cursor: pointer;
}

.hide-compare-btn :deep(.btn-outline-primary),
.hide-compare-btn :deep(.btn-primary) {
  display: none !important;
}

@media (max-width: 768px) {
  .compare-layout {
    flex-direction: column;
    height: auto;
    overflow: visible;
  }
  .pane {
    overflow-y: visible;
  }
  .align-banner {
    height: auto !important;
    min-height: auto !important;
  }
}
</style>
<style>
.sync-highlight {
  border-radius: 0.25em;
  padding: 0.25em 0;
  outline: 2px solid #0d6efd;
}
</style>
