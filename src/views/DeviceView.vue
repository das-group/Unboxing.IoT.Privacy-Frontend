<template>
  <!-- Post controls -->
  <div class="container pt-2 d-flex flex-column">
    <div class="card blog-card shadow-sm">
      <div class="card-body d-flex justify-content-between gap-3">
        <ButtonElement class="btn-secondary" :onClick="goBack">Zurück</ButtonElement>

        <!-- Moderator  -->
        <div class="d-flex gap-2 flex-wrap justify-content-end">
          <!-- Todo für später - true || raus -->
          <ButtonElement class="btn-warning" :onClick="openReportModal" v-if="auth.isLoggedIn && (true || !auth.hasPermission('manage_posts'))"> <i class="bi bi-flag"></i> Melden </ButtonElement>

          <ButtonElement
            class="btn-warning"
            :onClick="() => $router.push('/device/' + props.id + '/edit')"
            v-if="auth.hasAnyPermission('manage_posts') || (auth.isLoggedIn && auth.user.id === deviceData?.created_by_user_id)"
          >
            <i class="bi bi-pencil-square"></i> Bearbeiten
          </ButtonElement>

          <ButtonElement class="btn-danger" :onClick="openDeleteModal" v-if="auth.hasAnyPermission('manage_posts') || (auth.isLoggedIn && auth.user.id === deviceData?.created_by_user_id)">
            <i class="bi bi-trash"></i> Löschen</ButtonElement
          >

          <ButtonElement class="btn-danger" :onClick="onUnapprove" v-if="auth.hasAnyPermission('manage_posts') && deviceData?.visibility === 'public'">
            <i class="bi bi-ban"></i> Verbergen</ButtonElement
          >

          <ButtonElement class="btn-success" :onClick="onApprove" v-if="auth.hasAnyPermission('manage_posts') && deviceData?.visibility === 'review'">
            <i class="bi bi-person-fill-up"></i> Veröffentlichen</ButtonElement
          >

          <ButtonElement class="btn-outline-primary" :onClick="openHistoryModal" v-if="deviceData?.prev_version_id || auth.hasAnyPermission('manage_posts')">
            <i class="bi bi-clock-history"></i> Verlauf</ButtonElement
          >

          <!-- New Compare Button -->
          <button v-if="$route.name !== 'CompareView' || !props.id" class="btn btn-outline-primary" @click="$router.push(`/compare/${props.id}`)">
            <i class="bi bi-layout-split me-1"></i> Gerät vergleichen
          </button>
          <button v-else class="btn btn-primary" @click="$router.push(`/device/${props.id}`)"><i class="bi bi-x-circle me-1"></i> Vergleich beenden</button>
        </div>
      </div>
    </div>
  </div>

  <div class="container pt-2 d-flex flex-column">
    <div class="alert alert-danger" style="white-space: pre-line" v-if="message">
      {{ message }}
    </div>

    <div class="card blog-card shadow-sm" v-else>
      <div class="alert alert-warning mb-0 rounded-0 d-flex align-items-center justify-content-between" v-if="pendingUpdateCount > 0">
        <span
          ><i class="bi bi-hourglass-split me-2"></i>Für diesen Eintrag {{ pendingUpdateCount === 1 ? 'liegt 1 Bearbeitung' : 'liegen ' + pendingUpdateCount + ' Bearbeitungen' }} zur Prüfung
          vor.</span
        >
        <router-link v-if="auth.hasAnyPermission('manage_posts')" to="/manage/updates" class="btn btn-sm btn-outline-dark">Ansehen</router-link>
      </div>

      <a href="#bildergalerie" @click="handleTabClick('general')">
        <img
          v-if="deviceData?.title_image?.includes('//')"
          :src="deviceData?.title_image"
          class="card-img-top mt-3 mb-2"
          alt="Titelbild"
          style="max-height: 300px; object-fit: contain"
          @error="handleImageError"
        />
      </a>

      <div class="card-body">
        <h2 class="card-title">{{ deviceData?.manufacturer }} {{ deviceData?.model }}</h2>
        <p class="text-muted small mb-2">Eingereicht von {{ deviceData?.created_by_username }} • {{ formattedCreationDate }}</p>

        <!-- Sterne-Bewertung -->
        <span class="text-muted small mb-2"> Qualität des Beitrags: </span>
        <div class="d-flex flex-wrap align-items-center gap-4 mb-3">
          <div class="text-nowrap">
            <!-- Stars -->
            <div class="d-flex align-items-center">
              <i
                v-for="n in 5"
                :key="`star-${n}`"
                class="bi me-1"
                :class="getStarClass(n)"
                :style="{
                  fontSize: '1.25rem',
                  cursor: auth.isLoggedIn ? 'pointer' : 'default',
                  color: getStarColor(n),
                }"
                @mouseenter="auth.isLoggedIn && (hoverRating = n)"
                @mouseleave="auth.isLoggedIn && (hoverRating = null)"
                @click="() => auth.isLoggedIn && submitRating(n)"
              />

              <!-- Always show average (with optional half-star visual in text if desired, but we keep it simple) -->
              <span class="text-muted small mt-1">
                {{ ratingAverage > 0 ? `(${ratingAverage.toFixed(1)})` : '' }}
              </span>
            </div>

            <!-- Summary text -->
            <div class="text-muted small mt-1">
              <span>
                {{ totalRatings > 0 ? `Stimmen: ${totalRatings}` : '' }}
              </span>
              <!-- Show user rating only if submitted -->
              <span v-if="userRating > 0" class="ms">, deine Bewertung: {{ userRating }} <i class="bi-star-fill"></i> </span>
            </div>
          </div>
        </div>

        <nav class="tab-nav-wrapper">
          <div ref="tabNavRef" class="nav nav-tabs tab-nav" id="nav-tab" role="tablist" @scroll.passive="updateTabFade">
            <button @click="handleTabClick('general')" class="nav-link" :class="{ active: currentTab === 'general' }" type="button" role="tab">
              <i class="bi bi-info-square me-2"></i>
              <span class="d-none d-sm-inline">Allgemeine Informationen</span>
              <span class="d-sm-none">Allgemein</span>
            </button>

            <button
              v-if="deviceData?.policy_reports?.length > 0"
              @click="handleTabClick('privacypolicy')"
              class="nav-link"
              :class="{ active: currentTab === 'privacypolicy' }"
              type="button"
              role="tab"
            >
              <i class="bi bi-file-text me-2"></i>
              <span class="d-none d-sm-inline">Datenschutzerklärung</span>
              <span class="d-sm-none">Datenschutz</span>
            </button>

            <button v-if="deviceData?.net_reports?.length > 0" @click="handleTabClick('network')" class="nav-link" :class="{ active: currentTab === 'network' }" type="button" role="tab">
              <i class="bi bi-router me-2"></i>
              <span class="d-none d-sm-inline">Server, Netzwerk- und Internetverbindungen</span>
              <span class="d-sm-none">Netzwerk</span>
            </button>

            <button
              v-if="deviceData?.companion_apps?.android?.store_link"
              @click="handleTabClick('companionapp')"
              class="nav-link"
              :class="{ active: currentTab === 'companionapp' }"
              type="button"
              role="tab"
            >
              <i class="bi bi-app-indicator me-2"></i>
              <span class="d-none d-sm-inline">Smartphone-Apps</span>
              <span class="d-sm-none">Apps</span>
            </button>

            <button v-if="deviceData?.firmware_reports?.length > 0" @click="handleTabClick('firmware')" class="nav-link" :class="{ active: currentTab === 'firmware' }" type="button" role="tab">
              <i class="bi bi-code-square me-2"></i>
              <span>Firmware</span>
            </button>
          </div>
        </nav>
        <div class="tab-content mt-2" id="nav-tabContent">
          <div class="tab-pane fade" :class="{ 'show active': currentTab === 'general' }" role="tabpanel">
            <!-- NAV Allgemeine Informationen -->

            <div class="flex-container">
              <div class="flex-container-item">
                <h5 data-sync="allgemein-daten"><i class="bi bi-info-square me-1"></i> Gerätedaten:</h5>

                <ul class="list-group list-group-flush">
                  <li class="list-group-item d-flex justify-content-between">
                    <span class="fw-semibold">Hersteller:</span>
                    <span
                      ><a :href="deviceData?.manufacturerUrl">{{ deviceData?.manufacturer }}</a></span
                    >
                  </li>

                  <li class="list-group-item d-flex justify-content-between">
                    <span class="fw-semibold">Modell:</span>
                    <span>{{ deviceData?.model }}</span>
                  </li>

                  <li class="list-group-item d-flex justify-content-between">
                    <span class="fw-semibold">Kategorie:</span>
                    <span>{{ joinedCategories }}</span>
                  </li>

                  <li class="list-group-item d-flex justify-content-between" v-if="deviceData?.tags.length > 0">
                    <span class="fw-semibold">Schlagwörter:</span>
                    <span>
                      <div class="mb-1 d-flex flex-wrap justify-content-end" style="gap: 0.2em">
                        <span v-for="tag in deviceData?.tags" :key="tag" class="badge bg-secondary text-uppercase">
                          {{ tag }}
                        </span>
                      </div>
                    </span>
                  </li>
                </ul>

                <!-- Kurzbeschreibung -->
                <div v-if="deviceData?.description">
                  <hr />
                  <h5 data-sync="allgemein-kurzbeschreibung">Kurzbeschreibung:</h5>
                  <p class="card-text" style="white-space: pre-line">{{ deviceData?.description }}</p>
                </div>
              </div>

              <div class="flex-container-item">
                <div v-if="privacy_properties_score && privacy_properties_score.descriptions?.length > 1">
                  <!--
                  <div class="card blog-card shadow-sm">
                    <div class="card-header">
                      <h5 class="card-title mb-0">Individuelle Übereinstimmung der Privatheitseigenschaften:</h5>
                    </div>

                    <div class="card-body">
                      <div class="d-flex">
                        <div class="score-ring" :style="{ '--score': Math.round(Math.min(100, Math.max(0, privacy_properties_score.total_score))) }">
                          <span class="score-ring__value"></span>
                        </div>

                        <ul>
                          <li v-for="(desc, index) in privacy_properties_score.descriptions" :key="desc" class="">
                            <span :class="desc.color">
                              <b>
                                {{ desc.description }}
                              </b>
                              <small class="ms-1" v-if="index > 0">({{ desc.score_impact }})</small>
                            </span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
   -->

                  <h5 class="mb-3">Individuelle Übereinstimmung der Privatheitseigenschaften:</h5>

                  <div class="d-flex">
                    <div class="score-ring" :style="{ '--score': Math.round(Math.min(100, Math.max(0, privacy_properties_score.total_score))) }">
                      <span class="score-ring__value"></span>
                    </div>

                    <ul>
                      <li v-for="(desc, index) in privacy_properties_score.descriptions" :key="desc" class="">
                        <span :class="desc.color">
                          <b>
                            {{ desc.description }}
                          </b>
                          <small class="ms-1" v-if="index > 0">({{ desc.score_impact }})</small>
                        </span>
                      </li>
                    </ul>
                  </div>

                  <hr />
                </div>
                <div v-else-if="privacy_properties_score">
                  <h5>Individuelle Übereinstimmung der Privatheitseigenschaften:</h5>
                  Bitte gehen Sie in Ihre <router-link to="/account" active-class="active"><i class="bi bi-person-fill-gear me-1"></i>Kontoeinstellungen</router-link>, und wählen Sie ihre Präferenzen
                  hinsichtlich Privatheit aus.
                  <br />
                  <hr />
                </div>

                <div>
                  <h5>Qualität der Datenschutzerklärung (Zusammenfassung):</h5>
                  <!-- <img :src="`https://platform.iot-privacy.info/api/data/entry/${props.id}/privacylabel`" class="privacylabel img-fluid " alt="Privacy-Label" /> -->

                  <div class="spoiler">
                    <button
                      class="btn btn-secondary collapsed w-100"
                      type="button"
                      data-bs-toggle="collapse"
                      data-bs-target="#policy_thematiken"
                      aria-expanded="true"
                      aria-controls="policy_thematiken"
                    >
                      Klick zum Aufklappen
                    </button>

                    <div class="collapse" id="policy_thematiken">
                      <div class="d-flex justify-content-center">
                        <div @click="() => handleTabClick('privacypolicy')">
                          <SvgContainer
                            v-if="deviceData?.policy_reports && deviceData?.policy_reports.length > 0 && deviceData?.policy_reports[0].data?.report?.label_svg"
                            :svg="deviceData.policy_reports[0].data.report.label_svg"
                            class="privacylabel img-fluid"
                            alt="Privacy-Label"
                          />
                          <template v-else>
                            <img :src="`https://platform.iot-privacy.info/api/data/entry/${props.id}/privacylabel`" class="privacylabel img-fluid" alt="Privacy-Label" />
                          </template>

                          <span class="text-muted">
                            Hinweis: Dies ist eine Kurzfassung. Für eine vollständige Ansicht, gehen Sie auf den Reiter
                            <nobr
                              >"<i class="bi bi-file-text me-1"></i>
                              <span class="d-none d-sm-inline">Datenschutzerklärung</span>
                              <span class="d-sm-none">Datenschutz</span>"</nobr
                            >
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Bildergalerie -->
            <div v-if="deviceData?.images.length > 0" id="bildergalerie">
              <hr />
              <h5>Bildergalerie:</h5>
              <ImageGallery :images="deviceData?.images_urls" />
            </div>
          </div>

          <!-- NAV Datenschutzerklärung -->
          <div class="tab-pane fade" :class="{ 'show active': currentTab === 'privacypolicy' }" role="tabpanel">
            <div class="d-flex gap-2">
              <!-- Privacy Policy Report -->
              <h5><i class="bi bi-file-text me-1"></i> Analyse der Datenschutzerklärung:</h5>

              <!--
              <button type="button" class="btn btn-secondary">
                <i class="bi bi-file-text"></i> Öffnen
              </button>
              -->
            </div>

            <div class="" v-for="(report, index) in sortedPolicyReports" :key="report.id">
              <hr v-if="index > 0" />
              <h5 v-if="index === 1">Ältere Untersuchungen:</h5>

              <p class="text-muted small mb-2">Ausgewertet am {{ formatDateTime(report.data?.created_at) }}</p>

              <ButtonElement class="btn btn-secondary px-2 py-1 mb-2 fw-semibold rounded-pill" :onClick="() => refreshPrivacyPolicy(report?.id)" v-if="index === 0 && auth.isLoggedIn">
                <i class="bi bi-arrow-clockwise"></i>
                Erneut untersuchen
              </ButtonElement>

              <!-- Allgemein -->
              <div data-sync="dse-allgemein" class="card mb-3" v-if="report.data?.report.summary">
                <div class="card-header"><h6 class="card-title fw-bold datablock-title">Datenschutzerklärung</h6></div>

                <div class="card-body">
                  <ul class="list-group list-group-flush">
                    <li class="list-group-item d-flex justify-content-between flex-row flex-wrap" v-if="report.data?.report.summary.policy">
                      <span class="fw-semibold">Link zu der Datenschutzerklärung</span>

                      <span class="d-flex flex-wrap">
                        <a
                          :href="report.data?.report.source"
                          v-if="deviceData?.policy_reports.length > 0 && deviceData?.policy_reports[0]"
                          target="_blank"
                          class="d-block text-break text-decoration-none"
                          >{{ report.data?.report.source }}</a
                        >
                        <button type="button" class="btn btn-secondary ms-3 py-0 lh-2" @click="openOriginalPrivacyPolicy"><i class="bi bi-file-text"></i> Gespeicherte Kopie öffnen</button>

                        <!-- <a href="#" @click="openOriginalPrivacyPolicy">Gespeicherte Kopie Öffnen</a> -->
                      </span>
                    </li>

                    <li class="list-group-item d-flex justify-content-between" v-if="report.data?.report.summary.policy.date">
                      <span class="fw-semibold">Datenschutzerklärung zuletzt aktualisiert</span>
                      <span> {{ formatDate(report.data?.report.summary.policy.date) }} </span>
                    </li>

                    <li class="list-group-item d-flex justify-content-between">
                      <span class="fw-semibold">Sprache der Datenschutzerklärung</span>
                      <span> {{ localization.langCodeToLanguageName(report.data?.report.language) }} </span>
                    </li>

                    <li class="list-group-item d-flex justify-content-between" v-if="report.data?.report.summary?.audience?.audience_countries?.length > 0">
                      <span class="fw-semibold">Gültigkeitsbereich der Datenschutzerklärung</span>
                      <span class="text-end"> {{ joinTrans(report.data?.report.summary?.audience?.audience_countries) }} </span>
                    </li>

                    <li class="list-group-item d-flex justify-content-between">
                      <span class="fw-semibold"
                        >Ist die Datenschutzerklärung für das Gerät gültig?

                        <span
                          class="text-muted ms-1"
                          role="button"
                          tabindex="0"
                          data-bs-toggle="tooltip"
                          data-bs-title="
                          Gilt die Datenschutzerklärung auch für das Produkt, oder lediglich für die Webseite bzw. Dienste?
                          "
                        >
                          <i class="bi bi-info-circle"></i>
                        </span>
                      </span>
                      <span class="text-end">
                        <span class="d-none d-sm-inline me-2" v-if="report.data?.report.summary?.context?.device / report.data?.report.summary?.policy?.total_sentences <= policyForDeviceTreshold">
                          Die Datenschutzerklärung gilt NICHT für das Gerät -</span
                        >

                        <BoolStatusElement
                          :status="report.data?.report.summary?.context?.device / report.data?.report.summary?.policy?.total_sentences > policyForDeviceTreshold"
                          :title="
                            report.data?.report.summary?.context?.device / report.data?.report.summary?.policy?.total_sentences > policyForDeviceTreshold
                              ? 'Die Datenschutzerklärung gilt für das Gerät'
                              : 'Die Datenschutzerklärung gilt NICHT für das Gerät'
                          "
                        />
                      </span>
                    </li>

                    <li class="list-group-item d-flex justify-content-between">
                      <span class="fw-semibold">Anzahl ausgewerteter Sätze</span>
                      <span> {{ report.data?.report.summary.policy.total_sentences }} </span>
                    </li>
                  </ul>
                </div>
              </div>

              <!-- Gesammelte Daten -->
              <div data-sync="dse-gesammeltedaten" class="card mb-3" v-if="report.data?.report.summary.data_type">
                <div class="card-header"><h6 class="card-title fw-bold datablock-title">Gesammelte Daten</h6></div>

                <div class="card-body">
                  <div class="mb-3 col-md-4" v-if="false">
                    <label for="summaryLevel" class="form-label fw-bold">Detailgrad wählen:</label>
                    <select id="summaryLevel" v-model="selectedLevel" class="form-select">
                      <!-- Bind the numeric ID to the value, but show the Label to the user -->
                      <option v-for="option in summaryOptions" :key="option.id" :value="option.id">
                        {{ option.label }}
                      </option>
                    </select>
                  </div>

                  <ul class="list-group list-group-flush">
                    <li class="list-group-item d-flex justify-content-between flex-column">
                      <span class="fw-semibold flex-grow-1 flex-shrink-1 flex-base-0">
                        Welche Daten werden gesammelt? <nobr>( {{ filteredDataTypes?.length }} )</nobr>
                      </span>

                      <div ref="legend" class="pill-legend">
                        <span data-bs-toggle="tooltip" data-bs-title="Daten, die keine besondere Kategorie erfüllen, z.B. App-Namen oder technische Einstellungen." class="legend-item">
                          <i class="legend-pill"></i> Daten
                        </span>
                        <span
                          data-bs-toggle="tooltip"
                          data-bs-title="Personenbezogene Daten (PII): Informationen, die sich auf eine identifizierte oder identifizierbare Person beziehen, z.B. SSID, MAC-Adresse, E-Mail."
                          class="legend-item"
                        >
                          <i class="legend-pill pill-pii"></i> Personenbezogene Daten
                        </span>
                        <span data-bs-toggle="tooltip" data-bs-title="Sensible Daten gemäß Art. 9 DSGVO: Gesundheitsdaten, Biometrie, Standort, Mediendaten etc." class="legend-item">
                          <i class="legend-pill pill-sensitive"></i> Sensible Daten
                        </span>
                      </div>

                      <span class="flex-grow-2 flex-shrink-1 flex-base-0">
                        <div class="data-type-groups">
                          <div v-for="(items, group) in groupedDataTypes" :key="group" class="data-type-card">
                            <h4 class="group-label">
                              <span class="group-icon" aria-hidden="true">
                                <i :class="GROUP_ICONS[group] || 'bi-question-circle'"></i>
                              </span>
                              {{ group }}
                              <span class="badge bg-body-tertiary border rounded-pill ms-auto">
                                {{ items.length }}
                              </span>
                            </h4>

                            <ul class="data-type-list">
                              <li
                                v-for="item in items"
                                :key="item"
                                :data-raw="item"
                                :class="{
                                  'pill-sensitive': sensitiveSet.has(item),
                                  'pill-pii': piiSet.has(item) && !sensitiveSet.has(item),
                                }"
                              >
                                {{ localization.t(item) }}
                              </li>
                            </ul>
                          </div>
                        </div>

                        <!--
                        <ul class="columns-3">
                          <li v-for="(item, index) in filteredDataTypes" :key="index" :data-raw="item">
                            {{ localization.t(item) }}
                          </li>
                        </ul>
                      -->

                        <p v-if="filteredDataTypes?.length === 0" class="text-muted small">Keine Daten verfügbar.</p>
                      </span>
                    </li>

                    <li class="list-group-item d-flex justify-content-between flex-column">
                      <span class="fw-semibold flex-grow-1 flex-shrink-1 flex-base-0">Warum werden Daten gesammelt?</span>
                      <span class="flex-grow-2 flex-shrink-1 flex-base-0">
                        <ul class="columns-3">
                          <li v-for="(item, index) in report.data?.report.summary.purpose.purposes" :key="index" :data-raw="item">{{ localization.t(item) }}</li>
                        </ul>
                      </span>
                    </li>
                  </ul>

                  <ul class="list-group list-group-flush">
                    <li class="list-group-item d-flex justify-content-between" v-if="filteredDataTypes.length > 0">
                      <span class="fw-semibold"
                        >Findet eine Datenverarbeitung zu Werbezwecken statt?

                        <span
                          class="text-muted ms-1"
                          role="button"
                          tabindex="0"
                          data-bs-toggle="tooltip"
                          data-bs-title="
                          Werden meine Daten verwendet, um mir gezielt Werbung anzuzeigen, die mich zum Kaufen animieren soll? Erkennbar an den Begriffen 'Werbe-ID', 'Google-Ad-ID', 'Interessendaten', 'Werbe-Aktivitäten', 'Inhalte personalisieren', 'Kundenakquise', 'Käufe empfehlen', 'Marketing-Nachrichten', 'Werbepartner'
                          "
                        >
                          <i class="bi bi-info-circle"></i>
                        </span>
                      </span>
                      <span>
                        <BoolStatusElement :status="isCollectingDataForAdvertisement(report)" />
                      </span>
                    </li>
                  </ul>
                </div>
              </div>

              <!-- Drittparteien -->
              <div data-sync="dse-drittparteien" class="card mb-3" v-if="report.data?.report.summary.purpose">
                <div class="card-header"><h6 class="card-title fw-bold datablock-title">Drittparteien</h6></div>
                <div class="card-body">
                  <ul class="list-group list-group-flush">
                    <li class="list-group-item d-flex justify-content-between flex-column">
                      <span class="fw-semibold flex-grow-1 flex-shrink-1 flex-base-0"
                        >Welche Daten werden an Drittparteien weitergegeben? <nobr>( {{ report.data?.report.summary.sharing.sharing_types?.length }} )</nobr></span
                      >

                      <div class="pill-legend">
                        <span class="legend-item"> <i class="legend-pill"></i> Normale Daten </span>
                        <span class="legend-item"> <i class="legend-pill pill-pii"></i> Personenbezogene Daten </span>
                        <span class="legend-item"> <i class="legend-pill pill-sensitive"></i> Sensible Daten </span>
                      </div>

                      <span class="flex-grow-2 flex-shrink-1 flex-base-0">
                        <div class="data-type-groups">
                          <div v-for="(items, group) in groupedThirdPartyDataTypes" :key="group" class="data-type-card">
                            <h4 class="group-label">
                              <span class="group-icon" aria-hidden="true">
                                <i :class="GROUP_ICONS[group] || 'bi-question-circle'"></i>
                              </span>
                              {{ group }}
                            </h4>
                            <ul class="data-type-list">
                              <li
                                v-for="item in items"
                                :key="item"
                                :data-raw="item"
                                :class="{
                                  'pill-sensitive': sensitiveSet.has(item),
                                  'pill-pii': piiSet.has(item) && !sensitiveSet.has(item),
                                }"
                              >
                                {{ localization.t(item) }}
                              </li>
                            </ul>
                          </div>
                        </div>

                        <!--
                        <ul class="columns-3">
                          <li v-for="(item, index) in report.data?.report.summary.sharing.sharing_types" :key="index" :data-raw="item">{{ localization.t(item) }}</li>
                        </ul>

                        -->
                      </span>
                    </li>

                    <li class="list-group-item d-flex justify-content-between flex-column" v-if="report.data?.report.summary.third_party?.descriptives?.length > 0">
                      <span class="fw-semibold flex-grow-1 flex-shrink-1 flex-base-0">Welche Rolle(n) spielen die Drittparteien?</span>
                      <span class="flex-grow-2 flex-shrink-1 flex-base-0">
                        <ul class="columns-3">
                          <li v-for="(item, index) in report.data?.report.summary.third_party.descriptives" :key="index" :data-raw="item">{{ localization.t(item) }}</li>
                        </ul>
                      </span>
                    </li>

                    <li class="list-group-item d-flex justify-content-between flex-column" v-if="report.data?.report.summary.third_party.companies.length > 0">
                      <span class="fw-semibold flex-grow-1 flex-shrink-1 flex-base-0">Mit welchen Unternehmen werden Daten geteilt?</span>
                      <span class="flex-grow-2 flex-shrink-1 flex-base-0">
                        <ul class="columns-3">
                          <li v-for="(item, index) in thirdPartyEntities(report)" :key="index" :data-raw="item">{{ item }}</li>
                        </ul>
                      </span>
                    </li>

                    <li class="list-group-item d-flex justify-content-between flex-column" v-if="report.data?.report.summary.purpose?.third_party_purposes?.length > 0">
                      <span class="fw-semibold flex-grow-1 flex-shrink-1 flex-base-0">Warum werden Daten von Drittparteien gesammelt?</span>
                      <span class="flex-grow-2 flex-shrink-1 flex-base-0">
                        <ul class="columns-3">
                          <li v-for="(item, index) in report.data?.report.summary.purpose.third_party_purposes" :key="index" :data-raw="item">{{ localization.t(item) }}</li>
                        </ul>
                      </span>
                    </li>

                    <li class="list-group-item d-flex justify-content-between">
                      <span class="fw-semibold">Werden Daten mit Ländern außerhalb der Europäischen Union geteilt? </span>
                      <span>
                        <BoolStatusElement :status="report.data?.report.summary.additional_properties?.sharing_outside_eu" />
                      </span>
                    </li>

                    <li class="list-group-item d-flex justify-content-between flex-column" v-if="report.data?.report?.summary?.additional_properties?.sharing_outside_eu_countries?.length > 0">
                      <span class="fw-semibold flex-grow-1 flex-shrink-1 flex-base-0">Wo liegen die Länder, mit denen die Daten geteilt werden?</span>
                      <span class="flex-grow-2 flex-shrink-1 flex-base-0">
                        <ul class="columns-3">
                          <li
                            v-for="(item, index) in (report.data?.report?.summary?.additional_properties?.sharing_outside_eu_countries || [])

                              .map((country) => {
                                if (country.startsWith('CountriesOutsideOf(')) {
                                  const match = country.match(/^CountriesOutsideOf\(([^)]*)\)$/)
                                  return match ? match[1] : country
                                }
                                return country
                              })
                              .filter((country) => typeof country === 'string' && country !== 'AndOther' && country !== 'CountriesOutsideOf')
                              .filter((val, i, arr) => arr.indexOf(val) === i)"
                            :key="index"
                          >
                            {{ localization.t(item) }}
                          </li>
                        </ul>
                      </span>
                    </li>
                  </ul>
                </div>
              </div>

              <!-- Datenspeicherung -->
              <div data-sync="dse-retention" class="card mb-3" v-if="report.data?.report.summary.retention?.countries?.length > 0">
                <div class="card-header"><h6 class="card-title fw-bold datablock-title">Datenspeicherung</h6></div>

                <div class="card-body">
                  <ul class="list-group list-group-flush">
                    <li class="list-group-item d-flex justify-content-between flex-column">
                      <span class="fw-semibold flex-grow-1 flex-shrink-1 flex-base-0">In welchen Ländern werden die Daten gespeichert?</span>
                      <span class="flex-grow-2 flex-shrink-1 flex-base-0">
                        <ul class="columns-3">
                          <li
                            v-for="(item, index) in report.data?.report.summary.retention.countries?.filter(
                              (country) => typeof country === 'string' && !country.includes('CountriesOutsideOf') && !country.includes('AndOther'),
                            ) || []"
                            :key="index"
                          >
                            {{ localization.t(item) }}
                          </li>
                        </ul>
                      </span>
                    </li>
                  </ul>
                </div>
              </div>

              <!-- Profiling -->
              <div data-sync="dse-profiling" class="card mb-3" v-if="report.data?.report.summary.additional_properties">
                <div class="card-header"><h6 class="card-title fw-bold datablock-title">Tracking</h6></div>
                <div class="card-body">
                  <ul class="list-group list-group-flush">
                    <li class="list-group-item d-flex justify-content-between">
                      <span class="fw-semibold"
                        >Findet Tracking statt?

                        <span
                          class="text-muted ms-1"
                          role="button"
                          tabindex="0"
                          data-bs-toggle="tooltip"
                          data-bs-title="
                          Tracking bezeichnet Technologien und Verfahren, mit denen Webseiten, Apps oder Online-Dienste das Verhalten von Nutzenden im Internet beobachten und aufzeichnen. Kurzum: Das Erfassen von Daten.
                          "
                        >
                          <i class="bi bi-info-circle"></i>
                        </span>
                      </span>
                      <span>
                        <BoolStatusElement :status="report.data?.report.summary?.processing?.tracking?.length > 0" />
                      </span>
                    </li>

                    <li class="list-group-item d-flex justify-content-between flex-column" v-if="report.data?.report.summary.processing?.tracking?.length > 0">
                      <span class="fw-semibold flex-grow-1 flex-shrink-1 flex-base-0">Mithilfe welcher Technologien findet Tracking statt?</span>
                      <span class="flex-grow-2 flex-shrink-1 flex-base-0">
                        <ul class="columns-3">
                          <li
                            v-for="(item, index) in report.data?.report.summary?.processing?.tracking.filter((t) => typeof t === 'string' && t !== 'SimilarTechnologies')"
                            :key="index"
                            :data-raw="item"
                          >
                            {{ localization.t(item) }}
                          </li>
                        </ul>
                      </span>
                    </li>

                    <li class="list-group-item d-flex justify-content-between">
                      <span class="fw-semibold"
                        >Findet Profiling statt?

                        <span
                          class="text-muted ms-1"
                          role="button"
                          tabindex="0"
                          data-bs-toggle="tooltip"
                          data-bs-title="
                          Profiling bezeichnet die automatisierte Verarbeitung personenbezogener Daten zur Analyse, Bewertung oder Vorhersage personenbezogener Aspekte einer betroffenen Person, insbesondere zur Beeinflussung ihres Verhaltens, ihrer Neigungen oder ihres Standverhaltens (Art. 4 Abs. 4 DSGVO). Kurzum: Die Auswertung von (z.B. durch Tracking) erfassten Daten.
                          "
                        >
                          <i class="bi bi-info-circle"></i>
                        </span>
                      </span>
                      <span>
                        <BoolStatusElement :status="report.data?.report.summary?.additional_properties?.profiling" />
                      </span>
                    </li>

                    <li class="list-group-item d-flex justify-content-between flex-column" v-if="report.data?.report.summary.additional_properties?.profiling_data_types?.length > 0">
                      <span class="fw-semibold flex-grow-1 flex-shrink-1 flex-base-0">Mithilfe welcher Daten findet Profiling statt?</span>
                      <span class="flex-grow-2 flex-shrink-1 flex-base-0">
                        <ul class="columns-3">
                          <li v-for="(item, index) in report.data?.report.summary.additional_properties.profiling_data_types" :key="index">{{ localization.t(item) }}</li>
                        </ul>
                      </span>
                    </li>
                  </ul>
                </div>
              </div>

              <!-- Tracking -->
              <!--
              <div class="card mb-3" v-if="report.data?.report.summary.processing && report.data?.report.summary.processing.tracking">
                <div class="card-body">
                  <h6 class="card-title fw-bold">Datenverarbeitung</h6>
                  <ul class="list-group list-group-flush">

                    <li class="list-group-item d-flex justify-content-between flex-column">
                      <span class="fw-semibold flex-grow-1 flex-shrink-1 flex-base-0">Wie wird das Tracking technisch umgesetzt?</span>
                      <span class="flex-grow-2 flex-shrink-1 flex-base-0">
                        <ul class="columns-3">
                          <li v-for="(item, index) in report.data?.report.summary.processing.tracking" :key="index"> {{ localization.t(item) }} </li>
                        </ul>
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
              -->

              <!-- Rechte -->
              <div data-sync="dse-datenschutzrechte" class="card mb-3" v-if="report.data?.report.summary.user_rights">
                <div class="card-header"><h6 class="card-title fw-bold datablock-title">Datenschutzrechte</h6></div>

                <div class="card-body">
                  <ul class="list-group list-group-flush">
                    <li class="list-group-item d-flex justify-content-between">
                      <span class="fw-semibold"
                        >Wird auf das Recht zur Einsicht der eigenen Daten hingewiesen?

                        <span
                          class="text-muted ms-1"
                          role="button"
                          tabindex="0"
                          data-bs-toggle="tooltip"
                          data-bs-title="
                          Gemäß Art. 15 DSGVO
                          "
                        >
                          <i class="bi bi-info-circle"></i>
                        </span>
                      </span>
                      <span>
                        <BoolStatusElement :status="report.data?.report.summary?.user_rights.access" />
                      </span>
                    </li>

                    <li class="list-group-item d-flex justify-content-between">
                      <span class="fw-semibold"
                        >Wird auf das Recht zur Löschung der eigenen Daten hingewiesen?

                        <span
                          class="text-muted ms-1"
                          role="button"
                          tabindex="0"
                          data-bs-toggle="tooltip"
                          data-bs-title="
                          Gemäß Art. 17 DSGVO
                          "
                        >
                          <i class="bi bi-info-circle"></i>
                        </span>
                      </span>
                      <span>
                        <BoolStatusElement :status="report.data?.report.summary?.user_rights.deletion" />
                      </span>
                    </li>

                    <li class="list-group-item d-flex justify-content-between">
                      <span class="fw-semibold"
                        >Wird auf das Recht zum Widerruf von Einwilligung hingewiesen?

                        <span
                          class="text-muted ms-1"
                          role="button"
                          tabindex="0"
                          data-bs-toggle="tooltip"
                          data-bs-title="
                          Gemäß Art. 21 DSGVO
                          "
                        >
                          <i class="bi bi-info-circle"></i>
                        </span>
                      </span>
                      <span>
                        <BoolStatusElement :status="report.data?.report.summary?.user_rights.revoke" />
                      </span>
                    </li>

                    <li class="list-group-item d-flex justify-content-between">
                      <span class="fw-semibold"
                        >Wird auf das Recht zur Berichtigung der eigenen Daten hingewiesen?

                        <span
                          class="text-muted ms-1"
                          role="button"
                          tabindex="0"
                          data-bs-toggle="tooltip"
                          data-bs-title="
                          Gemäß Art. 16 DSGVO
                          "
                        >
                          <i class="bi bi-info-circle"></i>
                        </span>
                      </span>
                      <span>
                        <BoolStatusElement :status="report.data?.report.summary?.user_rights.rectification" />
                      </span>
                    </li>

                    <li class="list-group-item d-flex justify-content-between">
                      <span class="fw-semibold"
                        >Liegt ein berechtigtes Interesse zur Datenverarbeitung ohne explizite Einwilligung vor?

                        <span
                          class="text-muted ms-1"
                          role="button"
                          tabindex="0"
                          data-bs-toggle="tooltip"
                          data-bs-title="
                          Gemäß Art. 6.1f DSGVO
                          "
                        >
                          <i class="bi bi-info-circle"></i>
                        </span>
                      </span>
                      <span>
                        <BoolStatusElement :status="report.data?.report.summary?.legal_basis.legitimate_interest > 0" />
                      </span>
                    </li>

                    <li class="list-group-item d-flex justify-content-between" v-if="report.data?.report.summary.legal_basis.legitimate_interest > 0">
                      <span class="fw-semibold"
                        >Ist benannt, dass einer Datenverarbeitung widersprochen werden kann, die auf Grundlage berechtigter Interessen erfolgt?

                        <span
                          class="text-muted ms-1"
                          role="button"
                          tabindex="0"
                          data-bs-toggle="tooltip"
                          data-bs-title="
                          Gemäß Art. 6.1f, Art. 21 und Art. 18 DSGVO
                          "
                        >
                          <i class="bi bi-info-circle"></i>
                        </span>
                      </span>
                      <span>
                        <BoolStatusElement :status="report.data?.report.summary?.legal_basis?.legitimate_interest > 0 && report.data?.report.summary.user_rights.object" />
                      </span>
                    </li>

                    <!--
                    <li class="list-group-item d-flex justify-content-between">
                      <span class="fw-semibold">Ist die Datenschutzerklärung hinsichtlich der berechtigten Interessen und Widerspruch vollständig?

                        <span class="text-muted ms-1" role="button" tabindex="0" data-bs-toggle="tooltip" data-bs-title="
                          Gemäß Art. 6.1f, Art. 21 und Art. 18 DSGVO
                          ">
                          <i class="bi bi-info-circle"></i>
                        </span>
                      </span>
                      <span>
                        <BoolStatusElement :status="report.data?.report.summary.legal_basis.legitimate_interest > 0 && report.data?.report.summary.user_rights.object" />
                      </span>
                    </li>
                  -->

                    <li class="list-group-item d-flex justify-content-between">
                      <span class="fw-semibold"
                        >Wird über das Beschwerderecht bei einer Aufsichtsbehörde hingewiesen?

                        <span
                          class="text-muted ms-1"
                          role="button"
                          tabindex="0"
                          data-bs-toggle="tooltip"
                          data-bs-title="
                          Gemäß Art. 77 DSGVO
                          "
                        >
                          <i class="bi bi-info-circle"></i>
                        </span>
                      </span>
                      <span>
                        <BoolStatusElement :status="report.data?.report.summary.user_rights.complain" />
                      </span>
                    </li>
                  </ul>
                </div>
              </div>

              <!-- Kontakt -->
              <div data-sync="dse-kontakt" class="card mb-3" v-if="report.data?.report.scores.meta">
                <div class="card-header"><h6 class="card-title fw-bold datablock-title">Kontaktinformationen</h6></div>

                <div class="card-body">
                  <ul class="list-group list-group-flush">
                    <li class="list-group-item d-flex justify-content-between">
                      <span class="fw-semibold">Wird eine Telefonnummer zur Kontaktaufnahme angegeben?</span>
                      <span>
                        <BoolStatusElement :status="report.data?.report.scores.meta.contact_phone" />
                      </span>
                    </li>

                    <li class="list-group-item d-flex justify-content-between">
                      <span class="fw-semibold">Wird eine E-Mail Adresse zur Kontaktaufnahme angegeben?</span>
                      <span>
                        <span
                          v-if="report.data?.report.summary.contact.email && report.data?.report.summary.contact.email_addresses && report.data?.report.summary.contact.email_addresses.length > 0"
                          class="me-2 text-break"
                        >
                          <span v-for="(email, index) in report.data?.report.summary.contact.email_addresses" :key="index">
                            <a :href="`mailto:${email}`">{{ email }}</a>
                            <span v-if="index < report.data?.report.summary.contact.email_addresses.length - 1">, </span>
                          </span>
                        </span>
                        <BoolStatusElement :status="report.data?.report.summary.contact.email" />
                      </span>
                    </li>

                    <li class="list-group-item d-flex justify-content-between">
                      <span class="fw-semibold">Wird eine Adresse zur Kontaktaufnahme angegeben?</span>
                      <span>
                        <BoolStatusElement :status="report.data?.report.scores.meta.contact_address" />
                      </span>
                    </li>

                    <li class="list-group-item d-flex justify-content-between">
                      <span class="fw-semibold">Wird eine Webseite zur Kontaktaufnahme angegeben?</span>
                      <span>
                        <BoolStatusElement :status="report.data?.report.scores.meta.contact_website" />
                      </span>
                    </li>

                    <li class="list-group-item d-flex justify-content-between">
                      <span class="fw-semibold">Wird ein Datenschutzbeauftragter angegeben? </span>
                      <span>
                        <BoolStatusElement :status="report.data?.report.scores.meta.policy_officer" />
                      </span>
                    </li>

                    <!--
                    <span class="mt-3">
                      Informationen zur Vollständigkeit:
                    </span>
                    <ProgressBarElement class="mt-3" :value="report.data?.report.scores.meta.final_score" variant="success" show-label-max />
                  --></ul>
                </div>
              </div>

              <!-- Transparenz -->
              <div data-sync="dse-transparenz" class="card mb-3" v-if="report.data?.report.scores.transparency">
                <div class="card-header"><h6 class="card-title fw-bold datablock-title">Transparenz</h6></div>

                <div class="card-body">
                  <ul class="list-group list-group-flush">
                    <li class="list-group-item d-flex justify-content-between">
                      <span class="fw-semibold"
                        >Wie genau werden gesammelte Daten benannt?

                        <span
                          class="text-muted ms-1"
                          role="button"
                          tabindex="0"
                          data-bs-toggle="tooltip"
                          data-bs-title="
                          Der Score wird anhand der in einer Datenschutzerklärung genannten Datentypen und ihrer Tiefe in der Datentyp‑Hierarchie ermittelt. Je spezifischer die genannten Datentypen, desto höher fällt der Score aus. Beispielsweise wird eine Erklärung, die nur „Personenbezogene Daten“ nennt, niedriger bewertet als eine, die konkrete Typen wie „Standort‑“ oder „Gesundheitsdaten“ erwähnt.

Die Punkte jedes Datentyps werden aus dem Kubik seiner Hierarchietiefe berechnet; Blattknoten erhalten zusätzlich Punkte. Die Gesamtsumme wird anschließend durch die Anzahl der genannten Datentypen relativiert.

                          "
                        >
                          <i class="bi bi-info-circle"></i>
                        </span>
                      </span>
                      <span>{{ report.data?.report.scores.transparency.data_specificity_grade }}</span>
                    </li>

                    <li class="list-group-item d-flex justify-content-between" v-if="report.data?.report.scores.transparency.third_party_specificity_grade">
                      <span class="fw-semibold"
                        >Wie genau werden Drittparteien benannt?

                        <span
                          class="text-muted ms-1"
                          role="button"
                          tabindex="0"
                          data-bs-toggle="tooltip"
                          data-bs-title="

                          Der Score beruht auf der Menge konkreter Drittparteien, die in einer Datenschutzerklärung erwähnt werden. Je genauer die Benennung, desto höher ist der Score. Eine Aussage, die lediglich „Drittparteien“ enthält, führt zu einem geringeren Score als eine, die spezifische Bezeichnungen wie „Zahlungsabwickler“ oder „Analyse‑Provider“ verwendet. Sätze, in denen explizite Firmennamen (z. B. „Google“, „Amazon“) genannt werden, werden doppelt gewichtet. Die erreichten Punkte werden durch die Gesamtzahl der Sätze, die Drittparteien erwähnen, normalisiert.

                          "
                        >
                          <i class="bi bi-info-circle"></i>
                        </span>
                      </span>
                      <span>{{ report.data?.report.scores.transparency.third_party_specificity_grade }}</span>
                    </li>

                    <li class="list-group-item d-flex justify-content-between">
                      <span class="fw-semibold"
                        >Wie genau wird die Datenspeicherung beschrieben?

                        <span
                          class="text-muted ms-1"
                          role="button"
                          tabindex="0"
                          data-bs-toggle="tooltip"
                          data-bs-title="

                        Der Score wird aus den genannten Aufbewahrungsdauer‑Kategorien abgeleitet. Für jede genannte Kategorie werden feste Punkte vergeben:

                        Speicherdauer = 5 Punkte,
                        Dauer der Rechtsgrundlage = 3 Punkte,
                        Gesetzliche Aufbewahrungsfrist = 2 Punkte,
                        Notwendigkeit = 1 Punkt.

                        Die Summe dieser Punkte bildet den Aufbewahrungs‑Score.
                          "
                        >
                          <i class="bi bi-info-circle"></i>
                        </span>
                      </span>
                      <span>{{ report.data?.report.scores.transparency.retention_specificity_grade }}</span>
                    </li>
                  </ul>

                  <p class="text-muted mt-3 mb-0">
                    Wie kommt die Bewertung zustande?

                    <span
                      class="text-muted ms-1"
                      role="button"
                      tabindex="0"
                      data-bs-toggle="tooltip"
                      data-bs-title="

                      Alle Scores aller Richtlinien im Datensatz werden analysiert und die Schwellenwerte für die jeweiligen Noten werden mithilfe der Jenks‑Natural‑Breaks‑Optimierung bestimmt. Auf dieser Basis wird jeder Score relativ zur Gesamtdatenverteilung einer Note zwischen 'A' und 'D' zugeordnet.

                      "
                    >
                      <i class="bi bi-info-circle"></i>
                    </span>
                  </p>
                </div>
              </div>

              <!-- Kontext -->
              <div data-sync="dse-kontext" class="card mb-3" v-if="report.data?.report.summary?.context">
                <div class="card-header"><h6 class="card-title fw-bold datablock-title">Kontext</h6></div>

                <div class="card-body">
                  <ul class="list-group list-group-flush">
                    <li class="list-group-item d-flex justify-content-between">
                      <span class="fw-semibold"
                        >Anteil für Webseite und Dienste

                        <span
                          class="text-muted ms-1"
                          role="button"
                          tabindex="0"
                          data-bs-toggle="tooltip"
                          data-bs-title="
                          Prozentsatz der Sätze, welche sich auf die Webseite und Dienste des Herstellers beziehen
                          "
                        >
                          <i class="bi bi-info-circle"></i>
                        </span>
                      </span>
                      <span class="text-end">
                        {{
                          (
                            ((report.data?.report.summary?.context?.account +
                              report.data?.report.summary?.context?.backend +
                              report.data?.report.summary?.context?.communication +
                              report.data?.report.summary?.context?.event +
                              report.data?.report.summary?.context?.recruitment +
                              report.data?.report.summary?.context?.services +
                              report.data?.report.summary?.context?.store +
                              report.data?.report.summary?.context?.website) /
                              report.data?.report.summary?.policy?.total_sentences) *
                            100
                          ).toFixed(1)
                        }}
                        %</span
                      >
                    </li>

                    <li class="list-group-item d-flex justify-content-between">
                      <span class="fw-semibold"
                        >Anteil für App

                        <span
                          class="text-muted ms-1"
                          role="button"
                          tabindex="0"
                          data-bs-toggle="tooltip"
                          data-bs-title="
                          Prozentsatz der Sätze, welche sich auf die App des Herstellers beziehen
                          "
                        >
                          <i class="bi bi-info-circle"></i>
                        </span>
                      </span>
                      <span class="text-end"> {{ ((report.data?.report.summary?.context?.app / report.data?.report.summary?.policy?.total_sentences) * 100).toFixed(1) }} %</span>
                    </li>

                    <li class="list-group-item d-flex justify-content-between">
                      <span class="fw-semibold"
                        >Anteil für Gerät

                        <span
                          class="text-muted ms-1"
                          role="button"
                          tabindex="0"
                          data-bs-toggle="tooltip"
                          data-bs-title="
                          Prozentsatz der Sätze, welche sich auf das Gerät beziehen
                          "
                        >
                          <i class="bi bi-info-circle"></i>
                        </span>
                      </span>
                      <span class="text-end"> {{ ((report.data?.report.summary?.context?.device / report.data?.report.summary?.policy?.total_sentences) * 100).toFixed(1) }} %</span>
                    </li>
                  </ul>
                </div>
              </div>

              <!-- Thematiken -->
              <div data-sync="dse-thematiken" class="card mb-3" v-if="report.data?.report.topic_map_png">
                <div class="card-header"><h6 class="card-title fw-bold datablock-title">Verteilung der Thematiken innerhalb der Datenschutzerklärung</h6></div>

                <div class="card-body">
                  <div class="spoiler">
                    <button
                      class="btn btn-secondary w-100 collapsed"
                      type="button"
                      data-bs-toggle="collapse"
                      data-bs-target="#policy_thematiken"
                      aria-expanded="true"
                      aria-controls="policy_thematiken"
                    >
                      Klick zum Aufklappen
                    </button>

                    <div class="collapse" id="policy_thematiken">
                      <div class="d-flex justify-content-center">
                        <img :src="`data:image/png;base64,` + report.data?.report.topic_map_png" style="max-width: min(50em, 100%)" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <!-- -->

          <!-- NAV Internetverbindungen -->
          <div class="tab-pane fade" :class="{ 'show active': currentTab === 'network' }" role="tabpanel">
            <div data-sync="verbindungen-main" v-if="deviceData?.net_reports.length > 0">
              <h5 class="mb-4"><i class="bi bi-router me-1"></i> Analyse des Netzwerkverkehrs:</h5>

              <div v-for="report in deviceData?.net_reports" :key="report.id" class="mb-4">
                <h5 v-if="formatReportType(report.report_type)">{{ formatReportType(report.report_type) }}</h5>
                <p class="text-muted small mb-3">Ausgewertet am {{ formatDateTime(report.data?.info.date) }}</p>

                <div class="row g-4 mb-4">
                  <div class="col-md-6">
                    <div class="card h-100 border-0 shadow-sm bg-body-tertiary">
                      <div class="card-body">
                        <h6 class="card-title fw-bold mb-3">
                          <i class="bi bi-globe2 me-2"></i>Datenfluss nach Standorten

                          <span
                            class="text-muted ms-1"
                            role="button"
                            tabindex="0"
                            data-bs-toggle="tooltip"
                            data-bs-title="
                          Dies sind die Länder, in denen die Server stehen, welche von dem Gerät kontaktiert wurden
                          "
                          >
                            <i class="bi bi-info-circle"></i>
                          </span>
                        </h6>

                        <div v-if="report.data?.countryRanking && report.data?.countryRanking.length > 0">
                          <div v-for="(country, idx) in report.data.countryRanking" :key="idx" class="mb-3">
                            <div class="d-flex justify-content-between align-items-center mb-1 small">
                              <span class="fw-semibold d-flex align-items-center gap-2">
                                <CountryFlagElement v-if="country.code && country.code !== 'Private'" :code="country.code" :showName="true" />
                                <span v-else-if="country.code" class="text-muted">Lokales Netzwerk</span>
                                <span v-else class="text-muted">Unbekannter Standort</span>
                              </span>
                              <span class="text-muted"
                                >{{ country.bytesFormatted }} ({{
                                  country.percentage > 0.01 ? Number.parseFloat((100 * country.percentage).toFixed(0)) : Number.parseFloat((100 * country.percentage).toFixed(2))
                                }}%)</span
                              >
                            </div>
                            <div class="progress" style="height: 8px">
                              <div
                                class="progress-bar bg-primary rounded"
                                role="progressbar"
                                :style="{ width: country.percentage * 100 + '%' }"
                                :aria-valuenow="country.percentage * 100"
                                aria-valuemin="0"
                                aria-valuemax="100"
                              ></div>
                            </div>
                          </div>
                        </div>
                        <div v-else class="text-muted small">Keine Standortdaten verfügbar.</div>
                      </div>
                    </div>
                  </div>

                  <div class="col-md-6">
                    <div class="card h-100 border-0 shadow-sm bg-body-tertiary">
                      <div class="card-body">
                        <h6 class="card-title fw-bold mb-3">
                          <i class="bi bi-building me-2"></i>Kontaktierte Unternehmen

                          <span
                            class="text-muted ms-1"
                            role="button"
                            tabindex="0"
                            data-bs-toggle="tooltip"
                            data-bs-title="
                          Dies sind die Unternehmen, die die Server betreiben, welche von dem Gerät kontaktiert wurden
                          "
                          >
                            <i class="bi bi-info-circle"></i>
                          </span>
                        </h6>

                        <ul class="list-group list-group-flush bg-transparent">
                          <li v-for="(item, index) in report.data?.filtered_network_countries" :key="index" class="list-group-item bg-transparent d-flex align-items-center gap-2 px-0 py-2">
                            <span v-if="item && item.company_name" class="d-flex align-items-center gap-2 w-100">
                              <CountryFlagElement :code="item.company_country" :showName="false" v-if="item.company_country" />
                              <span class="fw-medium text-body">{{ item.company_name }}</span>
                            </span>
                            <span v-else class="text-muted small">Unbekanntes Unternehmen</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="col-md-12">
                  <div class="card h-100 border-0 shadow-sm bg-body-tertiary">
                    <div class="card-body">
                      <h6 class="card-title fw-bold mb-3"><i class="bi bi-wifi me-2"></i>Technische Verbindungsinformationen, nach Verbindungsprotokoll <small>(Klick zum Ausklappen)</small></h6>

                      <div data-sync="verbindungen-detailiert" class="card card-body p-2">
                        <div class="accordion" :id="`accordion-protocols-${report.id}`">
                          <div class="accordion-item" v-for="([protocol, flows], pIdx) in getSortedProtocolGroups(report.data?.grouped_flows)" :key="protocol">
                            <h2 class="accordion-header">
                              <button
                                class="accordion-button collapsed"
                                type="button"
                                data-bs-toggle="collapse"
                                :data-bs-target="`#collapse-proto-${report.id}-${slugify(protocol)}`"
                                aria-expanded="false"
                              >
                                <span class="badge bg-secondary me-2 text-uppercase">{{ protocol }}</span>

                                <span class="badge me-2" :class="getProtocolExtra(protocol) ? getProtocolExtra(protocol).color : ''" v-if="getProtocolExtra(protocol)">{{
                                  getProtocolExtra(protocol).text
                                }}</span>

                                <span class="text-muted small">{{ flows.length }} {{ flows.length === 1 ? 'Verbindung' : 'Verbindungen' }}</span>
                              </button>
                            </h2>
                            <div :id="`collapse-proto-${report.id}-${slugify(protocol)}`" class="accordion-collapse collapse" :data-bs-parent="`#accordion-protocols-${report.id}`">
                              <div class="accordion-body p-0">
                                <div class="table-responsive">
                                  <table class="table table-sm table-hover align-middle mb-0">
                                    <thead>
                                      <tr>
                                        <th class="ps-3">Ziel</th>
                                        <th>Port</th>
                                        <th class="pe-3">Betreiber</th>
                                        <th>Datenmenge</th>
                                        <th>Hinweis</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      <tr v-for="(flow, idx) in flows" :key="idx">
                                        <td class="ps-3">
                                          <span class="d-inline-flex align-items-center gap-2">
                                            <CountryFlagElement :code="flow['target_info.country_c']" v-if="flow['target_info.country_c']" />
                                            <span v-if="getFlowTarget(flow)">{{ getFlowTarget(flow) }}</span>
                                            <span v-else class="text-muted">–</span>
                                          </span>
                                        </td>
                                        <td>
                                          <span v-if="flow.target_port" class="text-muted">{{ flow.target_port }}</span>
                                          <span v-else class="text-muted">–</span>
                                        </td>
                                        <td class="pe-3">
                                          <span v-if="flow['target_info.entity']" class="d-inline-flex align-items-center gap-2">
                                            <CountryFlagElement :code="flow['target_info.ent_origin_c']" v-if="flow['target_info.ent_origin_c']" />
                                            {{ flow['target_info.entity'] }}
                                          </span>
                                          <span v-else class="text-muted">Unbekannt</span>
                                        </td>
                                        <td>
                                          <i class="bi bi-cloud-arrow-down-fill"></i> {{ formatBytes(flow.bytes_in) }} / <i class="bi bi-cloud-arrow-up-fill"></i> {{ formatBytes(flow.bytes_out) }}
                                        </td>

                                        <td>
                                          {{ getConnectionInfo(flow) }}
                                        </td>
                                      </tr>
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <hr v-if="deviceData?.net_reports.length > 1" />
              </div>
            </div>
          </div>

          <!-- NAV Companioon App -->

          <div class="tab-pane fade" :class="{ 'show active': currentTab === 'companionapp' }" role="tabpanel">
            <div data-sync="companion-apps">
              <h5 class="mb-4"><i class="bi bi-app-indicator me-1"></i> Zugehörige Companion-Apps:</h5>

              <div data-sync="dse-app-allgemein" class="card mb-3" v-if="deviceData?.companion_apps?.android">
                <div class="card-body">
                  <h6 class="card-title fw-bold">Allgemein</h6>
                  <ul class="list-group list-group-flush">
                    <li class="list-group-item d-flex justify-content-between">
                      <span class="fw-semibold"
                        >Ist eine Kontoregistrierung erforderlich?
                        <span
                          class="text-muted ms-1"
                          role="button"
                          tabindex="0"
                          data-bs-toggle="tooltip"
                          data-bs-title="
                          Wird eine Accountregistrierung vorgeschlagen, sobald die App für die Einrichtung gestartet wird?
                          "
                        >
                          <i class="bi bi-info-circle"></i>
                        </span>
                      </span>
                      <span class="text-end">
                        <BoolStatusElement :status="true" />
                      </span>
                    </li>

                    <!--
                    <li class="list-group-item d-flex justify-content-between">
                      <span class="fw-semibold">Ist die Registrierung überspringbar?
                      </span>
                      <span class="text-end">
                        <BoolStatusElement :status="false" :color-inverted="false" />
                      </span>
                    </li>-->

                    <li class="list-group-item d-flex justify-content-between flex-column">
                      <span class="fw-semibold flex-grow-1 flex-shrink-1 flex-base-0">
                        Welche Daten müssen bei der Registrierung angegeben werden? <nobr>( {{ 3 }} )</nobr>
                      </span>
                      <span class="flex-grow-2 flex-shrink-1 flex-base-0">
                        <ul class="columns-3">
                          <li>E-Mail-Adresse (mit Bestätigung)</li>
                          <li>Passwort</li>
                          <li>Vorname und Nachname</li>
                        </ul>
                      </span>
                    </li>

                    <li class="list-group-item d-flex justify-content-between">
                      <span class="fw-semibold"
                        >Sind gegen Bezahlung weitere Funktionen freischaltbar?
                        <span
                          class="text-muted ms-1"
                          role="button"
                          tabindex="0"
                          data-bs-toggle="tooltip"
                          data-bs-title="
                          Werden weitere Dienste und Funktionen zum Kauf oder als Abo-Modell in der App angeboten?
                          "
                        >
                          <i class="bi bi-info-circle"></i>
                        </span>
                      </span>
                      <span class="text-end">
                        <BoolStatusElement :status="false" />
                      </span>
                    </li>
                  </ul>
                </div>
              </div>

              <div class="row g-3">
                <!-- Android -->
                <div v-if="deviceData?.companion_apps?.android" class="col-md-12">
                  <div class="card h-100 border-0 shadow-sm">
                    <div class="card-body">
                      <div class="d-flex align-items-center mb-2">
                        <h5 class="card-title mb-0">
                          <a :href="deviceData.companion_apps.android.store_link" target="_blank" rel="noopener noreferrer" class="text-decoration-none text-reset fw-bold">
                            <i class="bi bi-google-play text-success me-1"></i> Google Play -

                            {{ deviceData.companion_apps.android.name || 'Android App' }}
                          </a>
                        </h5>
                      </div>

                      <!-- Version, Preis  -->
                      <div class="text-muted small">
                        <span v-if="deviceData.companion_apps.android.developer" class="me-3" title="Entwickler">
                          <i class="bi bi-person"></i> Entwickler: {{ deviceData.companion_apps.android.developer }}
                        </span>
                        <span v-if="deviceData.companion_apps.android.updated" class="me-3" title="Zuletzt aktualisiert">
                          <i class="bi bi-calendar-date"></i> Zuletzt aktualisiert: {{ formatDate(new Date(deviceData.companion_apps.android.updated * 1000)) }}
                        </span>
                        <br />
                        <span v-if="deviceData.companion_apps.android.version && deviceData.companion_apps.android.version !== 'Varies with device'" class="me-3" title="Versionsnummer">
                          <i class="bi bi-tag"></i> App-Version: {{ deviceData.companion_apps.android.version }}
                        </span>
                        <span v-else-if="deviceData.companion_apps.android.version" class="me-3"> <i class="bi bi-tag"></i> Versionsnummer ist Geräteabhängig </span>

                        <span v-if="deviceData.companion_apps.android.free !== undefined" class="me-3" title="Kosten">
                          <i :class="deviceData.companion_apps.android.free ? 'bi bi-cash text-success' : 'bi bi-cash text-danger'"></i>
                          {{ deviceData.companion_apps.android.free ? 'Kostenlos' : 'Kostenpflichtig' }}
                        </span>
                        <span v-if="deviceData.companion_apps.android.contains_ads" class="me-3 text-warning" title="Werbung"> <i class="bi bi-badge-ad-fill"></i> Enthält Werbung </span>
                        <span v-else class="me-3 text-success" title="Werbung"> <i class="bi bi-badge-ad-fill"></i> Enthält keine Werbung </span>
                      </div>

                      <!-- Berechtigungen -->
                      <div v-if="deviceData.companion_apps.android.permissions && Object.keys(deviceData.companion_apps.android.permissions).length > 0" class="mt-3">
                        <div class="fw-semibold small text-body-secondary mb-2">
                          <i class="bi bi-shield-lock-fill me-1"></i>
                          App-Berechtigungen (Android)
                        </div>

                        <div class="row g-2 col-xl-12">
                          <div v-for="(desc, category) in deviceData.companion_apps.android.permissions" :key="category" class="col-12 col-md-6 col-xl-4">
                            <div class="card border bg-body-tertiary rounded-3 p-2 h-100">
                              <div class="d-flex align-items-center gap-2 mb-1">
                                <i :class="['me-1 small', getPermissionIcon(category)]"></i>
                                <span class="fw-semibold small">
                                  {{ category === 'Uncategorized' ? 'Ohne Kategorie' : category }}
                                </span>
                                <span class="badge bg-body-tertiary border rounded-pill ms-auto">
                                  {{ desc.length }}
                                </span>
                              </div>

                              <ul class="list-unstyled mb-0 small">
                                <li v-for="(d, i) in desc" :key="i" class="d-flex align-items-start gap-2 py-1">
                                  <i class="bi bi-dot text-body-secondary"></i>
                                  <span>{{ d }}</span>
                                </li>
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- iOS  -->
                <div v-if="deviceData?.companion_apps?.ios" class="col-md-6">
                  <div class="card h-100 border-0 shadow-sm">
                    <div class="card-body">
                      <div class="d-flex align-items-center mb-2">
                        <i class="bi bi-apple text-dark fs-4 me-2"></i>
                        <h5 class="card-title mb-0">
                          <a :href="deviceData.companion_apps.ios.store_link" target="_blank" rel="noopener noreferrer" class="text-decoration-none text-reset">
                            {{ deviceData.companion_apps.ios.name || 'iOS App' }}
                          </a>
                        </h5>
                      </div>

                      <div class="text-muted small">
                        <span v-if="deviceData.companion_apps.ios.version" class="me-3"> <i class="bi bi-tag me-1"></i> v{{ deviceData.companion_apps.ios.version }} </span>
                        <span v-if="deviceData.companion_apps.ios.free !== undefined" class="me-3">
                          <i :class="deviceData.companion_apps.ios.free ? 'bi bi-tag-fill text-success' : 'bi bi-tag-fill text-danger'"></i>
                          {{ deviceData.companion_apps.ios.free ? 'Free' : 'Paid' }}
                        </span>
                        <span v-if="!deviceData.companion_apps.ios.permissions" class="text-muted"> <i class="bi bi-info-circle me-1"></i> Permissions hidden by Apple </span>
                      </div>
                    </div>
                    <div class="card-footer bg-transparent">
                      <a :href="deviceData.companion_apps.ios.store_link" target="_blank" rel="noopener noreferrer" class="btn btn-sm btn-outline-dark w-100"> View on App Store </a>
                    </div>
                  </div>
                </div>

                <!-- Empty state -->
                <div v-if="!deviceData?.companion_apps?.android && !deviceData?.companion_apps?.ios" class="col-12 text-muted fst-italic">No companion apps available.</div>
              </div>
            </div>
          </div>

          <!-- NAV Firmware -->
          <div class="tab-pane fade" :class="{ 'show active': currentTab === 'firmware' }" role="tabpanel">
            <h5>Firmware:</h5>

            <div class="" v-for="report in deviceData?.firmware_reports" :key="report.id">
              <div v-if="report.status !== 'DONE'">Die Firmware wird aktuell noch untersucht. Bitte gedulden Sie sich noch ein wenig.</div>
              <div v-else>
                <p class="text-muted small mb-2">Ausgewertet am {{ formatDate(report.added_at) }}</p>

                <ul class="nav nav-tabs mb-3" role="tablist">
                  <li class="nav-item" role="presentation">
                    <button
                      class="nav-link"
                      :class="{ active: getFirmwareTab(report.id) === 'uris' }"
                      @click="setFirmwareTab(report.id, 'uris')"
                      type="button"
                      role="tab"
                      v-if="report?.data?.uris?.length > 0"
                    >
                      URIs
                    </button>
                  </li>
                  <li class="nav-item" role="presentation">
                    <button
                      class="nav-link"
                      :class="{ active: getFirmwareTab(report.id) === 'peripherals' }"
                      @click="setFirmwareTab(report.id, 'peripherals')"
                      type="button"
                      role="tab"
                      v-if="report?.data?.peripherals?.length > 0"
                    >
                      Peripherie
                    </button>
                  </li>
                  <li class="nav-item" role="presentation">
                    <button
                      class="nav-link"
                      :class="{ active: getFirmwareTab(report.id) === 'issues' }"
                      @click="setFirmwareTab(report.id, 'issues')"
                      type="button"
                      role="tab"
                      v-if="report?.data?.issues?.length > 0"
                    >
                      Probleme
                    </button>
                  </li>
                  <li class="nav-item" role="presentation" v-if="getReportCves(report).length > 0">
                    <button class="nav-link" :class="{ active: getFirmwareTab(report.id) === 'cves' }" @click="setFirmwareTab(report.id, 'cves')" type="button" role="tab">CVEs</button>
                  </li>
                </ul>

                <div class="tab-content">
                  <!-- TAB FÜR URIs -->
                  <div class="tab-pane fade" :class="{ 'show active': getFirmwareTab(report.id) === 'uris' }" role="tabpanel">
                    <p><strong>Gefundene URIs, welche möglicherweise kontaktiert werden können:</strong></p>

                    <div class="accordion-item" v-for="uri in report?.data?.uris ?? []" :key="id">
                      <CountryFlagElement :code="uri.ipAddresses[0].countryCode" :showName="true" v-if="uri?.ipAddresses?.length > 0 && uri.ipAddresses[0].countryCode" />
                      <span v-else-if="country.code === 'Private'" class="text-muted">Lokales Netzwerk</span>
                      <span v-else class="text-muted">Unbekannter Standort</span>:
                      <a :href="uri.uri" target="_blank">{{ uri.uri }}</a>
                    </div>
                  </div>

                  <!-- TAB FÜR Peripherie -->
                  <div class="tab-pane fade" :class="{ 'show active': getFirmwareTab(report.id) === 'peripherals' }" role="tabpanel">
                    <p><strong>Gefundene Peripherie, also verbaute Hardwarekomponenten:</strong></p>

                    <div class="accordion-item" v-for="item in report?.data?.peripherals ?? []" :key="id">
                      {{ item }}
                    </div>
                  </div>

                  <!-- TAB FÜR PROBLEME -->
                  <div class="tab-pane fade" :class="{ 'show active': getFirmwareTab(report.id) === 'issues' }" role="tabpanel">
                    <p><strong>Erkannte Probleme:</strong></p>

                    <div class="accordion mb-3" id="accordion-problems">
                      <div class="accordion-item" v-for="(group, type) in groupIssues(report?.data?.issues ?? [])" :key="type">
                        <h2 class="accordion-header">
                          <button
                            class="accordion-button collapsed"
                            type="button"
                            data-bs-toggle="collapse"
                            :data-bs-target="`#collapse-${slugify(type)}`"
                            aria-expanded="false"
                            :aria-controls="`collapse-${slugify(type)}`"
                          >
                            <div class="card-body">
                              <h5 class="card-title">
                                {{ type }} <span class="text-nowrap">( x {{ group.length }} )</span>
                              </h5>
                              <h6 class="card-subtitle mb-2 text-body-secondary">{{ group.length > 0 ? group[0].severity : '' }}</h6>
                            </div>
                          </button>
                        </h2>
                        <div :id="`collapse-${slugify(type)}`" class="accordion-collapse collapse" data-bs-parent="#accordion-problems">
                          <div class="accordion-body">
                            <p class="card-text">Problem: {{ group[0].doc.summary }}</p>
                            <p class="card-text">Beschreibung: {{ group[0].doc.description }}</p>

                            <span v-if="group[0].doc.references.length > 0">Weitere Informationen:</span>
                            <ul class="" v-for="ref in group[0].doc.references" :key="ref.url">
                              <li>
                                <a :href="ref.url" target="_blank"> {{ ref.title }} </a>
                              </li>
                            </ul>

                            <div v-for="(item, i) in group" :key="i" class="card mb-3">
                              <div class="card-body">
                                <p class="card-text"><strong>Betroffene Datei:</strong> {{ item.file.name }}</p>
                                <p class="card-text"><strong>Vollständiger Pfad: </strong>{{ item.summary.split(' - ')[item.summary.split(' - ').length - 1] }}</p>

                                <p class="card-text"><strong>Informationen: </strong>{{ item.summary.split(' - ')[1] }}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- TAB FÜR CVES -->
                  <div class="tab-pane fade" :class="{ 'show active': getFirmwareTab(report.id) === 'cves' }" role="tabpanel">
                    <div class="form-check form-switch mb-3">
                      <input class="form-check-input" type="checkbox" role="switch" :id="`cve-filter-${report.id}`" v-model="showOnlyCriticalHigh[report.id]" />
                      <label class="form-check-label" :for="`cve-filter-${report.id}`">Nur Critical &amp; High anzeigen</label>
                    </div>

                    <div class="accordion mb-3" :id="`accordion-cves-${report.id}`">
                      <!-- Äußere Schleife: Gruppiert nach Schweregrad (CRITICAL, HIGH, ...) -->
                      <div class="accordion-item" v-for="(cveGroup, severity) in getFilteredCveGroups(report)" :key="severity">
                        <h2 class="accordion-header">
                          <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" :data-bs-target="`#collapse-cve-group-${report.id}-${severity}`" aria-expanded="false">
                            <div class="d-flex w-100 justify-content-between align-items-center pe-3">
                              <strong
                                >{{ severity }} <span class="text-nowrap ms-2 fw-normal text-muted">( {{ cveGroup.length }} Einträge )</span></strong
                              >
                              <span class="badge" :class="getBadgeClass(severity)">
                                {{ severity }}
                              </span>
                            </div>
                          </button>
                        </h2>

                        <div :id="`collapse-cve-group-${report.id}-${severity}`" class="accordion-collapse collapse" :data-bs-parent="`#accordion-cves-${report.id}`">
                          <div class="accordion-body p-0">
                            <div class="list-group list-group-flush">
                              <div class="list-group-item p-3" v-for="(cve, idx) in cveGroup" :key="idx">
                                <div class="d-flex justify-content-between align-items-start mb-2">
                                  <strong class="fs-6">{{ cve.cve?.id || 'Unbekannte CVE' }}</strong>
                                  <span
                                    class="badge"
                                    :class="getCvssBaseScore(cve) ? getCvssBadgeClass(getCvssBaseScore(cve).score) : 'bg-secondary'"
                                    :title="getCvssBaseScore(cve) ? getCvssBaseScore(cve).version : 'Kein CVSS-Score vorhanden - zeigt OneKey-Risiko-Score'"
                                  >
                                    <template v-if="getCvssBaseScore(cve)"> CVSS: {{ getCvssBaseScore(cve).score.toFixed(1) }} </template>
                                    <template v-else> OneKey-Score: {{ cve.score }} </template>
                                  </span>
                                </div>

                                <p class="small mb-2">{{ cve.cve?.description || 'Keine Beschreibung verfügbar.' }}</p>
                                <p class="card-text small text-muted mb-2" v-if="cve.component?.name"><strong>Betroffene Komponente:</strong> {{ cve.component.name }}</p>

                                <a :href="`https://nvd.nist.gov/vuln/detail/${cve.cve?.id}`" target="_blank" class="btn btn-sm btn-outline-secondary mt-1" v-if="cve.cve?.id">
                                  <i class="bi bi-box-arrow-up-right me-1"></i> Mehr Infos (NVD)
                                </a>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!--
        <div v-if="deviceData?.description">
          <hr />
          <h5>Kurzbeschreibung:</h5>
          <p class="card-text" style="white-space: pre-line">{{ deviceData?.description }}</p>
        </div>

        -->
      </div>
    </div>
  </div>

  <!-- View Original Privacy Policy Modal -->
  <div class="modal fade" ref="originalPrivacyPolicyModalRef" tabindex="-1">
    <div class="modal-dialog modal-xl modal-dialog-scrollable">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title"><i class="bi bi-file-text"></i> Datenschutzerklärung</h5>
          <button type="button" class="btn-close" @click="closeOriginalPrivacyPolicy"></button>
        </div>

        <div class="modal-body" v-html="deviceData?.policy_reports[0].data?.report.html" v-if="deviceData?.policy_reports && deviceData?.policy_reports.length > 0"></div>

        <div class="modal-footer"></div>
      </div>
    </div>
  </div>

  <!-- Report Modal -->
  <div class="modal fade" ref="reportModalRef" tabindex="-1">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title"><i class="bi bi-flag-fill"></i> Eintrag Melden...</h5>
          <button type="button" class="btn-close" @click="closeReportModal"></button>
        </div>

        <div class="modal-body">
          Sind Sie sicher, dass Sie den Beitrag melden möchten?

          <ul>
            <li>Sind Inhalte falsch?</li>
            <li>Sind Informationen veraltet?</li>
            <li>Stimmt etwas mit der Webseite nicht?</li>
            <li>Gibt es anderweitige Probleme?</li>
          </ul>

          <textarea class="form-control mt-3" v-model="reportModalComment" rows="3" placeholder="Bitte beschreiben Sie kurz, was das Problem ist"></textarea>
        </div>

        <div class="modal-footer">
          <button class="btn btn-secondary" @click="closeReportModal">Abbrechen</button>
          <button class="btn btn-warning" @click="confirmReport">Melden</button>
        </div>
      </div>
    </div>
  </div>

  <!-- Delete Request Modal -->
  <div class="modal fade" ref="deleteRequestModalRef" tabindex="-1">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title"><i class="bi bi-trash-fill"></i> Löschung beantragen</h5>
          <button type="button" class="btn-close" @click="closeDeleteRequestModal"></button>
        </div>

        <div class="modal-body">Sind Sie sicher, dass der Beitrag gelöscht werden soll?</div>

        <div class="modal-footer">
          <ButtonElement class="btn btn-secondary" :onClick="closeDeleteRequestModal"> Abbrechen </ButtonElement>
          <ButtonElement class="btn btn-danger" :onClick="confirmDeleteRequest"> Löschung beantragen </ButtonElement>
        </div>
      </div>
    </div>
  </div>

  <!-- Delete Modal -->
  <div class="modal fade" ref="deleteModalRef" tabindex="-1">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title"><i class="bi bi-trash-fill"></i> Beitrag löschen</h5>
          <button type="button" class="btn-close" @click="closeDeleteModal"></button>
        </div>

        <div class="modal-body">Sind Sie sicher, dass der Beitrag endgültig gelöscht werden soll?</div>

        <div class="modal-footer">
          <ButtonElement class="btn btn-secondary" :onClick="closeDeleteModal"> Abbrechen </ButtonElement>
          <ButtonElement class="btn btn-danger" :onClick="confirmDelete"> Beitrag löschen </ButtonElement>
        </div>
      </div>
    </div>
  </div>

  <!-- History Modal -->
  <div class="modal fade" ref="historyModalRef" tabindex="-1">
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title"><i class="bi bi-clock-history"></i> Bearbeitungsverlauf</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
        </div>
        <div class="modal-body">
          <div v-if="historyLoading" class="text-center py-4"><div class="spinner-border"></div></div>

          <div v-else-if="historyDiffs.length === 0" class="text-muted small fst-italic">Keine früheren Versionen vorhanden.</div>

          <div v-else>
            <div v-for="(entry, i) in historyDiffs" :key="i" class="border-top pt-3 mt-3">
              <div class="text-muted small mb-2">
                Geändert am {{ formatDateTime(entry.newer.last_modified_at) }} von
                <strong>{{ entry.newer.modified_by_username }}</strong>
              </div>
              <table class="table table-sm mb-0">
                <thead>
                  <tr>
                    <th style="width: 22%">Feld</th>
                    <th style="width: 39%">Vorher</th>
                    <th style="width: 39%">Nachher</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="d in entry.diffs" :key="d.label">
                    <td class="fw-semibold">{{ d.label }}</td>
                    <td class="text-danger small">
                      <s>{{ d.oldValue }}</s>
                    </td>
                    <td class="text-success small">{{ d.newValue }}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="text-muted small mt-3 border-top pt-3">
              Ursprünglich erstellt von <strong>{{ oldestVersion?.created_by_username }}</strong> am {{ formatDate(oldestVersion?.created_at) }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Message Modal -->
  <div class="modal fade" tabindex="-1" aria-hidden="true" ref="messageModalRef">
    <div class="modal-dialog modal-sm modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-body text-center py-4">
          <div class="text-success fs-1 mb-2">✓</div>
          <h5 class="mb-2">{{ messageModalMessage[0] }}</h5>
          <p class="mb-3">{{ messageModalMessage[1] }}</p>
          <button type="button" class="btn btn-success" data-bs-dismiss="modal">OK</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue'
import ImageGallery from '@/components/ImageGallery.vue'
import { useRouter } from 'vue-router'
import { dataApi } from '@/api/dataApi'
import { userApi } from '@/api/userApi'
import { localization } from '@/locales/localization'
import { Tooltip } from 'bootstrap'
import { handleImageError, formatDate, formatDateTime, formatReportType } from '@/utils/helpers'

import { useAuth } from '@/stores/auth'
const auth = useAuth()

// Elements
import ButtonElement from '@/components/ButtonElement.vue'
import CountryFlagElement from '@/components/CountryFlagElement.vue'
import ProgressBarElement from '@/components/ProgressBarElement.vue'
import BoolStatusElement from '@/components/BoolStatusElement.vue'
import SvgContainer from '@/components/SvgContainer.vue'

const router = useRouter()

function goBack() {
  try {
    router.back()
  } catch (ex) {
    router.push('/')
  }

  //router.push('/')
}

const props = defineProps({
  id: {
    type: String,
    required: true,
  },
  activeTab: {
    type: String,
    default: '',
  },
})

const GROUP_ICONS = {
  Kontoinformationen: 'bi-person-badge',
  'Identitäts- und Personenstammdaten': 'bi-person-vcard',
  Kontaktinformationen: 'bi-telephone',
  'Gesundheits- und Fitnessdaten': 'bi-heart-pulse',
  'Biometrische Daten': 'bi-fingerprint',
  'Finanz- und Zahlungsdaten': 'bi-wallet2',
  'Netzwerk- und Verbindungsdaten': 'bi-wifi',
  'Geräte- und Hardwaredaten': 'bi-cpu',
  'Standort- und Umweltdaten': 'bi-geo-alt',
  'Energie- und Verbrauchsdaten': 'bi-lightning-charge',
  'Smart-Home-Daten': 'bi-house-door',
  'Nutzungs- und Interaktionsdaten': 'bi-cursor',
  Werbetracking: 'bi-megaphone',
  'Kamera- und Mediendaten': 'bi-collection-play',
  'Unternehmens- und Personaldaten': 'bi-briefcase',
  Berechtigungen: 'bi-shield-lock',
  'Sensible und Rechtliche Daten': 'bi-law-justice',
  'Sonstige Daten': 'bi-three-dots',
  Unkategorisiert: 'bi-inbox',
}
const DATA_TYPE_GROUPS = [
  {
    label: 'Kontoinformationen',
    keys: [
      'AccountData',
      'AccountID',
      'ActivationTime',
      'AuthToken',
      'CredentialData',
      'EmailAddress',
      'FCMToken',
      'OpenID',
      'Password',
      'ProfileData',
      'ProfilePicture',
      'RegistrationData',
      'SecurityInformation',
      'SecurityPin',
      'SessionID',
      'ThirdPartyHandle',
      'UserID',
      'Username',
    ],
  },
  {
    label: 'Identitäts- und Personenstammdaten',
    keys: [
      'Age',
      'BiographicInformation',
      'DateOfBirth',
      'DriverLicense',
      'Ethnicity',
      'FirstName',
      'Gender',
      'GovernmentID',
      'Identifier',
      'LastName',
      'Language',
      'Name',
      'Nationality',
      'Nickname',
      'Passport',
      'SocialSecurityNumber',
      'TaxID',
      'PersonalData',
      'SensitiveData',
    ],
  },
  {
    label: 'Kontaktinformationen',
    keys: ['Address', 'AreaCode', 'City', 'ContactInformation', 'Contacts', 'Country', 'PhoneNumber', 'Timezone'],
  },
  {
    label: 'Gesundheits- und Fitnessdaten',
    keys: [
      'BMI',
      'BloodOxygenLevel',
      'BloodPressure',
      'BloodSugar',
      'BodyFat',
      'BoneDensity',
      'CoughingData',
      'EmergencyData',
      'FitnessGoals',
      'HealthData',
      'HealthStatus',
      'HeartRate',
      'HeartRateData',
      'Height',
      'MenstrualCycleData',
      'MetabolicInformation',
      'MuscleMass',
      'PhysicalBodyMetrics',
      'SnoringData',
      'SleepData',
      'StepCountData',
      'Weight',
    ],
  },
  {
    label: 'Biometrische Daten',
    keys: ['BiometricData', 'FacialData', 'FingerprintData', 'VoiceCharacteristics'],
  },
  {
    label: 'Finanz- und Zahlungsdaten',
    keys: [
      'BankAccountInformation',
      'BankAccountNumber',
      'BankHolderName',
      'BillingData',
      'BillingReceipts',
      'CardExpiryDate',
      'CommercialInformation',
      'CreditCardInformation',
      'CreditCardNumber',
      'CreditScore',
      'DebitCardInformation',
      'FinancialData',
      'FinancialStatus',
      'InAppTransactions',
      'IncomeData',
      'InvoiceData',
      'OrderData',
      'OrderHistory',
      'OrderNumber',
      'PaymentAmount',
      'PaymentCardInformation',
      'PaymentCardNumber',
      'PaymentData',
      'PaymentMethod',
      'PurchaseDate',
      'PurchaseMotivation',
      'ShippingInformation',
      'TransactionData',
    ],
  },
  {
    label: 'Netzwerk- und Verbindungsdaten',
    keys: [
      'ConnectionData',
      'CustomerProprietaryNetworkInformation',
      'IPAddress',
      'InternetServiceProvider',
      'InternetSpeed',
      'MACAddress',
      'MobileCountryCode',
      'MobileNetworkCode',
      'MobileNetworkData',
      'NetworkData',
      'OtherElectronicNetworkActivityInformation',
      'Referrer',
      'SignalStrength',
      'SSID',
      'URL',
      'WiFiData',
      'WiFiHeatmap',
      'WiFiStatus',
    ],
  },
  {
    label: 'Geräte- und Hardwaredaten',
    keys: [
      'AndroidID',
      'AppInformation',
      'AppInteraction',
      'AppName',
      'AppVersion',
      'ApplicationData',
      'BatteryData',
      'BrowserInformation',
      'BrowserType',
      'BrowserVersion',
      'ConfigurationData',
      'CpuUsage',
      'DeviceEvents',
      'DeviceID',
      'DeviceInformation',
      'DeviceInteractions',
      'DeviceLogs',
      'DeviceName',
      'DeviceState',
      'DeviceStatistics',
      'DeviceTemperature',
      'DeviceType',
      'DiagnosticData',
      'DrivingEvents',
      'FirmwareVersion',
      'HardwareInformation',
      'HardwareVersion',
      'HostName',
      'ICCID',
      'IMEI',
      'IMSI',
      'MaintenanceLogs',
      'ManufacturerInformation',
      'MemoryUsage',
      'MotionData',
      'OperatingSystem',
      'PartnerApp',
      'PerformanceData',
      'ScreenResolution',
      'ScreenUnlocks',
      'SensorData',
      'SerialNumber',
      'SetupInformation',
      'SIMInformation',
      'StorageUsage',
      'TamperStatus',
      'TechnicalInformation',
      'TelemetryData',
      'VirusDefinitions',
    ],
  },
  {
    label: 'Standort- und Umweltdaten',
    keys: [
      'AirQualityData',
      'AltitudeData',
      'AmbientLightData',
      'AmbientSound',
      'CarbonDioxideData',
      'CarbonMonoxideData',
      'Coordinates',
      'DirtLevel',
      'EnvironmentalData',
      'GPSData',
      'HumidityData',
      'LocationData',
      'LocationHistory',
      'MoistureData',
      'NoiseLevel',
      'OutdoorData',
      'PrecipitationData',
      'SmokeData',
      'TemperatureData',
      'WeatherData',
      'WindData',
      'Region',
    ],
  },
  {
    label: 'Energie- und Verbrauchsdaten',
    keys: ['EnergyConsumptionData', 'EnergyProductivityData', 'GasConsumptionData', 'OperatingPowerData', 'VoltageData', 'WaterConsumptionData'],
  },
  {
    label: 'Smart-Home-Daten',
    keys: ['CleaningHistory', 'FloorType', 'FloorplanData', 'HeatingSchedule', 'HomeName', 'Lighting', 'PresenceData', 'PresenceOfPeople', 'PresenceOfPets', 'RoomName', 'ScheduleTimes', 'SpaceID'],
  },
  {
    label: 'Nutzungs- und Interaktionsdaten',
    keys: [
      'AccessLogs',
      'ActivityLogs',
      'BrowsingActivity',
      'CallRecords',
      'CallStatus',
      'ChatHistory',
      'ClickedLinks',
      'Clicks',
      'Clickstream',
      'Comments',
      'CommunicationRecords',
      'ContentUseHistory',
      'Feedback',
      'Follows',
      'InterestData',
      'Keystrokes',
      'Likes',
      'LogData',
      'LogFiles',
      'MouseMovements',
      'OnlineStatus',
      'Opinions',
      'PageInteractions',
      'PageResponseTime',
      'PersonalBehaviorData',
      'Reviews',
      'ScrollData',
      'Screenshots',
      'SearchHistory',
      'Submissions',
      'TouchData',
      'UsageData',
      'UsageDuration',
      'UsageFrequency',
      'ViewedContent',
      'VisitedPages',
      'WebsiteInformation',
    ],
  },
  {
    label: 'Werbetracking',
    keys: ['AdvertisingID', 'ClickID', 'GoogleAdID', 'WindowsAdID'],
  },
  {
    label: 'Kamera- und Mediendaten',
    keys: ['AudioData', 'DesignFiles', 'Drawings', 'ImageData', 'MediaData', 'Music', 'TextData', 'UserGeneratedContent', 'VideoData', 'VoiceCommands', 'VoiceData'],
  },
  {
    label: 'Unternehmens- und Personaldaten',
    keys: [
      'BusinessInformation',
      'BusinessModel',
      'CustomerList',
      'CustomerRecords',
      'DemographicData',
      'EducationalBackground',
      'Employer',
      'EmploymentBackground',
      'FamilyInformation',
      'FriendsInformation',
      'MembershipData',
      'NumberOfChildren',
      'NumberOfEmployees',
      'NumberOfPets',
      'PetInformation',
      'Qualifications',
      'ServiceType',
      'ServicesData',
    ],
  },
  {
    label: 'Berechtigungen',
    keys: [
      'CameraPermissions',
      'ContactsPermissions',
      'LocationPermissions',
      'MicrophonePermissions',
      'NotificationPermissions',
      'PermissionsData',
      'SecurityInformationNPII',
      'StoragePermissions',
      'WrittenPermissions',
    ],
  },
  {
    label: 'Sensible und Rechtliche Daten',
    keys: ['CriminalOffenses', 'NPII', 'PII', 'PoliticalAffiliations', 'ReligiousBeliefs', 'SexualLife', 'SexualOrientation', 'SocialAssistanceData', 'SpecialCategoryData', 'TradeUnionMembership'],
  },
  {
    label: 'Sonstige Daten',
    keys: [
      'ContestData',
      'Data',
      'DataAmount',
      'DateTime',
      'Errors',
      'Events',
      'FontSize',
      'GeneralInformation',
      'HabitData',
      'HobbyData',
      'LifestyleInformation',
      'ObjectData',
      'OtherFileData',
      'SettingsData',
      'StatisticalData',
      'Status',
    ],
  },
]

const keyToGroup = new Map()
for (const group of DATA_TYPE_GROUPS) {
  for (const key of group.keys) {
    keyToGroup.set(key, group.label)
  }
}

function groupDataTypes(keys) {
  const grouped = {}
  const seen = new Set()

  for (const key of keys) {
    if (seen.has(key)) continue
    seen.add(key)

    const label = keyToGroup.get(key) ?? 'Unkategorisiert'
    if (!grouped[label]) grouped[label] = []
    grouped[label].push(key)
  }

  return grouped
}

const groupedDataTypes = computed(() => {
  const grouped = groupDataTypes(deviceData?.value.policy_reports[0].data?.report.summary.data_type?.data_types)
  const sorted = Object.fromEntries(Object.entries(grouped).map(([label, keys]) => [label, [...keys].sort((a, b) => localization.t(a).localeCompare(localization.t(b), 'de'))]))
  return Object.fromEntries(Object.entries(sorted).sort(([a], [b]) => a.localeCompare(b, 'de')))
})

const groupedThirdPartyDataTypes = computed(() => {
  const grouped = groupDataTypes(deviceData?.value.policy_reports[0].data?.report.summary.sharing?.sharing_types)
  const sorted = Object.fromEntries(Object.entries(grouped).map(([label, keys]) => [label, [...keys].sort((a, b) => localization.t(a).localeCompare(localization.t(b), 'de'))]))
  return Object.fromEntries(Object.entries(sorted).sort(([a], [b]) => a.localeCompare(b, 'de')))
})

const sensitiveSet = computed(() => {
  const types = deviceData.value?.policy_reports?.flatMap((report) => report?.data?.report?.summary?.additional_properties?.sensitive_data_types ?? []) ?? []
  const set = new Set(types)
  set.add('VideoData')
  set.add('ImageData')
  set.add('AudioData')
  return set
})

const piiSet = computed(() => {
  const types = deviceData.value?.policy_reports?.flatMap((report) => report?.data?.report?.summary?.additional_properties?.pii_data_types ?? []) ?? []
  const set = new Set(types)
  set.add('WiFiData')
  set.add('SSID')
  return set
})

const internalActiveTab = ref('general')

const currentTab = computed(() => {
  return props.activeTab || internalActiveTab.value
})

const emit = defineEmits(['tab-changed', 'loaded'])

const handleTabClick = (tabId) => {
  if (typeof applyStaggeredDelay === 'function') {
    applyStaggeredDelay(tabId)
  }

  internalActiveTab.value = tabId
  emit('tab-changed', tabId)
}

// Privacy Properties

const privacy_properties_score = ref(null)

const evaluatePrivacyPropertyScore = async (saved_privacy_properties) => {
  if (deviceData?.value.policy_reports.length == 0) {
    return null
  }

  const deviceReport = deviceData?.value.policy_reports[0]?.data?.report

  const netReport = deviceData?.value.net_reports[0]?.data

  // Nur die Properties, die nicht "egal" sind
  const user_properties = saved_privacy_properties.filter((element) => element.value !== 0)

  // Raw data
  const profiling = deviceReport?.summary?.additional_properties?.profiling
  const sharing_outside_eu = deviceReport?.summary?.additional_properties?.sharing_outside_eu
  const collected_data_types = deviceReport?.summary?.data_type?.data_types

  let containsUnencrypted = null
  if (netReport) {
    containsUnencrypted = Object.keys(netReport?.grouped_flows).some((k) => k.toUpperCase() === 'HTTP')
  }

  console.log(containsUnencrypted)
  //console.log('CL1', deviceReport?.summary)
  const WEIGHTS = {
    PP28: {
      value: profiling === true ? 1 : profiling === null ? 0 : -1,
      description_pos: 'Profiling findet statt',
      description_neg: 'Kein Profiling findet statt',
      weight: 1,
      color: null,
    },
    PP53: {
      value: sharing_outside_eu === true ? 1 : sharing_outside_eu === null ? 0 : -1,
      description_pos: 'Daten verlassen den EU-Rechtsraum',
      description_neg: 'Daten bleiben innerhalb des EU-Rechtsraums',
      weight: 1,
      color: null,
    },
    PP57: {
      value: 1,
      description_pos: 'App erfordert Registrierung eines Kontos',
      description_neg: 'App erfordert keine Registrierung',
      weight: 1,
      color: null,
    },
    PP61: {
      value: collected_data_types?.length > 50 ? 1 : -1,
      description_pos: 'Sammelt überdurchschnittlich (' + collected_data_types.length + ') viele Datentypen',
      description_neg: 'Sammelt unterdurchschnittlich (' + collected_data_types.length + ') viele Datentypen',
      weight: collected_data_types.length >= 50 ? 1 : 1.5 - (collected_data_types.length / 50) * 0.5,
      color: null,
    },
    PP56: {
      value: containsUnencrypted ? -1 : 1,
      description_pos: 'Kommunikation ist vollständig verschlüsselt',
      description_neg: 'Kommunikation teilweise unverschlüsselt',
      weight: 1,
      color: null,
    },
  }

  const descriptions = [{ id: 'basis', description: 'Basiswert: 50' }]
  let weightSum = 0

  // Nur properties die wir auch bestimmen können
  const totalCount = user_properties.filter((p) => WEIGHTS[p.id]?.value !== 0).length

  for (const property of user_properties) {
    const entry = WEIGHTS[property.id]
    if (!entry) {
      continue
    }

    console.log(entry)

    // Farbe anhand übereinstimmung
    const color = entry.value === 0 ? 'text-muted' : entry.value === property.value ? 'text-success' : 'text-danger'

    const currentScoreImpactWeight = entry.value === property.value ? entry.weight : -entry.weight
    const currentScoreImpact = 50 * (currentScoreImpactWeight / totalCount)
    // Überspringe den hinweistext wenn nicht bestimmbar
    if (entry.value !== 0) {
      descriptions.push({
        id: property.id,
        description: entry.value === 1 ? entry.description_pos : entry.description_neg,
        color,
        score_impact: currentScoreImpact > 0 ? '+' + Math.round(currentScoreImpact) : Math.round(currentScoreImpact),
      })

      weightSum += currentScoreImpactWeight
    }
  }

  const score = Math.min(100, Math.max(0, 50 + 50 * (weightSum / totalCount)))

  //console.log(score)
  //console.log(descriptions)
  return { total_score: score, descriptions }
}

const loadPrivacyProperties = async () => {
  try {
    const settings_req = await dataApi.get('/user/settings')
    const settings = settings_req.data

    const saved_privacy_properties = Array.isArray(settings?.privacy_properties) ? settings.privacy_properties : []

    if (saved_privacy_properties.length > 0) {
      privacy_properties_score.value = await evaluatePrivacyPropertyScore(saved_privacy_properties)
    }
  } catch (err) {
    onError(err)
  }
}
//

// > 9.5% about the device
const policyForDeviceTreshold = ref(0.08)

const deviceData = ref(null)
const message = ref(null)

const ratingAverage = ref(null)
const userRating = ref(0)
const totalRatings = ref(0)
const hoverRating = ref(0)
const ratingSubmitting = ref(false)
const ratingError = ref(null)

const loadRating = async () => {
  try {
    const res = await dataApi.get(`/entry/${props.id}/rating`)
    const data = res.data
    ratingAverage.value = data?.avg_rating !== null && data?.avg_rating !== undefined ? parseFloat(data.avg_rating) : null
    userRating.value = data?.my_rating ?? 0
    totalRatings.value = data?.n_ratings
  } catch (err) {
    console.log('Failed to load rating', err)
  }
}

const submitRating = async (value) => {
  if (!auth.isLoggedIn || ratingSubmitting.value) return
  ratingSubmitting.value = true
  ratingError.value = null

  const previousRating = userRating.value
  userRating.value = value

  try {
    const res = await dataApi.post(`/entry/${props.id}/rating`, { rating: value })
    const data = res.data
    ratingAverage.value = data?.avg_rating !== null && data?.avg_rating !== undefined ? parseFloat(data.avg_rating) : ratingAverage.value
    userRating.value = data?.my_rating ?? value

    loadRating()
  } catch (err) {
    console.log('Failed to submit rating - status:', err?.response?.status, 'data:', err?.response?.data, 'full error:', err)
    userRating.value = previousRating
    ratingError.value = 'Bewertung konnte nicht gespeichert werden.'
  } finally {
    ratingSubmitting.value = false
  }
}

const thirdPartyEntities = (report) => {
  const seen = new Set()
  return (report?.data?.report?.summary?.third_party?.companies ?? []).filter((item) => {
    const key = String(item).trim().toLowerCase()
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

const getAverageStarIcon = (starIndex) => {
  const avg = ratingAverage.value ?? 0
  if (avg >= starIndex) return 'bi-star-fill'
  if (avg >= starIndex - 0.5) return 'bi-star-half'
  return 'bi-star'
}

const getUserStarIcon = (starIndex) => {
  const displayValue = hoverRating.value || userRating.value
  return displayValue >= starIndex ? 'bi-star-fill' : 'bi-star'
}
// --- STERNE-BEWERTUNG ENDE ---

// --- NETZWERK-DETAILANSICHT START ---

const decodeDnsEscapes = (str) => {
  if (!str) return str
  return str.replace(/\\(\d{3})/g, (_, code) => String.fromCharCode(parseInt(code, 10)))
}

// Liefert den lesbaren "Ziel"-Text einer Verbindung (Hostname bevorzugt, sonst IP).
const getFlowTarget = (flow) => {
  const raw = flow?.hostname?.[0] || flow?.target_ip || ''
  return decodeDnsEscapes(raw)
}

const getSortedProtocolGroups = (groupedFlows) => {
  if (!groupedFlows) return []
  return Object.entries(groupedFlows).sort((a, b) => (b[1]?.length ?? 0) - (a[1]?.length ?? 0))
}
// --- NETZWERK-DETAILANSICHT ENDE ---

function slugify(value) {
  return String(value)
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

function getProtocolExtra(protocol) {
  if (protocol === 'HTTP') {
    return { text: 'Unverschlüsselt (!)', color: 'bg-danger' }
  }
  return null
}

function getConnectionInfo(flow) {
  //console.log(flow)

  if (flow.target_port === 53) {
    return 'DNS'
  }

  return null
}

function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) {
    return '0 B'
  }
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB']

  const i = Math.floor(Math.log(bytes) / Math.log(k))

  const unit = sizes[Math.min(i, sizes.length - 1)]

  const value = (bytes / Math.pow(k, i)).toFixed(decimals)

  const formattedValue = parseFloat(value).toString()

  return `${formattedValue} ${unit}`
}

const formattedCreationDate = computed(() => formatDate(deviceData?.value?.created_at))

const joinedCategories = computed(() => {
  return deviceData?.value?.categories?.join(', ')
})

const joined = (arr) => {
  return arr.join(', ')
}

const tr = (a) => {
  return localization.t(a)
}

const joinTrans = (arr) => {
  return arr.map(tr).join(', ')
}

// Privacy Policy Viewer
const originalPrivacyPolicyModalRef = ref(null)
let originalPrivacyPolicyModal = null
const openOriginalPrivacyPolicy = async () => {
  originalPrivacyPolicyModal.show()
}
const closeOriginalPrivacyPolicy = () => {
  originalPrivacyPolicyModal.hide()
}

// Report Viewer
const reportModalRef = ref(null)
let reportModal = null
const reportModalComment = ref('')
const openReportModal = async () => {
  reportModal.show()
}
const closeReportModal = () => {
  reportModal.hide()
}
const confirmReport = async () => {
  try {
    const res = await dataApi.post('/entry/' + props.id + '/report', { comment: reportModalComment.value })
    if (res.data.status !== 'OK') {
      console.log('Failed to report')
      return
    }
    openMessageModal('Vielen Dank!', 'Wir haben Ihre Meldung erhalten. Ein Moderator wird den Sachverhalt in Kürze prüfen.')
    closeReportModal()
  } catch (ex) {
    console.log(ex)
  }
}

// Delete Request
const deleteRequestModalRef = ref(null)
let deleteRequestModal = null
const openDeleteRequestModal = async () => {
  deleteRequestModal.show()
}
const closeDeleteRequestModal = () => {
  deleteRequestModal.hide()
}
const confirmDeleteRequest = async () => {
  await sendDeleteRequest()

  closeDeleteRequestModal()
}

const sendDeleteRequest = async () => {
  try {
    const res = await dataApi.delete('/entry/' + props.id + '/request')

    if (res.data.status !== 'OK') {
      console.log('Failed to delete')
      return
    }

    await goBack()
  } catch (ex) {
    console.log(ex)
  }
}

// Ausstehende Bearbeitungen (Endpunkt ist nur für berechtigte Nutzer abrufbar)
const pendingUpdateCount = ref(0)

const loadPendingUpdateCount = async () => {
  if (!auth.hasAnyPermission('manage_posts')) return
  try {
    const res = await dataApi.get('/management/updates/' + props.id)
    pendingUpdateCount.value = Array.isArray(res.data) ? res.data.length : 0
  } catch (err) {
    console.warn('Ausstehende Bearbeitungen konnten nicht geladen werden:', err)
  }
}

// Bearbeitungsverlauf
const historyModalRef = ref(null)
let historyModal = null
const historyLoading = ref(false)
const historyVersions = ref([])

const HISTORY_FIELD_LABELS = {
  manufacturer: 'Hersteller',
  model: 'Modell',
  description: 'Beschreibung',
  categories: 'Kategorie',
  tags: 'Schlagwörter',
  model_year: 'Modelljahr',
  model_version: 'Modellversion',
  companion_apps: 'Companion-Apps',
}

const formatHistoryValue = (value) => {
  if (value === null || value === undefined || value === '') return '(leer)'
  if (Array.isArray(value)) return value.length > 0 ? value.join(', ') : '(leer)'
  if (typeof value === 'object')
    return Object.entries(value)
      .map(([k, v]) => `${k}: ${v || '(leer)'}`)
      .join(', ')
  return String(value)
}

const compareVersions = (newer, older) => {
  const diffs = []
  for (const key of Object.keys(HISTORY_FIELD_LABELS)) {
    const oldVal = older?.[key]
    const newVal = newer?.[key]
    if (JSON.stringify(oldVal) === JSON.stringify(newVal)) continue
    diffs.push({ label: HISTORY_FIELD_LABELS[key], oldValue: formatHistoryValue(oldVal), newValue: formatHistoryValue(newVal) })
  }
  return diffs
}

const historyDiffs = computed(() => {
  const result = []
  for (let i = 0; i < historyVersions.value.length - 1; i++) {
    result.push({ newer: historyVersions.value[i], diffs: compareVersions(historyVersions.value[i], historyVersions.value[i + 1]) })
  }
  return result
})

const oldestVersion = computed(() => historyVersions.value.at(-1))

const openHistoryModal = async () => {
  historyModal.show()
  if (historyVersions.value.length > 0) return // schon geladen

  historyLoading.value = true
  const versions = [deviceData.value]
  let nextId = deviceData.value.prev_version_id

  while (nextId) {
    try {
      const res = await dataApi.get('/entry/' + nextId)
      versions.push(res.data)
      nextId = res.data.prev_version_id
    } catch (err) {
      console.error('Verlauf konnte nicht vollständig geladen werden:', err)
      break
    }
  }

  historyVersions.value = versions
  historyLoading.value = false
}

// Delete Post
const deleteModalRef = ref(null)
let deleteModal = null
const openDeleteModal = async () => {
  deleteModal.show()
}
const closeDeleteModal = () => {
  deleteModal.hide()
}
const confirmDelete = async () => {
  await deletePost()
  closeDeleteModal()
}

// Delete Post
const messageModalRef = ref(null)
let messageModal = null
let messageModalMessage = ref('')

const openMessageModal = (title, message) => {
  messageModalMessage.value = [title, message]
  messageModal.show()
}

const onError = (err) => {
  console.error(err)

  if (err.response) {
    message.value = localization.t(err.response.data.code)
  } else {
    message.value = err
  }
}

const getUrlForImageEntry = (imageEntry) => {
  return dataApi.baseURL + 'uploads/images/' + imageEntry.id
}
/*
const fixImageUrl = (imageEntry) => {
  if (imageEntry) {
    imageEntry.id = dataApi.baseURL + 'uploads/images/' + imageEntry.id;
  }
  return imageEntry
}
  */

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

onMounted(async () => {
  try {
    originalPrivacyPolicyModal = new window.bootstrap.Modal(originalPrivacyPolicyModalRef.value)
    reportModal = new window.bootstrap.Modal(reportModalRef.value)
    deleteRequestModal = new window.bootstrap.Modal(deleteRequestModalRef.value)
    deleteModal = new window.bootstrap.Modal(deleteModalRef.value)
    historyModal = new window.bootstrap.Modal(historyModalRef.value)
    messageModal = new window.bootstrap.Modal(messageModalRef.value)

    // Load entry data
    const res = await dataApi.get('/entry/' + props.id)

    deviceData.value = res.data

    emit('loaded', `${deviceData.value?.manufacturer ?? ''} ${deviceData.value?.model ?? ''}`.trim())

    await loadRating()
    loadPendingUpdateCount()

    console.log('Res data', res.data)

    // Create array with image urls in order to not change my gallery class TODO
    deviceData.value.images_urls = deviceData.value.images.map((image) => {
      return { url: extendImagePath(image.id), thumb: extendImagePath(image.id, true), uploaded_by: image.uploaded_by, uploaded_at: image.uploaded_at, title: 'Bild' }
    })

    // Extend title image
    deviceData.value.title_image = extendImagePath(deviceData.value.title_image, true)

    // If we have net reports
    if (deviceData.value.net_reports.length > 0) {
      await Promise.all(
        deviceData.value.net_reports.map(async function (item, index) {
          try {
            const net_report_res = await dataApi.get('/data/net/' + item.id)
            item.data = net_report_res.data.report

            item.data.filtered_flows = item.data.flows.filter((entry) => entry.target_ip && entry['target_info.entity'] !== 'Private Network')
            item.data.filtered_networks = new Set(item.data.filtered_flows.map((entry) => entry['target_info.entity']))
            item.data.filtered_countries = new Set(item.data.filtered_flows.map((entry) => entry['target_info.country_c']))

            item.data.filtered_network_countries = [
              ...new Map(
                item.data.filtered_flows.map((entry) => [
                  `${entry['target_info.ent_origin']}-${entry['target_info.entity']}`,
                  {
                    company_country: entry['target_info.ent_origin_c'],
                    company_name: entry['target_info.entity'],
                  },
                ]),
              ).values(),
            ]

            if (item.data.flows) {
              const countryTraffic = item.data.flows.reduce((acc, flow) => {
                const country = flow['target_info.country_c'] || 'Unbekannt'
                const totalBytes = Number(flow.bytes || 0)
                acc[country] = (acc[country] || 0) + totalBytes
                return acc
              }, {})

              const totalAllBytes = Object.values(countryTraffic).reduce((a, b) => a + b, 0)

              const formatBytes = (bytes) => {
                if (bytes === 0) return '0 B'
                const k = 1024
                const sizes = ['B', 'KB', 'MB', 'GB']
                const i = Math.floor(Math.log(bytes) / Math.log(k))
                return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
              }

              item.data.countryRanking = Object.entries(countryTraffic)
                .map(([countryCode, bytes]) => ({
                  code: countryCode === 'Unbekannt' ? null : countryCode,
                  name: countryCode,
                  bytes: bytes,
                  bytesFormatted: formatBytes(bytes),
                  percentage: totalAllBytes > 0 ? bytes / totalAllBytes : 0, //Math.ceil((bytes / totalAllBytes) * 100) : 0,
                }))
                .sort((a, b) => b.bytes - a.bytes)
            }

            item.data.grouped_filtered_flows = item.data.filtered_flows.reduce((acc, item) => {
              const key = item.application
              if (!acc[key]) {
                acc[key] = []
              }
              acc[key].push(item)
              return acc
            }, {})

            item.data.grouped_flows = item.data.flows.reduce((acc, item) => {
              const key = item.application
              if (!acc[key]) {
                acc[key] = []
              }
              acc[key].push(item)
              return acc
            }, {})

            console.log(item.data)
          } catch (err) {
            console.log('Failed to load net report', err)
          }
        }),
      )
    }

    // If we have privacy policy reports
    if (deviceData.value.policy_reports.length > 0) {
      // Load Privacy Policy report
      try {
        await Promise.all(
          deviceData.value.policy_reports.map(async function (item) {
            const policy_report_res = await dataApi.get('/data/policy/' + item.id)
            console.log('policy', policy_report_res.data)
            item.data = policy_report_res?.data
          }),
        )
      } catch (err) {
        console.log('Failed to load privacy policy report', err)
      }
    }

    // If we have firmware reports
    if (deviceData.value.firmware_reports.length > 0) {
      // Load Firmware report
      try {
        await Promise.all(
          deviceData.value.firmware_reports.map(async function (item) {
            const firmware_report_res = await dataApi.get('/data/firmware/' + item.id)
            console.log('firmware', firmware_report_res.data)
            item.data = firmware_report_res.data.report
          }),
        )
      } catch (err) {
        console.log('Failed to load firmware report', err)
      }
    }

    // Load Privacy Properties
    if (auth.isLoggedIn) {
      await loadPrivacyProperties()
    }

    console.log(deviceData.value)

    // DOM für tooltips muss erst noch gebaut werden
    await nextTick()

    const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]')
    const tooltipList = [...tooltipTriggerList].map((tooltipTriggerEl) => new window.bootstrap.Tooltip(tooltipTriggerEl))
  } catch (err) {
    onError(err)
  }
})

const groupIssues = (issues) => {
  const groups = issues.reduce((acc, cur) => {
    const key = cur.type ?? '__UNKNOWN__'
    ;(acc[key] = acc[key] || []).push(cur)
    return acc
  }, {})

  const severityRank = {
    CRITICAL: 0,
    HIGH: 1,
    MEDIUM: 2,
    LOW: 3,
    INFORMATIONAL: 4,
  }
  const getRank = (sev) => severityRank[(sev ?? '').toUpperCase()] ?? Number.MAX_SAFE_INTEGER

  const sortedKeys = Object.keys(groups).sort((a, b) => {
    const rankA = getRank(groups[a][0]?.severity)
    const rankB = getRank(groups[b][0]?.severity)
    return rankA - rankB
  })

  const ordered = {}
  for (const k of sortedKeys) {
    ordered[k] = groups[k]
  }

  return ordered
}

// --- CVE-ANZEIGE (Firmware-Tab) START ---

const getReportCves = (report) => {
  const data = report?.data
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.cves)) return data.cves
  if (Array.isArray(data?.report)) return data.report
  if (Array.isArray(data?.report?.cves)) return data.report.cves
  return []
}

const getCveSeverity = (cve) => {
  return cve?.originSeverity ?? cve?.severity ?? cve?.cve?.severity ?? cve?.cve?.baseSeverity ?? cve?.cvssSeverity ?? null
}

const CVSS_VERSION_CANDIDATES = [
  { label: 'CVSS v4.0', paths: ['cve.cvss4'] },
  { label: 'CVSS v3.0', paths: ['cve.cvss3'] },
  { label: 'CVSS v2.0', paths: ['cve.cvss2'] },
]

const getByPath = (obj, path) => {
  return path.split('.').reduce((acc, key) => (acc == null ? undefined : acc[key]), obj)
}

const getCvssBaseScore = (cve) => {
  for (const candidate of CVSS_VERSION_CANDIDATES) {
    for (const path of candidate.paths) {
      const node = getByPath(cve, path)
      const score = node?.baseScore ?? node?.base_score ?? (typeof node === 'number' ? node : undefined)
      if (score !== undefined && score !== null && !isNaN(parseFloat(score))) {
        return { score: parseFloat(score), version: candidate.label }
      }
    }
  }
  return null
}

const getCvssBadgeClass = (score) => {
  const num = parseFloat(score)
  if (isNaN(num)) return 'bg-secondary'
  if (num >= 9.0) return 'bg-danger'
  if (num >= 7.0) return 'badge-orange'
  if (num >= 4.0) return 'bg-warning text-dark'
  return 'bg-secondary'
}

const getBadgeClass = (severity) => {
  const sev = (severity || '').toUpperCase()
  if (sev === 'CRITICAL') return 'bg-danger' // rot
  if (sev === 'HIGH') return 'badge-orange' // orange
  if (sev === 'MEDIUM') return 'bg-warning text-dark' // gelb
  if (sev === 'LOW') return 'bg-secondary' // grau, nicht grün
  if (sev === 'INFORMATIONAL') return 'bg-info text-dark' // blau
  return 'bg-secondary'
}

const groupCVEs = (cves) => {
  if (!Array.isArray(cves) || cves.length === 0) return {}

  const groups = cves.reduce((acc, cur) => {
    if (!cur) return acc // defensiv: kaputte/leere Einträge überspringen
    const key = (getCveSeverity(cur) || 'UNBEKANNT').toString().toUpperCase()
    ;(acc[key] = acc[key] || []).push(cur)
    return acc
  }, {})

  const severityRank = {
    CRITICAL: 0,
    HIGH: 1,
    MEDIUM: 2,
    LOW: 3,
    INFORMATIONAL: 4,
    UNBEKANNT: 99,
  }
  const getRank = (sev) => severityRank[sev] ?? 99

  const sortedKeys = Object.keys(groups).sort((a, b) => getRank(a) - getRank(b))

  const ordered = {}
  for (const k of sortedKeys) {
    ordered[k] = groups[k].sort((a, b) => parseFloat(b.score || 0) - parseFloat(a.score || 0))
  }

  return ordered
}

// Filter "Nur Critical & High anzeigen"
const showOnlyCriticalHigh = reactive({})

const getFilteredCveGroups = (report) => {
  const groups = groupCVEs(getReportCves(report))
  if (!showOnlyCriticalHigh[report.id]) return groups

  const filtered = {}
  for (const key of Object.keys(groups)) {
    if (key === 'CRITICAL' || key === 'HIGH') {
      filtered[key] = groups[key]
    }
  }
  return filtered
}

// Aktiver Unter-Tab (Probleme/CVEs) je Firmware-Report
const activeFirmwareTab = ref({})

const setFirmwareTab = (reportId, tab) => {
  activeFirmwareTab.value[reportId] = tab
}

const getFirmwareTab = (reportId) => {
  if (activeFirmwareTab.value[reportId]) {
    return activeFirmwareTab.value[reportId]
  }

  const report = deviceData.value?.firmware_reports?.find((r) => r.id === reportId)

  if (!report?.data) {
    return null
  }

  if (report.data.peripherals?.length > 0) {
    return 'peripherals'
  }

  if (report.data.uris?.length > 0) {
    return 'uris'
  }

  if ((!report.data.issues || report.data.issues.length === 0) && getReportCves(report).length > 0) {
    return 'cves'
  }

  return 'issues'
}
// --- CVE-ANZEIGE ENDE ---

//

const sortedPolicyReports = computed(() => {
  return (deviceData.value?.policy_reports || []).sort((a, b) => {
    const timeA = new Date(a.added_at).getTime()
    const timeB = new Date(b.added_at).getTime()
    return timeB - timeA
  })
})

const refreshPrivacyPolicy = async (policy_id) => {
  try {
    const res = await dataApi.post('/data/policy/' + policy_id + '/refresh')

    if (res.data.status !== 'OK') {
      console.log('Failed to refresh')
      console.log(res.data.status)
      console.log(res.data)
      return
    }

    // OK
  } catch (ex) {
    console.log(ex)
  }
}

// Moderator functions
const setPostApproved = async (state) => {
  try {
    const res = await dataApi.post('/management/submission/' + props.id + '/setVisibility', { public: state })

    if (res.data.status !== 'OK') {
      console.log('Failed to set approved stae')
      return
    }

    await goBack()
    //router.push('/manage/submissions')
  } catch (ex) {
    console.log(ex)
  }
}

const deletePost = async () => {
  try {
    const res = await dataApi.delete('/management/submission/' + props.id)

    if (res.data.status !== 'OK') {
      console.log('Failed to delete')
      return
    }

    await goBack()
  } catch (ex) {
    console.log(ex)
  }
}

const onApprove = async () => {
  await setPostApproved(true)
}

const onUnapprove = async () => {
  await setPostApproved(false)
}

const dummy = async () => {}

const selectedLevel = ref(0)

const summaryOptions = [
  { id: 0, label: 'Vollständig' },
  { id: 1, label: 'Detailiert' },
  { id: 2, label: 'Zusammengefasst' },
  { id: 3, label: 'Grob Zusammengefasst' },
]

const filteredDataTypes = computed(() => {
  // const allTypes = ;

  //deviceData?.policy_reports[0].data?.r

  // If level is 0 (Vollständig), return everything
  if (selectedLevel.value === 0) {
    return deviceData?.value.policy_reports[0].data?.report.summary.data_type?.data_types
  }

  // Logic for level 1 (Zusammengefasst)
  if (selectedLevel.value >= 1) {
    return deviceData?.value.policy_reports[0].data?.report.summary.data_type?.data_types_level[4 - selectedLevel.value]
  }

  return []
})

const isCollectingDataForAdvertisement = (report) => {
  const dataTypes = report.data?.report?.summary.data_type?.data_types
  const purposeTypes = report.data?.report?.summary.purpose?.purposes

  const adDataTypes = ['AdvertisingID', 'GoogleAdID', 'InterestData']
  const adUsageTypes = ['CustomerAcquisition', 'PromotionalActivities', 'RecommendPurchases', 'PersonalizeContent', 'MarketingMessage', 'AdvertisingPartner']

  return adDataTypes.some((dt) => dataTypes.includes(dt)) || adUsageTypes.some((dt) => purposeTypes.includes(dt))
}

const applyStaggeredDelay = async (tabId) => {
  // TODO
}

const getStarClass = (starIndex) => {
  const avg = ratingAverage.value ?? 0

  // Hover
  if (hoverRating.value > 0) {
    const hr = hoverRating.value
    if (hr >= starIndex) return 'bi-star-fill text-warning'
    if (hr >= starIndex - 0.5 && hr < starIndex) return 'bi-star-half text-warning'
    return 'bi-star text-muted'
  }

  // Average
  if (avg >= starIndex) return 'bi-star-fill text-warning'
  if (avg >= starIndex - 0.5 && avg < starIndex) return 'bi-star-half text-warning'
  return 'bi-star text-muted'
}

const getStarColor = (starIndex) => {
  if (hoverRating.value !== null) {
    return '#ffc107' // yellow
  }
  const ur = userRating.value
  const avg = ratingAverage.value ?? 0

  if (ur !== null && ur >= starIndex - 0.5) return '#ffc107'
  if (avg >= starIndex - 0.5) return '#ffc107'

  return '#d3d6da'
}

const permissionIcons = {
  'Geräte- und App-Verlauf': 'bi-history',
  Standort: 'bi-geo-alt-fill',
  Telefon: 'bi-telephone-fill',
  'Fotos/Medien/Dateien': 'bi-images',
  Speicher: 'bi-database',
  Kamera: 'bi-camera-video',
  Mikrofon: 'bi-mic-fill',
  'WLAN-Verbindungsinformationen': 'bi-wifi',
  'Geräte-ID & Anrufinformationen': 'bi-cpu',
  Bluetooth: 'bi-bluetooth',
  Sonstiges: 'bi-tools',
  'Ohne Kategorie': 'bi-three-dots',
  Uncategorized: 'bi-three-dots',
}

const getPermissionIcon = (category) => permissionIcons[category] || 'bi-shield-lock'
</script>

<style scoped>
.badge-orange {
  background-color: #fd7e14;
  color: #fff;
}

.drag-active {
  background-color: #e9f5ff;
  border-color: #0d6efd;
  transition: 0.2s ease;
}

.privacylabel {
  /*
  max-width: 100%;
  height: auto;
  display: block;
  object-fit: contain;

*/
}

.basic-data-privacylabel > * {
}

.flex-container {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 3em;
}

.flex-container-item {
  flex: 1 0 0;
}

@media (max-width: 992px) {
  .flex-container-item {
    flex: 0 0 100%;
    /* 🔑 force full width */
    max-width: 100%;
  }

  .flex-container-item:not(:last-child)::after {
    content: '';
    display: block;
    height: 1px;
    background-color: var(--bs-card-border-color);
    margin: 16px 0;
  }
}

.privacylabel > * {
  width: 100%;
}

.columns-3 {
  columns: 3;
  column-width: 15rem;
  column-gap: 1.5rem;
}
.sensitive-item {
  color: var(--bs-danger) !important;
}

.pii-item {
  color: var(--bs-warning) !important;
}

/* */

.data-type-groups {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1rem;
}

.data-type-groups {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(320px, 100%), 1fr));
  gap: 1rem;
}

.data-type-card {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
}

.data-type-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.data-type-list li {
  font-size: 0.85rem;
  color: #4b5563;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 999px;
  padding: 0.25rem 0.6rem;
  white-space: nowrap;
}

[data-bs-theme='dark'] {
  .data-type-card {
    background: var(--bs-card-color);
    border-color: #374151;
  }
  .group-label {
    color: #f9fafb;
    border-bottom-color: #374151;
  }
  .data-type-list li {
    color: #d1d5db;
    background: #374151;
    border-color: #4b5563;
  }
}

.group-label {
  margin: 0 0 0.75rem;
  font-size: 1rem;
  font-weight: 600;
  color: #111827;
  border-bottom: 1px solid #f3f4f6;
  padding-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.group-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  flex-shrink: 0;
  font-size: 0.9rem;
  color: #2563eb;
  background: #eff6ff;
  border-radius: 8px;
}

[data-bs-theme='dark'] {
  .group-icon {
    color: #93c5fd;
    background: #1e3a5f;
  }
}

/* */

.data-type-list li.pill-pii {
  background: #fff7ed; /* warm orange tint */
  border-color: #fdba74;
  color: #9a3412;
}

.data-type-list li.pill-sensitive {
  background: #fef2f2; /* soft red tint */
  border-color: #fca5a5;
  color: #991b1b;
}
[data-bs-theme='dark'] {
  .data-type-list li.pill-pii {
    background: #452b12;
    border-color: #7c4a1e;
    color: #fdba74;
  }
  .data-type-list li.pill-sensitive {
    background: #451a1a;
    border-color: #7c3535;
    color: #fca5a5;
  }
}

.pill-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 0.5rem;
  font-size: 0.8rem;
  color: #6b7280;
}

.legend-item {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
}

.legend-pill {
  display: inline-block;
  width: 18px;
  height: 10px;
  border-radius: 999px;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
}

.legend-pill.pill-pii {
  background: #fff7ed;
  border-color: #fdba74;
}

.legend-pill.pill-sensitive {
  background: #fef2f2;
  border-color: #fca5a5;
}

[data-bs-theme='dark'] {
  .pill-legend {
    color: #9ca3af;
  }
  .legend-pill {
    background: #374151;
    border-color: #4b5563;
  }
  .legend-pill.pill-pii {
    background: #452b12;
    border-color: #7c4a1e;
  }
  .legend-pill.pill-sensitive {
    background: #451a1a;
    border-color: #7c3535;
  }
}
.datablock-title {
  margin-bottom: 0px;
  font-size: 1.8em;
}

div .card.mb-3 {
  filter: drop-shadow(0px 0px 6px black);
}

.data-type-list > li {
  overflow: hidden;
  text-overflow: ellipsis;
}
/*
.card-title.fw-bold {
  font-size: 1.5em;
}

.card {
  filter: drop-shadow(0px 0px 6px black);
}

.datablock-title {
  margin-bottom: 0px;
}
*/

/* PP Score */
@property --p {
  syntax: '<number>';
  inherits: true;
  initial-value: 0;
}
@property --n {
  syntax: '<integer>';
  inherits: true;
  initial-value: 0;
}

.score-ring {
  --scale: 1;
  --size: 140px;
  --thickness: 12px;

  /* Farbwerte für Light Mode */
  --sat: 75%;
  --light: 42%;
  --shadow: 0 4px 14px rgba(0, 0, 0, 0.12);

  /* Bootstrap */
  --track: var(--bs-secondary-bg, #e9ecef);
  --inner: var(--bs-body-bg, #fff);
  --muted: var(--bs-secondary-color, #868e96);

  /* 0 = rot, 60 = gelb, 100+ = grün */
  --color: hsl(calc(var(--p) * 1.2), var(--sat), var(--light));

  position: relative;
  display: grid;
  place-items: center;
  width: calc(var(--size) * var(--scale));
  height: calc(var(--size) * var(--scale));
  border-radius: 50%;
  background: conic-gradient(from 0deg, var(--color) calc(var(--p) * 1%), var(--track) 0);
  box-shadow: var(--shadow);
  animation: score-fill 2s cubic-bezier(0, 0.57, 0, 1) forwards;

  flex: 0 0 auto;
}

@media (max-width: 767.98px) {
  .score-ring {
    --scale: 0.8;
  }
}

/* Dark Mode */
[data-bs-theme='dark'] .score-ring {
  --sat: 70%;
  --light: 58%;
  --shadow: 0 4px 18px rgba(0, 0, 0, 0.55);
}

/* Innerer Kreis */
.score-ring::before {
  content: '';
  position: absolute;
  inset: var(--thickness);
  border-radius: 50%;
  background: var(--inner);
  box-shadow: inset 0 0 0 1px var(--bs-border-color, rgba(0, 0, 0, 0.05));
}

/* Zahl */
.score-ring__value {
  position: relative;
  z-index: 1;
  font-size: calc(var(--size) * var(--scale, 1) * 0.3);
  font-weight: 700;
  line-height: 1;
  color: var(--color);
  counter-reset: num var(--n);
}
.score-ring__value::before {
  content: counter(num);
}
.score-ring__value::after {
  content: '/100';
  margin-left: 2px;
  font-size: 0.4em;
  font-weight: 500;
  color: var(--muted);
}

@keyframes score-fill {
  from {
    --p: 0;
    --n: 0;
  }
  to {
    --p: var(--score);
    --n: var(--score);
  }
}

@media (prefers-reduced-motion: reduce) {
  .score-ring {
    animation-duration: 0.01s;
  }
}
</style>
