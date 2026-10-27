<template>
  <div class="container py-4">
    <h1 class="mb-4 text-center"><i class="bi bi-tools me-1"></i>Richtlinien, Anleitungen und Werkzeuge</h1>

    <div class="card shadow-sm">
      <div class="card-body">
        <h4 class="mb-2">Richtlinien und Anleitungen</h4>

        <div class="d-flex flex-column mb-3">
          <router-link to="/articles/network"> <i class="bi bi-file-earmark-text"></i> Richtlinie / Anleitung für die Netzwerkuntersuchung von IoT-Geräten </router-link>

          <router-link to="/articles/photo"> <i class="bi bi-file-earmark-text"></i> Richtlinie für die fotografische Dokumentation von IoT-Geräten </router-link>

          <router-link to="/articles/firmware"> <i class="bi bi-file-earmark-text"></i> Richtlinie für die Extraktion der Firmware bei IoT-Geräten </router-link>
        </div>

        <h4 class="mb-2">Werkzeuge</h4>
        <div class="d-flex mb-1 gap-2">
          <a href="https://platform.iot-privacy.info/static/UIoTP_Netzwerkuntersuchung_Werkzeuge.zip">
            <i class="bi bi-file-earmark-zip-fill"></i> Skripte für die Netzwerkuntersuchung von IoT-Geräten (Linux)

            <a href="https://platform.iot-privacy.info/static/UIoTP_Netzwerkuntersuchung_Werkzeuge.zip" class="btn btn-primary px-2 py-0 fw-semibold rounded-pill">Herunterladen</a>
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
</script>
