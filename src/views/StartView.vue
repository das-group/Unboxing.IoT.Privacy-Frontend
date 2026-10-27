<template>
  <div class="container py-4">
    <div class="alert alert-info d-flex align-items-center mb-4" role="alert" v-if="showInfoBanner">
      <button type="button" class="btn-close btn-close-white position-absolute top-0 end-0 m-3" aria-label="Schließen" @click="onHideInfoBanner"></button>

      <i class="bi bi-info-circle me-3 fs-4 text-info"></i>
      <div>
        <strong class="d-block mb-1">Willkommen bei unserem IoT-Geräteverzeichnis</strong>
        Hier findest du eine Übersicht aktueller <strong>IoT-Geräte</strong>, mit Hintergrundinformationen zu deren <strong>Datenschutz- und Privatsphären-Eigenschaften</strong>.
        <br />

        <span class="d-none d-md-inline">Nutze die Suche, um nach Hersteller, Modell, Tags oder Beschreibung zu filtern.</span>
        <br />
        Du kannst auch deine IoT-Geräte untersuchen, und einen eigenen Beitrag einreichen!<br />

        Weitere Informationen findest du unter
        <u class="cursor-pointer">
          <span @click="clickTools"> <i class="bi bi-tools me-1"></i>Richtlinien und Werkzeuge</span> </u
        >. Zum Einreichen, klicke auf

        <u class="cursor-pointer">
          <span @click="clickNewIoT"> <i class="bi bi-plus-circle-fill me-1"></i>Neues IoT-Gerät...</span>
        </u>
      </div>
    </div>

    <h1 class="text-center mb-4">Neueste Beiträge</h1>

    <form class="d-flex mb-4" role="search" @submit.prevent="searchPosts">
      <input class="form-control me-2" type="search" placeholder="Suche..." aria-label="Search" v-model="searchQuery" />
      <button class="btn btn-outline-success" type="submit">
        <i class="bi bi-search m-0"></i>
      </button>
    </form>

    <div class="row g-4" :class="postEntries.length <= 2 ? 'justify-content-center' : ''" v-if="postEntries.length > 0">
      <div class="col-12 col-sm-6 col-lg-4" v-for="post in postEntries" :key="post.id">
        <DevicePostEntry
          :manufacturer="post.manufacturer"
          :model="post.model"
          :description="post.description"
          :created_by="post.created_by"
          :created_at="post.created_at"
          :tags="post.tags"
          :title_image="post.title_image"
          :link="post.link"
          @read-more="openPost(post)"
          @on-tag-click="handleTagClick"
        />
      </div>
    </div>
    <div v-else-if="loadError" class="text-center text-muted py-5">Fehler beim Laden der Einträge: {{ loadError }}</div>
    <div v-else-if="searchQuery" class="text-center text-muted py-5">Es konnten keine Einträge mit den angegebenen Suchparametern gefunden werden.</div>
    <div v-else class="text-center text-muted py-5">Bislang wurden noch keine Einträge erstellt. Sei der Erste!</div>
  </div>
</template>

<script setup>
import DevicePostEntry from '@/components/DevicePostEntry.vue'
import { ref, onMounted, computed, watch } from 'vue'
import { dataApi } from '@/api/dataApi'

import { RouterLink, useRouter } from 'vue-router'

// Elements
//import TextInputElement from '@/components/TextInputElement.vue';

import { useAuth } from '@/stores/auth'

const auth = useAuth()

const clickNewIoT = () => {
  document.getElementById('create_post_button').click()

  if (!auth.isLoggedIn) {
    //router.push({ name: 'login', params: { message: 'Um einen Beitrag einzureichen, müssen Sie sich anmelden oder ein Konto erstellen.' } })
  }
}

const clickTools = () => {
  document.getElementById('tools_button').click()
}

const router = useRouter()

const searchQuery = ref('')
const loadError = ref(null)

const postEntries = ref([])

let debounceTimer = null
const debounceInterval = 200

let showInfoBanner = ref(false)

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

const extendImagePath = (url, thumbnail = false) => {
  let imageUrl = url
  if (imageUrl) {
    // Prepend path
    imageUrl = dataApi.baseURL + 'uploads/images/' + imageUrl

    if (thumbnail) {
      imageUrl = insertBeforeExtension(imageUrl, '_thumb')
    }
  }
  return imageUrl
}

// Load posts
const loadEntries = async (params = null) => {
  try {
    const res = await dataApi.get('/entry/list', { params })

    postEntries.value = []
    for (const entry of res.data) {
      let newEntry = entry

      newEntry.title_image = extendImagePath(newEntry.title_image, true)
      newEntry.link = '/device/' + entry.id
      newEntry.author = newEntry.author || 'Anonym'

      postEntries.value.push(newEntry)
    }
  } catch (err) {
    console.error(err)

    if (err.response.status == 502) {
      loadError.value = 'Backend nicht erreichbar.'
    }
    if (err.response.status == 429) {
      loadError.value = 'Zu viele Anfragen. Bitte versuchen Sie es später erneut.'
    } else {
      loadError.value = err
    }
  }
}

const onHideInfoBanner = async () => {
  showInfoBanner.value = false
  dataApi.post('/user/settings', { show_info_banner: false })
}

const searchPosts = async () => {
  const queryString = searchQuery.value.toLowerCase().trim()
  loadEntries({ query: queryString })
}

// Search debouncing, don't search while still typing faster than debounceInterval
watch(searchQuery, (newValue) => {
  clearTimeout(debounceTimer)

  // When empty, search instantly
  if (newValue.length == 0) {
    searchPosts()
    return
  }

  // Schedule searching in next x ms, when no other key is pressed
  debounceTimer = setTimeout(() => {
    searchPosts()
  }, debounceInterval)
})

const handleTagClick = (tagName) => {
  searchQuery.value = tagName
}

const openPost = (post) => {
  router.push(post.link)
  //window.open(post.link, '_blank').focus();
}

onMounted(async () => {
  await loadEntries()

  if (auth.isLoggedIn) {
    try {
      const settings = (await dataApi.get('/user/settings')).data
      if (settings.show_info_banner == undefined || settings.show_info_banner === true) {
        showInfoBanner.value = true
      } else {
        showInfoBanner.value = false
      }
    } catch (ex) {
      console.error(ex)
    }
  } else {
    showInfoBanner.value = true
  }
})
</script>

<style scoped>
.cursor-pointer {
  cursor: pointer !important;
}
</style>
