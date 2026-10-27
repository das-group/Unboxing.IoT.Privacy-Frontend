<template>
  <div class="gallery-wrapper">
    <button v-if="showPrev" class="carousel-nav prev" @click="scrollPrev">
      <i class="bi bi-caret-left-fill"></i>
    </button>

    <div class="gallery-scroll" ref="galleryRef">
      <div v-for="(img, index) in images" :key="index" class="gallery-card d-flex justify-content-center align-items-center" @click="openModal(img, index)">
        <div class=" ">
          <img :src="img.thumb" class="gallery-image" @error="handleImageError" />
        </div>
      </div>
    </div>

    <button v-if="showNext" class="carousel-nav next" @click="scrollNext">
      <i class="bi bi-caret-right-fill"></i>
    </button>

    <!-- Viewer -->
    <div class="modal fade full-image-modal" id="imageModal" tabindex="-1" aria-hidden="true" ref="modalRef">
      <div class="modal-dialog modal-dialog-centered modal-xl">
        <div class="modal-content bg-transparent modal-anim" v-if="selectedImage">
          <div class="modal-header border-0">
            <div class="card-body p-0 d-flex gap-1 flex-wrap align-items-center">
              <div class="card-text" style="color: white" v-if="selectedImage.title">{{ selectedImage.title }}</div>
              <div style="color: white">&bull;</div>
              <div class="card-text" style="color: white" v-if="selectedImage.uploaded_at">Datum: {{ formatDate(selectedImage.uploaded_at) }}</div>
            </div>

            <!-- Control buttons -->
            <div class="modal-zoom-controls d-flex align-items-center gap-1">
              <button type="button" class="btn btn-sm rounded-circle d-flex align-items-center justify-content-center" :disabled="zoom <= 1" @click="zoomStep(-0.5)" title="Herauszoomen">
                <i class="bi bi-zoom-out"></i>
              </button>

              <button type="button" class="btn btn-sm zoom-level p-0" @click="resetZoom" title="Zoom zurücksetzen">{{ Math.round(zoom * 100) }} %</button>

              <button type="button" class="btn btn-sm rounded-circle d-flex align-items-center justify-content-center" :disabled="zoom >= MAX_ZOOM" @click="zoomStep(0.5)" title="Hineinzoomen">
                <i class="bi bi-zoom-in"></i>
              </button>

              <!-- Rotate button -->
              <button type="button" class="btn btn-sm rounded-circle d-flex align-items-center justify-content-center" @click="rotateImage" title="Bild um 90° rotieren">
                <i class="bi bi-arrow-clockwise"></i>
              </button>

              <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Bildansicht schließen"></button>
            </div>
          </div>

          <div
            ref="viewerRef"
            class="modal-body p-0 viewer-body"
            :class="{ 'cursor-grab': zoom > 1, dragging: isDragging }"
            @mousedown="onMouseDown"
            @touchstart="onTouchStart"
            @touchmove="onTouchMove"
            @touchend="onTouchEnd"
            @touchcancel="onTouchEnd"
          >
            <img
              ref="viewerImgRef"
              :key="selectedImage.url"
              :src="selectedImage.url"
              class="modal-zoom-image"
              :style="imageStyle"
              draggable="false"
              @load="refreshLayout"
              @dblclick="toggleZoom"
              @error="handleImageError"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { onBeforeRouteLeave } from 'vue-router'
import { handleImageError, formatDate } from '@/utils/helpers'
import { Modal } from 'bootstrap'

const props = defineProps({
  images: { type: Array, default: () => [] },
})

const selectedImage = ref(null)
const selectedIndex = ref(-1)
const modalRef = ref(null)
const galleryRef = ref(null)
const viewerRef = ref(null)
const viewerImgRef = ref(null)

const showPrev = ref(false)
const showNext = ref(true)

let modalInstance = null

const MAX_ZOOM = 8
const MIN_ZOOM = 1

const zoom = ref(1)
const rotation = ref(0)
const pan = ref({ x: 0, y: 0 })
const isDragging = ref(false)
let dragStart = null

const isRotated = computed(() => Math.abs(rotation.value % 180) === 90)

function isModalOpen() {
  return modalRef.value?.classList.contains('show')
}

// Original
const natural = ref({ w: 0, h: 0 })
// Viewer
const box = ref({ w: 0, h: 0 })

function measure() {
  const b = viewerRef.value
  const img = viewerImgRef.value
  if (!b) return
  box.value = { w: b.clientWidth, h: b.clientHeight }
  if (img?.naturalWidth) {
    natural.value = { w: img.naturalWidth, h: img.naturalHeight }
  }
}

const baseSize = computed(() => {
  const { w: nw, h: nh } = natural.value
  const { w: bw, h: bh } = box.value
  if (!nw || !nh || !bw || !bh) return { w: 0, h: 0 }

  const rw = isRotated.value ? nh : nw
  const rh = isRotated.value ? nw : nh
  const fit = Math.min(bw / rw, bh / rh)

  return { w: nw * fit, h: nh * fit }
})

const maxZoom = computed(() => {
  const { w } = baseSize.value
  if (!w || !natural.value.w) return MAX_ZOOM
  const dpr = window.devicePixelRatio || 1
  return Math.max(MAX_ZOOM, (natural.value.w / (w * dpr)) * 1.5)
})

const imageStyle = computed(() => ({
  width: `${baseSize.value.w * zoom.value}px`,
  height: `${baseSize.value.h * zoom.value}px`,
  transform: `translate(-50%, -50%) translate(${pan.value.x}px, ${pan.value.y}px) rotate(${rotation.value}deg)`,
  visibility: baseSize.value.w ? 'visible' : 'hidden',
}))

function clampPan() {
  const { w, h } = baseSize.value
  const scaledW = (isRotated.value ? h : w) * zoom.value
  const scaledH = (isRotated.value ? w : h) * zoom.value

  const maxX = Math.max(0, (scaledW - box.value.w) / 2)
  const maxY = Math.max(0, (scaledH - box.value.h) / 2)

  pan.value = {
    x: Math.min(maxX, Math.max(-maxX, pan.value.x)),
    y: Math.min(maxY, Math.max(-maxY, pan.value.y)),
  }
}

function refreshLayout() {
  measure()
  clampPan()
}

function zoomTo(value, clientX, clientY) {
  const prev = zoom.value
  const next = Math.min(maxZoom.value, Math.max(MIN_ZOOM, value))
  if (next === prev) return

  if (next === MIN_ZOOM) {
    zoom.value = next
    pan.value = { x: 0, y: 0 }
    return
  }

  const ratio = next / prev
  const b = viewerRef.value

  if (b && clientX != null && clientY != null) {
    const rect = b.getBoundingClientRect()
    const px = clientX - (rect.left + rect.width / 2)
    const py = clientY - (rect.top + rect.height / 2)
    pan.value = {
      x: px - (px - pan.value.x) * ratio,
      y: py - (py - pan.value.y) * ratio,
    }
  } else {
    pan.value = { x: pan.value.x * ratio, y: pan.value.y * ratio }
  }

  zoom.value = next
  clampPan()
}

function zoomStep(delta, clientX, clientY) {
  zoomTo(zoom.value + delta, clientX, clientY)
}

function toggleZoom(e) {
  if (zoom.value > 1) resetZoom()
  else zoomTo(Math.min(2.5, maxZoom.value), e?.clientX, e?.clientY)
}

function resetZoom() {
  zoom.value = 1
  pan.value = { x: 0, y: 0 }
}

function resetView() {
  resetZoom()
  rotation.value = 0
}

function rotateImage() {
  rotation.value += 90
  resetZoom()
  nextTick(refreshLayout)
}

function handleWheel(e) {
  if (!isModalOpen()) return
  e.preventDefault()
  zoomTo(zoom.value * (e.deltaY < 0 ? 1.2 : 1 / 1.2), e.clientX, e.clientY)
}

function startDrag(clientX, clientY) {
  if (zoom.value <= 1) return
  isDragging.value = true
  dragStart = { x: clientX, y: clientY, panX: pan.value.x, panY: pan.value.y }
}

function moveDrag(clientX, clientY) {
  if (!isDragging.value || !dragStart) return
  pan.value = {
    x: dragStart.panX + (clientX - dragStart.x),
    y: dragStart.panY + (clientY - dragStart.y),
  }
  clampPan()
}

function endDrag() {
  isDragging.value = false
  dragStart = null
}
function onMouseDown(e) {
  if (e.button !== 0 || zoom.value <= 1) return
  e.preventDefault()
  startDrag(e.clientX, e.clientY)
}

function onMouseMove(e) {
  moveDrag(e.clientX, e.clientY)
}

let pinch = null
let lastTap = 0

function touchDistance(t1, t2) {
  return Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY)
}

function touchMid(t1, t2) {
  return { x: (t1.clientX + t2.clientX) / 2, y: (t1.clientY + t2.clientY) / 2 }
}

function onTouchStart(e) {
  if (e.touches.length === 2) {
    e.preventDefault()
    endDrag()
    const [t1, t2] = e.touches
    const mid = touchMid(t1, t2)
    pinch = { dist: touchDistance(t1, t2), midX: mid.x, midY: mid.y }
    isDragging.value = true
    return
  }

  if (e.touches.length === 1) {
    const t = e.touches[0]
    const now = Date.now()
    if (now - lastTap < 300) {
      e.preventDefault()
      toggleZoom({ clientX: t.clientX, clientY: t.clientY })
      lastTap = 0
      return
    }
    lastTap = now

    startDrag(t.clientX, t.clientY)
  }
}

function onTouchMove(e) {
  if (pinch && e.touches.length === 2) {
    e.preventDefault()
    const [t1, t2] = e.touches
    const dist = touchDistance(t1, t2)
    const mid = touchMid(t1, t2)

    if (pinch.dist > 0) {
      zoomTo(zoom.value * (dist / pinch.dist), mid.x, mid.y)
    }

    if (zoom.value > 1) {
      pan.value = {
        x: pan.value.x + (mid.x - pinch.midX),
        y: pan.value.y + (mid.y - pinch.midY),
      }
      clampPan()
    }

    pinch = { dist, midX: mid.x, midY: mid.y }
    return
  }

  if (isDragging.value && dragStart && e.touches.length === 1) {
    e.preventDefault()
    const t = e.touches[0]
    moveDrag(t.clientX, t.clientY)
  }
}

function onTouchEnd(e) {
  if (pinch && e.touches.length < 2) {
    pinch = null
    isDragging.value = false

    if (e.touches.length === 1 && zoom.value > 1) {
      const t = e.touches[0]
      startDrag(t.clientX, t.clientY)
    }
    return
  }

  if (e.touches.length === 0) endDrag()
}

function showImage(index) {
  selectedIndex.value = index
  selectedImage.value = props.images[index]
  natural.value = { w: 0, h: 0 }
  resetView()
}

function openModal(img, index) {
  showImage(index)
  modalInstance?.show()
}

function onShown() {
  refreshLayout()
}

function onHidden() {
  endDrag()
  pinch = null
  resetView()
}

function handleModalKeyDown(event) {
  if (!isModalOpen()) return

  const total = props.images.length

  switch (event.key) {
    case 'ArrowLeft':
    case 'ArrowRight': {
      if (selectedIndex.value < 0 || total === 0) return
      event.preventDefault()

      const dir = event.key === 'ArrowLeft' ? -1 : 1
      const newIndex = (selectedIndex.value + dir + total) % total
      showImage(newIndex)

      nextTick(() => {
        const card = galleryRef.value?.children[newIndex]
        card?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
      })
      break
    }
    case '+':
    case '=':
      event.preventDefault()
      zoomTo(zoom.value * 1.5)
      break
    case '-':
      event.preventDefault()
      zoomTo(zoom.value / 1.5)
      break
    case '0':
      event.preventDefault()
      resetZoom()
      break
    case 'r':
    case 'R':
      event.preventDefault()
      rotateImage()
      break
  }
}

function onResize() {
  updateNavState()
  if (isModalOpen()) refreshLayout()
}

function scrollNext() {
  const el = galleryRef.value
  if (!el) return
  const target = Math.min(el.scrollLeft + el.clientWidth, el.scrollWidth - el.clientWidth)
  el.scrollTo({ left: target, behavior: 'smooth' })
}

function scrollPrev() {
  const el = galleryRef.value
  if (!el) return
  const target = Math.max(el.scrollLeft - el.clientWidth, 0)
  el.scrollTo({ left: target, behavior: 'smooth' })
}

function updateNavState() {
  const el = galleryRef.value
  if (!el) return
  const maxScroll = el.scrollWidth - el.clientWidth
  showPrev.value = el.scrollLeft > 5
  showNext.value = el.scrollLeft < maxScroll - 5
}

async function waitForImages(container) {
  const imgs = [...container.querySelectorAll('img')]
  await Promise.all(
    imgs.map((img) =>
      img.complete
        ? Promise.resolve()
        : new Promise((resolve) => {
            img.addEventListener('load', resolve, { once: true })
            img.addEventListener('error', resolve, { once: true })
          }),
    ),
  )
}

onMounted(async () => {
  modalInstance = new Modal(modalRef.value)

  modalRef.value.addEventListener('shown.bs.modal', onShown)
  modalRef.value.addEventListener('hidden.bs.modal', onHidden)
  modalRef.value.addEventListener('wheel', handleWheel, { passive: false })

  window.addEventListener('mousemove', onMouseMove)
  window.addEventListener('mouseup', endDrag)
  window.addEventListener('keydown', handleModalKeyDown)
  window.addEventListener('resize', onResize)
  window.addEventListener('orientationchange', onResize)

  galleryRef.value?.addEventListener('scroll', updateNavState, { passive: true })

  await nextTick()
  if (galleryRef.value) await waitForImages(galleryRef.value)
  updateNavState()

  setTimeout(() => {
    updateNavState()
  }, 1000)
})

onBeforeRouteLeave(() => {
  // Back button hides modal
  if (isModalOpen()) {
    modalInstance?.hide()
    return false
  }
})

onBeforeUnmount(() => {
  modalRef.value?.removeEventListener('shown.bs.modal', onShown)
  modalRef.value?.removeEventListener('hidden.bs.modal', onHidden)
  modalRef.value?.removeEventListener('wheel', handleWheel)

  window.removeEventListener('mousemove', onMouseMove)
  window.removeEventListener('mouseup', endDrag)
  window.removeEventListener('keydown', handleModalKeyDown)
  window.removeEventListener('resize', onResize)
  window.removeEventListener('orientationchange', onResize)

  galleryRef.value?.removeEventListener('scroll', updateNavState)

  modalInstance?.dispose()
  modalInstance = null

  // Cleanup bootstrap modal artifact
  document.querySelectorAll('.modal-backdrop').forEach((el) => el.remove())

  const body = document.body
  body.classList.remove('modal-open')
  body.style.removeProperty('overflow')
  body.style.removeProperty('padding-right')
  body.removeAttribute('data-bs-overflow')
  body.removeAttribute('data-bs-padding-right')
})
</script>

<style scoped>
.image-gallery {
  width: 100%;
}

.gallery-scroll {
  display: flex;
  gap: 1rem;
  overflow-x: auto;
  padding: 0.5rem 0 1rem;

  scrollbar-width: none;
  scroll-snap-type: x mandatory;
}

.gallery-scroll::-webkit-scrollbar {
  display: none;
}

.gallery-card {
  flex: 0 0 calc(33.333% - 0.75rem);

  display: flex;

  border-radius: 1rem;
  overflow: hidden;

  cursor: pointer;

  scroll-snap-align: center;

  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.gallery-card:hover {
  transform: translateY(-4px);
}

.gallery-image {
  width: 100%;
  max-height: 250px;
  object-fit: contain;
  border-radius: 1em;
}

@media (max-width: 992px) {
  .gallery-card {
    flex: 0 0 calc(50% - 0.5rem);
  }
}

@media (max-width: 576px) {
  .gallery-card {
    flex: 0 0 85%;
  }
}

.modal-content.glass-modal {
  background: rgba(255, 255, 255, 0.08);

  backdrop-filter: blur(22px);
  -webkit-backdrop-filter: blur(22px);

  border-radius: 1.25rem;

  box-shadow: 0 8px 40px rgba(0, 0, 0, 0.35);
}

/* Dark theme */
[data-bs-theme='dark'] .glass-modal {
  background: rgba(20, 20, 20, 0.45);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

/* Light theme */
[data-bs-theme='light'] .glass-modal {
  background: rgba(255, 255, 255, 0.55);
  color: var(--bs-body-color);
  border: 1px solid rgba(255, 255, 255, 0.35);
}

.modal-header {
  padding: 1rem 1.25rem;
}

.gallery-wrapper {
  position: relative;
}

.carousel-nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);

  width: 48px;
  height: 48px;
  border-radius: 50%;

  border: none;
  z-index: 10;

  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);

  transition: all 0.2s ease;

  display: flex;
  align-items: center;
  justify-content: center;

  font-size: 1.75rem;
}

.carousel-nav:hover {
  transform: translateY(-50%) scale(1.05);
}

.prev {
  left: 8px;
}

.next {
  right: 8px;
}

/* Dark theme */
[data-bs-theme='dark'] .carousel-nav {
  background: rgba(255, 255, 255, 0.08);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.15);
}

/* Light theme */
[data-bs-theme='light'] .carousel-nav {
  background: rgba(255, 255, 255, 0.65);
  color: var(--bs-body-color);
  border: 1px solid rgba(0, 0, 0, 0.08);
}

/* blur animation */
.modal-content {
  box-shadow: 0 0 0 1px #777;
  backdrop-filter: blur(0);
  -webkit-backdrop-filter: blur(0);
  transition:
    backdrop-filter 0.9s ease,
    -webkit-backdrop-filter 0.9s ease,
    filter 0.9s ease;
}

.modal.show .modal-content {
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

/* Viewer */
.full-image-modal .modal-content {
  display: flex;
  flex-direction: column;
}

/* Disable doubletap lockout */
.full-image-modal,
.full-image-modal * {
  touch-action: manipulation;
}
.full-image-modal .viewer-body,
.full-image-modal .viewer-body * {
  touch-action: none;
}

.viewer-body {
  position: relative;
  height: calc(100vh - 8rem);
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
  user-select: none;
}

.viewer-body.zoomed {
  touch-action: none;
}

.viewer-body.cursor-grab {
  cursor: grab;
}

.viewer-body.dragging {
  cursor: grabbing;
}

.viewer-body.dragging .modal-zoom-image {
  transition: none;
}

@media (max-width: 575.98px) {
  .full-image-modal {
    --bs-modal-margin: 0;
  }

  .full-image-modal .modal-dialog {
    width: 100vw !important;
    max-width: 100vw !important;
    height: 100dvh;
    margin: 0;
  }

  .full-image-modal .modal-content {
    height: 100%;
    min-height: 0;
    border-radius: 0;
  }

  .full-image-modal .modal-header {
    padding: 0.5rem 0.75rem;
    flex-shrink: 0;
  }

  .full-image-modal .viewer-body {
    flex: 1 1 auto;
    height: auto;
    min-height: 0;
  }

  .full-image-modal .modal-header .btn {
    width: 40px !important;
    height: 40px !important;
  }
}

/* Zoom */
.modal-zoom-controls {
  margin-left: auto;
}

.modal-zoom-controls .btn {
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  width: 32px;
  height: 32px;
}

.modal-zoom-controls .btn:hover {
  background: rgba(255, 255, 255, 0.25);
}

.modal-zoom-controls .btn:disabled {
  opacity: 0.4;
}

.modal-zoom-controls .zoom-level {
  width: auto;
  min-width: 52px;
  font-variant-numeric: tabular-nums;
  font-size: 0.8rem;
}

.modal-zoom-image {
  transition: transform 0.15s ease-out;
  will-change: transform;
}

.full-image-modal .modal-content {
  display: flex;
  flex-direction: column;
}

.viewer-body {
  position: relative;
  height: calc(100vh - 8rem);
  overflow: hidden;
  touch-action: none;
  user-select: none;
}

.modal-zoom-image {
  position: absolute;
  top: 50%;
  left: 50%;
  max-width: none !important;
  max-height: none !important;
  transform-origin: center center;
  transition: none;
  border-radius: 0.375rem;
  -webkit-user-drag: none;
  pointer-events: auto;
}

.viewer-body.cursor-grab {
  cursor: grab;
}

.viewer-body.dragging {
  cursor: grabbing;
}

@media (max-width: 575.98px) {
  .full-image-modal {
    --bs-modal-margin: 0;
  }

  .full-image-modal .modal-dialog {
    width: 100vw !important;
    max-width: 100vw !important;
    height: 100dvh;
    margin: 0;
  }

  .full-image-modal .modal-content {
    height: 100%;
    min-height: 0;
    border-radius: 0;
  }

  .full-image-modal .modal-header {
    padding: 0.5rem 0.75rem;
    flex-shrink: 0;
  }

  .full-image-modal .viewer-body {
    flex: 1 1 auto;
    height: auto;
    min-height: 0;
  }

  .full-image-modal .modal-header .btn {
    width: 40px !important;
    height: 40px !important;
  }
}

/* Bootstrap fix, größeres modal */
@media (min-width: 992px) {
  .modal-xl {
    --bs-modal-width: 90vw;
  }
}
</style>
