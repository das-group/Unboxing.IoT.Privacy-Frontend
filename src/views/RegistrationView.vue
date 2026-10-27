<template>
  <div class="container py-5">
    <div class="row justify-content-center">
      <div class="col-md-6">
        <div class="card shadow-sm">
          <div class="card-body">
            <h3 class="card-title mb-3"><i class="bi bi-people-fill me-2"></i>Registrierung</h3>

            <form @submit.prevent @keydown.enter.prevent>
              <div class="mb-3">
                <TextInputElement
                  v-model="form.email"
                  ref="emailInput"
                  label="E-Mail Adresse"
                  type="email"
                  autocomplete="email webauthn"
                  required
                  :class="{ 'is-invalid': emailError }"
                  :aria-invalid="!!emailError"
                  aria-describedby="email-error"
                  @update:model-value="onEmailInput"
                />
                <div v-if="emailError" id="email-error" class="invalid-feedback d-block" role="alert">
                  {{ emailError }}
                </div>
              </div>

              <div class="mb-3">
                <TextInputElement
                  v-model="form.username"
                  label="Benutzername"
                  type="username"
                  autocomplete="username"
                  required
                  :class="{ 'is-invalid': usernameError }"
                  :aria-invalid="!!usernameError"
                  aria-describedby="username-error"
                  @update:model-value="onUsernameInput"
                />
                <div v-if="usernameError" id="username-error" class="invalid-feedback d-block" role="alert">
                  {{ usernameError }}
                </div>
              </div>

              <div class="mb-3">
                <div class="form-floating">
                  <select class="form-select" id="loginMethodInput" aria-label="Anmeldemethode" v-model="method" @change="message = ''">
                    <option value="passkey" :disabled="!passkeyAvailable">Anmeldung über {{ passkeyLabel }} (empfohlen)</option>
                    <option value="password">Anmeldung über Passwort</option>
                  </select>
                  <label for="loginMethodInput">Bitte wählen Sie Ihre gewünschte Anmeldemethode aus</label>
                </div>
                <!--
                <label class="form-label">Bitte wählen Sie Ihre gewünschte Anmeldemethode aus:</label>
                <select class="form-select" v-model="method" @change="message = ''">
                  <option value="passkey">Anmeldung über Passkey (empfohlen)</option>
                  <option value="password">Anmeldung über Passwort</option>
                </select>
              --></div>

              <!-- Passwort -->
              <div v-if="method === 'password'">
                <!-- Password Input -->

                <TextInputElement v-model="form.password" label="Passwort" type="password" @input="checkPassword" required class="mb-3" autocomplete="new-password" />

                <!-- Password Strength Bar -->
                <div class="progress mb-2">
                  <div class="progress-bar" role="progressbar" :style="{ width: strengthScore + '%' }" :class="strengthColor"></div>
                </div>

                <!-- Requirements -->
                <ul class="list-unstyled small">
                  <li :class="reqClass(passwordRequirements.length)">• Mindestens 8 Zeichen</li>
                  und
                  <li :class="reqClass(passwordRequirements.lowercase)">• Ein Kleinbuchstabe (a-z)</li>
                  <li :class="reqClass(passwordRequirements.uppercase)">• Ein Großbuchstabe (A-Z)</li>
                  <li :class="reqClass(passwordRequirements.number)">• Eine Ziffer (0-9)</li>
                  <li :class="reqClass(passwordRequirements.special)">• Ein Sonderzeichen (!§$%&...)</li>

                  <li :class="reqClass(passwordMeetsRequirements)">{{ minPasswordRequirementsMet - 1 }} der 4 Anforderungen bzgl. vorkommender Zeichen müssen erfüllt werden</li>
                </ul>

                <!-- Confirm Password -->

                <TextInputElement v-model="form.confirmPassword" label="Passwort erneut eingeben" type="password" required class="mb-3" autocomplete="new-password" />

                <div class="mt-1 small">
                  <span v-if="form.confirmPassword.length > 0">
                    <span v-if="passwordsMatch" class="text-success"> ✓ Passwörter stimmen überein </span>
                    <span v-else class="text-danger"> ✗ Passwörter stimmen nicht überein </span>
                  </span>
                </div>
              </div>

              <label class="alert alert-info w-100 mt-3" role="alert" for="agreeTerms">
                <input class="form-check-input me-2" type="checkbox" value="" id="agreeTerms" v-model="agreeTerms" />
                <span> Ich stimme der <router-link to="/datenschutz" target="_blank">Datenschutzerklärung</router-link> zu. </span>
              </label>

              <span
                class="w-100"
                id="agreeTermsOverlayWrapper"
                ref="agreeTermsOverlayWrapper"
                tabindex="0"
                data-bs-toggle="tooltip"
                data-bs-placement="top"
                :title="agreeTerms ? '' : 'Bitte stimmen Sie der Datenschutzerklärung zu.'"
              >
                <!-- Passkey -->
                <div v-if="method === 'passkey'" class="d-flex mt-3">
                  <ButtonElement
                    class="btn btn-primary btn-lg d-flex align-items-center justify-content-center gap-2 w-100"
                    :onClick="registerPasskey"
                    :extra-disabled="!agreeTerms"
                    :showSpinner="false"
                  >
                    <span v-if="isRegisteringPasskey" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                    <i v-else :class="['bi', passkeyIcon]"></i>
                    <span>{{ isRegisteringPasskey ? 'Passkey wird registriert...' : 'Mit ' + passkeyLabel + ' registrieren' }}</span>
                  </ButtonElement>
                </div>

                <!-- Password -->
                <div v-if="method === 'password'" class="d-flex mt-3">
                  <ButtonElement class="btn-primary btn-lg w-100" :onClick="registerPassword" :disabled="!isValidForm || !agreeTerms">
                    <i class="bi bi-key-fill"></i> Mit Passwort registrieren
                  </ButtonElement>
                </div>
              </span>

              <div v-if="method === 'passkey'">
                <br />

                <span
                  class="text-muted ms-1"
                  role="button"
                  tabindex="0"
                  data-bs-toggle="tooltip"
                  data-bs-title="
                      Ein Passkey ist ein kryptografischer Schlüssel, welcher das klassische Passwort bei einer Kontoregistrierung ersetzt.
                      Er kann den Anmeldeprozess vereinfachen, und ist gegenüber Angreifern sicherer als ein Passwort.

                      Er wird entweder auf dem Smartphone, auf einem Sicherheitstoken wie z.B. einem YubiKey, oder auch auf dem PC mithilfe von 'Windows Hello' abgespeichert.
                      Zur Anmeldung wird das entsprechende Gerät benötigt, auf dem der Passkey abgespeichert wurde.
                      Einem Benutzerkonto können bei Bedarf mehrere Passkeys hinzugefügt werden.
                    "
                >
                  <i class="bi bi-info-circle"></i>
                  Was ist ein Passkey?
                </span>
              </div>
            </form>

            <hr />

            <div v-if="message" class="alert" :class="messageClass" style="white-space: pre-line">
              {{ message }}
            </div>

            <div class="small text-muted mt-3">Haben Sie bereits einen Account? Dann melden Sie sich <router-link to="/login">hier</router-link> an</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, computed, watch, onMounted } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { userApi } from '@/api/userApi'

import { localization } from '@/locales/localization'

// Elements
import ButtonElement from '@/components/ButtonElement.vue'
import TextInputElement from '@/components/TextInputElement.vue'

const router = useRouter()

const method = ref('passkey')

const form = reactive({
  email: '',
  username: '',
  password: '',
  confirmPassword: '',
})

const emailError = ref('')
const EMAIL_RE = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/

function getEmailError(raw) {
  const email = raw.trim()

  if (!email) {
    return 'Bitte geben Sie eine E-Mail-Adresse ein.'
  }
  if (email.length > 254) {
    return 'Die E-Mail-Adresse darf höchstens 254 Zeichen lang sein.'
  }

  const atIndex = email.lastIndexOf('@')
  if (atIndex === -1) {
    return 'Die E-Mail-Adresse muss ein "@" enthalten.'
  }

  const local = email.slice(0, atIndex)
  const domain = email.slice(atIndex + 1)

  if (!local) {
    return 'Vor dem "@" fehlt der Name.'
  }
  if (local.length > 64) {
    return 'Der Teil vor dem "@" darf höchstens 64 Zeichen lang sein.'
  }
  if (!domain) {
    return 'Nach dem "@" fehlt die Domain (z.B. web.de, gmail.com).'
  }
  if (!domain.includes('.')) {
    return 'Die Domain muss eine Endung enthalten (z.B. ".de" oder ".com").'
  }
  if (!EMAIL_RE.test(email)) {
    return 'Bitte gib eine gültige E-Mail-Adresse ein.'
  }

  return ''
}

function onEmailInput(value) {
  emailError.value = getEmailError(value ?? '')
}

const usernameError = ref('')
const ALLOWED_SPECIAL_CHARS = new Set([' ', '.', '_'])
const isAlnum = (c) => /^[\p{L}\p{N}]$/u.test(c)

function getUsernameError(username) {
  const tusername = username.trim()

  if (!tusername) {
    return 'Bitte geben Sie einen Benutzernamen ein.'
  }

  const chars = [...username]

  if (chars.length < 3 || chars.length > 30) {
    return 'Der Benutzername muss zwischen 3 und 30 Zeichen lang sein.'
  }
  if (!chars.every((c) => isAlnum(c) || ALLOWED_SPECIAL_CHARS.has(c))) {
    return 'Im Benutzernamen sind nur Buchstaben, Ziffern, Leerzeichen, Punkte und Unterstriche erlaubt.'
  }

  if (!chars.some(isAlnum)) {
    return 'Der Benutzername muss mindestens einen Buchstaben oder eine Ziffer enthalten.'
  }
  if (ALLOWED_SPECIAL_CHARS.has(chars[0]) || ALLOWED_SPECIAL_CHARS.has(chars[chars.length - 1])) {
    return 'Der Benutzername darf nicht mit einem Leerzeichen, Punkt oder Unterstrich beginnen oder enden.'
  }
  for (let i = 1; i < chars.length; i++) {
    if (ALLOWED_SPECIAL_CHARS.has(chars[i - 1]) && ALLOWED_SPECIAL_CHARS.has(chars[i])) {
      return 'Leerzeichen, Punkte und Unterstriche dürfen nicht direkt aufeinander folgen.'
    }
  }

  return ''
}

function onUsernameInput(value) {
  usernameError.value = getUsernameError(value ?? '')
}

const agreeTerms = ref(false)
const agreeTermsOverlayWrapper = ref(null)
watch(agreeTerms, () => {
  const tooltip = window.bootstrap.Tooltip.getInstance(agreeTermsOverlayWrapper.value)

  if (agreeTerms.value) {
    tooltip?.disable()
  } else {
    tooltip?.enable()
  }
})

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

const emailInput = ref(null)

const message = ref('')
const messageClass = ref('alert-info')

const minPasswordLength = ref(8)
const minPasswordRequirementsMet = ref(5)
const passwordRequirements = reactive({
  length: false,
  uppercase: false,
  lowercase: false,
  number: false,
  special: false,
})

function checkPassword() {
  const p = form.password

  passwordRequirements.length = p.length >= minPasswordLength.value
  passwordRequirements.uppercase = /[A-Z]/.test(p)
  passwordRequirements.lowercase = /[a-z]/.test(p)
  passwordRequirements.number = /[0-9]/.test(p)
  passwordRequirements.special = /[!@#$%^&*(),.?":;{}|<_>-]/.test(p)
}

const strengthScore = computed(() => {
  let score = 0
  Object.values(passwordRequirements).forEach((req) => {
    if (req) score += 20
  })
  return score
})

const strengthColor = computed(() => {
  if (strengthScore.value <= 40) return 'bg-danger'
  if (strengthScore.value <= 60) return 'bg-warning'
  if (strengthScore.value <= 80) return 'bg-info'
  return 'bg-success'
})

function reqClass(isValid) {
  return isValid ? 'text-success' : 'text-danger'
}

const passkeyCreated = ref(false)

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

const onError = (err) => {
  console.error(err)

  if (err.response) {
    setMessage(localization.t(err.response.data.code), 'alert-danger')
  } else {
    setMessage(err, 'alert-danger')
  }
}

const isRegisteringPasskey = ref(false)
const registerPasskey = async () => {
  try {
    isRegisteringPasskey.value = true
    if (!form.email) {
      setMessage('Bitte geben Sie Ihre E-Mail-Adresse ein')
      //emailInput.value.focus()
      return false
    }

    const resp_opts = await userApi.post('register/webauthn/options', {
      username: form.username,
      email: form.email,
    })

    const options = resp_opts.data

    setMessage('Erzeuge passkey...')

    try {
      const cred = await navigator.credentials.create({
        publicKey: {
          challenge: fromBase64Url(options.challenge),
          rp: {
            id: options.rp.id, //  window.location.hostname
            name: options.rp.name,
          },
          user: {
            id: fromBase64Url(options.user.id),
            name: options.user.name,
            displayName: options.user.displayName,
          },
          pubKeyCredParams: options.pubKeyCredParams,
          timeout: options.timeout,
          attestation: options.attestation,
          authenticatorSelection: {
            residentKey: 'required',
            requireResidentKey: true,
            userVerification: 'required', //"discouraged" // TODO required
          },
          /*
          extensions: {
            credProps: true
          },
          */
        },
      })

      // cred.response.transports = list ['usb']
      // cred.response.attestationObject = base64 cert info

      // Send credentials to server for verification
      const resp_verify = await userApi.post('register/webauthn/verify', {
        id: cred.id,
        rawId: toBase64Url(cred.rawId),
        type: cred.type,
        client_data_json: toBase64Url(cred.response.clientDataJSON),
        attestation_object: toBase64Url(cred.response.attestationObject),
        user_id: options.user.id,
      })

      passkeyCreated.value = true
      setMessage('Passkey wurde erzeugt und registriert!', 'alert-success')

      // Navigate to login page
      //await sleep(1500);
      router.push({ name: 'login', params: { message: 'Account erstellt. Sie können sich nun anmelden.' } })
    } catch (err) {
      console.error(err)

      if (err.status == 409) {
        setMessage('Fehler: ' + localization.t(err.response.data?.code), 'alert-danger')
        return
      }

      setMessage('Passkey konnte nicht erzeugt werden. Bitte versuchen Sie es erneut, oder wählen Sie die Anmeldung über Passwort.', 'alert-danger')
    }
  } catch (err) {
    onError(err)
  } finally {
    isRegisteringPasskey.value = false
  }
}

const requirementsMetCount = computed(() => {
  return Object.values(passwordRequirements).filter((v) => v).length
})

const passwordsMatch = computed(() => {
  return form.password && form.password === form.confirmPassword
})

const passwordMeetsRequirements = computed(() => {
  return passwordRequirements.length && requirementsMetCount.value >= minPasswordRequirementsMet.value
})

const isValidForm = computed(() => {
  if (!form.email) {
    return false
  }

  if (method.value === 'password') {
    return passwordMeetsRequirements.value && passwordsMatch.value
  }

  if (method.value === 'passkey') {
    return passkeyCreated.value
  }

  return false
})

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

const registerPassword = async () => {
  try {
    const resp = await userApi.post('register/passwd', { email: form.email, username: form.username, password: form.password })
    if (resp.status !== 200) {
      setMessage(resp.data.message, 'alert-danger')
      return
    }

    setMessage('Erfolgreich registriert!', 'alert-success')
    router.push({ name: 'login', params: { message: 'Account erstellt. Sie können sich nun anmelden.' } })
  } catch (err) {
    onError(err)
  }
}

const setMessage = (text, cls = 'alert-info') => {
  message.value = text
  messageClass.value = cls
}

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
  if (!passkeyAvailable.value) {
    method.value = 'password'
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
