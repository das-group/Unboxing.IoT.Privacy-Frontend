<template>
  <nav class="navbar navbar-expand-xl bg-body-tertiary border-bottom">
    <div class="container-fluid d-flex justify-content-between align-items-center">
      <div class="d-flex flex-grow-1 justify-content-center justify-content-xl-start align-items-center">
        <UIOTPIcon class="navbar-brand me-2 nav-logo" @click="toStartPage" />
        <a class="navbar-brand" style="cursor: pointer" @click="toStartPage">Unboxing.IoT.Privacy <sub class="d-none d-sm-inline"> Plattform</sub></a>
      </div>
      <button
        class="navbar-toggler ms-auto mt-2"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#navbarSupportedContent"
        aria-controls="navbarSupportedContent"
        aria-expanded="false"
        aria-label="Navigation ausklappen"
      >
        <span class="navbar-toggler-icon"></span>
      </button>

      <div class="collapse navbar-collapse" id="navbarSupportedContent">
        <ul class="navbar-nav ms-auto mb-2 mb-lg-0">
          <li class="nav-item">
            <router-link to="/" class="nav-link" aria-current="page" active-class="active"><i class="bi bi-book-fill"></i>Übersicht</router-link>
          </li>

          <li class="nav-item" v-if="auth.isLoggedIn && auth.hasPermission('create_post')">
            <router-link to="/submit" class="nav-link" active-class="active" id="create_post_button"><i class="bi bi-plus-circle-fill"></i>Einen Beitrag veröffentlichen...</router-link>
          </li>
          <li class="nav-item" v-else-if="!auth.isLoggedIn">
            <router-link to="/login/Um einen Beitrag einzureichen, müssen Sie sich anmelden oder ein Konto erstellen." class="nav-link" active-class="active" id="create_post_button"
              ><i class="bi bi-plus-circle-fill"></i>Einen Beitrag veröffentlichen...</router-link
            >
          </li>

          <li class="nav-item">
            <router-link to="/tools" class="nav-link" aria-current="page" active-class="active" id="tools_button"><i class="bi bi-tools"></i>Richtlinien und Werkzeuge</router-link>
          </li>

          <li class="nav-item dropdown">
            <a class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">Über uns</a>
            <ul class="dropdown-menu mb-1" style="min-width: 200px">
              <li>
                <router-link to="/datenschutz" class="nav-link" active-class="active"><i class="bi bi-shield-shaded"></i>Datenschutz</router-link>
              </li>
              <li>
                <router-link to="/impressum" class="nav-link" active-class="active"><i class="bi bi-list-nested"></i>Impressum</router-link>
              </li>

              <li>
                <a href="https://iot-privacy.info/" target="_blank" class="nav-link"><i class="bi bi-link-45deg"></i>Projektwebseite</a>
              </li>
            </ul>
          </li>

          <li class="nav-item dropdown" v-if="auth.hasAnyPermission('manage')">
            <a class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
              <i class="bi bi-database-fill"></i>

              Verwaltung
              <span v-if="totalManagementUnread > 0" class="badge rounded-pill bg-danger ms-1 me-1">
                {{ totalManagementUnread > 99 ? '99+' : totalManagementUnread }}
              </span>
            </a>

            <ul class="dropdown-menu mb-1" style="min-width: 300px">
              <li v-if="auth.hasPermission('manage_users')">
                <router-link to="/manage/users" class="nav-link" active-class="active"><i class="bi bi-person-fill-gear"></i>Benutzer-Administration </router-link>
              </li>

              <li v-if="auth.hasPermission('manage_posts')">
                <router-link to="/manage/submissions" class="nav-link" active-class="active"
                  ><i class="bi bi-book-fill"></i>

                  Geräte-Post-Moderation

                  <span v-if="newDeviceSubmissions > 0 || newDeviceDeleteRequests > 0" class="badge rounded-pill bg-danger ms-1 me-1">
                    <!-- Format: delete / submissions -->
                    <template v-if="newDeviceDeleteRequests > 0 && newDeviceSubmissions > 0">
                      {{ newDeviceDeleteRequests > 99 ? '99+' : newDeviceDeleteRequests }} /
                      {{ newDeviceSubmissions > 99 ? '99+' : newDeviceSubmissions }}
                    </template>
                    <template v-else-if="newDeviceSubmissions > 0">
                      {{ newDeviceSubmissions > 99 ? '99+' : newDeviceSubmissions }}
                    </template>
                    <template v-else>
                      {{ newDeviceDeleteRequests > 99 ? '99+' : newDeviceDeleteRequests }}
                    </template>
                  </span>
                </router-link>
              </li>

              <li v-if="auth.hasPermission('manage_posts')">
                <router-link to="/manage/reports" class="nav-link" active-class="active"
                  ><i class="bi bi-flag-fill"></i>

                  Meldungen
                  <span v-if="newReports > 0" class="badge rounded-pill bg-danger ms-1 me-1">
                    {{ newReports > 99 ? '99+' : newReports }}
                  </span>
                </router-link>
              </li>

              <li v-if="auth.hasPermission('manage_posts')">
                <router-link to="/manage/updates" class="nav-link" active-class="active"
                  ><i class="bi bi-pencil-square"></i>

                  Ausstehende Bearbeitungen
                  <span v-if="newDeviceUpdates > 0" class="badge rounded-pill bg-danger ms-1 me-1">
                    {{ newDeviceUpdates > 99 ? '99+' : newDeviceUpdates }}
                  </span>
                </router-link>
              </li>
            </ul>
          </li>

          <li class="nav-item" v-if="!auth.isLoggedIn">
            <router-link to="/login" class="nav-link" active-class="active"><i class="bi bi-people-fill"></i>Anmelden</router-link>
          </li>
          <li class="nav-item dropdown" v-else>
            <a class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false"><i class="bi bi-people-fill"></i> {{ auth.user?.email }}</a>
            <ul class="dropdown-menu dropdown-menu-end" style="min-width: 230px">
              <li>
                <router-link to="/account" class="nav-link" active-class="active"><i class="bi bi-person-fill-gear"></i>Kontoeinstellungen</router-link>
              </li>
              <li>
                <router-link to="/submissions" class="nav-link" active-class="active"><i class="bi bi-book-fill"></i>Meine Beiträge</router-link>
              </li>
              <li>
                <button class="nav-link" @click="logOut"><i class="bi bi-door-open-fill"></i> Abmelden</button>
              </li>
            </ul>
          </li>

          <!--
          <form class="d-flex" role="search" @submit.prevent="handleSearch">
            <input class="form-control me-2" type="search" placeholder="Suche..." aria-label="Search" v-model="searchQuery" />
            <button class="btn btn-outline-success" type="submit"><i class="bi bi-search m-0"></i>
            </button>
          </form>
        --></ul>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { dataApi } from '@/api/dataApi'
import UIOTPIcon from './icons/IconUIOTP.vue'

import { useAuth } from '@/stores/auth'

const auth = useAuth()
const router = useRouter()

let refreshInterval = null
const newReports = ref(0)
const newDeviceSubmissions = ref(0)
const newDeviceDeleteRequests = ref(0)
const newDeviceUpdates = ref(0)

const totalManagementUnread = computed(() => {
  return newReports.value + newDeviceSubmissions.value + newDeviceDeleteRequests.value + newDeviceUpdates.value
})

const loadModeratorBadges = async () => {
  if (!auth.hasPermission('manage_posts')) {
    return false
  }

  try {
    const res = await dataApi.get('/management/counters')

    const counters = res.data

    newReports.value = counters.pending_rep
    newDeviceSubmissions.value = counters.hidden_entr
    newDeviceDeleteRequests.value = counters.delete_req
    newDeviceUpdates.value = counters.update_req
  } catch (ex) {
    console.error(ex)
  }

  return true
}

onMounted(async () => {
  if (loadModeratorBadges()) {
    refreshInterval = setInterval(loadModeratorBadges, 15_000)
  }
})

onUnmounted(() => {
  if (refreshInterval) {
    clearInterval(refreshInterval)
    refreshInterval = null
  }
})

const logOut = async () => {
  await auth.logout()
  router.go()
}

const toStartPage = () => {
  router.push({ name: 'home' })
}

/*
let searchQuery = ref('');
const handleSearch = () => {
  let result = "Suche nach " + searchQuery.value + "\n";

  alert(result);
}
*/
</script>

<style scoped>
.navbar-brand {
  font-weight: bold;
  font-variant: all-small-caps;
  font-size: x-large;
}

.nav-logo {
  width: 32px;
  cursor: pointer;
}

@media (max-width: 375px) {
  .nav-logo {
    width: 28px;
  }
}

.nav-link a {
  /*color: rgb(14, 39, 118);*/
}

a.active {
  /*color: rgb(14, 39, 118);*/
  text-decoration: underline;
}

.nav-link i {
  margin-right: 0.3rem;
}

i {
  margin-left: 0.5em;
}

/* Margin to the last nav element */
.navbar-nav li:last-child .nav-link {
  margin-right: 0.5em;
}

@media (max-width: 991.98px) {
  .navbar-nav > li > .nav-link {
    border: 1px solid #ccc;
    margin-bottom: 5px;
    padding: 8px 12px;
    border-radius: 4px;
  }

  /* Margin to the last nav element */
  .navbar-nav li:last-child .nav-link {
    margin-right: 0;
  }

  .navbar-toggler {
    margin-bottom: 0.5em;
  }
}
</style>
