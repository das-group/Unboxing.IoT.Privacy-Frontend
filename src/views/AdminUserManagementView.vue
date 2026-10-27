<template>
  <div class="container pt-2 d-flex flex-column">
    <div class="card shadow-sm">
      <div class="card-body overflow-auto">
        <h3 class="card-title mb-3"><i class="bi bi-person-fill-gear me-2"></i>Benutzerliste</h3>

        <table class="table table-striped table-hover">
          <thead class="table">
            <tr>
              <th>#</th>
              <th>Benutzername</th>
              <th>E-Mail Adresse</th>
              <th>Berechtigungen</th>
              <th width="180">Aktionen</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(user, index) in userList" :key="user.id">
              <td :title="user.id">{{ index + 1 }}</td>
              <td>{{ user.username }}</td>
              <td>{{ user.email }}</td>
              <td>{{ formatList(user.permissions) }}</td>
              <td>
                <button class="btn btn-sm btn-warning me-2" title="Bearbeiten" @click="openEditModal(user)">
                  <i class="bi bi-pencil-square"></i>
                </button>
                <button class="btn btn-sm btn-danger" title="Löschen" @click="openDeleteModal(user)">
                  <i class="bi bi-trash-fill"></i>
                </button>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Edit User Modal -->
        <div class="modal fade" ref="editModalRef" tabindex="-1">
          <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title"><i class="bi bi-pencil-square"></i> Benutzer bearbeiten...</h5>
                <button type="button" class="btn-close" @click="closeEditModal"></button>
              </div>

              <div class="modal-body">
                <div class="mb-3">
                  <TextInputElement label="Benutzername" v-model="editForm.username" />
                </div>

                <div class="mb-3">
                  <TextInputElement label="E-Mail Adresse" v-model="editForm.email" />
                </div>
                <div class="mb-3">
                  <CheckboxElement v-model="editForm.manage_users" label="Kann Benutzer verwalten" description="Administrator" />
                  <CheckboxElement v-model="editForm.manage_posts" label="Kann Beiträge verwalten" description="Moderator" />
                  <CheckboxElement v-model="editForm.create_post" label="Kann einen Beitrag erstellen" description="Autor" />
                </div>
              </div>

              <div class="modal-footer">
                <button class="btn btn-secondary" @click="closeEditModal">Abbrechen</button>
                <button class="btn btn-primary" @click="saveUser"><i class="bi bi-floppy-fill"></i> Speichern</button>
              </div>
            </div>
          </div>
        </div>

        <!-- Delete Modal -->
        <div class="modal fade" ref="deleteModalRef" tabindex="-1">
          <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title"><i class="bi bi-trash-fill"></i> Benutzer löschen...</h5>
                <button type="button" class="btn-close" @click="closeDeleteModal"></button>
              </div>

              <div class="modal-body">
                Sind Sie sicher, dass der Benutzer <strong>{{ deleteTarget?.username }}</strong> gelöscht werden soll?
              </div>

              <div class="modal-footer">
                <button class="btn btn-secondary" @click="closeDeleteModal">Abbrechen</button>
                <button class="btn btn-danger" @click="confirmDelete">Löschen</button>
              </div>
            </div>
          </div>
        </div>

        <div v-if="message" class="alert mb-0 mt-3" :class="messageClass">{{ message }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { userApi } from '@/api/userApi'

import TextInputElement from '@/components/TextInputElement.vue'
import ButtonElement from '@/components/ButtonElement.vue'
import CheckboxElement from '@/components/CheckboxElement.vue'

import { localization } from '@/locales/localization'

const router = useRouter()

import { useAuth } from '@/stores/auth'
const auth = useAuth()

const formatList = (list) => {
  return list?.join(', ')
}
////

//const axios = inject('axios');

// Load latest user data

const editModalRef = ref(null)
const deleteModalRef = ref(null)
let editModal = null
let deleteModal = null

// User deletion
const deleteTarget = ref(null)

const openDeleteModal = (user) => {
  deleteTarget.value = user
  deleteModal.show()
}

const closeDeleteModal = () => {
  deleteModal.hide()
}

const confirmDelete = async () => {
  try {
    const resp = await userApi.delete('management/user/' + deleteTarget.value.id)
    if (resp.status !== 200) {
      return
    }

    if (resp.data.success) {
      setMessage('Benutzer gelöscht.')

      // Visually delete
      userList.value = userList.value.filter((u) => u.id !== deleteTarget.value.id)
    } else {
      setMessage('Fehlgeschlagen', 'alert-danger')
    }
  } catch (ex) {
    setMessage(ex)
  } finally {
    deleteModal.hide()
  }
}

// User edit

const editForm = reactive({ user_id: null, username: '', email: '', user_instance: null })

const closeEditModal = () => {
  editModal.hide()
}

const openEditModal = (user) => {
  editForm.user_id = user.id
  editForm.username = user.username
  editForm.email = user.email
  editForm.permissions = user.permissions

  editForm.manage_users = user.permissions.includes('manage_users')
  editForm.manage_posts = user.permissions.includes('manage_posts')
  editForm.create_post = user.permissions.includes('create_post')

  editForm.user_instance = user
  editModal.show()
}

const saveUser = async () => {
  try {
    // TODO fix / add roles
    let permissions = []
    if (editForm.manage_users) {
      permissions.push('manage_users')
    }
    if (editForm.manage_posts) {
      permissions.push('manage_posts')
    }
    if (editForm.create_post) {
      permissions.push('create_post')
    }

    const resp = await userApi.post('management/user/' + editForm.user_id, { username: editForm.username, email: editForm.email, permissions: permissions })
    if (resp.status !== 200) {
      return
    }

    console.log(resp.data)

    if (resp.data.success) {
      setMessage('Benutzer bearbeitet.')

      // Visually update
      editForm.user_instance.username = editForm.username
      editForm.user_instance.email = editForm.email
      editForm.user_instance.permissions = permissions
    } else {
      setMessage('Fehlgeschlagen', 'alert-danger')
    }
  } catch (ex) {
    setMessage(ex)
  } finally {
    editModal.hide()
  }
}

const loadUsers = async () => {
  // Load passkeys
  const resp = await userApi.get('management/users')
  if (resp.status !== 200) {
    return
  }
  userList.value = resp.data

  console.log(userList.value)
}

onMounted(async () => {
  //const user = await auth.loadSession()
  await loadUsers()

  editModal = new window.bootstrap.Modal(editModalRef.value)
  deleteModal = new window.bootstrap.Modal(deleteModalRef.value)
})

//const route = useRoute()

const props = defineProps({
  message: {
    type: String,
    required: false,
  },
})

const userList = ref(null)

const message = ref(props.message)
const messageClass = ref('alert-info')

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

const setMessage = (text, cls = 'alert-info') => {
  message.value = text
  messageClass.value = cls
}
</script>

<style scoped>
.card-title {
  font-weight: 600;
}
</style>
