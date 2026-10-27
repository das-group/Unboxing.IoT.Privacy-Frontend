<template>

  <div class="container py-4">
    <h1 class="text-center mb-4">Meldungen</h1>


    <nav>
      <div class="nav nav-tabs" id="nav-tab" role="tablist">
        <button class="nav-link active" data-bs-toggle="tab" data-bs-target="#pending" type="button" role="tab" aria-controls="pending" aria-selected="true">Neu ({{ pendingPosts.length }})</button>
        <button class="nav-link" data-bs-toggle="tab" data-bs-target="#archive" type="button" role="tab" aria-controls="archive" aria-selected="false">Archiv</button>

      </div>
    </nav>
    <div class="tab-content mt-3" id="nav-tabContent">
      <div class="tab-pane fade show active" role="tabpanel" aria-labelledby="nav-home-tab" id="pending">



        <!-- -->
        <div class="row g-4" :class="pendingPosts.length <= 2 ? 'justify-content-center' : ''" v-if="pendingPosts.length > 0">
          <div class="col-12" v-for="post in pendingPosts" :key="post.id || post._id">



            <!-- Post Header -->
            <div class="card mb-3 shadow-sm">
              <div class="row g-0">
                <!-- Thumbnail -->

                <div class="col-md-3 d-flex align-items-center justify-content-center">
                  <img v-if="post.title_image" :src="post.title_image" class="img-fluid rounded-start" alt="Bild" style="max-height: 120px; object-fit: cover" @error="handleImageError">
                </div>



                <!-- Post Meta -->
                <div class="col-md-9">
                  <div class="card-body">
                    <h5 class="card-title mb-1">
                      <strong>{{ post.manufacturer }} {{ post.model }}</strong>
                    </h5>
                    <div class="text-muted small mb-2">
                      Erstellt am {{ formatDateTime(post.created_at) }} von

                      <strong v-if="post.created_by_username">{{ post.created_by_username }}</strong>
                      <span v-else class="text-muted">(Unbekannt)</span>
                    </div>



                    <!-- Reports Section (only PENDING reports) -->
                    <div class="mt-3 border-top pt-3">
                      <h6 class="text-secondary small fw-bold">
                        Meldungen ({{ post.pendingReports.length }})
                      </h6>



                      <div v-if="post.pendingReports.length">
                        <div v-for="report in post.pendingReports" :key="report._id || report.id" class="mb-2 p-2 bg-secondary rounded border-sm">
                          <div class="d-flex justify-content-between small text-muted mb-1">

                            <span>Melder: {{ report.created_by_username || 'Unbekannt' }}</span>
                            <span>{{ formatDateTime(report.created_at) }}</span>
                          </div>
                          <div class="small fw-semibold">
                            {{ report.comment ? '"' + report.comment + '"' : 'Kein Kommentar angegeben.' }}
                          </div>

                          <button class="mt-2 btn btn-sm btn-success w-100" @click="setReportStatus(report, 'archived')">
                            Archivieren
                          </button>
                        </div>
                      </div>



                      <div v-else class="text-muted small fst-italic">
                        Keine offenen Meldungen zu diesem Eintrag.
                      </div>
                    </div>

                    <!-- View post -->
                    <div class="mt-2">

                      <router-link :to="post.link" class="btn btn-sm btn-outline-primary w-100">
                        Zugehörigen Post Öffnen
                      </router-link>

                    </div>
                  </div>
                </div>
              </div>
            </div>


          </div>
        </div>
        <div v-else-if="loadError" class="text-center text-muted py-5">
          Fehler beim Laden der Einträge: {{ loadError }}
        </div>
        <div v-else class="text-center text-muted py-5">
          Aktuell wurden noch keine Beiträge gemeldet.
        </div>
        <!-- -->

      </div>
    </div>
    <div class="tab-content mt-3" id="nav-tabContent">
      <div class="tab-pane fade" role="tabpanel" aria-labelledby="nav-home-tab" id="archive">

        <!-- -->
        <div class="row g-4" :class="archivedReports.length <= 2 ? 'justify-content-center' : ''" v-if="archivedReports.length > 0">
          <div class="col-12" v-for="post in archivedReports" :key="post.id || post._id">
            <!-- Post Header -->
            <div class="card mb-3 shadow-sm">
              <div class="row g-0">
                <!-- Thumbnail -->
                <div class="col-md-3 d-flex align-items-center justify-content-center">
                  <img v-if="post.title_image" :src="post.title_image" class="img-fluid rounded-start" alt="Bild" style="max-height: 120px; object-fit: cover" @error="handleImageError">
                </div>

                <!-- Post Meta -->
                <div class="col-md-9">
                  <div class="card-body">
                    <h5 class="card-title mb-1">
                      <strong>{{ post.manufacturer }} {{ post.model }}</strong>
                    </h5>
                    <div class="text-muted small mb-2">
                      Erstellt am {{ formatDateTime(post.created_at) }} von
                      <strong v-if="post.created_by_username">{{ post.created_by_username }}</strong>
                      <span v-else class="text-muted">(Unbekannt)</span>
                    </div>

                    <!-- Reports Section (only PENDING reports) -->
                    <div class="mt-3 border-top pt-3">
                      <h6 class="text-secondary small fw-bold">
                        Meldungen ({{ post.archivedReports?.length }})
                      </h6>

                      <div v-if="post.archivedReports?.length">
                        <div v-for="report in post.archivedReports" :key="report._id || report.id" class="mb-2 p-2 bg-secondary rounded border-sm">
                          <div class="d-flex justify-content-between small text-muted mb-1">
                            <span>Melder: {{ report.created_by_username || 'Unbekannt' }}</span>
                            <span>{{ formatDateTime(report.created_at) }}</span>
                          </div>
                          <div class="small fw-semibold">
                            {{ report.comment ? '"' + report.comment + '"' : 'Kein Kommentar angegeben.' }}
                          </div>

                          <button class="mt-2 btn btn-sm btn-success w-100" @click="setReportStatus(report, 'pending')">
                            Aus Archiv zurückholen
                          </button>
                        </div>
                      </div>

                      <div v-else class="text-muted small fst-italic">
                        Keine archivierten Meldungen zu diesem Eintrag.
                      </div>
                    </div>

                    <!-- Action: View Post (optional) -->
                    <div class="mt-2">
                      <router-link :to="post.link" class="btn btn-sm btn-outline-primary w-100">
                        Zugehörigen Post Öffnen
                      </router-link>
                    </div>
                  </div>
                </div>
              </div>
            </div>


          </div>
        </div>
        <div v-else-if="loadError" class="text-center text-muted py-5">
          Fehler beim Laden der Einträge: {{ loadError }}
        </div>
        <div v-else class="text-center text-muted py-5">
          Aktuell wurden noch keine Beiträge gemeldet.
        </div>
        <!-- -->

      </div>
    </div>
  </div>





</template>

<script setup>
import DevicePostEntry from "@/components/DevicePostEntry.vue";
import { ref, onMounted, computed } from "vue";
import { dataApi } from '@/api/dataApi'
import { localization } from "@/locales/localization";
import { handleImageError, formatDate, formatDateTime } from "@/utils/helpers"
import { RouterLink, useRouter } from 'vue-router'
import { userApi } from "@/api/userApi";


//const blogPosts = ref([])

const router = useRouter()

const loadError = ref(null)




const pendingPosts = computed(() => {
  return blogPosts.value
    .map(post => ({
      ...post,
      // Filter only pending reports and keep the count
      pendingReports: (post.reports || []).filter(report => report.status === 'pending')
    }))
    .filter(post => post.pendingReports.length > 0);

})


const archivedReports = computed(() => {
  return blogPosts.value
    .map(post => ({
      ...post,
      // Filter only pending reports and keep the count
      archivedReports: (post.reports || []).filter(report => report.status !== 'pending')
    }))
    .filter(post => post.archivedReports.length > 0);

})


const insertBeforeExtension = (url, insert) => {
  const u = new URL(url);
  const parts = u.pathname.split('/');
  const file = parts.pop();

  const i = file.lastIndexOf('.');
  const newFile = i === -1
    ? file + insert
    : file.slice(0, i) + insert + file.slice(i);

  parts.push(newFile);
  u.pathname = parts.join('/');
  return u.toString();
}

const extendImagePath = (url, thumbnail = false) => {

  let imageUrl = url
  if (imageUrl) {
    // Prepend path
    imageUrl = dataApi.baseURL + 'uploads/images/' + imageUrl;

    if (thumbnail) {
      imageUrl = insertBeforeExtension(imageUrl, '_thumb');
    }
  }
  return imageUrl;
}

const setReportStatus = async (report, status) => {
  try {
    const res = await dataApi.post('/management/report/' + report.id, { status })


    // Update in ui
    report.status = status

  } catch (err) {
    console.error(err)
  }
}



onMounted(async () => {

  try {
    const res = await dataApi.get('/management/submissions/reported')
    //console.log(res.data)

    for (const entry of res.data) {
      let newEntry = entry

      newEntry.title_image = extendImagePath(newEntry.title_image, true);
      newEntry.link = '/device/' + entry._id

      // Load Reports
      const reports_res = await dataApi.get('/management/submission/' + entry._id + '/reports')
      console.log(reports_res.data)

      newEntry.reports = reports_res.data

      blogPosts.value.push(newEntry)
    }
  } catch (err) {
    console.error(err)

    if (err.response.status == 502) {
      loadError.value = 'Backend nicht erreichbar.'
    }
    else {
      loadError.value = localization.t(err.response.data.code)
    }

  }

})

const blogPosts = ref([
]);

function openPost(post) {
  router.push(post.link)
  //window.open(post.link, '_blank').focus();
}
</script>
