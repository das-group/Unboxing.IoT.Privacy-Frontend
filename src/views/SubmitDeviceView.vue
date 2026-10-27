<template>
  <div class="container py-4 d-flex flex-column align-items-center">
    <h1 class="mb-4"><i class="bi bi-plus-circle-fill me-2"></i> Neuer Beitrag zu einem IoT-Gerät</h1>

    <div class="d-flex flex-row flex-wrap w-100">
      <BreadcrumbWizard :steps="steps" :activeIndex="step" :maxIndexVisited="maxStepVisited" @change="setStep" class="col-12 col-lg-3" />

      <div class="col-12 col-lg-9">
        <h3 v-if="step > 0">{{ form.manufacturer }} {{ form.modelName }}</h3>

        <!-- Seite 1 -->
        <div v-if="step === 0">
          <label class="form-label">Bitte geben Sie den Hersteller und den Produktnamen Ihres IoT-Geräts ein:</label>

          <TextInputElement class="mb-3" v-model="form.manufacturer" label="Hersteller" placeholder="Bitte geben Sie den Hersteller ein, z.B. 'Philips'" list="manufacturerOptions" required />

          <TextInputElement v-model="form.modelName" label="Modell" placeholder="Bitte geben Sie den Produktnamen bzw. Modellbezeichner an, z.B. 'Hue Bridge Pro'" />
          <!--

        <label for="manufacturer" class="form-label">Hersteller:</label>
        <input list="manufacturerOptions" type="text" id="manufacturer" v-model="form.manufacturer" class="form-control" placeholder="Bitte geben Sie den Hersteller ein, z.B. 'Philips'" required />
        -->
          <datalist id="manufacturerOptions">
            <option value="Apple" />
            <option value="Samsung" />
            <option value="Sony" />
            <option value="LG" />
            <option value="Dell" />
            <option value="Intel" />
            <option value="Google" />
            <option value="Amazon" />
            <option value="Microsoft" />
            <option value="Cisco" />
            <option value="Huawei" />
            <option value="Xiaomi" />
            <option value="Lenovo" />
            <option value="ASUS" />
            <option value="Acer" />
            <option value="Bosch" />
            <option value="Siemens" />
            <option value="Honeywell" />
            <option value="Schneider Electric" />
            <option value="ABB" />
            <option value="TP-Link" />
            <option value="Netgear" />
            <option value="D-Link" />
            <option value="Belkin" />
            <option value="Ubiquiti" />
            <option value="Philips" />
            <option value="GE" />
            <option value="Panasonic" />
            <option value="Toshiba" />
            <option value="Hitachi" />
            <option value="Zebra Technologies" />
            <option value="Garmin" />
            <option value="Fitbit" />
            <option value="Withings" />
            <option value="Arlo" />
            <option value="Ring" />
            <option value="Nest" />
            <option value="Ecobee" />
            <option value="Wyze" />
            <option value="Eufy" />
            <option value="Tuya" />
            <option value="Broadlink" />
            <option value="iRobot" />
            <option value="Roomba" />
            <option value="August" />
            <option value="Yale" />
            <option value="Kwikset" />
            <option value="Nanoleaf" />
            <option value="LIFX" />
            <option value="Meross" />
            <option value="Aqara" />
            <option value="Shelly" />
            <option value="Sonoff" />
            <option value="Particle" />
            <option value="Espressif" />
            <option value="Nordic Semiconductor" />
            <option value="Quectel" />
            <option value="u-blox" />
            <option value="Advantech" />
            <option value="HPE" />
            <option value="IBM" />
            <option value="Black & Decker" />
            <option value="Bosch Rexroth" />
            <option value="Thales" />
            <option value="Infinion" />
            <option value="NXP" />
            <option value="STMicroelectronics" />
            <option value="Microchip" />
            <option value="Raspberry Pi Foundation" />
            <option value="Arduino" />
            <option value="BeagleBoard" />
            <option value="Seeed Studio" />
            <option value="Adafruit" />
            <option value="TPV" />
            <option value="Bang & Olufsen" />
            <option value="JBL" />
            <option value="Harman Kardon" />
            <option value="Sennheiser" />
            <option value="Logitech" />
            <option value="Anker" />
            <option value="Belimo" />
            <option value="Leviton" />
            <option value="Lutron" />
            <option value="Somfy" />
            <option value="Honeywell Home" />
          </datalist>
        </div>

        <!-- Seite 2 -->
        <div v-if="step === 1">
          <div class="mb-3">
            <label class="form-label">Bitte wählen Sie die zutreffendste Produktkategorie aus:</label>
            <select class="form-select" v-model="form.productCategory">
              <option value="Household">Haushalt</option>
              <option value="Health">Medizinisch</option>
              <option value="Security">Sicherheit</option>
              <option value="Garden">Garten</option>
              <option value="Office">Büro</option>
              <option value="Industrial">Industriell</option>
              <!--
            <option value="smartHome">Smart Home</option>
            <option value="industrial">Industriell</option>
            <option value="medical">Medizinisch</option>
            <option value="logistaics">Logistik</option>

            <option value="other">Andere</option>
          -->
            </select>
          </div>

          <label class="form-label">Kurzbeschreibung:</label>
          <textarea class="form-control" v-model="form.descriptionSummary" rows="3" placeholder="Bitte beschreiben Sie das Produkt in wenigen Sätzen, nennen Sie besondere Merkmale etc."></textarea>

          <label class="form-label mt-3">Schlagwörter:</label>
          <TagSelectorElement v-model="form.tags" placeholder="Geben Sie ein Schlagwort ein und drücken Sie Enter, um ein Schlagwort hinzuzufügen" />
        </div>

        <div v-if="step === 2">
          <h4>Falls vorhanden, geben Sie bitte einen Link zu der zugehörigen Companion-Smartphone-App aus dem jeweiligen Appstore an</h4>
          <h4><i class="bi bi-google-play"></i> Android-App:</h4>
          <TextInputElement
            v-model="form.androidAppLink"
            label="Link zu der Android-App"
            placeholder="z.B. https://play.google.com/store/apps/details?id=com.sonos.acr2"
            autocomplete="false"
            class="mt-3"
          />

          <h4 class="mt-3"><i class="bi bi-apple"></i> iOS-App:</h4>
          <TextInputElement v-model="form.iosAppLink" label="Link zu der iOS-App" placeholder="z.B. https://apps.apple.com/de/app/sonos/id1488977981" autocomplete="false" class="mt-3" />

          <br />
          <!-- Secure Data Transmission -->
          <CheckboxElement
            v-model="form.appCanRegister"
            label="Wird eine Accountregistrierung (z.B. mit E-Mail + Passwort) vorgeschlagen?"
            description="Wird eine Accountregistrierung beim Start der App vorgeschlagen?"
          />

          <CheckboxElement v-if="form.appCanRegister" v-model="form.appAccountSkippable" label="Lassen sich App und Gerät auch ohne Account benutzen? Ist die Accountregistrierung überspringbar?" />

          <CheckboxElement v-if="form.appAccountSkippable" v-model="form.appRestrictedWithoutAccount" label="Ist auch ohne Account der volle Funktionsumfang gegeben?" />

          <CheckboxElement v-model="form.appHasPaywall" label="Werden Funktionen des Geräts oder der App erst gegen Bezahlung freigeschaltet?" />
        </div>

        <div v-if="step === 3">
          <h4>
            Bitte laden Sie Produktbilder des <u><b>Geräts</b></u> hoch und wählen Sie anschließend ein Titelbild aus:
          </h4>
          <UploadFileElement
            :files="imageFiles"
            accept="image/png, image/jpeg"
            :multiple="true"
            :imagePreview="true"
            :fileSelectable="true"
            v-model:selected-id="selectedTitleImageFileId"
            class="mb-3"
          />

          <div v-if="form.androidAppLink || form.iosAppLink">
            <hr />

            <h4>Companion App</h4>
            <h4>
              Optional: Laden Sie Bilder von der <u><b>Smartphone-App</b></u> hoch:
            </h4>

            <UploadFileElement :files="appImageFiles" accept="image/png, image/jpeg" :multiple="true" :imagePreview="true" class="mb-3" />
          </div>
        </div>

        <!-- Seite 5 -->
        <div v-if="step === 4">
          <h4>Falls Sie den Netzwerkverkehr des Geräts aufgezeichnet haben, laden Sie die Paketaufzeichnungsdatei (.pcap) hoch:</h4>

          <UploadFileElement :files="pcapFiles" accept=".pcap,.pcapng,*" :multiple="false" :maxFiles="1" />

          <TextInputElement v-model="form.pcapMac" label="MAC-Adresse des Geräts" placeholder="AA:BB:CC:DD:EE:FF" @input="formatMac" maxlength="17" autocomplete="false" class="mt-3" />

          <div class="small text-muted mt-3">
            Die MAC-Adresse wird benötigt, damit der Netzwerkverkehr dem Gerät korrekt zugeordnet werden kann. Wird das Feld ausgelassen, dann wird sämtlicher Netzwerkverkehr ausgewertet.
          </div>

          <div v-if="form.androidAppLink || form.iosAppLink">
            <hr />

            <h4>Companion App</h4>
            <h4>Falls Sie den Netzwerkverkehr der Companion-App aufgezeichnet haben, laden Sie bitte die zugehörige Paketaufzeichnungsdatei (.pcap) hoch:</h4>
            <UploadFileElement :files="appPcapFiles" accept=".pcap,.pcapng,*" :multiple="false" :maxFiles="1" />
          </div>
        </div>

        <!-- Seite 6 -->
        <div v-if="step === 5">
          <div class="mb-3">
            <h4>Bitte geben Sie einen Link zu der Datenschutzerklärung des Gerätes an:</h4>
            <TextInputElement v-model="form.privacyPolicyLink" label="Link zu der Datenschutzerklärung" placeholder="https://..." autocomplete="false" class="mt-3" />
          </div>

          <!--
        <div class="d-flex align-items-center my-3" v-if="!form.privacyPolicyLink && privacyPolicyFiles.length == 0">
          <hr class="flex-grow-1">
          <span class="mx-3 text-muted">oder</span>
          <hr class="flex-grow-1">
        </div>
        -->

          <div v-if="form.privacyPolicyLink">
            <h4>Optional, falls gewünscht: Bitte wählen Sie eine Datenschutzerklärung im .txt oder .html-Format aus:</h4>
            <UploadFileElement :files="privacyPolicyFiles" accept=".txt,.html,*" :multiple="false" :maxFiles="1" />
          </div>

          <div class="small text-muted mt-3">
            Die Datenschutzerklärung wird automatisiert von dem von Ihnen angegebenen Link abgerufen und ausgewertet. Sie können zusätzlich eigene Dateien im HTML-Format hochladen, falls die
            Datenschutzerklärung nicht per Link abrufbar ist.
          </div>
        </div>

        <!-- Seite 7 -->
        <div v-if="step === 6">
          <h4>Optional, falls gewünscht: Bitte laden Sie eine Firmwaredatei hoch. Wir prüfen automatisch auf Schwachstellen und mögliche Probleme:</h4>

          <UploadFileElement :files="firmwareFiles" accept="*" :multiple="false" :maxFiles="1" />

          <div class="small text-muted mt-3">
            Die automatisierte Firmwareanalyse wird von <a href="https://www.onekey.com/de">ONEKEY</a> bereitgestellt. Der Prozess kann einige Zeit in Anspruch nehmen.
          </div>
        </div>

        <!-- Seite 8: Privacy-Eigenschaften -->
        <div v-if="step === 7">
          <h4>Privatheitseigenschaften (optional)</h4>
          <p class="text-muted small">
            Diese Eigenschaften können (noch) nicht automatisch aus Datenschutzerklärung, Netzwerkmitschnitt oder Firmware-Analyse ermittelt werden. Alle Angaben sind optional - überspringen Sie
            einfach, was Sie nicht wissen oder wofür Sie keine Angabe machen möchten.
          </p>

          <div v-for="group in groupedPrivacyProperties" :key="group.category" class="mb-4">
            <h5 class="border-bottom pb-1 mb-3">{{ group.category }}</h5>

            <div v-for="prop in group.items" :key="prop.id" class="mb-4">
              <label class="form-label fw-semibold">
                {{ prop.title }}
                <!-- <span class="badge bg-secondary ms-1" :title="'Priorität ' + prop.priority">P{{ prop.priority }}</span> -->
              </label>
              <div class="small text-muted mb-2">{{ prop.description }}</div>

              <!-- Ja/Nein -->
              <template v-if="prop.type === 'binary' || prop.type === 'binary_image'">
                <div class="btn-group mb-2" role="group">
                  <input type="radio" class="btn-check" :name="'pp-' + prop.id" :id="'pp-' + prop.id + '-yes'" :value="true" v-model="privacyProperties[prop.id].value" />
                  <label class="btn btn-outline-success" :for="'pp-' + prop.id + '-yes'">Ja</label>

                  <input type="radio" class="btn-check" :name="'pp-' + prop.id" :id="'pp-' + prop.id + '-no'" :value="false" v-model="privacyProperties[prop.id].value" />
                  <label class="btn btn-outline-danger" :for="'pp-' + prop.id + '-no'">Nein</label>

                  <input type="radio" class="btn-check" :name="'pp-' + prop.id" :id="'pp-' + prop.id + '-unknown'" :value="null" v-model="privacyProperties[prop.id].value" />
                  <label class="btn btn-outline-secondary" :for="'pp-' + prop.id + '-unknown'">Unbekannt</label>
                </div>

                <input type="text" class="form-control form-control-sm" v-model="privacyProperties[prop.id].note" placeholder="Optionale Anmerkung / Quelle" />
              </template>

              <!-- Bild-Upload -->
              <template v-if="prop.type === 'binary_image'">
                <div class="mt-2">
                  <label class="form-label small">Nachweis (Screenshot):</label>
                  <input type="file" class="form-control form-control-sm" accept="image/png, image/jpeg" @change="(e) => onPrivacyPropertyImageSelected(prop.id, e)" />
                  <img v-if="privacyProperties[prop.id].imagePreviewUrl" :src="privacyProperties[prop.id].imagePreviewUrl" class="img-thumbnail mt-2" style="max-height: 150px" />
                </div>
              </template>

              <!-- Liste -->
              <template v-if="prop.type === 'list'">
                <TagSelectorElement v-model="privacyProperties[prop.id].items" placeholder="Wert eingeben und Enter drücken, um hinzuzufügen" />
              </template>

              <!-- Feste Berechtigungs-Checkliste -->
              <template v-if="prop.type === 'permission_checklist'">
                <div class="row row-cols-2 row-cols-md-3 g-2">
                  <div class="col" v-for="perm in APP_PERMISSIONS" :key="perm">
                    <div class="form-check">
                      <input class="form-check-input" type="checkbox" :id="'pp-' + prop.id + '-' + perm" :value="perm" v-model="privacyProperties[prop.id].items" />
                      <label class="form-check-label small" :for="'pp-' + prop.id + '-' + perm">{{ perm }}</label>
                    </div>
                  </div>
                </div>
              </template>

              <!-- Freitext -->
              <template v-if="prop.type === 'text'">
                <textarea class="form-control form-control-sm" rows="2" v-model="privacyProperties[prop.id].note"></textarea>
              </template>
            </div>
          </div>
        </div>

        <!-- Seite 9: Zusammenfassung -->
        <div v-if="step === 8">
          <div class="d-flex flex-column align-items-center">
            <img v-if="titleImagePreviewUrl" :src="titleImagePreviewUrl" class="img-thumbnail" style="max-width: 200px" alt="Titelbild" />
          </div>

          <ul class="list-group list-group-flush card">
            <li class="list-group-item d-flex justify-content-between">
              <span class="fw-semibold">Hersteller:</span>
              <span>{{ form.manufacturer }}</span>
            </li>

            <li class="list-group-item d-flex justify-content-between">
              <span class="fw-semibold">Modell:</span>
              <span>{{ form.modelName }}</span>
            </li>

            <li class="list-group-item d-flex justify-content-between">
              <span class="fw-semibold">Produktkategorie:</span>
              <span>{{ form.productCategory }}</span>
            </li>

            <li class="list-group-item d-flex justify-content-between">
              <span class="fw-semibold">Bescheribung:</span>
              <span>{{ form.descriptionSummary }}</span>
            </li>

            <li class="list-group-item d-flex justify-content-between">
              <span class="fw-semibold">Tags:</span>

              <span v-if="form.tags.length > 0">{{ joinedTags }}</span>
              <span v-else>Keine</span>
            </li>

            <li class="list-group-item d-flex justify-content-between">
              <span class="fw-semibold">Bilder:</span>
              <span>{{ imageFiles.length }}</span>
            </li>

            <li class="list-group-item d-flex justify-content-between">
              <span class="fw-semibold">Paketaufzeichnungen:</span>
              <span>{{ pcapFiles.length }}</span>
            </li>

            <li class="list-group-item d-flex justify-content-between">
              <span class="fw-semibold">Datenschutzerklärungen:</span>
              <span>{{ privacyPolicyFiles.length }}</span>
            </li>

            <li class="list-group-item d-flex justify-content-between">
              <span class="fw-semibold">Link zur Datenschutzerklärung:</span>
              <span>{{ form.privacyPolicyLink }}</span>
            </li>
          </ul>

          <label class="alert alert-info w-100 mt-3" role="alert" for="agreeRights">
            <input class="form-check-input me-2" type="checkbox" value="" id="agreeRights" v-model="rightTransferAgreed" />
            <span> Ich stimme zu, dass ich alle Rechte an den übermittelten Daten an die Plattform "Unboxing IoT Privacy" abgebe </span>
          </label>
        </div>

        <hr />

        <div v-if="message" class="alert" :class="messageClass">{{ message }}</div>

        <div
          class="col-12 mt-3 d-flex"
          :class="{
            'justify-content-between': step > minStep && step <= maxStep, // Mittendrin
            'justify-content-end': step == minStep, // Nur 1 button
          }"
        >
          <ButtonElement v-if="step > minStep" class="btn-secondary" :onClick="prevStep"> Zurück</ButtonElement>
          <ButtonElement v-if="step < maxStep && ((step === 0 && form.manufacturer && form.modelName) || (step === 1 && form.descriptionSummary) || step > 1)" class="btn-primary" :onClick="nextStep">
            {{ (!form.pcapFiles && step === 4) || (step === 6 && !form.firmwareFiles) ? 'Überspringen' : 'Weiter' }}
          </ButtonElement>

          <span
            ref="rightTransferAgreedWrapper"
            v-show="step == maxStep"
            tabindex="0"
            data-bs-toggle="tooltip"
            data-bs-placement="top"
            :title="rightTransferAgreed ? '' : 'Bitte akzeptieren Sie die Bedingung.'"
          >
            <ButtonElement v-if="step == maxStep" class="btn-primary" :onClick="handleSubmit" :extra-disabled="!rightTransferAgreed"> Veröffentlichen </ButtonElement>
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, computed, onMounted, watch } from 'vue'
import { dataApi } from '@/api/dataApi'
import { useRouter } from 'vue-router'
import { localization } from '@/locales/localization'

// Elements
import BreadcrumbWizard from '@/components/BreadcrumbWizard.vue'
import TagSelectorElement from '@/components/TagSelectorElement.vue'
import UploadFileElement from '@/components/UploadFileElement.vue'
import ButtonElement from '@/components/ButtonElement.vue'
import TextInputElement from '@/components/TextInputElement.vue'
import CheckboxElement from '@/components/CheckboxElement.vue'

const steps = [
  { id: 0, label: 'Hersteller und Modell', tooltip: 'Angabe von dem Hersteller und Modellbezeichner des IoT-Geräts' },
  { id: 1, label: 'Produktbeschreibung', tooltip: 'Angabe von Kategorie und Produktbeschreibung sowie Schlagwörter des IoT-Geräts' },
  { id: 2, label: 'Companion-App', tooltip: 'Smartphone-App' },
  { id: 3, label: 'Bilder', tooltip: 'Hochladen von Produktbildern' },
  { id: 4, label: 'Netzwerkmitschnitt', tooltip: 'Hochladen eines Netzwerkmitschnitts, MAC-Adresse' },
  { id: 5, label: 'Datenschutzerklärung', tooltip: 'Hochladen einer Datenschutzerklärung' },
  { id: 6, label: 'Firmware', tooltip: 'Hochladen eines Firmwareabbilds' },
  { id: 7, label: 'Privacy-Eigenschaften', tooltip: 'Manuelle Angaben zu Privacy-Eigenschaften, die nicht automatisch erkannt werden können' },
  { id: 8, label: 'Zusammenfassung', tooltip: 'Finale Übersicht' },
]

const router = useRouter()

const minStep = ref(0)
const maxStep = ref(steps[steps.length - 1].id)
const step = ref(0)
const maxStepVisited = ref(0)

const rightTransferAgreed = ref(false)
const rightTransferAgreedWrapper = ref(null)
watch(rightTransferAgreed, () => {
  const tooltip = window.bootstrap.Tooltip.getInstance(rightTransferAgreedWrapper.value)

  if (rightTransferAgreed.value) {
    tooltip?.disable()
  } else {
    tooltip?.enable()
  }
})

//const titleImageFiles = ref([]);//
const imageFiles = ref([])
const appImageFiles = ref([])
const selectedTitleImageFileId = ref(null)

const pcapFiles = ref([])
const appPcapFiles = ref([])
const privacyPolicyFiles = ref([])
const firmwareFiles = ref([])

// --- PRIVACY-EIGENSCHAFTEN START ---

const PRIVACY_PROPERTY_DEFINITIONS = [
  { id: 'PPX1', title: 'Aktualisierbarkeit', category: 'Sicherheit und technische Maßnahmen', priority: 1, type: 'binary', description: 'Können Firmware-Updates durchgeführt werden?' },
  {
    id: 'PP47',
    title: 'TLS-Zertifikatsprüfung',
    category: 'Sicherheit und technische Maßnahmen',
    priority: 1,
    type: 'binary',
    description: 'Werden TLS-Zertifikate bei verschlüsselter Übertragung validiert?',
  },
  /*
  { id: 'PP02', title: 'Unterstützung bei Compliance', category: 'Unterstützung', priority: 1, type: 'binary', description: 'Ob der Hersteller Informationen zur Einhaltung von Vorschriften bereitstellt (z. B. Privatsphäre für Umstehende)' },
  { id: 'PP04', title: 'Sichere und datenschutzfreundliche Standardeinstellungen', category: 'Sicherheit und technische Maßnahmen', priority: 1, type: 'binary', description: 'Ob das Gerät mit sicheren und datenschutzfreundlichen Standardeinstellungen ausgeliefert wird' },
  { id: 'PP05', title: 'Zurücksetzen auf sichere Standardeinstellungen', category: 'Sicherheit und technische Maßnahmen', priority: 1, type: 'binary', description: 'Ob das Gerät auf sichere und datenschutzfreundliche Standardeinstellungen zurückgesetzt werden kann' },
  { id: 'PP08', title: 'Kontrolle der verarbeiteten Daten', category: 'Kontrolle', priority: 1, type: 'binary', description: 'Ob ausgewählt werden kann, welche Daten verarbeitet werden' },
  { id: 'PP09', title: 'Kontrolle der Datenempfänger', category: 'Kontrolle', priority: 1, type: 'binary', description: 'Ob ausgewählt werden kann, welche Empfänger Daten erhalten' },
 // { id: 'PP16', title: 'Benötigte App-Berechtigungen', category: 'Funktion', priority: 1, type: 'permission_checklist', description: 'Welche Zugriffsberechtigungen die Companion-App benötigt' },
  { id: 'PP21', title: 'Authentifizierungsmethoden', category: 'Sicherheit und technische Maßnahmen', priority: 1, type: 'list', description: 'Welche Authentifizierungsmethoden das Gerät anbietet' },
  { id: 'PP22', title: 'Privatsphäre-Einstellungsoberfläche', category: 'Nutzbarkeit', priority: 1, type: 'binary_image', description: 'Ob es Privatsphäre-bezogene Einstellungen gibt' },
  { id: 'PP34', title: 'Kontrolle des Verarbeitungsorts der Daten', category: 'Kontrolle', priority: 1, type: 'binary', description: 'Ob der Ort, an dem Daten verarbeitet werden, vom Nutzer gewählt werden kann' },
  { id: 'PP36', title: 'Verwaltung mehrerer Nutzerkonten', category: 'Funktion', priority: 1, type: 'binary', description: 'Ob mehrere Nutzerprofile verwaltet werden können' },
  { id: 'PP41', title: 'Datenübertragbarkeit', category: 'Kontrolle', priority: 1, type: 'binary', description: 'Ob Daten vom Gerät auf andere Geräte übertragen werden können' },
  { id: 'PP43', title: 'Aktualisierbarkeit', category: 'Sicherheit und technische Maßnahmen', priority: 1, type: 'binary', description: 'Ob das Gerät aktualisiert werden kann' },
  { id: 'PP47', title: 'TLS-Zertifikatsprüfung', category: 'Sicherheit und technische Maßnahmen', priority: 1, type: 'binary', description: 'Ob TLS-Zertifikate bei verschlüsselter Übertragung geprüft werden' },
  { id: 'PP55', title: 'Steuerbare Sichtbarkeit im Netzwerk', category: 'Funktion', priority: 1, type: 'binary', description: 'Ob die Suche im lokalen Netzwerk deaktiviert werden kann' },
  { id: 'PP01', title: 'Einhaltung des Cyber Resilience Act', category: 'Transparenz', priority: 2, type: 'binary', description: 'Ob das Gerät die Anforderungen des Cyber Resilience Act erfüllt' },
  { id: 'PP13', title: 'Verfügbarkeit von Verträgen für gemeinsame Verantwortliche/Auftragsverarbeiter', category: 'Unterstützung', priority: 2, type: 'binary', description: 'Ob der Hersteller Vertragsvorlagen für eine gemeinsame Verantwortlichkeit/Auftragsverarbeitung bereitstellt' },
  //{ id: 'PP23', title: 'Visuelle Darstellung des Datenflusses', category: 'Nutzbarkeit', priority: 2, type: 'binary_image', description: 'Ob eine Visualisierung der Datenflüsse bereitgestellt wird' },
  { id: 'PP25', title: 'Kontextbezogene Datenoffenlegung', category: 'Nutzbarkeit', priority: 2, type: 'binary', description: 'Ob das Gerät beim Offenlegen von Daten kontextbezogene Informationen bereitstellt' },
  { id: 'PP26', title: 'Zusätzliche Transparenzmechanismen', category: 'Nutzbarkeit', priority: 2, type: 'list', description: 'Ob das Gerät zusätzliche Transparenzmechanismen bereitstellt' },
  { id: 'PP27', title: 'Unterschiedliche Detailtiefe der Privatsphäre-Einstellungen', category: 'Nutzbarkeit', priority: 2, type: 'binary', description: 'Ob Privatsphäre-Einstellungen in unterschiedlichen Detailstufen verfügbar sind' },
  { id: 'PP31', title: 'Anzeige des (Sicherheits-)Update-Status', category: 'Sicherheit und technische Maßnahmen', priority: 2, type: 'binary', description: 'Ob der Status von Sicherheitsupdates angezeigt wird' },
  { id: 'PP33', title: 'Untersuchungsfunktionen', category: 'Nutzbarkeit', priority: 2, type: 'binary', description: 'Ob das Gerät Funktionen zur Untersuchung bereitstellt (z. B. Fehlerprotokolle)' },
  { id: 'PP44', title: 'Historie von Datenlecks', category: 'Sicherheit und technische Maßnahmen', priority: 2, type: 'list', description: 'Welche Datenleck-Vorfälle in der Vergangenheit beim Hersteller aufgetreten sind' },
  { id: 'PP45', title: 'Datenschutzverletzungen', category: 'Sicherheit und technische Maßnahmen', priority: 2, type: 'list', description: 'Welche Datenschutzverletzungen in der Vergangenheit beim Hersteller aufgetreten sind' },
  { id: 'PP46', title: 'Open Source', category: 'Funktion', priority: 2, type: 'binary', description: 'Ob das Gerät auf Open-Source-Software basiert' },
  { id: 'PP20', title: 'Optionale Sicherheitsüberprüfung', category: 'Sicherheit und technische Maßnahmen', priority: 3, type: 'binary', description: 'Ob es zusätzliche Sicherheitsuntersuchungen für das Gerät gibt' },
  { id: 'PP32', title: 'Erkundungsfunktionen', category: 'Nutzbarkeit', priority: 3, type: 'binary', description: 'Ob das Gerät die Erkundung von Systeminteraktionen unterstützt (z. B. Liste der Kommunikation, Visualisierung von Aktivitäten)' },
  { id: 'PP34b', title: 'Benachrichtigung bei Handlungsbedarf', category: 'Nutzbarkeit', priority: 3, type: 'binary', description: 'Ob das Gerät den Nutzer benachrichtigt, wenn eine Handlung erforderlich ist' },
  { id: 'PP39', title: 'Nutzerinteraktion', category: 'Nutzbarkeit', priority: 3, type: 'binary', description: 'Ob Nutzer mit dem Gerät interagieren können' },
  */
]

const APP_PERMISSIONS = [
  'Kamera',
  'Mikrofon',
  'Standort (genau)',
  'Standort (ungefähr)',
  'Kontakte',
  'Kalender',
  'Telefonanrufe',
  'SMS/Nachrichten',
  'Speicher/Dateien',
  'Fotos/Medien',
  'Bluetooth',
  'WLAN-Informationen',
  'Körper-/Gesundheitssensoren',
  'Benachrichtigungen',
  'Konten',
  'Bewegungsdaten (Aktivitätserkennung)',
  'Netzwerkzugriff (Internet)',
]

const privacyProperties = reactive({})
PRIVACY_PROPERTY_DEFINITIONS.forEach((prop) => {
  if (prop.type === 'list' || prop.type === 'permission_checklist') {
    privacyProperties[prop.id] = { items: [] }
  } else if (prop.type === 'binary_image') {
    privacyProperties[prop.id] = { value: null, note: '', imageFile: null, imagePreviewUrl: null }
  } else {
    privacyProperties[prop.id] = { value: null, note: '' }
  }
})

const groupedPrivacyProperties = computed(() => {
  const groups = {}
  for (const prop of PRIVACY_PROPERTY_DEFINITIONS) {
    if (!groups[prop.category]) groups[prop.category] = []
    groups[prop.category].push(prop)
  }
  return Object.keys(groups)
    .sort()
    .map((category) => ({
      category,
      items: groups[category].sort((a, b) => a.priority - b.priority),
    }))
})

const onPrivacyPropertyImageSelected = (propId, event) => {
  const file = event.target.files?.[0]
  if (!file) return
  privacyProperties[propId].imageFile = file
  privacyProperties[propId].imagePreviewUrl = URL.createObjectURL(file)
}

const buildPrivacyPropertiesPayload = () => {
  const payload = {}
  for (const prop of PRIVACY_PROPERTY_DEFINITIONS) {
    const entry = privacyProperties[prop.id]
    if (prop.type === 'list' || prop.type === 'permission_checklist') {
      if (entry.items.length > 0) payload[prop.id] = { items: entry.items }
    } else {
      const hasValue = entry.value !== null || (entry.note && entry.note.trim() !== '')
      if (hasValue) {
        payload[prop.id] = { value: entry.value, note: entry.note || '' }
      }
    }
  }
  return payload
}
// --- PRIVACY-EIGENSCHAFTEN ENDE ---

const isSubmitting = ref(false)

const message = ref(null)
const messageClass = ref('alert-info')
const setMessage = (text, cls = 'alert-info') => {
  message.value = text
  messageClass.value = cls
}

const formatMac = () => {
  form.pcapMac =
    form.pcapMac
      .replace(/[^0-9a-fA-F]/g, '')
      .toUpperCase()
      .match(/.{1,2}/g)
      ?.join(':') || ''
}

const formatSize = (bytes) => {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

function nextStep() {
  if (step.value < maxStep.value) {
    step.value++
    if (maxStepVisited.value < step.value) {
      maxStepVisited.value = step.value
    }
  }
}

function prevStep() {
  if (step.value > minStep.value) {
    step.value--
  }
}

function setStep(i) {
  step.value = i
}

const form = reactive({
  manufacturer: '',
  modelName: '',
  descriptionSummary: '',
  productCategory: '',
  tags: [],
  pcapMac: '',
  privacyPolicyLink: '',
  androidAppLink: '',
  iosAppLink: '',
  appCanRegister: false,
  appAccountSkippable: false,
  appNoAccountAllFeatures: false,
  appHasPaywall: false,
})

const joinedTags = computed(() => {
  return form.tags.join(', ')
})

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

const titleImagePreviewUrl = computed(() => {
  const selectedFileObj = imageFiles.value.find((f) => f.localFileId === selectedTitleImageFileId.value)
  if (selectedFileObj && selectedFileObj.file) {
    return URL.createObjectURL(selectedFileObj.file)
  }
  return null
})

const handleSubmit = async () => {
  isSubmitting.value = true

  try {
    setMessage('Lege neuen Eintrag an...')

    // Create entry
    let res = await dataApi.put('/entry', {
      manufacturer: form.manufacturer,
      model: form.modelName,
      categories: [form.productCategory], // TODO
      model_year: 0, // TODO
      model_version: '', // TODO
      description: form.descriptionSummary,
      tags: form.tags,
      companion_app_links: { ios: form.iosAppLink, android: form.androidAppLink },
      companion_app_options: {
        canRegister: form.appCanRegister,
        accountSkippable: form.appAccountSkippable,
        noAccountAllFeatures: form.appNoAccountAllFeatures,
        paywall: form.appHasPaywall,
      },
      // Endpunkt noch nicht mit Backend abgestimmt

      privacy_properties: buildPrivacyPropertiesPayload(),
    })

    const createdEntry = res.data
    console.log('Created entry', createdEntry)

    // Nachweis-Bilder für Privacy-Properties hochladen
    // Endpunkt noch nicht mit Backend abgestimmt
    for (const prop of PRIVACY_PROPERTY_DEFINITIONS) {
      const entry = privacyProperties[prop.id]
      if (entry?.imageFile) {
        setMessage(`Lade Nachweis-Bild für ${prop.id} hoch...`)
        try {
          const formData = new FormData()
          formData.append('file_upload', entry.imageFile)
          formData.append('property_id', prop.id)
          res = await dataApi.post('/upload/privacy_property_image/' + createdEntry.id, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          })
          console.log('Privacy property image upload', prop.id, res.data)
        } catch (err) {
          console.log('Failed to upload privacy property image for', prop.id, err)
          const error_code = err.response?.data?.code
          setMessage(`Fehler beim Hochladen des Nachweis-Bilds für ${prop.id}: ` + (error_code ? localization.t(error_code) : 'Unbekannter Fehler'), 'alert-danger')
          await sleep(2000)
          setMessage('Ich fahre aber trotzdem fort ;)', 'alert-info')
          await sleep(1000)
        }
      }
    }

    // Upload title image
    /*
    if (titleImageFiles.value.length > 0) {
      setMessage('Lade titelbild hoch...')

      const formData = new FormData();
      formData.append("file_upload", titleImageFiles.value[0].file);

      res = await dataApi.post('/upload/image/' + createdEntry.id, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (p) => {
          const progress = Math.round((p.loaded / p.total) * 100);

          setMessage('Lade Titelbild hoch... ' + progress + '%')
        }
      })

      const createdImage = res.data
      console.log('Created image', createdImage)

      // Set image as title image
      try {
        res = await dataApi.post('/upload/title_image', { entry_id: createdEntry.id, image_id: createdImage.image_id })
        console.log('Set title image', res.data)
      } catch (err) {
        console.log('Failed to set title image')
        const error_code = err.response.data.code
        setMessage('Fehler beim festlegen des titelbilds: ' + localization.t(error_code), 'alert-danger')
        await sleep(2000)
        setMessage('Ich fahre aber trotzdem fort ;)', 'alert-info')
        await sleep(1000)
      }
    }
    */

    // Upload images TODO more?
    if (imageFiles.value.length > 0) {
      setMessage('Lade Bilder hoch... ')

      let i = 1
      for (const obj of imageFiles.value) {
        const formData = new FormData()
        formData.append('file_upload', obj.file)

        const isTitleImage = obj.localFileId == selectedTitleImageFileId.value

        res = await dataApi.post('/upload/image/' + createdEntry.id, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
          onUploadProgress: (p) => {
            const progress = Math.round((p.loaded / p.total) * 100)

            setMessage('Lade Bild ' + i + '/' + imageFiles.value.length + ' hoch... ' + progress + '%')
          },
        })
        console.log('Image upload', res.data)

        // Set image as title image
        if (isTitleImage) {
          try {
            res = await dataApi.post('/upload/title_image', { entry_id: createdEntry.id, image_id: res.data.image_id })
            console.log('Set title image', res.data)
          } catch (err) {
            console.log('Failed to set title image')
            const error_code = err.response.data.code
            setMessage('Fehler beim festlegen des titelbilds: ' + localization.t(error_code), 'alert-danger')
            await sleep(2000)
            setMessage('Ich fahre aber trotzdem fort ;)', 'alert-info')
            await sleep(1000)
          }
        }

        i = i + 1
      }
    }

    // Upload pcaps
    if (pcapFiles.value.length > 0) {
      setMessage('Lade pcap hoch... ')

      // Fetch upload-id before it even exists???
      res = await dataApi.get('/upload-id/' + createdEntry.id)
      const uploadId = res.data.upload_id
      console.log('upload-id', uploadId)

      let i = 1
      for (const obj of pcapFiles.value) {
        const fileType = obj.file.name.split('.').pop()

        const formData = new FormData()
        formData.append('chunk', obj.file)
        formData.append('upload_id', uploadId)
        formData.append('chunk_index', 0)
        formData.append('total_chunks', 1)
        formData.append('file_type', fileType)

        res = await dataApi.post('/upload/net/chunk', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
          onUploadProgress: (p) => {
            const progress = Math.round((p.loaded / p.total) * 100)

            setMessage('Lade PCAP ' + i + '/' + pcapFiles.value.length + ' hoch... ' + progress + '%')
          },
        })
        console.log('Pcap upload', res.data)
        i = i + 1
      }

      // Set pcap as completed
      try {
        res = await dataApi.post('/upload/net/complete', { upload_id: uploadId, mac_address: form.pcapMac, upload_type: 'device' })

        console.log('Pcap analyze start', res.data)
      } catch (err) {
        console.log('Failed to set title image')
        const error_code = err.response.data.code
        setMessage('Fehler beim starten der pcap-analyse: ' + localization.t(error_code), 'alert-danger')
        await sleep(2000)
        setMessage('Ich fahre aber trotzdem fort ;)', 'alert-info')
        await sleep(1000)
      }
    }
    // Do the exact same for the app pcap
    if (appPcapFiles.value.length > 0) {
      setMessage('Lade app-pcap hoch... ')

      // Fetch upload-id before it even exists???
      res = await dataApi.get('/upload-id/' + createdEntry.id)
      const uploadId = res.data.upload_id
      console.log('upload-id', uploadId)

      let i = 1
      for (const obj of appPcapFiles.value) {
        const fileType = obj.file.name.split('.').pop()

        const formData = new FormData()
        formData.append('chunk', obj.file)
        formData.append('upload_id', uploadId)
        formData.append('chunk_index', 0)
        formData.append('total_chunks', 1)
        formData.append('file_type', fileType)

        res = await dataApi.post('/upload/net/chunk', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
          onUploadProgress: (p) => {
            const progress = Math.round((p.loaded / p.total) * 100)

            setMessage('Lade app-PCAP ' + i + '/' + appPcapFiles.value.length + ' hoch... ' + progress + '%')
          },
        })
        console.log('Pcap upload', res.data)
        i = i + 1
      }

      // Set pcap as completed
      try {
        res = await dataApi.post('/upload/net/complete', { upload_id: uploadId, mac_address: '', upload_type: 'app' })

        console.log('Pcap analyze start', res.data)
      } catch (err) {
        console.log('Failed to set title image')
        const error_code = err.response.data.code
        setMessage('Fehler beim starten der pcap-analyse: ' + localization.t(error_code), 'alert-danger')
        await sleep(2000)
        setMessage('Ich fahre aber trotzdem fort ;)', 'alert-info')
        await sleep(1000)
      }
    }
    //////

    // Upload Privacy policy

    if (form.privacyPolicyLink.length > 0) {
      // Set privacy policy by url
      try {
        res = await dataApi.post('/upload/policy/direct', { entry_id: createdEntry.id, type: 'url', content: form.privacyPolicyLink })

        console.log('Set privacy policy url', res.data)
      } catch (err) {
        console.log('Failed to add policy link')
        const error_code = err.response.data.code
        setMessage('Fehler beim setzen der policy url: ' + localization.t(error_code), 'alert-danger')
        await sleep(5000)
        setMessage('Ich fahre aber trotzdem fort ;)', 'alert-info')
        await sleep(1000)
      }
    }

    if (privacyPolicyFiles.value.length > 0) {
      // Set privacy policy by link

      setMessage('Lade Datenschutzerklärung hoch... ')

      // Fetch upload-id before it even exists???
      res = await dataApi.get('/upload-id/' + createdEntry.id)
      const uploadId = res.data.upload_id
      console.log('upload-id', uploadId)

      let i = 1
      for (const obj of privacyPolicyFiles.value) {
        const fileType = obj.file.name.split('.').pop()

        const formData = new FormData()
        formData.append('chunk', obj.file)
        formData.append('upload_id', uploadId)
        formData.append('chunk_index', 0)
        formData.append('total_chunks', 1)
        formData.append('file_type', fileType)

        res = await dataApi.post('/upload/policy/chunk', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
          onUploadProgress: (p) => {
            const progress = Math.round((p.loaded / p.total) * 100)

            setMessage('Lade Policy ' + i + '/' + privacyPolicyFiles.value.length + ' hoch... ' + progress + '%')
          },
        })
        console.log('Policy upload', res.data)
        i = i + 1
      }

      // Set policy as completed
      try {
        res = await dataApi.post('/upload/policy/complete', { upload_id: uploadId })

        console.log('Policy completed', res.data)
      } catch (err) {
        console.log('Failed to set policy upload completed')
        const error_code = err.response.data.code
        setMessage('Fehler beim abschließen der Datenschutzerklärung: ' + localization.t(error_code), 'alert-danger')
        await sleep(2000)
        setMessage('Ich fahre aber trotzdem fort ;)', 'alert-info')
        await sleep(1000)
      }
    }

    // Testing
    //const createdEntry = { 'id': '123' }
    //let res = null

    // Firmware
    if (firmwareFiles.value.length > 0) {
      setMessage('Lade Firmware hoch... ')
      const firmwareFile = firmwareFiles.value[0]

      const formData = new FormData()
      formData.append('file', firmwareFile.file)
      formData.append('entry_id', createdEntry.id)
      // Analysis metadata
      formData.append('model_name', form.modelName)
      formData.append('manufacturer_name', form.manufacturer)

      res = await dataApi.post('/upload/firmware', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (p) => {
          const progress = Math.round((p.loaded / p.total) * 100)
          setMessage('Lade Firmware hoch... ' + progress + '%')
        },
      })
      console.log('Firmware upload', res.data)
    }

    setMessage('Erfolg!')

    // Redirect to directly view new entry
    router.push('/device/' + createdEntry.id)
  } catch (err) {
    console.error(err)

    const error_code = err.response.data.code

    // "INVALID_INPUT", Uploaded image format is not supported. Only '.png', '.jpg', and '.jpeg' are allowed.
    setMessage('Fehler: ' + localization.t(error_code), 'alert-danger')
  }

  isSubmitting.value = false
}

onMounted(() => {
  document.querySelectorAll('[data-bs-toggle="tooltip"]').forEach((el) => {
    rightTransferAgreedWrapper.value = el
    new window.bootstrap.Tooltip(el)
  })
})
</script>

<style scoped></style>
