<script setup>
import { RouterView } from 'vue-router'

// Bootstrap + Vue Dark mode
import { useDark, useToggle } from '@vueuse/core'
const isDark = useDark({
  attribute: 'data-bs-theme',
  valueDark: 'dark',
  valueLight: 'light',
  storageKey: 'theme',
  disableTransition: false,
})

const toggleDark = useToggle(isDark)
//import HelloWorld from './components/HelloWorld.vue'
import NavBar from './components/NavBar.vue'
import FooterBar from './components/FooterBar.vue'
</script>

<template>
  <div class="d-flex flex-column min-vh-100">
    <header>
      <NavBar />
    </header>

    <main>
      <RouterView />
    </main>

    <footer class="mt-auto">
      <FooterBar />
    </footer>

    <!-- Theme toggle -->
    <button class="darkmode-fab" @click="toggleDark()" :aria-label="isDark ? 'Welchsele zum hellen Modus' : 'Welchsele zum dunkelen Modus'">
      <span v-if="isDark"><i class="bi bi-moon-fill"></i></span>
      <span v-else><i class="bi bi-brightness-high-fill"></i></span>
    </button>
  </div>
</template>

<style scoped>
.darkmode-fab {
  position: fixed;
  bottom: 1.25rem;
  right: 1.25rem;
  z-index: 1055;

  width: 3rem;
  height: 3rem;
  border-radius: 50%;

  display: grid;
  place-items: center;

  border: none;
  cursor: pointer;

  background: var(--bs-body-bg);
  color: var(--bs-body-color);

  opacity: 1;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.25);
  transition:
    background-color 0.25s ease,
    color 0.25s ease,
    transform 0.15s ease,
    opacity 0.25s ease;
}

.darkmode-fab:hover {
  transform: translateY(-2px);
}

.darkmode-fab:active {
  transform: translateY(0);
}
@media (max-width: 576px) {
  .darkmode-fab {
    bottom: 0.75rem;
    right: 0.75rem;
  }
}

@media (min-width: 576px) {
  /* Hide fab when inactive */
  body:hover .darkmode-fab {
    opacity: 1;
  }

  body:not(:hover) .darkmode-fab {
    opacity: 0;
  }
}
</style>
