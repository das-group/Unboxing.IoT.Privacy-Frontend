<template>
  <div class="container py-5">
    <div class="row justify-content-center">
      <div class="col-md-6">
        <div class="card shadow-sm">
          <div class="card-body">
            <h3 class="card-title mb-3"><i class="bi bi-people-fill me-2"></i>Anmeldung</h3>

            <form @submit.prevent="">
              <div class="mb-3">
                <ButtonElement
                  class="btn btn-primary btn-lg d-flex align-items-center justify-content-center gap-2 w-100"
                  :onClick="loginWithPasskey"
                  :showSpinner="false"
                  :extra-disabled="!passkeyAvailable"
                >
                  <span v-if="isLoggingInWithPasskey" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                  <i v-else :class="['bi', passkeyIcon]"></i>
                  <span>{{ isLoggingInWithPasskey ? 'Anmeldung läuft...' : 'Über ' + passkeyLabel + ' anmelden' }}</span>
                </ButtonElement>
              </div>
            </form>
            <div class="d-flex align-items-center my-3">
              <hr class="flex-grow-1" />
              <span class="mx-3 text-muted">oder</span>
              <hr class="flex-grow-1" />
            </div>

            <form @submit.prevent="">
              <TextInputElement v-model="email" label="E-Mail Adresse" placeholder="Bitte geben Sie ihre E-Mail Adresse ein..." autocomplete="email webauthn" required class="mb-3" />

              <TextInputElement v-model="password" label="Passwort" type="password" placeholder="Bitte geben Sie ihr Passwort ein..." autocomplete="current-password" required class="mb-3" />

              <ButtonElement class="btn-primary w-100 btn-lg" :onClick="loginWithPassword"> <i class="bi bi-envelope-at-fill"></i> Über E-Mail-Adresse und Passwort anmelden </ButtonElement>
            </form>

            <div class="d-flex align-items-center mt-3">
              <hr class="flex-grow-1" />
              <span class="mx-3 text-muted">oder</span>
              <hr class="flex-grow-1" />
            </div>

            <div class="text-muted d-flex justify-content-between align-items-center">
              Noch kein Konto registriert? <router-link to="/register" class="btn btn-primary px-2 py-1 fw-semibold rounded-pill">Konto erstellen</router-link>
            </div>
          </div>

          <div class="card-footer bg-transparent text-center py-3 mt-1" v-if="message">
            <div class="alert mt-0 mb-0" :class="messageClass" style="white-space: pre-line"><i class="bi bi-info-circle me-1 text-info"></i> {{ message }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { RouterLink, useRouter, useRoute } from 'vue-router'
import { userApi } from '@/api/userApi'
import { useAuth } from '@/stores/auth'

import { localization } from '@/locales/localization'

// Elements
import ButtonElement from '@/components/ButtonElement.vue'
import TextInputElement from '@/components/TextInputElement.vue'

const router = useRouter()
const route = useRoute()

const props = defineProps({
  message: {
    type: String,
    required: false,
  },
})

const email = ref('')
const password = ref('')
const message = ref(props.message)
const messageClass = ref('alert-info')

// ---------- helpers for base64url <-> ArrayBuffer ----------
const bufferToBase64Url = (buffer) => {
  const bytes = new Uint8Array(buffer)
  let str = ''
  for (let i = 0; i < bytes.byteLength; i++) {
    str += String.fromCharCode(bytes[i])
  }
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

const base64UrlToBuffer = (base64url) => {
  const padding = '='.repeat((4 - (base64url.length % 4)) % 4)
  const base64 = (base64url + padding).replace(/-/g, '+').replace(/_/g, '/')
  const str = atob(base64)
  const bytes = new Uint8Array(str.length)
  for (let i = 0; i < str.length; i++) {
    bytes[i] = str.charCodeAt(i)
  }
  return bytes.buffer
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

const afterLogin = async (user) => {
  //await sleep(1500)

  // Redirect to requested path or home

  if (route.query.redirect) {
    router.push(route.query.redirect)
  } else {
    router.push({ name: 'home' })
  }
}

const loginWithPassword = async () => {
  if (!email.value || !password.value) {
    setMessage('Bitte geben Sie Ihre E-Mail und Passwort an', 'alert-warning')
    return
  }

  setMessage('Anmelden...', 'alert-info')

  try {
    const resp = await userApi.post('login/passwd', { email: email.value, password: password.value })

    if (resp.status !== 200) {
      setMessage(resp.data.message, 'alert-danger')
      return
    }

    const auth = useAuth()

    auth.login(resp.data.auth.token, resp.data.user)
    auth.token = resp.data.auth.token
    //auth.token_expires = result.auth.expires

    setMessage('Anmeldung erfolgreich. Willkommen, ' + auth.user.email, 'alert-success')
    afterLogin(auth.user)
  } catch (err) {
    console.error(err)

    if (err.response && err.response.data && err.response.data.code) {
      setMessage(localization.t(err.response.data.code), 'alert-danger')
    } else {
      setMessage(err, 'alert-danger')
    }
  }
}

function toBase64Url(buffer) {
  return btoa(String.fromCharCode(...new Uint8Array(buffer)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}

function fromBase64Url(base64url) {
  const base64 = base64url.replace(/-/g, '+').replace(/_/g, '/')
  const pad = base64.length % 4 === 0 ? '' : '='.repeat(4 - (base64.length % 4))
  const str = atob(base64 + pad)
  return Uint8Array.from(str, (c) => c.charCodeAt(0))
}

const isLoggingInWithPasskey = ref(false)
const loginWithPasskey = async () => {
  if (!window.PublicKeyCredential) {
    setMessage('WebAuthn / Passkeys werden in diesem Browser nicht unterstützt.', 'alert-danger')
    return
  }

  setMessage('Anmelden...', 'alert-info')

  try {
    isLoggingInWithPasskey.value = true
    // Get Passkey options
    const response = await userApi.post('login/webauthn/options')
    const options = response.data

    // Get Credentials locally
    const assertion = await navigator.credentials.get({
      publicKey: {
        challenge: fromBase64Url(options.challenge),
        rpId: options.rpId,
        allowCredentials: options.allowCredentials.map((cred) => ({
          id: fromBase64Url(cred.id),
          type: cred.type,
        })),
        userVerification: 'required',
      },
    })

    // Send assertion to server for verification
    try {
      const responseVerify = await userApi.post('login/webauthn/verify', {
        id: assertion.id,
        rawId: toBase64Url(assertion.rawId),
        type: assertion.type,
        authenticatorData: toBase64Url(assertion.response.authenticatorData),
        clientDataJSON: toBase64Url(assertion.response.clientDataJSON),
        signature: toBase64Url(assertion.response.signature),
        userHandle: assertion.response.userHandle ? toBase64Url(assertion.response.userHandle) : null,
        login_id: options.login_id,
      })

      if (responseVerify.status !== 200) {
        setMessage(responseVerify.data.message, 'alert-danger')

        // If account was deleted, flag passkey for deletion
        if (responseVerify.status === 404) {
          if (PublicKeyCredential.signalUnknownCredential) {
            console.log('Flagging unknown credential')
            await PublicKeyCredential.signalUnknownCredential({
              rpId: options.rpId,
              credentialId: assertion.id,
            })
          } else {
            console.log('Cant flag unknown credential')
          }
        }
        return
      }

      //console.log(result)
      const auth = useAuth()

      auth.login(responseVerify.data.auth.token, responseVerify.data.user)
      auth.token = responseVerify.data.auth.token
      //auth.token_expires = result.auth.expires

      setMessage('Anmeldung erfolgreich. Willkommen, ' + auth.user.email, 'alert-success')
      afterLogin(auth.user)
    } catch (err) {
      // If account is not found, signal unknown credential to passkey provider
      if (err.status === 404) {
        if (PublicKeyCredential.signalUnknownCredential) {
          await PublicKeyCredential.signalUnknownCredential({
            rpId: options.rpId,
            credentialId: assertion.id,
          })
        }

        if (err.response && err.response.data && err.response.data.code) {
          setMessage(localization.t(err.response.data.code), 'alert-danger')
        } else {
          setMessage(err, 'alert-danger')
        }
      }
    }
  } catch (err) {
    console.error(err)

    if (err instanceof DOMException && err.name === 'NotAllowedError') {
      setMessage('Fehler: Die Anmeldung wurde abgebrochen oder von dem Browser verweigert.', 'alert-danger')
    } else if (err.response && err.response.data && err.response.data.code) {
      setMessage(localization.t(err.response.data.code), 'alert-danger')
    } else {
      setMessage(err, 'alert-danger')
    }
  } finally {
    isLoggingInWithPasskey.value = false
  }
}

const setMessage = (text, cls = 'alert-info') => {
  message.value = text
  messageClass.value = cls
}

// Platformspecific Passkey
const platform = ref('other')
const platformAvailable = ref(false)

function detectPlatform() {
  const ua = navigator.userAgent
  const p = navigator.userAgentData?.platform || navigator.platform || ''

  if (/iPhone|iPad|iPod/.test(ua)) return 'ios'
  if (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1) return 'ios'
  if (/Android/.test(ua)) return 'android'
  if (/Win/.test(p) || /Windows/.test(ua)) return 'windows'
  if (/Mac/.test(p) || /Macintosh/.test(ua)) return 'mac'
  return 'other'
}

const passkeyConfig = {
  ios: { label: 'Face ID', icon: 'bi-person-bounding-box' },
  mac: { label: 'Touch ID', icon: 'bi-fingerprint' },
  windows: { label: 'Windows Hello', icon: 'bi-windows' },
  android: { label: 'Gesicht oder Fingerabdruck', icon: 'bi-android2' },
  other: { label: 'Passkey', icon: 'bi-key-fill' },
}

const passkeyLabel = computed(() => (platformAvailable.value ? passkeyConfig[platform.value].label : passkeyConfig.other.label))
const passkeyIcon = computed(() => passkeyConfig[platform.value].icon)
//

const passkeyAvailable = ref(false)
async function checkPasskeyAvailability() {
  try {
    passkeyAvailable.value = window.isSecureContext && !!window.PublicKeyCredential // && (await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable())

    platform.value = detectPlatform()
    if (window.PublicKeyCredential?.isUserVerifyingPlatformAuthenticatorAvailable) {
      platformAvailable.value = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
    }
  } catch {
    passkeyAvailable.value = false
  }
}

onMounted(async () => {
  const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]')
  const tooltipList = [...tooltipTriggerList].map((tooltipTriggerEl) => new window.bootstrap.Tooltip(tooltipTriggerEl))

  // Passkey setup
  await checkPasskeyAvailability()
})
</script>

<style scoped>
.card-title {
  font-weight: 600;
}

.button-half {
  flex: 0 0 50%;
  /* don't grow or shrink, 50% width */
}
</style>
