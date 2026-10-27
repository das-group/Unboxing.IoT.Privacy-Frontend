<template>
  <section class="content">
    <router-view />
  </section>
</template>

<script setup>
import { ref } from 'vue'
</script>

<style scoped>
.articles-page {
  display: flex;
  gap: 2rem;
}

.content {
  flex: 1;
}
</style>
