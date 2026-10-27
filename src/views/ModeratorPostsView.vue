<template>

  <div class="container py-4">
    <h1 class="text-center mb-4">Moderierte Einträge</h1>

    <div class="row g-4" :class="blogPosts.length <= 2 ? 'justify-content-center' : ''" v-if="blogPosts.length > 0">
      <div class="col-12 col-sm-6 col-lg-4" v-for="post in blogPosts" :key="post.id">
        <DevicePostEntry :manufacturer="post.manufacturer" :model="post.model" :description="post.description" :created_by="post.created_by" :created_at="post.created_at" :tags="post.tags" :title_image="post.title_image" :link="post.link"
          @read-more="openPost(post)" :show_visibility="true" :visibility="post.visibility" />
      </div>
    </div>
    <div v-else-if="loadError" class="text-center text-muted py-5">
      Fehler beim Laden der Einträge: {{ loadError }}
    </div>
    <div v-else class="text-center text-muted py-5">
      Aktuell stehen keine Beiträge zur Moderation aus.
    </div>
  </div>


</template>

<script setup>
import DevicePostEntry from "@/components/DevicePostEntry.vue";
import { ref, onMounted } from "vue";
import { dataApi } from '@/api/dataApi'
import { localization } from "@/locales/localization";

import { RouterLink, useRouter } from 'vue-router'


//const blogPosts = ref([])

const router = useRouter()

const loadError = ref(null)

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

onMounted(async () => {

  try {
    const res = await dataApi.get('/management/submissions')
    //console.log(res.data)

    for (const entry of res.data) {
      let newEntry = entry

      newEntry.title_image = extendImagePath(newEntry.title_image, true);
      newEntry.link = '/device/' + entry._id
      newEntry.author = newEntry.author || "Anonym"

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
