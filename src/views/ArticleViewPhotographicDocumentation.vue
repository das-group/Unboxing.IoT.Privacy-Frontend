<template>
  <div class="container py-4">
    <h1 class="mb-4 text-center">Richtlinie für die fotografische Dokumentation von IoT-Geräten</h1>

    <div class="card shadow-sm">
      <div class="card-body">
        <p>
          In diesem Artikel wird die fotografische Dokumentation von IoT-Geräten erläutert. Ziel ist die Erstellung von einheitlichem Bildmaterial, welches auf dieser Plattform hochgeladen werden
          kann.
        </p>

        <div class="alert alert-warning" role="alert">Hinweis: Bitte stellen Sie sicher, dass Sie keine personenbezogenen Daten einreichen!</div>

        <hr />

        <h2>Benötigte Utensilien:</h2>

        <ul>
          <li>Digitalkamera</li>
          <ul>
            <li>Möglichst hochauflösend</li>
          </ul>

          <li>Reprostativ</li>
          <ul>
            <li>Mit neutraler, weißer Fläche bzw. Hintergrund</li>
          </ul>

          <li>Flächenleuchte</li>
          <ul>
            <li>In Tageslichtweiß</li>
          </ul>

          <li>Bildbearbeitungssoftware</li>
          <ul>
            <li>Nötiger Funktionsumfang: Bildbeschneidung, Bildrotation, Hintergrundentfernung</li>
            <li>Ist z.B. standardmäßig in dem Bildanzeigeprogramm in Windows 11 enthalten</li>
          </ul>
        </ul>

        <div class="w-100 d-flex justify-content-center">
          <img class="img-fluid" style="max-height: 30em; border-radius: 0.5em; filter: drop-shadow(1px 1px 5px black)" src="@/assets/articles/reprostativ.jpeg" alt="Exemplarischer Aufbau" />
        </div>

        <hr />

        <h2>Vorbereitung:</h2>

        <ul>
          <li>Klarsichtfolien und Ähnliches sollen vor der Fotografie von der Verpackung des IoT-Geräts entfernt werden, um Lichtreflektionen zu vermeiden.</li>

          <li>
            Die Kamera soll einen möglichst <u>hohen</u> Abstand zu dem Produkt haben. Mithilfe des optischen Zooms soll das gesamte Produkt bzw. die Verpackung im Bildsucher erfasst werden. Kann das
            Produkt den Bildsucher nicht horizontal oder vertikal ausfüllen, dann muss die Kamera näher herangeführt werden. Manchmal bietet sich eine Aufnahme in Querformat an, um das gesamte Produkt
            erfassen zu können.
          </li>
          <ul>
            <li>Dies dient der Vermeidung des Fischaugen-Effekts, wobei das Bild ungewollt verzerrt und verfälscht wird</li>
          </ul>

          <li>Typischer Abstand zwischen Produkt und Kamera: ca. 50-100cm</li>
          <li>Mithilfe der Flächenleuchten soll das Produkt möglichst schattenfrei, reflexionsfrei und gleichmäßig ausgeleuchtet werden</li>
        </ul>

        <div class="row justify-content-evenly align-items-center">
          <!-- First image + caption -->
          <div class="col-auto text-center mb-4 mb-md-0" style="max-width: 40%; border-radius: 0.5em; filter: drop-shadow(1px 1px 5px black)">
            <figure class="figure">
              <img src="@/assets/articles/kamera_nah.jpeg" class="figure-img img-fluid rounded" alt="Kamera zu nah" style="max-height: 26.5em" />
              <figcaption class="figure-caption mt-2 text-danger d-flex align-items-center justify-content-center"><i class="bi-exclamation-triangle-fill me-1"></i> Kamera zu nah</figcaption>
            </figure>
          </div>

          <!-- Arrow between the images -->
          <div class="col-auto d-flex align-items-center justify-content-center">
            <i class="bi-arrow-right arrow-icon" style="font-size: 2rem; color: #6c757d"></i>
          </div>

          <!-- Second image + caption -->
          <div class="col-auto text-center" style="max-width: 40%; border-radius: 0.5em; filter: drop-shadow(1px 1px 5px black)">
            <figure class="figure">
              <img src="@/assets/articles/zu_nah.JPG" class="figure-img img-fluid rounded" alt="Fischaugeneffekt" />
              <figcaption class="figure-caption mt-2 text-danger d-flex align-items-center justify-content-center"><i class="bi-exclamation-triangle-fill me-1"></i> Fischaugeneffekt</figcaption>
            </figure>
          </div>
        </div>

        <div class="row justify-content-evenly align-items-center mt-3">
          <!-- First image + caption -->
          <div class="col-auto text-center mb-4 mb-md-0" style="max-width: 40%; border-radius: 0.5em; filter: drop-shadow(1px 1px 5px black)">
            <figure class="figure">
              <img src="@/assets/articles/kamera_weit.jpeg" class="figure-img img-fluid rounded" alt="Guter Abstand" style="max-height: 26.5em" />
              <figcaption class="figure-caption mt-2 text-success d-flex align-items-center justify-content-center"><i class="bi-check-circle-fill me-1"></i> Kamera weiter entfernt + Zoom</figcaption>
            </figure>
          </div>

          <!-- Arrow between the images -->
          <div class="col-auto d-flex align-items-center justify-content-center">
            <i class="bi-arrow-right arrow-icon" style="font-size: 2rem; color: #6c757d"></i>
          </div>

          <!-- Second image + caption -->
          <div class="col-auto text-center" style="max-width: 40%; border-radius: 0.5em; filter: drop-shadow(1px 1px 5px black)">
            <figure class="figure">
              <img src="@/assets/articles/korrekt.JPG" class="figure-img img-fluid rounded" alt="Gutes Foto" />
              <figcaption class="figure-caption mt-2 text-success d-flex align-items-center justify-content-center"><i class="bi-check-circle-fill me-1"></i> OK</figcaption>
            </figure>
          </div>
        </div>

        <hr />

        <h2>Schritt 1: Fotografie der Verpackung:</h2>

        <ul>
          <li>
            Alle Seiten der Produktverpackung sollen fotografiert werden, sofern sich Schriftzüge oder Kennzeichnungen darauf befinden. Leere Seiten der Produktverpackung können ausgelassen werden
          </li>
          <li>Dazu zählen Frontansicht, Rückansicht, Seitenansicht links und rechts, Draufsicht und Untersicht</li>
          <li>Schriftzüge sollen auf den Bildern lesbar sein</li>
        </ul>

        <hr />

        <h2>Schritt 2: Fotografie des Verpackungsinhalts / Zubehörs:</h2>

        <ul>
          <li>
            Alle mitgelieferten Bestandteile sollen, ähnlich wie bei einer Explosionszeichnung, auf der Bildfläche angeordnet und Fotografiert werden. Hierzu zählen mitgeliefertes Zubehör wie Kabel,
            Netzteile, Schrauben, Schutzhüllen, Betriebsanleitungen, Konformitätserklärungen oder Ähnliches. Das (Haupt-)Produkt kann, muss aber nicht, in diesem Schritt aufgenommen werden
          </li>
          <li>Dokumente wie Betriebsanleitungen, Konformitätserklärungen oder Garantiezettel sollen noch einmal gesondert oberflächlich aufgenommen werden</li>
        </ul>

        <hr />

        <h2>Schritt 3: Fotografie des Produkts:</h2>

        <ul>
          <li>Alle Seiten des Produkts sollen fotografiert werden</li>
          <li>
            Dazu zählen prinzipiell Frontansicht, Rückansicht, Seitenansicht, Draufsicht und Untersicht. Je nach Produkt und dessen Form bzw. physikalische Gegebenheiten reichen jedoch auch eine
            Untermenge der verschiedenen Ansichten aus, um einen Gesamteindruck des Produkts zu erhalten
          </li>

          <li>Besonderer Fokus:</li>
          <ul>
            <li>Schriftzüge sowie Etiketten sollen lesbar sein</li>
            <li>Besonderheiten, Öffnungen, Knöpfe, Displays, LEDs, Kameralinsen, Prüfsiegel o.Ä.</li>
            <li>Existieren erkennbare physische Interventionen zum Schutz der Privatheit? Beispiele: Abdeckung von Kameralinsen, physikalische Schalter für Mikrofone</li>
          </ul>
        </ul>

        <hr />

        <h2>Schritt 4: Fotografie der Hardware (optional):</h2>

        <ul>
          <li>
            Nun soll das Gerät zerlegt werden. Hierbei besteht die Gefahr, dass das Gerät dabei beschädigt wird. Laufzeittests und ähnliche Untersuchungen, in denen ein lauffähiges und unbeschädigtes
            Gerät benötigt wird, sollten vorher durchgeführt werden
          </li>
          <li>Für diesen Schritt existiert keine allgemeine Vorgehensweise. Es empfiehlt sich jedoch, Anleitungen oder Videos zur möglichst zerstörungsfreien Produktöffnung zu recherchieren</li>
          <li>
            Alle elektronischen Leiterplatten sollen beidseitig offengelegt werden. Ziel ist die Erfassung der verbauten elektronischen Komponenten, um die technischen Fähigkeiten des Geräts zu
            erfassen.
          </li>
        </ul>

        <hr />

        <h2>Schritt 5: Nachbearbeitung der Fotos:</h2>

        <ul>
          <li>Nun sollen die Fotos für die Präsentation im Internet vorbereitet werden</li>
          <li>
            1. Alle Metadaten (wie z.B. Kamerainformationen oder Standortdaten) müssen entfernt werden. Hierfür bietet sich beispielsweise das quelloffene Werkzeug
            <a href="https://github.com/szTheory/exifcleaner">ExifCleaner</a> an, womit mehrere Bilder per Drag&Drop gleichzeitig bereinigt werden können
          </li>

          <div class="row justify-content-evenly align-items-center">
            <div class="col-auto text-center mb-4 mb-md-0" style="border-radius: 0.5em; filter: drop-shadow(1px 1px 5px black)">
              <figure class="figure">
                <img src="@/assets/articles/exifcleaner.png" class="figure-img img-fluid rounded clickable" alt="First picture" @click="(e) => e.target.classList.toggle('active')" />
                <figcaption class="figure-caption mt-2 d-flex align-items-center justify-content-center">Entfernung von Metadaten via ExifCleaner</figcaption>
              </figure>
            </div>
          </div>

          <li>2. Die Fotos müssen ggf. rotiert und begradigt werden. Auch minimale Schräglagen sollen korrigiert werden</li>

          <div class="row justify-content-evenly align-items-center">
            <div class="col-auto text-center mb-4 mb-md-0" style="border-radius: 0.5em; filter: drop-shadow(1px 1px 5px black)">
              <figure class="figure">
                <img src="@/assets/articles/begradigen.gif" class="figure-img img-fluid rounded clickable" alt="First picture" @click="(e) => e.target.classList.toggle('active')" />
                <figcaption class="figure-caption mt-2 d-flex align-items-center justify-content-center">Begradigung via Windows Bildeditor</figcaption>
              </figure>
            </div>
          </div>

          <li>
            3. Jegliche eindeutigen Kennzeichner (wie z.B. MAC-Adressen, Seriennummern, zugehörige Barcodes, QR-Codes) sollen von dem Bild mithilfe eines schwarzen Balkens unkenntlich gemacht werden
          </li>

          <div class="row justify-content-evenly align-items-center">
            <div class="col-auto text-center mb-4 mb-md-0" style="border-radius: 0.5em; filter: drop-shadow(1px 1px 5px black)">
              <figure class="figure">
                <img src="@/assets/articles/zensieren.gif" class="figure-img img-fluid rounded clickable" alt="First picture" @click="(e) => e.target.classList.toggle('active')" />
                <figcaption class="figure-caption mt-2 d-flex align-items-center justify-content-center">Entfernung einer Kennnummer mit Windows Paint-Bildeditor (beispielhaft)</figcaption>
              </figure>
            </div>
          </div>

          <li>4. Zuletzt sollen die Fotos zugeschnitten werden. Bildfläche, welche nicht ausschließlich das fotografierte Objekt zeigt, soll entfernt werden</li>

          <div class="row justify-content-evenly align-items-center">
            <div class="col-auto text-center mb-4 mb-md-0" style="border-radius: 0.5em; filter: drop-shadow(1px 1px 5px black)">
              <figure class="figure">
                <img src="@/assets/articles/beschneiden.gif" class="figure-img img-fluid rounded clickable" alt="First picture" @click="(e) => e.target.classList.toggle('active')" />
                <figcaption class="figure-caption mt-2 d-flex align-items-center justify-content-center">Zurechtschneidung via Windows Bildeditor</figcaption>
              </figure>
            </div>
          </div>

          <li>
            5. Ein Titelbild soll unter den geschossenen Fotos ausgewählt werden, welches das IoT-Gerät hinreichend gut darstellt. Bei diesem Foto soll der Hintergrund transparent gemacht (=entfernt)
            werden
          </li>

          <div class="row justify-content-evenly align-items-center">
            <div class="col-auto text-center mb-4 mb-md-0" style="border-radius: 0.5em; filter: drop-shadow(1px 1px 5px black)">
              <figure class="figure">
                <img src="@/assets/articles/hintergrund.gif" class="figure-img img-fluid rounded clickable" alt="First picture" @click="(e) => e.target.classList.toggle('active')" />
                <figcaption class="figure-caption mt-2 d-flex align-items-center justify-content-center">Entfernung des Hintergrunds mit Windows Bildeditor</figcaption>
              </figure>
            </div>
          </div>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
</script>

<style scoped>
h2 {
  font-size: 1.5rem !important;
}

h3 {
  font-size: 1.25rem !important;
}

h4 {
  font-size: 1.1rem !important;
}

h5 {
  font-size: 1rem !important;
}

h6 {
  font-size: 0.85rem !important;
}

.blur {
  filter: blur(2.75px);
}

figure img.clickable {
  margin-top: 0.3em;

  max-width: auto;
  max-height: 20em;

  transition: max-height 0.25s ease;

  cursor: pointer;
}

figure img.clickable.active {
  max-width: 100% !important;
  max-height: 100em !important;
}
</style>
