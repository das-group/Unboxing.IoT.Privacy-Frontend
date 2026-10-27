<template>
  <div class="container pt-2 d-flex flex-column" style="max-width: 800px">
    <div class="card shadow-sm">
      <div class="card-body">
        <h3 class="card-title mb-3"><i class="bi bi-person-fill-gear me-2"></i>Kontoeinstellungen</h3>

        <nav>
          <div class="nav nav-tabs" id="nav-tab" role="tablist">
            <button class="nav-link active" data-bs-toggle="tab" data-bs-target="#general" type="button" role="tab" aria-controls="general" aria-selected="true">Allgemein</button>
            <button class="nav-link" data-bs-toggle="tab" data-bs-target="#passkeys" type="button" role="tab" aria-controls="passkeys" aria-selected="false">Passkeys</button>
            <button class="nav-link" data-bs-toggle="tab" data-bs-target="#privacypreferences" type="button" role="tab" aria-controls="privacypreferences" aria-selected="false">
              Privatheitseigenschaften - Präferenzen
            </button>

            <button class="nav-link" data-bs-toggle="tab" data-bs-target="#delete" type="button" role="tab" aria-controls="delete" aria-selected="false">Kontolöschung</button>
          </div>
        </nav>
        <div class="tab-content mt-3" id="nav-tabContent">
          <div class="tab-pane fade show active" role="tabpanel" aria-labelledby="nav-home-tab" id="general">
            <!-- Allgemein -->
            <form @submit.prevent="">
              <div class="mb-3">
                <TextInputElement v-model="email" label="E-Mail Adresse" placeholder="Bitte geben Sie ihre E-Mail Adresse ein..." autocomplete="email" disabled />
              </div>

              <div class="mb-2">
                <TextInputElement v-model="username" label="Benutzername" placeholder="Bitte geben Sie ihren bevorzugten Benutzernamen ein..." autocomplete="username" required />

                <div class="small text-muted mt-3">Einreichungen werden Ihrem Benutzernamen zugeschrieben. Dieser ist öffentlich einsehbar.</div>
              </div>

              <div>
                <ButtonElement class="btn-primary w-100 mt-2" :onClick="updateAccountData"> Daten aktualisieren </ButtonElement>
              </div>
            </form>
          </div>

          <div class="tab-pane fade" role="tabpanel" aria-labelledby="nav-profile-tab" id="passkeys">
            <!-- Passkeys -->
            <ul class="list-group mt-3" v-for="passkey in passkeyList" :key="passkey.id">
              <li class="list-group-item">
                <div class="d-flex justify-content-between align-items-center">
                  <div>
                    <strong>{{ passkey.name }}</strong
                    ><br />
                    <small class="text-muted">{{ new Date(passkey.created_at).toLocaleString() }}</small>
                  </div>

                  <div class="d-flex gap-2">
                    <button class="btn btn-danger btn-sm" @click="deletePasskey(passkey.id)"><i class="bi bi-trash me-2"></i>Entfernen</button>
                  </div>
                </div>
              </li>
            </ul>

            <ButtonElement class="btn-primary w-100 mt-3" :onClick="addPasskey"> Neuen Passkey hinzufügen... </ButtonElement>
          </div>

          <div class="tab-pane fade" role="tabpanel" aria-labelledby="nav-profile-tab" id="privacypreferences">
            <!-- Privacy Properties -->
            <ul class="list-group mt-3">
              <h3>Individuelle Bewertung</h3>

              Um eine individuelle Bewertung auf der Produktansicht zu ermöglichen, müssen Sie ihre Präferenzen auswählen.

              <h6 class="mt-2">Bitte nehmen Sie sich einen Moment Zeit, und wählen Sie Zutreffendes aus.</h6>

              <div v-for="group in groupedPrivacyProperties" :key="group.category" class="mb-4 mt-3">
                <div class="card blog-card shadow-sm">
                  <div class="card-header">
                    <h5 class="card-title">{{ group.category }}</h5>
                  </div>

                  <div class="card-body">
                    <!--
                    <h5 class="border-bottom pb-1 mb-3">{{ group.category }}</h5>
                    -->

                    <div v-for="(prop, index) in group.items" :key="prop.id" class="mb-4">
                      <label class="form-label fw-semibold">
                        {{ prop.title }}
                        <!-- <span class="badge bg-secondary ms-1" :title="'Priorität ' + prop.priority">P{{ prop.priority }}</span> -->
                      </label>
                      <div class="small text-muted mb-2">{{ prop.description }}</div>

                      <div class="small text-muted mb-3" v-if="prop.info">
                        <span class="text-muted ms-1" role="button" tabindex="0" data-bs-toggle="tooltip" :data-bs-title="prop.info">
                          <i class="bi bi-info-circle"></i>
                          Was ist das Risiko dabei?
                        </span>
                      </div>

                      <!-- Ja/Nein -->
                      <template v-if="prop.type === 'binary' || prop.type === 'binary_image'">
                        <div class="btn-group mb-2 w-100" role="group">
                          <input type="radio" class="btn-check" :name="'pp-' + prop.id" :id="'pp-' + prop.id + '-yes'" :value="true" v-model="privacyProperties[prop.id].value" />
                          <label class="btn btn-outline-success" :for="'pp-' + prop.id + '-yes'">Finde ich gut</label>

                          <input type="radio" class="btn-check" :name="'pp-' + prop.id" :id="'pp-' + prop.id + '-unknown'" :value="null" v-model="privacyProperties[prop.id].value" />
                          <label class="btn btn-outline-secondary" :for="'pp-' + prop.id + '-unknown'">Ist mir egal</label>

                          <input type="radio" class="btn-check" :name="'pp-' + prop.id" :id="'pp-' + prop.id + '-no'" :value="false" v-model="privacyProperties[prop.id].value" />
                          <label class="btn btn-outline-danger" :for="'pp-' + prop.id + '-no'">Finde ich schlecht</label>
                        </div>
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

                      <hr v-if="index < group.items.length - 1" />
                    </div>
                  </div>
                </div>
              </div>
              <li class="list-group-item d-none">
                <!-- Compliance Support -->
                <CheckboxElement
                  v-model="privacypreferences.compliance_support"
                  label="Compliance Support"
                  description="Whether the manufacturer provides information on compliance (e.g., bystander privacy)"
                />

                <!-- Availability of Contracts for Joint Controllers/Processors -->
                <CheckboxElement
                  v-model="privacypreferences.availability_of_contracts_for_joint_controllers_processors"
                  label="Availability of Contracts for Joint Controllers/Processors"
                  description="Whether the manufacturer provides contract templates for a joint controller/processor arrangement"
                />

                <!-- Account Required for Device Bootstrapping -->
                <CheckboxElement
                  v-model="privacypreferences.account_required_for_device_bootstrapping"
                  label="Account Required for Device Bootstrapping"
                  description="Whether an account with an online platform is required for operation"
                />

                <!-- App Permissions Required -->
                <CheckboxElement v-model="privacypreferences.app_permissions_required" label="App Permissions Required" description="What access permissions the companion app requires" />

                <!-- User Access Control -->
                <CheckboxElement v-model="privacypreferences.user_access_control" label="User Access Control" description="Whether it is possible to manage multiple user profiles." />

                <!-- Backend Service Demands -->
                <CheckboxElement v-model="privacypreferences.backend_service_demands" label="Backend Service Demands" description="Whether a backend service is necessary for operation" />

                <!-- Performs Network Discovery -->
                <CheckboxElement v-model="privacypreferences.performs_network_discovery" label="Performs Network Discovery" description="Whether the device searches the local network" />

                <!-- Controllable discovery function -->
                <CheckboxElement
                  v-model="privacypreferences.controllable_discovery_function"
                  label="Controllable discovery function"
                  description="Whether searching the local network can be disabled"
                />

                <!-- Open Source -->
                <CheckboxElement v-model="privacypreferences.open_source" label="Open Source" description="Whether the device is based on open source software" />

                <!-- On‑device data processing -->
                <CheckboxElement v-model="privacypreferences.on_device_data_processing" label="On‑device data processing" description="Which data processing takes place locally on the device" />

                <!-- Secure and Private Default Settings -->
                <CheckboxElement
                  v-model="privacypreferences.secure_and_private_default_settings"
                  label="Secure and Private Default Settings"
                  description="Whether the device comes with secure and privacy‑friendly default settings"
                />

                <!-- Resetting to Secure Default Settings -->
                <CheckboxElement
                  v-model="privacypreferences.resetting_to_secure_default_settings"
                  label="Resetting to Secure Default Settings"
                  description="Whether the device can be reset to secure and privacy‑friendly default settings"
                />

                <!-- Authentication Information -->
                <CheckboxElement v-model="privacypreferences.authentication_information" label="Authentication Information" description="Which authentication methods the device offers" />

                <!-- Secure Data Transmission -->
                <CheckboxElement v-model="privacypreferences.secure_data_transmission" label="Secure Data Transmission" description="Whether the device transmits data via encrypted connections" />

                <!-- TLS Certificate Validation -->
                <CheckboxElement
                  v-model="privacypreferences.tls_certificate_validation"
                  label="TLS Certificate Validation"
                  description="Whether TLS certificates are validated for encrypted transmission"
                />

                <!-- Updateability -->
                <CheckboxElement v-model="privacypreferences.updateability" label="Updateability" description="Whether the device can be updated" />

                <!-- (Security) Update Status Display -->
                <CheckboxElement
                  v-model="privacypreferences.security_update_status_display"
                  label="(Security) Update Status Display"
                  description="Whether the status of security updates is displayed"
                />

                <!-- History of Data Leakage -->
                <CheckboxElement
                  v-model="privacypreferences.history_of_data_leakage"
                  label="History of Data Leakage"
                  description="What data leakage incidents have occurred in the past related to the manufacturer?"
                />

                <!-- Privacy Breaches -->
                <CheckboxElement v-model="privacypreferences.privacy_breaches" label="Privacy Breaches" description="What privacy breaches have occurred in the past related to the manufacturer?" />

                <!-- Encryption Status for User Passwords -->
                <CheckboxElement
                  v-model="privacypreferences.encryption_status_for_user_passwords"
                  label="Encryption Status for User Passwords"
                  description="Whether the user password is stored in encrypted form on the device"
                />

                <!-- Optional Security Review -->
                <CheckboxElement
                  v-model="privacypreferences.optional_security_review"
                  label="Optional Security Review"
                  description="Whether there are additional security investigations for the device"
                />

                <!-- Privacy Enhancing Technologies -->
                <CheckboxElement v-model="privacypreferences.privacy_enhancing_technologies" label="Privacy Enhancing Technologies" description="Which privacy enhancing technologies are used" />

                <!-- Datatypes being processed -->
                <CheckboxElement v-model="privacypreferences.datatypes_being_processed" label="Datatypes being processed" description="What data is processed while operating the device" />

                <!-- Listing non‑Personally Identifiable Information -->
                <CheckboxElement
                  v-model="privacypreferences.listing_non_personally_identifiable_information"
                  label="Listing non‑Personally Identifiable Information"
                  description="What non‑personal data is processed when operating the device"
                />

                <!-- Special Categories of Data -->
                <CheckboxElement
                  v-model="privacypreferences.special_categories_of_data"
                  label="Special Categories of Data"
                  description="What special category data is processed when operating the device?"
                />

                <!-- Data Sharing -->
                <CheckboxElement v-model="privacypreferences.data_sharing" label="Data Sharing" description="What data is shared with third parties" />

                <!-- Recipient of Information -->
                <CheckboxElement v-model="privacypreferences.recipient_of_information" label="Recipient of Information" description="Which data recipients (company, origin) are involved" />

                <!-- Data processing outside the EU -->
                <CheckboxElement v-model="privacypreferences.data_processing_outside_the_eu" label="Data processing outside the EU" description="Whether data is processed outside the EU" />

                <!-- Profiling -->
                <CheckboxElement v-model="privacypreferences.profiling" label="Profiling" description="Whether profiling takes place" />

                <!-- Frequency of data being sent -->
                <CheckboxElement
                  v-model="privacypreferences.frequency_of_data_being_sent"
                  label="Frequency of data being sent"
                  description="On what legal basis the data is processed; How often data is transmitted"
                />

                <!-- Duration of data being stored -->
                <CheckboxElement v-model="privacypreferences.duration_of_data_being_stored" label="Duration of data being stored" description="How long the data is stored" />

                <!-- Actors Involved in the Processing -->
                <CheckboxElement v-model="privacypreferences.actors_involved_in_the_processing" label="Actors Involved in the Processing" description="Which actors are involved in data processing?" />

                <!-- Purpose of data being processed -->
                <CheckboxElement v-model="privacypreferences.purpose_of_data_being_processed" label="Purpose of data being processed" description="For what purposes the data is processed" />

                <!-- Data Minimisation -->
                <CheckboxElement v-model="privacypreferences.data_minimisation" label="Data Minimisation" description="" />

                <!-- Compliance with Cyber Resilience Act -->
                <CheckboxElement
                  v-model="privacypreferences.compliance_cra"
                  label="Compliance with Cyber Resilience Act"
                  description="Whether the device complies with the requirements of the Cyber Resilience Act"
                />

                <!-- Location of data being sent to -->
                <CheckboxElement v-model="privacypreferences.location_of_data_being_sent_to" label="Location of data being sent to" description="Where data is transferred to" />

                <!-- Ensure informed consent to data processing if required -->
                <CheckboxElement
                  v-model="privacypreferences.ensure_informed_consent_to_data_processing"
                  label="Ensure informed consent to data processing if required"
                  description="Whether informed consent to data processing is obtained"
                />

                <!-- Clarification of data processing process -->
                <CheckboxElement
                  v-model="privacypreferences.clarification_of_data_processing_process"
                  label="Clarification of data processing process"
                  description="Whether the processing of data is clearly communicated"
                />

                <!-- Privacy Control Interface -->
                <CheckboxElement v-model="privacypreferences.privacy_control_interface" label="Privacy Control Interface" description="Whether there are privacy‑related settings" />

                <!-- Separate Data Protection Information from Terms & Conditions -->
                <CheckboxElement
                  v-model="privacypreferences.separate_data_protection_information_from_terms_and_conditions"
                  label="Separate Data Protection Information from Terms & Conditions"
                  description="Whether privacy information and terms and conditions are clearly separated from each other"
                />

                <!-- Clear and Transparent Personal Data Processing Information -->
                <CheckboxElement
                  v-model="privacypreferences.clear_and_transparent_personal_data_processing_information"
                  label="Clear and Transparent Personal Data Processing Information"
                  description="Whether clear and transparent information is provided regarding the processing of personal data"
                />

                <!-- Visual Representation of Privacy Flow -->
                <CheckboxElement
                  v-model="privacypreferences.visual_representation_of_privacy_flow"
                  label="Visual Representation of Privacy Flow"
                  description="Whether a visualization of data flows is provided"
                />

                <!-- Different Granularity of Privacy Settings of UI -->
                <CheckboxElement
                  v-model="privacypreferences.different_granularity_of_privacy_settings_of_ui"
                  label="Different Granularity of Privacy Settings of UI"
                  description="Whether privacy settings are available at different levels of granularity"
                />

                <!-- User Interaction and Engagement -->
                <CheckboxElement v-model="privacypreferences.user_interaction_and_engagement" label="User Interaction and Engagement" description="Whether users can interact with the device" />

                <!-- Exploration Functionality -->
                <CheckboxElement
                  v-model="privacypreferences.exploration_functionality"
                  label="Exploration Functionality"
                  description="Whether the device supports exploring system interactions (e.g., list of communications, visualization of activities)"
                />

                <!-- Investigation Functionality -->
                <CheckboxElement
                  v-model="privacypreferences.investigation_functionality"
                  label="Investigation Functionality"
                  description="Whether the device provides functions for investigation (e.g., error logs)"
                />

                <!-- Being notified when something needs attention -->
                <CheckboxElement
                  v-model="privacypreferences.being_notified_when_something_needs_attention"
                  label="Being notified when something needs attention"
                  description="Whether the device notifies the user if action is required"
                />

                <!-- Contextual Data Disclosure -->
                <CheckboxElement
                  v-model="privacypreferences.contextual_data_disclosure"
                  label="Contextual Data Disclosure"
                  description="Whether the device provides contextual information when disclosing data"
                />

                <!-- Additional Transparency Mechanisms -->
                <CheckboxElement
                  v-model="privacypreferences.additional_transparency_mechanisms"
                  label="Additional Transparency Mechanisms"
                  description="Whether the device provides additional transparency mechanisms"
                />

                <!-- Control of Data Processing Location -->
                <CheckboxElement
                  v-model="privacypreferences.control_of_data_processing_location"
                  label="Control of Data Processing Location"
                  description="Whether the location where data is processed can be chosen by the user"
                />

                <!-- Control of Data Processed -->
                <CheckboxElement v-model="privacypreferences.control_of_data_processed" label="Control of Data Processed" description="Whether it is possible to select which data are processed" />

                <!-- Control of Data Recipient -->
                <CheckboxElement
                  v-model="privacypreferences.control_of_data_recipient"
                  label="Control of Data Recipient"
                  description="Whether it is possible to select which recipients receive data"
                />

                <!-- Subject Rights Implementation -->
                <CheckboxElement v-model="privacypreferences.subject_rights_implementation" label="Subject Rights Implementation" description="Whether the subject rights have been implemented" />

                <!-- Data Portability -->
                <CheckboxElement v-model="privacypreferences.data_portability" label="Data Portability" description="Whether the data from the device can be transferred to other devices" />
              </li>
            </ul>

            <ButtonElement class="btn-primary w-100 mt-3" :onClick="savePrivacyProperties"> Einstellungen übernehmen </ButtonElement>
          </div>

          <div class="tab-pane fade" role="tabpanel" aria-labelledby="nav-profile-tab" id="delete">
            <!-- Delete -->
            <p class="card-text">
              Wenn Sie ihr Konto löschen, dann werden alle persönlichen Daten und Einstellungen dauerhaft entfernt. Sie können sich bei Bedarf erneut mit Ihrer E-Mail-Adresse registrieren.
            </p>

            <p class="card-text">Ihre veröffentlichten Inhalte bleiben bestehen, können Ihnen aber nicht mehr zugeordnet werden.</p>

            <div class="alert alert-warning">Diese Aktion ist dauerhaft und kann nicht rückgängig gemacht werden.</div>

            <ButtonElement class="btn btn-outline-danger w-100 mt-3" :onClick="openAccountDeletionModal"> Konto löschen </ButtonElement>
          </div>
        </div>

        <div v-if="message" class="alert mb-0 mt-3" :class="messageClass">{{ message }}</div>

        <!-- Delete Modal -->
        <div class="modal fade" ref="deleteModalRef" tabindex="-1">
          <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title"><i class="bi bi-trash-fill"></i> Kontolöschung</h5>
                <button type="button" class="btn-close" @click="closeDeleteModal"></button>
              </div>

              <div class="modal-body">
                Sind Sie sicher, dass Sie ihr Benutzerkonto löschen möchten?

                <p>
                  Bitte geben Sie zur Bestätigung das Wort
                  <span class="badge bg-danger mx-1">{{ deleteConfirmation }}</span>
                  ein:
                </p>

                <input v-model="confirmationText" type="text" class="form-control mb-3" placeholder="Eingabe..." />
              </div>

              <div class="modal-footer">
                <ButtonElement class="btn btn-secondary" :onClick="closeDeleteModal"> Abbrechen </ButtonElement>
                <ButtonElement class="btn btn-outline-danger" :extraDisabled="confirmationText?.trim().toUpperCase() !== deleteConfirmation" :onClick="confirmAccountDelete">
                  Konto endgültig löschen
                </ButtonElement>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive, computed, nextTick } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { userApi } from '@/api/userApi'
import { dataApi } from '@/api/dataApi'

import TextInputElement from '@/components/TextInputElement.vue'
import ButtonElement from '@/components/ButtonElement.vue'
import CheckboxElement from '@/components/CheckboxElement.vue'

import { localization } from '@/locales/localization'

const router = useRouter()

import { useAuth } from '@/stores/auth'
const auth = useAuth()

const confirmationText = ref(null)

const deleteModalRef = ref(null)
let deleteModal = null
const deleteConfirmation = ref('LÖSCHEN')

////
const privacypreferences = reactive({
  compliance_support: true,
  availability_of_contracts_for_joint_controllers_processors: true,
  account_required_for_device_bootstrapping: true,
  app_permissions_required: true,
  user_access_control: true,
  backend_service_demands: true,
  performs_network_discovery: true,
  controllable_discovery_function: true,
  open_source: true,
  on_device_data_processing: true,
  secure_and_private_default_settings: true,
  resetting_to_secure_default_settings: true,
  authentication_information: true,
  secure_data_transmission: true,
  tls_certificate_validation: true,
  updateability: true,
  security_update_status_display: true,
  history_of_data_leakage: true,
  privacy_breaches: true,
  encryption_status_for_user_passwords: true,
  optional_security_review: true,
  privacy_enhancing_technologies: true,
  datatypes_being_processed: true,
  listing_non_personally_identifiable_information: true,
  special_categories_of_data: true,
  data_sharing: true,
  recipient_of_information: true,
  data_processing_outside_the_eu: true,
  profiling: true,
  frequency_of_data_being_sent: true,
  duration_of_data_being_stored: true,
  actors_involved_in_the_processing: true,
  purpose_of_data_being_processed: true,
  data_minimisation: true,
  compliance_cra: true,
  location_of_data_being_sent_to: true,
  ensure_informed_consent_to_data_processing: true,
  clarification_of_data_processing_process: true,
  privacy_control_interface: true,
  separate_data_protection_information_from_terms_and_conditions: true,
  clear_and_transparent_personal_data_processing_information: true,
  visual_representation_of_privacy_flow: true,
  different_granularity_of_privacy_settings_of_ui: true,
  user_interaction_and_engagement: true,
  exploration_functionality: true,
  investigation_functionality: true,
  being_notified_when_something_needs_attention: true,
  contextual_data_disclosure: true,
  additional_transparency_mechanisms: true,
  control_of_data_processing_location: true,
  control_of_data_processed: true,
  control_of_data_recipient: true,
  subject_rights_implementation: true,
  data_portability: true,
})

const openAccountDeletionModal = () => {
  deleteModal.show()
}

const closeDeleteModal = () => {
  deleteModal.hide()
}

const confirmAccountDelete = async () => {
  try {
    const resp_opts = await userApi.delete('/account')
    //const options = resp_opts.data
    setMessage('Ihr Konto wurde erfolgreich gelöscht. Sie werden ausgeloggt...', 'alert-success')

    // Log out and go
    await auth.logout()
    router.go()
  } catch (ex) {
    console.log(ex)
    setMessage('Ein Fehler ist aufgetreten.', 'alert-danger')
  }
}

const PRIVACY_PROPERTY_DEFINITIONS = [
  {
    id: 'PP53',
    title: 'Rechtsraum',
    category: 'Transparenz',
    priority: 1,
    type: 'binary',
    description: 'Das IoT-Gerät kommuniziert mit Servern außerhalb des EU-Rechtsraums',
    info: 'Innerhalb der EU gelten strenge Richtlinien hinsichtlich Datenschutz und Datensicherheit. Außerhalb der EU ist dieser Schutz nicht gegeben, und Daten können möglicherweise unsachgemäß verarbeitet werden.',
  },
  {
    id: 'PP28',
    title: 'Profiling',
    category: 'Datenverarbeitung',
    priority: 1,
    type: 'binary',
    description: 'Das IoT-Gerät legt ein Profil anhand Ihrer Daten über Sie an, und wertet Ihre Lebensweise und Gewohnheiten aus',
    info: 'Diese Praxis wird auch "Profiling" genannt. Dies ermöglicht den Herstellern eine umfassende Datensammlung, sodass diese Daten beispielsweise für die gezielte Werbung verwendet oder weiterverkauft werden können.',
  },
  {
    id: 'PP61',
    title: 'Datensammlung',
    category: 'Datenverarbeitung',
    priority: 1,
    type: 'binary',
    description: 'Das IoT-Gerät erfasst und verarbeitet eine hohe und vielfältige Anzahl an Datentypen',
    info: 'Prinzipiell ist die lokale Datenverarbeitung auf dem Gerät wenig bedenklich. Allerdings werden die gesammelten Daten oft an den Hersteller übermittelt, und teilweise auch an Drittparteien weitergegeben oder sogar weiterverkauft. Die preisgegebenen Daten ermöglichen einen Einblick in viele Bereiche des privaten Lebens und sollten minimiert werden.',
  },

  {
    id: 'PP57',
    title: 'Account',
    category: 'Smartphone-App',
    priority: 1,
    type: 'binary',
    description: 'Das IoT-Gerät erfordert für die Benutzung einen Account',
    info: 'Der Hersteller erhält persönliche Daten, in der Regel die E-Mail-Adresse sowie ein Passwort. Im Falle einer Kompromittierung des Herstellers fallen diese Daten Angreifern in die Hände. Zudem besteht die Gefahr, dass ein Angreifer auch ohne Kompromittierung des Herstellers das eigene Passwört errät, und somit Zugriff auf eine Vielzahl an persönlichen Informationen sowie Funktionen des Geräts erhält.',
  },

  {
    id: 'PP56',
    title: 'Verschlüsselte Kommunikation',
    category: 'Datenverarbeitung',
    priority: 1,
    type: 'binary',
    description: 'Das IoT-Gerät kommuniziert ausschließlich verschlüsselt',
    info: 'Eine Kommunikation über das Internet sollte immer verschlüsselt sein. Angreifer im Netzwerk könnten jeglichen Netzwerkverkehr mitlesen oder sogar manipulieren. In der heutigen Zeit birgt eine unverschlüsselte Verbindung ein unnötiges Risiko als Einfalltor für Angriffe.',
  },
]

const savePrivacyProperties = async () => {
  try {
    //const privacy_properties =[]

    const privacy_properties = PRIVACY_PROPERTY_DEFINITIONS.map((prop) => {
      const state = privacyProperties[prop.id]

      // Binary gut=1, neutral=0, schlecht=-1
      if (prop.type === 'binary' || prop.type === 'binary_image') {
        return {
          id: prop.id,
          value: state.value === true ? 1 : state.value === false ? -1 : 0,
          ...(prop.type === 'binary_image' ? { note: state.note || '' } : {}),
        }
      }

      // Freitext
      if (prop.type === 'text') {
        return { id: prop.id, value: state.note || '' }
      }

      // Listen
      return {
        id: prop.id,
        items: state.items || [],
      }
    })

    console.log(privacy_properties)

    await dataApi.post('/user/settings', { privacy_properties })
  } catch (ex) {
    console.log(ex)
    setMessage('Ein Fehler ist aufgetreten.', 'alert-danger')
  }
}

const loadPrivacyProperties = async () => {
  try {
    const settings_req = await dataApi.get('/user/settings')
    const settings = settings_req.data

    const saved_privacy_properties = Array.isArray(settings?.privacy_properties) ? settings.privacy_properties : []

    for (const entry of saved_privacy_properties) {
      const state = privacyProperties[entry.id]
      if (!state) continue

      if (entry.items) {
        // Listen
        state.items = [...entry.items]
      } else if (entry.value === 1 || entry.value === -1 || entry.value === 0) {
        // Binary gut=1, neutral=0, schlecht=-1
        state.value = entry.value === 1 ? true : entry.value === -1 ? false : null
      } else {
        // Freitext
        state.note = entry.value ?? ''
      }

      if (entry.note !== undefined) {
        state.note = entry.note
      }
    }
  } catch (ex) {
    console.error('Fehler beim Laden der Privatheitspräferenzen', ex)
  }
}

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

//const axios = inject('axios');

// Load latest user data

const loadPasskeys = async () => {
  // Load passkeys
  const resp = await userApi.get('user/passkeys')
  if (resp.status !== 200) {
    return
  }
  passkeyList.value = resp.data
}

onMounted(async () => {
  const user = await auth.loadSession()

  username.value = user.username
  email.value = user.email

  deleteModal = new window.bootstrap.Modal(deleteModalRef.value)

  // Load user passkeys
  await loadPasskeys()

  // Privacy Properties
  await loadPrivacyProperties()

  // DOM für tooltips muss erst noch gebaut werden
  await nextTick()

  const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]')
  const tooltipList = [...tooltipTriggerList].map((tooltipTriggerEl) => new window.bootstrap.Tooltip(tooltipTriggerEl))
})

//const route = useRoute()

const props = defineProps({
  message: {
    type: String,
    required: false,
  },
})

const username = ref(null)
const email = ref(null)

const passkeyList = ref(null)

const message = ref(props.message)
const messageClass = ref('alert-info')

const loadingData = ref(false)

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

const addPasskey = async () => {
  await registerPasskey()
}

const updateAccountData = async () => {
  if (!email.value) {
    setMessage('Bitte geben Sie Ihre E-Mail an', 'alert-warning')
    return
  }

  if (!username.value) {
    setMessage('Bitte geben Sie Ihren gewünschten Benutzernamen an', 'alert-warning')
    return
  }

  // Change username
  if (username.value !== auth.user.username) {
    setMessage('Aktualisieren...', 'alert-info')
    loadingData.value = true

    const resp = await userApi.post('user/update/username', { new_username: username.value })

    if (resp.status !== 200) {
      setMessage(resp.data.status, 'alert-danger')
      loadingData.value = false
      return
    }

    // Fetch new data
    const user = await auth.loadSession()
    username.value = user.username

    setMessage(localization.t(resp.data.status), 'alert-success')

    // Update Passkey Info
    if (PublicKeyCredential.signalCurrentUserDetails) {
      try {
        await PublicKeyCredential.signalCurrentUserDetails({
          rpId: 'platform.iot-privacy.info', // TODO get RP
          userId: user.id,
          name: username.value,
          displayName: username.value,
        })
      } catch (ex) {
        console.error('Failed to update passkey:', ex)
      }
    }

    loadingData.value = false
  }
}

const setMessage = (text, cls = 'alert-info') => {
  message.value = text
  messageClass.value = cls
}

// Passkey add

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

const deletePasskey = async (passkeyId) => {
  try {
    const resp_opts = await userApi.delete('/user/passkeys/' + passkeyId)

    const options = resp_opts.data

    setMessage('Passkey wurde gelöscht!', 'alert-success')

    await loadPasskeys()
  } catch (ex) {
    console.log(ex)
  }
}

function base64urlToBuffer(base64url) {
  const padding = '='.repeat((4 - (base64url.length % 4)) % 4)
  const base64 = (base64url + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = atob(base64)
  return Uint8Array.from(rawData, (c) => c.charCodeAt(0))
}

const registerPasskey = async () => {
  try {
    const resp_opts = await userApi.post('/user/passkeys/new/start')

    const options = resp_opts.data

    setMessage('Erzeuge passkey...')

    // Create excludecredentials object
    const excludeCredentials = passkeyList.value.map((cred) => ({
      type: 'public-key',
      id: base64urlToBuffer(cred.id),
    }))

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
            userVerification: 'required', // TODO required
          },
          /*
          extensions: {
            credProps: true
          },
          */
          excludeCredentials: excludeCredentials,
        },
      })

      // cred.response.transports = list ['usb']
      // cred.response.attestationObject = base64 cert info

      //const myClientExtResults = cred.getClientExtensionResults();
      //const authData = cred.response.getAuthenticatorData();

      // Send credentials to server for verification
      const resp_verify = await userApi.post('/user/passkeys/new/verify', {
        id: cred.id,
        rawId: toBase64Url(cred.rawId),
        type: cred.type,
        client_data_json: toBase64Url(cred.response.clientDataJSON),
        attestation_object: toBase64Url(cred.response.attestationObject),
        user_id: options.user.id,
      })

      setMessage('Passkey wurde erzeugt und registriert!', 'alert-success')

      await loadPasskeys()
    } catch (err) {
      if (err.name === 'InvalidStateError') {
        setMessage('Dieses Gerät beinhaltet bereits einen Passkey für Ihren Account auf dieser Webseite. Bitte verwenden Sie ein anderes Gerät.', 'alert-danger')
      } else {
        console.error(err)
        setMessage('Passkey konnte nicht erzeugt werden. Bitte versuchen Sie es erneut, oder wählen Sie die Anmeldung über Passwort.', 'alert-danger')
      }
    }
  } catch (err) {
    console.error(err)
  }
}
</script>

<style scoped>
.card-title {
  font-weight: 600;
}
</style>
