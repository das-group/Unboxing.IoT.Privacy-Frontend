<template>
  <div class="container py-4">
    <h1 class="mb-4 text-center">Richtlinie für die Firmwareextraktion bei IoT-Geräten</h1>

    <div class="card shadow-sm">
      <div class="card-body">
        <p>In diesem Artikel wird erläutert wie die Firmware eines IoT-Geräts erlangt wird, sodass sie auf dieser Plattform untersucht werden kann.</p>

        <p>Autor: <a href="https://www.onekey.com/de">ONEKEY</a></p>

        <div class="alert alert-warning" role="alert">Hinweis: Bitte stellen Sie sicher, dass Sie keine personenbezogenen Daten einreichen!</div>

        <hr />

        <h1 id="technische-dokumentation-beschaffung-von-iot-firmware-f-r-sicherheitsanalysen">Technische Dokumentation: Beschaffung von IoT-Firmware für Sicherheitsanalysen</h1>
        <p>
          <strong>Version:</strong> 1.0<br /><strong>Datum:</strong> 2026-02-23<br /><strong>Kontext:</strong> Förderprojekt zur systematischen Analyse von IoT-Firmware hinsichtlich
          Datenschutzverletzungen und Sicherheitslücken
        </p>
        <hr />
        <h2 id="1-einleitung">1. Einleitung</h2>
        <h3 id="1-1-projektziel">1.1 Projektziel</h3>
        <p>
          Das vorliegende Förderprojekt untersucht IoT-Geräte systematisch auf potenzielle Sicherheitslücken und Datenschutzrisiken. Kern jeder Firmware-Analyse ist der Zugriff auf das originale
          Firmware-Image des zu untersuchenden Geräts.
        </p>
        <p><strong>Untersuchte Risikofelder:</strong></p>
        <ul>
          <li>Hartkodierte Zugangsdaten (Credentials)</li>
          <li>Eingebettete API-Keys, Tokens und Zertifikate</li>
          <li>Cloud-Endpunkte und Backend-Infrastruktur</li>
          <li>Telemetrie- und Tracking-Mechanismen</li>
          <li>Unverschlüsselte Kommunikationskanäle</li>
          <li>Speicherung personenbezogener Daten</li>
          <li>Unsichere Update-Mechanismen</li>
          <li>Backdoors und Debug-Zugänge</li>
        </ul>
        <h3 id="1-2-zweck-dieser-dokumentation">1.2 Zweck dieser Dokumentation</h3>
        <p>
          Diese Dokumentation beschreibt <strong>technisch fundierte, reproduzierbare und rechtlich zulässige</strong> Methoden zur Beschaffung von IoT-Firmware für Analysezwecke. Sie dient als
          Grundlage für:
        </p>
        <ul>
          <li>Projektdokumentation gegenüber Fördermittelgebern</li>
          <li>Nachvollziehbarkeit der Forschungsmethodik</li>
          <li>Reproduzierbarkeit von Analysen</li>
          <li>Transparenz gegenüber technischen Prüfern</li>
        </ul>
        <h3 id="1-3-rechtlicher-rahmen">1.3 Rechtlicher Rahmen</h3>
        <p>Alle beschriebenen Methoden beziehen sich auf:</p>
        <ul>
          <li>Geräte im <strong>rechtmäßigen Besitz</strong> des Forschers</li>
          <li>Geräte, die <strong>zu Testzwecken erworben</strong> wurden</li>
          <li>Firmware, die <strong>vom Hersteller öffentlich bereitgestellt</strong> wird</li>
          <li>Methoden, die <strong>keine aktive Umgehung von Schutzmaßnahmen</strong> darstellen</li>
        </ul>
        <p><strong>Wichtig:</strong> Diese Dokumentation dient ausschließlich der wissenschaftlichen Sicherheitsforschung im Rahmen geltenden Rechts.</p>
        <hr />
        <h2 id="2-methoden-bersicht">2. Methodenübersicht</h2>
        <h3 id="2-1-kategorisierung">2.1 Kategorisierung</h3>
        <p>Methoden zur Firmware-Beschaffung lassen sich in drei Hauptkategorien einteilen:</p>
        <table>
          <thead>
            <tr>
              <th>Kategorie</th>
              <th>Hardwareeingriff</th>
              <th>Technische Komplexität</th>
              <th>Rechtliche Risiken</th>
              <th>Reproduzierbarkeit</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Offizielle Quellen</strong></td>
              <td>Nein</td>
              <td>Niedrig</td>
              <td>Keine</td>
              <td>Sehr hoch</td>
            </tr>
            <tr>
              <td><strong>Software-basiert</strong></td>
              <td>Nein</td>
              <td>Mittel</td>
              <td>Gering</td>
              <td>Hoch</td>
            </tr>
            <tr>
              <td><strong>Hardware-basiert</strong></td>
              <td>Ja</td>
              <td>Hoch</td>
              <td>Gering*</td>
              <td>Mittel</td>
            </tr>
          </tbody>
        </table>
        <p>*Bei Geräten im rechtmäßigen Besitz</p>
        <h3 id="2-2-entscheidungsbaum">2.2 Entscheidungsbaum</h3>
        <pre><code>Firmware-Beschaffung
│
├─ Ist <span class="hljs-keyword">Update</span> offiziell verfügbar?
│  ├─ Ja → Offizielle Quellen (<span class="hljs-keyword">Kap</span>. 3)
│  └─ Nein → Weiter
│
├─ Ist OTA-<span class="hljs-keyword">Update</span> <span class="hljs-keyword">m</span>öglich?
│  ├─ Ja → <span class="hljs-keyword">Update</span>-Mitschnitt (<span class="hljs-keyword">Kap</span>. 4)
│  └─ Nein → Weiter
│
├─ Ist Webinterface/<span class="hljs-keyword">App</span> vorhanden?
│  ├─ Ja → Software-Extraktion (<span class="hljs-keyword">Kap</span>. 5)
│  └─ Nein → Weiter
│
└─ Hardware-Zugriff erforderlich → <span class="hljs-keyword">Kap</span>. 6
</code></pre>
        <hr />
        <h2 id="3-offizielle-quellen">3. Offizielle Quellen</h2>
        <h3 id="3-1-hersteller-webseiten">3.1 Hersteller-Webseiten</h3>
        <p>
          <strong>Beschreibung:</strong><br />Viele Hersteller stellen Firmware-Updates direkt auf ihren Webseiten bereit. Dies ist die bevorzugte Methode, da sie vollständig legal, dokumentierbar und
          reproduzierbar ist.
        </p>
        <p><strong>Typische Fundorte:</strong></p>
        <ul>
          <li>Support-/Download-Bereiche</li>
          <li>Produktseiten (unter &quot;Firmware&quot; oder &quot;Downloads&quot;)</li>
          <li>Entwickler-Portale</li>
          <li>Open-Source-Compliance-Bereiche (GPL-Quellen)</li>
        </ul>
        <p><strong>Beispiel-Workflow:</strong></p>
        <ol>
          <li>Produktmodell und Hardware-Revision identifizieren</li>
          <li>Hersteller-Webseite aufrufen</li>
          <li>Support-Bereich → Downloads → Firmware</li>
          <li>Firmware-Datei herunterladen</li>
          <li>SHA256-Hash berechnen und dokumentieren</li>
        </ol>
        <p>
          <img src="https://iot-privacy.info/beurer-medical-bm-81/IMG_4354.JPG" alt="Geräteidentifikation: Produktkennzeichnung auf Rückseite" />
          <!-- Quelle: https://iot-privacy.info/beurer-medical-bm-81/ | Beispiel: Beurer BM 81, zeigt Seriennummer und Modellbezeichnung -->
        </p>
        <p><strong>Dokumentationsvorlage:</strong></p>
        <pre><code class="lang-markdown">### Firmware-Beschaffung: <span class="hljs-string">[Gerätename]</span>

**Gerät:** <span class="hljs-string">[Hersteller]</span> <span class="hljs-string">[Modell]</span> <span class="hljs-string">[HW-Rev]</span>
**Firmware-Version:** <span class="hljs-string">[x.y.z]</span>
**Quelle:** <span class="hljs-string">[URL]</span>
**Download-Datum:** <span class="hljs-string">[YYYY-MM-DD]</span>
**Dateiname:** <span class="hljs-string">[firmware.bin]</span>
**SHA256:** <span class="hljs-string">[hash]</span>
**Methode:** Offizieller Hersteller-Download
</code></pre>
        <p><strong>Beispielgeräte mit offizieller Firmware-Bereitstellung:</strong></p>
        <ul>
          <li>FRITZ!Box (AVM)</li>
          <li>UniFi-Geräte (Ubiquiti)</li>
          <li>Tasmota-basierte Smart-Home-Geräte</li>
          <li>OpenWrt-kompatible Router</li>
        </ul>
        <h3 id="3-2-open-source-compliance-gpl-lgpl-">3.2 Open-Source-Compliance (GPL/LGPL)</h3>
        <p><strong>Rechtlicher Hintergrund:</strong><br />Geräte, die Linux oder andere GPL-lizenzierte Software verwenden, müssen gemäß Lizenzbestimmungen den Quellcode bereitstellen.</p>
        <p><strong>Typische Fundorte:</strong></p>
        <ul>
          <li><code>[hersteller].com/gpl</code></li>
          <li><code>[hersteller].com/opensource</code></li>
          <li>GitHub/GitLab-Repositories des Herstellers</li>
        </ul>
        <p><strong>Besonderheit:</strong><br />GPL-Quellen enthalten oft:</p>
        <ul>
          <li>Komplette Kernel-Quellen</li>
          <li>Bootloader-Code</li>
          <li>Rootfs-Komponenten</li>
          <li>Build-Skripte</li>
        </ul>
        <p><strong>Beispiel-Anfrage:</strong></p>
        <pre><code><span class="hljs-keyword">Sehr </span>geehrte Damen und Herren,

im Rahmen <span class="hljs-keyword">eines </span>universitären Forschungsprojekts zur IoT-Sicherheit
analysieren wir das Gerät [Modell]. Gemäß GPL-Lizenz <span class="hljs-keyword">bitten </span>wir um
<span class="hljs-keyword">Bereitstellung </span>des vollständigen Quellcodes sowie der verwendeten
Toolchain.

Vielen Dank
[Ihr Name]
</code></pre>
        <h3 id="3-3-support-portale-und-kundenbereiche">3.3 Support-Portale und Kundenbereiche</h3>
        <p>Manche Hersteller stellen Firmware nur nach Login bereit:</p>
        <ul>
          <li>Registrierung mit Seriennummer</li>
          <li>Partner-/Entwickler-Portale</li>
          <li>RMA-Portale (Return Merchandise Authorization)</li>
        </ul>
        <p><strong>Dokumentationshinweis:</strong><br />Login-Credentials und Zugangswege ebenfalls dokumentieren (ohne Passwörter im Klartext).</p>
        <hr />
        <h2 id="4-update-mechanismen-ota-">4. Update-Mechanismen (OTA)</h2>
        <h3 id="4-1-ota-update-mitschnitt">4.1 OTA-Update-Mitschnitt</h3>
        <p>
          <strong>Beschreibung:</strong><br />Viele IoT-Geräte laden Firmware-Updates über das Netzwerk (Over-The-Air). Durch kontrollierten Netzwerk-Mitschnitt kann die Update-Datei extrahiert
          werden.
        </p>
        <p><strong>Voraussetzungen:</strong></p>
        <ul>
          <li>Gerät im eigenen Netzwerk</li>
          <li>MITM-Position (z.B. eigener Router)</li>
          <li>Tools: Wireshark, tcpdump, mitmproxy</li>
        </ul>
        <p><strong>Workflow:</strong></p>
        <ol>
          <li>Netzwerk-Verkehr des Geräts vorbereiten</li>
          <li>Update-Prozess anstoßen (Webinterface/App)</li>
          <li>HTTP(S)-Traffic mitschneiden</li>
          <li>Update-Datei aus Stream extrahieren</li>
          <li>Integrität prüfen (falls Hash bekannt)</li>
        </ol>
        <p><strong>Beispiel-Kommandos:</strong></p>
        <pre><code class="lang-bash"><span class="hljs-meta"># PCAP-Aufzeichnung starten</span>
sudo tcpdump -i eth0 -w ota_capture.pcap host <span class="hljs-number">192.168</span><span class="hljs-number">.1</span><span class="hljs-number">.50</span>

<span class="hljs-meta"># HTTP-Objekte aus PCAP extrahieren</span>
tcpflow -r ota_capture.pcap -o extracted/

<span class="hljs-meta"># Großes Objekt identifizieren (vermutlich Firmware)</span>
ls -lhS extracted/
</code></pre>
        <p><strong>Herausforderungen:</strong></p>
        <ul>
          <li><strong>HTTPS:</strong> Verschlüsselter Traffic erfordert SSL-Interception</li>
          <li><strong>Proprietäre Protokolle:</strong> Nicht immer HTTP-basiert</li>
          <li><strong>Fragmentierung:</strong> Update kann in Teilen übertragen werden</li>
        </ul>
        <h3 id="4-2-app-basierte-updates">4.2 App-basierte Updates</h3>
        <p>Mobile Apps laden oft Firmware herunter und übertragen sie per Bluetooth/WiFi ans Gerät.</p>
        <p>
          <img src="https://iot-privacy.info/beurer-medical-bm-81/App2.png" alt="Beispiel: Mobile App Registrierungsprozess" />
          <!-- Quelle: https://iot-privacy.info/beurer-medical-bm-81/ | Apps oft Quelle für Firmware-Downloads und Update-Mechanismen -->
        </p>
        <p><strong>Ansätze:</strong></p>
        <ul>
          <li>Traffic-Analyse der App (siehe Kap. 5.2)</li>
          <li>App-Speicher durchsuchen (rooted/jailbroken Device)</li>
          <li>Reverse Engineering der App (APK/IPA)</li>
        </ul>
        <p><strong>Beispiel (Android):</strong></p>
        <pre><code class="lang-bash"><span class="hljs-meta"># App-Daten sichern (ADB)</span>
adb backup -f app_backup.ab com.vendor.iot

<span class="hljs-meta"># Backup entpacken</span>
dd <span class="hljs-keyword">if</span>=app_backup.ab bs=<span class="hljs-number">24</span> skip=<span class="hljs-number">1</span> | openssl zlib -d &gt; app_data.tar

<span class="hljs-meta"># Firmware-Datei suchen</span>
tar -tzf app_data.tar | grep -i firmware
</code></pre>
        <h3 id="4-3-webinterface-update-funktion">4.3 Webinterface-Update-Funktion</h3>
        <p>Viele Geräte erlauben manuellen Firmware-Upload über Webinterface.</p>
        <p><strong>Reverse-Ansatz:</strong></p>
        <ol>
          <li>Webinterface öffnen → Update-Seite</li>
          <li>Browser Dev-Tools öffnen (Netzwerk-Tab)</li>
          <li>&quot;Firmware suchen&quot;-Funktion triggern</li>
          <li>HTTP-Requests analysieren</li>
          <li>Update-URL identifizieren</li>
          <li>Firmware direkt von URL herunterladen</li>
        </ol>
        <p><strong>Beispiel:</strong></p>
        <pre><code class="lang-http"><span class="hljs-keyword">GET</span> <span class="hljs-string">/api/firmware/check?model=XYZ-1000&amp;version=1.2.3</span> HTTP/1.1
<span class="hljs-attribute">Host</span>: update.vendor.com

<span class="groovy"><span class="hljs-string">Response:</span>
{
  <span class="hljs-string">"update_available"</span>: <span class="hljs-literal">true</span>,
  <span class="hljs-string">"version"</span>: <span class="hljs-string">"1.3.0"</span>,
  <span class="hljs-string">"url"</span>: <span class="hljs-string">"https://cdn.vendor.com/firmware/XYZ-1000_v1.3.0.bin"</span>,
  <span class="hljs-string">"sha256"</span>: <span class="hljs-string">"abc123..."</span>
}</span>
</code></pre>
        <hr />
        <h2 id="5-software-basierte-extraktion">5. Software-basierte Extraktion</h2>
        <h3 id="5-1-filesystem-zugriff-via-debug-interfaces">5.1 Filesystem-Zugriff via Debug-Interfaces</h3>
        <p>Einige Geräte bieten (versehentlich oder absichtlich) Shell-Zugriff:</p>
        <ul>
          <li>Telnet (oft mit Standard-Credentials)</li>
          <li>SSH (falls aktiviert)</li>
          <li>Debug-Konsole über serielle Schnittstelle (UART)</li>
        </ul>
        <p><strong>Beispiel-Workflow (Telnet):</strong></p>
        <pre><code class="lang-bash"><span class="hljs-meta"># Verbindung aufbauen</span>
telnet <span class="hljs-number">192.168</span><span class="hljs-number">.1</span><span class="hljs-number">.50</span>

<span class="hljs-meta"># Login (oft: root / admin / leer)</span>
<span class="hljs-symbol">Login:</span> root
<span class="hljs-symbol">Password:</span>

<span class="hljs-meta"># Filesystem mounten und kopieren</span>
dd if=<span class="hljs-meta-keyword">/dev/</span>mtd0 of=<span class="hljs-meta-keyword">/tmp/</span>firmware.bin
tftp -p -l <span class="hljs-meta-keyword">/tmp/</span>firmware.bin <span class="hljs-number">192.168</span><span class="hljs-number">.1</span><span class="hljs-number">.100</span>
</code></pre>
        <p><strong>Typische Partitionen:</strong></p>
        <table>
          <thead>
            <tr>
              <th>Device Node</th>
              <th>Typ</th>
              <th>Inhalt</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><code>/dev/mtd0</code></td>
              <td>MTD</td>
              <td>Bootloader</td>
            </tr>
            <tr>
              <td><code>/dev/mtd1</code></td>
              <td>MTD</td>
              <td>Kernel</td>
            </tr>
            <tr>
              <td><code>/dev/mtd2</code></td>
              <td>MTD</td>
              <td>Root Filesystem</td>
            </tr>
            <tr>
              <td><code>/dev/mtd3</code></td>
              <td>MTD</td>
              <td>Config / NVRAM</td>
            </tr>
            <tr>
              <td><code>/dev/mmcblk0</code></td>
              <td>eMMC</td>
              <td>Komplettes Image</td>
            </tr>
          </tbody>
        </table>
        <h3 id="5-2-firmware-extraktion-aus-mobilen-apps">5.2 Firmware-Extraktion aus mobilen Apps</h3>
        <p>Mobile Apps enthalten oft Firmware-Images oder Mechanismen, um diese herunterzuladen.</p>
        <p>
          <img src="https://iot-privacy.info/withings-body-scan/App18.png" alt="Beispiel: Smartphone-App Einrichtungsprozess" />
          <!-- App-Setup oft Einstiegspunkt für Firmware-Analyse -->
        </p>
        <p><strong>Android (APK-Analyse):</strong></p>
        <pre><code class="lang-bash"><span class="hljs-meta"># APK entpacken</span>
unzip com.vendor.iot.apk -d apk_contents/

<span class="hljs-meta"># Assets durchsuchen</span>
find apk_contents/assets/ -type f -size +<span class="hljs-number">1</span>M

<span class="hljs-meta"># Strings in binären Dateien analysieren</span>
strings apk_contents/assets/firmware.enc | grep -i <span class="hljs-string">"http"</span>
</code></pre>
        <p><strong>iOS (IPA-Analyse):</strong></p>
        <pre><code class="lang-bash"><span class="hljs-meta"># IPA entpacken</span>
unzip App.ipa -d ipa_contents/

<span class="hljs-meta"># Payload analysieren</span>
cd ipa_contents/Payload/App.app/

<span class="hljs-meta"># Embedded Resources finden</span>
find . -type f -size +<span class="hljs-number">1</span>M
</code></pre>
        <h3 id="5-3-cloud-endpunkt-enumeration">5.3 Cloud-Endpunkt-Enumeration</h3>
        <p>Manche Hersteller hosten Firmware auf öffentlich erreichbaren, aber nicht dokumentierten URLs.</p>
        <p><strong>Beispiel-Muster:</strong></p>
        <pre><code><span class="xml">https://cdn.vendor.com/firmware/</span><span class="hljs-template-variable">{model}</span><span class="xml">_</span><span class="hljs-template-variable">{version}</span><span class="xml">.bin
https://updates.vendor.com/</span><span class="hljs-template-variable">{model}</span><span class="xml">/v</span><span class="hljs-template-variable">{major}</span><span class="xml">.</span><span class="hljs-template-variable">{minor}</span><span class="xml">.</span><span class="hljs-template-variable">{patch}</span><span class="xml">.bin
https://s3.amazonaws.com/vendor-firmware/</span><span class="hljs-template-variable">{model}</span><span class="xml">-</span><span class="hljs-template-variable">{hwrev}</span><span class="xml">-</span><span class="hljs-template-variable">{swrev}</span><span class="xml">.img</span>
</code></pre>
        <p><strong>Brute-Force-Ansatz (nur mit Genehmigung!):</strong></p>
        <pre><code class="lang-python"><span class="hljs-built_in">import</span> requests

<span class="hljs-attr">models</span> = [<span class="hljs-string">"XYZ-1000"</span>, <span class="hljs-string">"XYZ-2000"</span>]
<span class="hljs-attr">versions</span> = [<span class="hljs-string">"1.0.0"</span>, <span class="hljs-string">"1.1.0"</span>, <span class="hljs-string">"1.2.0"</span>, <span class="hljs-string">"2.0.0"</span>]

for model <span class="hljs-keyword">in</span> models:
    for version <span class="hljs-keyword">in</span> versions:
        <span class="hljs-attr">url</span> = f<span class="hljs-string">"https://cdn.vendor.com/firmware/{model}_{version}.bin"</span>
        <span class="hljs-attr">r</span> = requests.head(url)
        <span class="hljs-keyword">if</span> r.<span class="hljs-attr">status_code</span> == <span class="hljs-number">200</span>:
            print(f<span class="hljs-string">"[+] Found: {url}"</span>)
</code></pre>
        <hr />
        <h2 id="6-hardware-basierte-methoden">6. Hardware-basierte Methoden</h2>
        <p>
          <img src="https://iot-privacy.info/alecto-smartbaby-5/IMG_4243_Ex.JPG" alt="Geöffnetes IoT-Gerät: Alecto Smartbaby 5" />
          <!-- Typisches IoT-Gerät mit Zugriff auf interne Hardware -->
        </p>
        <h3 id="6-1-uart-zugriff-serial-console-">6.1 UART-Zugriff (Serial Console)</h3>
        <p><strong>Beschreibung:</strong><br />UART (Universal Asynchronous Receiver/Transmitter) ist eine serielle Schnittstelle, die bei vielen IoT-Geräten Debug-Zugriff bietet.</p>
        <p><strong>Typische Pins:</strong></p>
        <ul>
          <li><strong>TX</strong> (Transmit) – Gerät sendet</li>
          <li><strong>RX</strong> (Receive) – Gerät empfängt</li>
          <li><strong>GND</strong> (Ground) – Masse</li>
          <li><strong>VCC</strong> (optional) – Stromversorgung (NICHT anschließen!)</li>
        </ul>
        <p><strong>Hardware:</strong></p>
        <ul>
          <li>USB-zu-UART-Adapter (z.B. FTDI FT232, CP2102)</li>
          <li>Jumperkabel</li>
          <li>Multimeter (zur Pin-Identifikation)</li>
        </ul>
        <p><strong>Pin-Identifikation:</strong></p>
        <pre><code>Multimeter im Continuity-<span class="hljs-string">Modus:</span>
<span class="hljs-number">1.</span> GND <span class="hljs-string">finden:</span> Durchgang zu Metallabschirmungen/Schrauben
<span class="hljs-number">2.</span> VCC <span class="hljs-string">finden:</span> Spannung messen (meist <span class="hljs-number">3.3</span>V oder <span class="hljs-number">5</span>V)
<span class="hljs-number">3.</span> TX <span class="hljs-string">finden:</span> Spannung schwankt beim Booten
<span class="hljs-number">4.</span> <span class="hljs-string">RX:</span> Verbleibender Pin
</code></pre>
        <p><strong>Beispiel-Verbindung:</strong></p>
        <pre><code><span class="hljs-comment">Gerät</span>        <span class="hljs-comment">USB</span><span class="hljs-literal">-</span><span class="hljs-comment">UART</span>
<span class="hljs-literal">-</span><span class="hljs-literal">-</span><span class="hljs-literal">-</span><span class="hljs-literal">-</span><span class="hljs-literal">-</span><span class="hljs-literal">-</span>       <span class="hljs-literal">-</span><span class="hljs-literal">-</span><span class="hljs-literal">-</span><span class="hljs-literal">-</span><span class="hljs-literal">-</span><span class="hljs-literal">-</span><span class="hljs-literal">-</span><span class="hljs-literal">-</span><span class="hljs-literal">-</span>
<span class="hljs-comment">TX</span>    <span class="hljs-literal">-</span><span class="hljs-literal">-</span><span class="hljs-literal">-</span><span class="hljs-literal">-</span><span class="hljs-literal">-</span>&gt; <span class="hljs-comment">RX</span>
<span class="hljs-comment">RX</span>    <span class="hljs-literal">-</span><span class="hljs-literal">-</span><span class="hljs-literal">-</span><span class="hljs-literal">-</span><span class="hljs-literal">-</span>&gt; <span class="hljs-comment">TX</span>
<span class="hljs-comment">GND</span>   <span class="hljs-literal">-</span><span class="hljs-literal">-</span><span class="hljs-literal">-</span><span class="hljs-literal">-</span><span class="hljs-literal">-</span>&gt; <span class="hljs-comment">GND</span>
<span class="hljs-comment">VCC</span>          <span class="hljs-comment">(NICHT</span> <span class="hljs-comment">verbinden!)</span>
</code></pre>
        <p><strong>Software:</strong></p>
        <pre><code class="lang-bash"><span class="hljs-comment"># Linux</span>
screen <span class="hljs-regexp">/dev/</span>ttyUSB0 <span class="hljs-number">115200</span>

<span class="hljs-comment"># Oder</span>
minicom -D <span class="hljs-regexp">/dev/</span>ttyUSB0 -b <span class="hljs-number">115200</span>

<span class="hljs-comment"># Oder</span>
picocom <span class="hljs-regexp">/dev/</span>ttyUSB0 -b <span class="hljs-number">115200</span>
</code></pre>
        <p><strong>Typische Baud-Raten:</strong></p>
        <ul>
          <li>9600</li>
          <li>38400</li>
          <li>57600</li>
          <li><strong>115200</strong> (am häufigsten)</li>
        </ul>
        <p><strong>Boot-Log analysieren:</strong></p>
        <pre><code>U-Boot <span class="hljs-number">2018.01</span> (Jul <span class="hljs-number">12</span> <span class="hljs-number">2022</span> - <span class="hljs-number">10</span>:<span class="hljs-number">23</span>:<span class="hljs-number">45</span> +<span class="hljs-number">0800</span>)

DRAM:  <span class="hljs-number">128</span> MiB
Flash: <span class="hljs-number">16</span> MiB
<span class="hljs-function"><span class="hljs-title">Loading</span></span> from NAND...
Kernel at <span class="hljs-number">0x80000</span>
Rootfs at <span class="hljs-number">0x200000</span>

<span class="hljs-function"><span class="hljs-title">Starting</span></span> kernel ...
</code></pre>
        <p><strong>Firmware-Extraktion via UART:</strong></p>
        <pre><code class="lang-bash"><span class="hljs-meta"># Im U-Boot-Prompt (falls zugänglich):</span>
printenv
<span class="hljs-meta"># Zeigt Partitionslayout</span>

<span class="hljs-meta"># Speicher auslesen (Beispiel):</span>
md.b <span class="hljs-number">0x80000</span> <span class="hljs-number">0x10000</span> &gt; kernel_dump.txt
</code></pre>
        <h3 id="6-2-bootloader-zugriff">6.2 Bootloader-Zugriff</h3>
        <p><strong>Beschreibung:</strong><br />Viele Embedded-Geräte nutzen <strong>U-Boot</strong> als Bootloader. Durch Unterbrechung des Boot-Prozesses lässt sich oft eine Shell erreichen.</p>
        <p><strong>Methode:</strong></p>
        <ol>
          <li>UART verbinden (siehe 6.1)</li>
          <li>Gerät einschalten</li>
          <li>Während Boot-Log <strong>schnell Taste drücken</strong> (meist Enter, Leertaste, <code>Ctrl+C</code>)</li>
          <li>U-Boot-Prompt erscheint: <code>=&gt;</code></li>
        </ol>
        <p><strong>U-Boot-Befehle:</strong></p>
        <pre><code class="lang-bash"># Umgebungsvariablen anzeigen
printenv

# Speicherlayout anzeigen
mtdparts

# Flash-Inhalt dumpen
nand read <span class="hljs-number">0x82000000</span> <span class="hljs-number">0x0</span> <span class="hljs-number">0x1000000</span>
md.b <span class="hljs-number">0x82000000</span> <span class="hljs-number">0x1000000</span>

# TFTP-Upload zu Analyzing-Host
setenv serverip <span class="hljs-number">192.168</span><span class="hljs-number">.1</span><span class="hljs-number">.100</span>
setenv ipaddr <span class="hljs-number">192.168</span><span class="hljs-number">.1</span><span class="hljs-number">.50</span>
tftp <span class="hljs-number">0x82000000</span> firmware_dump.bin
</code></pre>
        <p><strong>Schutzmaßnahmen:</strong></p>
        <p>Moderne Geräte schützen Bootloader-Zugriff oft durch:</p>
        <ul>
          <li><strong>Passwort-geschützter U-Boot-Prompt</strong></li>
          <li><strong>Verkürzte Auto-Boot-Delay</strong> (zu kurz zum Abbrechen)</li>
          <li><strong>Aktivierte Console-Locks</strong></li>
          <li><strong>Secure Boot</strong> (siehe 6.7)</li>
        </ul>
        <h3 id="6-3-jtag-swd">6.3 JTAG / SWD</h3>
        <p><strong>Beschreibung:</strong><br />JTAG (Joint Test Action Group) und SWD (Serial Wire Debug) sind Hardware-Debug-Schnittstellen für direkte CPU-Kontrolle.</p>
        <p><strong>Einsatzgebiete:</strong></p>
        <ul>
          <li>Flash-Speicher direkt auslesen</li>
          <li>CPU-Register auslesen</li>
          <li>Breakpoints setzen</li>
          <li>Firmware live patchen</li>
        </ul>
        <p><strong>Hardware:</strong></p>
        <ul>
          <li>JTAG-Adapter (z.B. J-Link, Bus Blaster, ST-Link)</li>
          <li>Passendes Kabel/Pinout</li>
          <li>Software: OpenOCD, JLink Commander, pyOCD</li>
        </ul>
        <p><strong>JTAG-Pin-Identifikation:</strong></p>
        <p>Standard-JTAG benötigt 4-5 Pins:</p>
        <ul>
          <li><strong>TDI</strong> (Test Data In)</li>
          <li><strong>TDO</strong> (Test Data Out)</li>
          <li><strong>TCK</strong> (Test Clock)</li>
          <li><strong>TMS</strong> (Test Mode Select)</li>
          <li><strong>TRST</strong> (Test Reset, optional)</li>
          <li><strong>GND</strong></li>
        </ul>
        <p><strong>SWD benötigt nur 2 Pins:</strong></p>
        <ul>
          <li><strong>SWDIO</strong> (Data)</li>
          <li><strong>SWCLK</strong> (Clock)</li>
          <li><strong>GND</strong></li>
        </ul>
        <p><strong>OpenOCD-Beispiel:</strong></p>
        <pre><code class="lang-bash"><span class="hljs-comment"># OpenOCD starten</span>
openocd <span class="hljs-_">-f</span> interface/jlink.cfg <span class="hljs-_">-f</span> target/stm32f4x.cfg

<span class="hljs-comment"># In separatem Terminal: Telnet zu OpenOCD</span>
telnet localhost 4444

<span class="hljs-comment"># Flash dumpen</span>
dump_image firmware_flash.bin 0x08000000 0x100000
</code></pre>
        <p><strong>Herausforderungen:</strong></p>
        <ul>
          <li><strong>Pin-Identifikation</strong> kann aufwändig sein (Multimeter + Oszilloskop)</li>
          <li><strong>Debug-Fuses</strong> können JTAG/SWD deaktivieren</li>
          <li><strong>Verschlüsselter Flash</strong> (z.B. STM32 RDP Level 2)</li>
        </ul>
        <h3 id="6-4-spi-flash-auslesen">6.4 SPI-Flash-Auslesen</h3>
        <p><strong>Beschreibung:</strong><br />Viele IoT-Geräte speichern Firmware auf externen SPI-Flash-Chips (z.B. Winbond W25Q128).</p>
        <p><strong>Hardware:</strong></p>
        <ul>
          <li>SPI-Programmer (z.B. CH341A, Raspberry Pi, Bus Pirate)</li>
          <li>SOIC-Clip (für In-Circuit-Programmierung)</li>
          <li>Oder: Chip de-löten und in Sockel lesen</li>
        </ul>
        <p><strong>Typische SPI-Flash-Chips:</strong></p>
        <table>
          <thead>
            <tr>
              <th>Hersteller</th>
              <th>Modell</th>
              <th>Kapazität</th>
              <th>Package</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Winbond</td>
              <td>W25Q128</td>
              <td>16 MB</td>
              <td>SOIC-8</td>
            </tr>
            <tr>
              <td>Macronix</td>
              <td>MX25L12835F</td>
              <td>16 MB</td>
              <td>SOIC-8</td>
            </tr>
            <tr>
              <td>GigaDevice</td>
              <td>GD25Q128</td>
              <td>16 MB</td>
              <td>SOIC-8</td>
            </tr>
            <tr>
              <td>Spansion</td>
              <td>S25FL128</td>
              <td>16 MB</td>
              <td>SOIC-8</td>
            </tr>
          </tbody>
        </table>
        <p><strong>Pin-Belegung (SOIC-8):</strong></p>
        <pre><code> ______
|<span class="hljs-string">  •   </span>|
CS   -|<span class="hljs-string"> 1   8 </span>|<span class="hljs-string">- VCC (3.3V)
DO   -</span>|<span class="hljs-string"> 2   7 </span>|<span class="hljs-string">- HOLD
WP   -</span>|<span class="hljs-string"> 3   6 </span>|<span class="hljs-string">- CLK
GND  -</span>|<span class="hljs-string"> 4   5 </span>|<span class="hljs-string">- DI
</span>|<span class="hljs-string">______</span>|
</code></pre>
        <p><strong>Workflow (CH341A):</strong></p>
        <ol>
          <li>Gerät öffnen</li>
          <li>SPI-Flash-Chip identifizieren (Markierung lesen)</li>
          <li>SOIC-Clip anschließen (Orientierung beachten!)</li>
          <li>Mit flashrom oder propietärer Software auslesen</li>
        </ol>
        <p><strong>flashrom-Beispiel:</strong></p>
        <pre><code class="lang-bash"><span class="hljs-meta"># Chip erkennen</span>
sudo flashrom -p ch341a_spi

<span class="hljs-meta"># Flash auslesen</span>
sudo flashrom -p ch341a_spi -r firmware_dump.bin

<span class="hljs-meta"># Verify</span>
sudo flashrom -p ch341a_spi -v firmware_dump.bin
</code></pre>
        <p><strong>Raspberry Pi als SPI-Programmer:</strong></p>
        <pre><code class="lang-bash"><span class="hljs-meta"># SPI aktivieren (raspi-config)</span>
sudo raspi-config
<span class="hljs-meta"># -&gt; Interface Options -&gt; SPI -&gt; Enable</span>

<span class="hljs-meta"># flashrom installieren</span>
sudo apt install flashrom

<span class="hljs-meta"># Auslesen</span>
sudo flashrom -p linux_spi:dev=/dev/spidev0<span class="hljs-number">.0</span>,spispeed=<span class="hljs-number">1000</span> -r dump.bin
</code></pre>
        <p><strong>Wichtige Hinweise:</strong></p>
        <ul>
          <li><strong>3.3V-Logik!</strong> CH341A liefert manchmal 5V → Gerät beschädigen!</li>
          <li><strong>SOIC-Clip korrekt ausrichten</strong> (Pin 1 Markierung beachten)</li>
          <li><strong>Mehrfach auslesen</strong> und Hashes vergleichen (Kontaktprobleme möglich)</li>
        </ul>
        <h3 id="6-5-emmc-nand-auslesen">6.5 eMMC / NAND-Auslesen</h3>
        <p><strong>Beschreibung:</strong><br />Höherwertige IoT-Geräte nutzen eMMC oder NAND-Flash statt SPI.</p>
        <p><strong>eMMC (Embedded MultiMediaCard):</strong></p>
        <ul>
          <li>Multi-Pin-Interface (ähnlich SD-Karte)</li>
          <li>Benötigt speziellen Adapter (z.B. eMMC-zu-SD, eMMC-zu-USB)</li>
          <li>Oft BGA-Package → schwer zugänglich</li>
        </ul>
        <p><strong>NAND-Flash:</strong></p>
        <ul>
          <li>Paralleles Interface (viele Pins)</li>
          <li>Spezielle Programmer nötig (z.B. NAND-Flasher)</li>
          <li>Fehlerkorrektur (ECC) notwendig</li>
        </ul>
        <p><strong>eMMC-Workflow:</strong></p>
        <pre><code class="lang-bash"><span class="hljs-meta"># eMMC via USB-Adapter eingelesen</span>
lsblk
<span class="hljs-meta"># /dev/sdc identifiziert</span>

<span class="hljs-meta"># Komplettes Image erstellen</span>
sudo dd <span class="hljs-keyword">if</span>=/dev/sdc of=emmc_dump.img bs=<span class="hljs-number">4</span>M status=progress

<span class="hljs-meta"># Partitionstabelle analysieren</span>
fdisk -l emmc_dump.img
</code></pre>
        <p><strong>Herausforderungen:</strong></p>
        <ul>
          <li><strong>BGA-Package de-löten</strong> erfordert Rework-Station</li>
          <li><strong>eMMC-Chip-ID</strong> muss bekannt sein (für Adapter)</li>
          <li><strong>Verschlüsselung</strong> kann Daten unlesbar machen</li>
        </ul>
        <h3 id="6-6-chip-off-analyse">6.6 Chip-Off-Analyse</h3>
        <p><strong>Beschreibung:</strong><br />In Extremfällen wird der Flash-Chip komplett vom Board entfernt und extern ausgelesen.</p>
        <p><strong>Methoden:</strong></p>
        <ul>
          <li><strong>Hot-Air-Rework-Station</strong> (für BGA/QFN)</li>
          <li><strong>Lötkolben</strong> (für SOIC/TSSOP)</li>
          <li><strong>Spezialisierte Chip-Reader</strong> (z.B. von Rusolut, Cellebrite)</li>
        </ul>
        <p><strong>Workflow:</strong></p>
        <ol>
          <li>Chip identifizieren (Datenblatt suchen)</li>
          <li>Chip vorsichtig auslöten</li>
          <li>In Programmer-Sockel einsetzen</li>
          <li>Auslesen (wie SPI/eMMC)</li>
          <li>Optional: Chip wieder auflöten</li>
        </ol>
        <p><strong>Profi-Equipment:</strong></p>
        <ul>
          <li><strong>Infrarot-Rework-Station</strong> (präzisere Temperaturkontrolle)</li>
          <li><strong>BGA-Reballing</strong> (falls Chip wieder montiert werden soll)</li>
        </ul>
        <p><strong>Risiko:</strong></p>
        <ul>
          <li><strong>Irreversibler Schaden</strong> am Gerät</li>
          <li><strong>Chip beschädigen</strong> (Hitze, mechanisch)</li>
          <li><strong>Nur als letztes Mittel</strong> verwenden</li>
        </ul>
        <h3 id="6-7-schutzmechanismen-moderner-ger-te">6.7 Schutzmechanismen moderner Geräte</h3>
        <p><strong>Secure Boot:</strong></p>
        <ul>
          <li><strong>Boot-Chain-Verifizierung:</strong> Jede Stufe prüft Signatur der nächsten</li>
          <li><strong>Trust Anchor:</strong> Hardware-Root-of-Trust (z.B. ARM TrustZone)</li>
          <li><strong>Rollback-Schutz:</strong> Verhindert Downgrade auf alte Versionen</li>
        </ul>
        <p><strong>Flash-Verschlüsselung:</strong></p>
        <ul>
          <li><strong>At-Rest-Encryption:</strong> Flash wird mit Hardware-Key verschlüsselt</li>
          <li><strong>Key in Fuses:</strong> Schlüssel hardcoded in CPU (nicht auslesbar)</li>
          <li><strong>Beispiele:</strong> STM32 RDP, ESP32 Flash Encryption</li>
        </ul>
        <p><strong>Debug-Fuses:</strong></p>
        <ul>
          <li><strong>JTAG-Lock:</strong> JTAG/SWD wird per Fuse deaktiviert</li>
          <li><strong>Boot-ROM-Lock:</strong> U-Boot-Prompt gesperrt</li>
          <li><strong>Oft irreversibel!</strong></li>
        </ul>
        <p><strong>Anti-Tamper:</strong></p>
        <ul>
          <li><strong>Mesh-Sensoren:</strong> Erkennen physisches Öffnen</li>
          <li><strong>Voltage Glitching Protection:</strong> Gegen Fault-Injection</li>
          <li><strong>Secure Elements:</strong> TPM, Secure Enclave</li>
        </ul>
        <p><strong>Beispiel (STM32 Read Protection):</strong></p>
        <table>
          <thead>
            <tr>
              <th>Level</th>
              <th>JTAG</th>
              <th>Flash-Auslesen</th>
              <th>Bootloader</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>0</td>
              <td>Voll</td>
              <td>Ja</td>
              <td>Zugänglich</td>
            </tr>
            <tr>
              <td>1</td>
              <td>Eingeschränkt</td>
              <td>Nein</td>
              <td>Teilweise</td>
            </tr>
            <tr>
              <td>2</td>
              <td>Gesperrt</td>
              <td>Nein (irreversibel!)</td>
              <td>Gesperrt</td>
            </tr>
          </tbody>
        </table>
        <hr />
        <h2 id="7-firmware-formate-und-dateisysteme">7. Firmware-Formate und Dateisysteme</h2>
        <h3 id="7-1-typische-firmware-formate">7.1 Typische Firmware-Formate</h3>
        <table>
          <thead>
            <tr>
              <th>Format</th>
              <th>Extension</th>
              <th>Beschreibung</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Binary Image</strong></td>
              <td><code>.bin</code></td>
              <td>Raw Flash-Dump</td>
            </tr>
            <tr>
              <td><strong>Encrypted/Obfuscated</strong></td>
              <td><code>.enc</code>, <code>.pkg</code></td>
              <td>Verschlüsselt oder verschleiert</td>
            </tr>
            <tr>
              <td><strong>Compressed</strong></td>
              <td><code>.tar.gz</code>, <code>.zip</code></td>
              <td>Gepacktes Filesystem</td>
            </tr>
            <tr>
              <td><strong>Vendor-proprietary</strong></td>
              <td><code>.img</code>, <code>.fw</code>, <code>.upg</code></td>
              <td>Hersteller-spezifisch</td>
            </tr>
            <tr>
              <td><strong>U-Boot uImage</strong></td>
              <td><code>.uImage</code></td>
              <td>U-Boot Kernel-Image mit Header</td>
            </tr>
          </tbody>
        </table>
        <h3 id="7-2-typische-dateisysteme">7.2 Typische Dateisysteme</h3>
        <table>
          <thead>
            <tr>
              <th>Dateisystem</th>
              <th>Einsatz</th>
              <th>Extraktion</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>SquashFS</strong></td>
              <td>Read-Only Rootfs</td>
              <td><code>unsquashfs</code></td>
            </tr>
            <tr>
              <td><strong>JFFS2</strong></td>
              <td>NAND-Flash</td>
              <td><code>jefferson</code>, <code>jffs2dump</code></td>
            </tr>
            <tr>
              <td><strong>UBIFS</strong></td>
              <td>NAND mit UBI</td>
              <td><code>ubireader</code></td>
            </tr>
            <tr>
              <td><strong>CramFS</strong></td>
              <td>Legacy Embedded</td>
              <td><code>cramfsck -x</code></td>
            </tr>
            <tr>
              <td><strong>ext4</strong></td>
              <td>eMMC/SD</td>
              <td><code>mount</code>, <code>debugfs</code></td>
            </tr>
            <tr>
              <td><strong>YAFFS2</strong></td>
              <td>NAND (älter)</td>
              <td><code>unyaffs</code></td>
            </tr>
          </tbody>
        </table>
        <p><strong>Binwalk-Analyse:</strong></p>
        <pre><code class="lang-bash"><span class="hljs-comment"># Firmware analysieren</span>
<span class="hljs-keyword">binwalk </span>firmware.<span class="hljs-keyword">bin
</span>
<span class="hljs-comment"># Filesysteme automatisch extrahieren</span>
<span class="hljs-keyword">binwalk </span>-e firmware.<span class="hljs-keyword">bin
</span>
<span class="hljs-comment"># Signatures anzeigen</span>
<span class="hljs-keyword">binwalk </span>-<span class="hljs-keyword">B </span>firmware.<span class="hljs-keyword">bin</span>
</code></pre>
        <p><strong>Beispiel-Output:</strong></p>
        <pre><code><span class="hljs-section">DECIMAL       HEXADECIMAL     DESCRIPTION
--------------------------------------------------------------------------------</span>
0             0x0             U-Boot uImage header
64            0x40            LZMA compressed data
131072        0x20000         Squashfs filesystem, little endian
</code></pre>
        <h3 id="7-3-bootloader-typen">7.3 Bootloader-Typen</h3>
        <table>
          <thead>
            <tr>
              <th>Bootloader</th>
              <th>Architektur</th>
              <th>Häufigkeit</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>U-Boot</strong></td>
              <td>ARM, MIPS, x86</td>
              <td>Sehr hoch</td>
            </tr>
            <tr>
              <td><strong>RedBoot</strong></td>
              <td>ARM</td>
              <td>Mittel</td>
            </tr>
            <tr>
              <td><strong>CFE</strong></td>
              <td>Broadcom MIPS</td>
              <td>Hoch (Router)</td>
            </tr>
            <tr>
              <td><strong>Barebox</strong></td>
              <td>ARM</td>
              <td>Niedrig</td>
            </tr>
            <tr>
              <td><strong>Proprietary</strong></td>
              <td>Variabel</td>
              <td>Mittel</td>
            </tr>
          </tbody>
        </table>
        <hr />
        <h2 id="8-dokumentationsanforderungen">8. Dokumentationsanforderungen</h2>
        <h3 id="8-1-mindestangaben-pro-firmware">8.1 Mindestangaben pro Firmware</h3>
        <p>Jede beschaffte Firmware muss dokumentiert werden:</p>
        <pre><code class="lang-markdown"><span class="hljs-section">## Firmware-Dokumentation</span>

<span class="hljs-section">### Geräteidentifikation</span>
<span class="hljs-bullet">- </span><span class="hljs-strong">**Hersteller:**</span> [Name]
<span class="hljs-bullet">- </span><span class="hljs-strong">**Modell:**</span> [Modellnummer]
<span class="hljs-bullet">- </span><span class="hljs-strong">**Hardware-Revision:**</span> [z.B. v1.2]
<span class="hljs-bullet">- </span><span class="hljs-strong">**Seriennummer:**</span> [S/N]
<span class="hljs-bullet">- </span><span class="hljs-strong">**FCC-ID:**</span> [falls vorhanden]

<span class="hljs-section">### Firmware-Details</span>
<span class="hljs-bullet">- </span><span class="hljs-strong">**Version:**</span> [z.B. 2.1.3]
<span class="hljs-bullet">- </span><span class="hljs-strong">**Build-Datum:**</span> [falls bekannt]
<span class="hljs-bullet">- </span><span class="hljs-strong">**Dateiname:**</span> [original_filename.bin]
<span class="hljs-bullet">- </span><span class="hljs-strong">**Dateigröße:**</span> [in MB]
<span class="hljs-bullet">- </span><span class="hljs-strong">**SHA256-Hash:**</span> [hash]
<span class="hljs-bullet">- </span><span class="hljs-strong">**MD5-Hash:**</span> [hash]

<span class="hljs-section">### Beschaffungsmethode</span>
<span class="hljs-bullet">- </span><span class="hljs-strong">**Quelle:**</span> [offiziell / OTA / Hardware]
<span class="hljs-bullet">- </span><span class="hljs-strong">**Datum der Beschaffung:**</span> [YYYY-MM-DD]
<span class="hljs-bullet">- </span><span class="hljs-strong">**URL (falls vorhanden):**</span> [https://...]
<span class="hljs-bullet">- </span><span class="hljs-strong">**Tool/Hardware verwendet:**</span> [z.B. "CH341A SPI Programmer"]

<span class="hljs-section">### Labor-Setup (bei Hardware-Methoden)</span>
<span class="hljs-bullet">- </span><span class="hljs-strong">**Fotodokumentation:**</span> [siehe Anhang]
<span class="hljs-bullet">- </span><span class="hljs-strong">**Pinout-Identifikation:**</span> [siehe Anhang]
<span class="hljs-bullet">- </span><span class="hljs-strong">**UART-Baudrate:**</span> [z.B. 115200]
<span class="hljs-bullet">- </span><span class="hljs-strong">**SPI-Chip-Modell:**</span> [z.B. W25Q128]

<span class="hljs-section">### Reproduzierbarkeit</span>
<span class="hljs-bullet">- </span><span class="hljs-strong">**Wiederholbar:**</span> [Ja/Nein]
<span class="hljs-bullet">- </span><span class="hljs-strong">**Voraussetzungen:**</span> [z.B. "Gerät muss geöffnet werden"]
<span class="hljs-bullet">- </span><span class="hljs-strong">**Zeitaufwand:**</span> [ca. X Minuten]
<span class="hljs-bullet">- </span><span class="hljs-strong">**Schwierigkeitsgrad:**</span> [Niedrig/Mittel/Hoch]

<span class="hljs-section">### Integrität</span>
<span class="hljs-bullet">- </span><span class="hljs-strong">**Verifikation:**</span> [z.B. "Hash verglichen mit offizieller Quelle"]
<span class="hljs-bullet">- </span><span class="hljs-strong">**Mehrfach-Dump:**</span> [z.B. "3x ausgelesen, Hashes identisch"]
</code></pre>
        <h3 id="8-2-fotodokumentation">8.2 Fotodokumentation</h3>
        <p><strong>Erforderliche Fotos:</strong></p>
        <ol>
          <li><strong>Gerät komplett</strong> (von außen)</li>
          <li><strong>Geöffnetes Gerät</strong> (Platine sichtbar)</li>
          <li><strong>Chip-Markierung</strong> (Close-Up des Flash-Chips)</li>
          <li><strong>Hardware-Setup</strong> (Programmer angeschlossen)</li>
          <li><strong>UART-Pinout</strong> (falls verwendet)</li>
        </ol>
        <p><strong>Markdown-Syntax:</strong></p>
        <pre><code class="lang-markdown">![<span class="hljs-string">Geräteübersicht</span>](<span class="hljs-link">images/device_overview.jpg</span>)
<span class="xml"><span class="hljs-comment">&lt;!-- Quelle: Eigene Aufnahme, Labor XYZ, 2026-02-20 --&gt;</span></span>

![<span class="hljs-string">SPI-Flash-Chip Nahaufnahme</span>](<span class="hljs-link">images/spi_chip_closeup.jpg</span>)
<span class="xml"><span class="hljs-comment">&lt;!-- Winbond W25Q128FVSG, Markierung: 1932 --&gt;</span></span>

![<span class="hljs-string">UART-Pinout identifiziert</span>](<span class="hljs-link">images/uart_pinout.jpg</span>)
<span class="xml"><span class="hljs-comment">&lt;!-- TX=Pin1, RX=Pin2, GND=Pin3, Baudrate: 115200 --&gt;</span></span>
</code></pre>
        <h3 id="8-3-log-dateien">8.3 Log-Dateien</h3>
        <p><strong>Wichtige Logs aufbewahren:</strong></p>
        <ul>
          <li><strong>UART-Boot-Log</strong> (kompletter Boot-Prozess)</li>
          <li><strong>Binwalk-Output</strong> (Firmware-Struktur)</li>
          <li><strong>flashrom-Output</strong> (SPI-Dump-Log)</li>
          <li><strong>Netzwerk-PCAP</strong> (OTA-Mitschnitt)</li>
        </ul>
        <p><strong>Beispiel:</strong></p>
        <pre><code class="lang-bash"><span class="hljs-comment"># UART-Log speichern</span>
<span class="hljs-keyword">script </span>-c <span class="hljs-string">"screen /dev/ttyUSB0 115200"</span> uart_boot.log

<span class="hljs-comment"># Binwalk-Log</span>
<span class="hljs-keyword">binwalk </span>-e firmware.<span class="hljs-keyword">bin </span>&gt; <span class="hljs-keyword">binwalk_output.txt </span><span class="hljs-number">2</span>&gt;&amp;<span class="hljs-number">1</span>

<span class="hljs-comment"># flashrom-Log</span>
sudo flashrom -p ch341a_spi -r dump.<span class="hljs-keyword">bin </span><span class="hljs-number">2</span>&gt;&amp;<span class="hljs-number">1</span> <span class="hljs-title">| tee flashrom.log</span>
</code></pre>
        <h3 id="8-4-chain-of-custody">8.4 Chain-of-Custody</h3>
        <p>Für forensische Nachvollziehbarkeit:</p>
        <pre><code class="lang-markdown"><span class="hljs-comment">### Chain of Custody</span>

|<span class="hljs-string"> Zeitstempel </span>|<span class="hljs-string"> Aktion </span>|<span class="hljs-string"> Durchgeführt von </span>|<span class="hljs-string"> Hash </span>|
|<span class="hljs-string">-------------</span>|<span class="hljs-string">--------</span>|<span class="hljs-string">------------------</span>|<span class="hljs-string">------</span>|
|<span class="hljs-string"> 2026-02-20 10:30 </span>|<span class="hljs-string"> Gerät erworben </span>|<span class="hljs-string"> [Name] </span>|<span class="hljs-string"> - </span>|
|<span class="hljs-string"> 2026-02-20 14:15 </span>|<span class="hljs-string"> Gerät geöffnet </span>|<span class="hljs-string"> [Name] </span>|<span class="hljs-string"> - </span>|
|<span class="hljs-string"> 2026-02-20 14:45 </span>|<span class="hljs-string"> SPI-Dump erstellt </span>|<span class="hljs-string"> [Name] </span>|<span class="hljs-string"> abc123... </span>|
|<span class="hljs-string"> 2026-02-20 15:00 </span>|<span class="hljs-string"> Dump verifiziert </span>|<span class="hljs-string"> [Name 2] </span>|<span class="hljs-string"> abc123... (match) </span>|
|<span class="hljs-string"> 2026-02-20 15:30 </span>|<span class="hljs-string"> Archiviert </span>|<span class="hljs-string"> [Name] </span>|<span class="hljs-string"> - </span>|
</code></pre>
        <hr />
        <h2 id="9-toolchain-bersicht">9. Toolchain-Übersicht</h2>
        <h3 id="9-1-software-tools">9.1 Software-Tools</h3>
        <table>
          <thead>
            <tr>
              <th>Tool</th>
              <th>Zweck</th>
              <th>Installation</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>binwalk</strong></td>
              <td>Firmware-Analyse und Extraktion</td>
              <td><code>apt install binwalk</code></td>
            </tr>
            <tr>
              <td><strong>unblob</strong></td>
              <td>Firmware-Analyse und Extraktion</td>
              <td><code>apt install unblob</code></td>
            </tr>
            <tr>
              <td><strong>flashrom</strong></td>
              <td>SPI-Flash-Programmierung</td>
              <td><code>apt install flashrom</code></td>
            </tr>
            <tr>
              <td><strong>OpenOCD</strong></td>
              <td>JTAG/SWD</td>
              <td><code>apt install openocd</code></td>
            </tr>
            <tr>
              <td><strong>minicom/screen</strong></td>
              <td>UART-Konsole</td>
              <td><code>apt install minicom</code></td>
            </tr>
            <tr>
              <td><strong>jefferson</strong></td>
              <td>JFFS2-Extraktion</td>
              <td><code>pip install jefferson</code></td>
            </tr>
            <tr>
              <td><strong>ubi_reader</strong></td>
              <td>UBIFS-Extraktion</td>
              <td><code>pip install ubi_reader</code></td>
            </tr>
            <tr>
              <td><strong>sasquatch</strong></td>
              <td>SquashFS (modifiziert)</td>
              <td><a href="https://github.com/devttys0/sasquatch">GitHub</a></td>
            </tr>
            <tr>
              <td><strong>firmware-mod-kit</strong></td>
              <td>All-in-One Firmware Tools</td>
              <td><a href="https://github.com/rampageX/firmware-mod-kit">GitHub</a></td>
            </tr>
          </tbody>
        </table>
        <h3 id="9-2-hardware-tools">9.2 Hardware-Tools</h3>
        <table>
          <thead>
            <tr>
              <th>Tool</th>
              <th>Zweck</th>
              <th>Ungefährer Preis</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>FTDI FT232</strong></td>
              <td>UART-Adapter</td>
              <td>~5€</td>
            </tr>
            <tr>
              <td><strong>CH341A</strong></td>
              <td>SPI-Programmer</td>
              <td>~3€</td>
            </tr>
            <tr>
              <td><strong>SOIC-Clip</strong></td>
              <td>In-Circuit SPI-Flash</td>
              <td>~5€</td>
            </tr>
            <tr>
              <td><strong>Bus Pirate</strong></td>
              <td>Universal Interface Tool</td>
              <td>~30€</td>
            </tr>
            <tr>
              <td><strong>J-Link EDU</strong></td>
              <td>JTAG/SWD</td>
              <td>~60€</td>
            </tr>
            <tr>
              <td><strong>Logic Analyzer</strong></td>
              <td>Pin-Identifikation</td>
              <td>~10€</td>
            </tr>
            <tr>
              <td><strong>Multimeter</strong></td>
              <td>Spannungs-/Durchgangsprüfung</td>
              <td>~20€</td>
            </tr>
            <tr>
              <td><strong>Lötstation</strong></td>
              <td>Chip-Auslöten</td>
              <td>~50€</td>
            </tr>
          </tbody>
        </table>
        <hr />
        <h2 id="10-risiken-und-limitationen">10. Risiken und Limitationen</h2>
        <h3 id="10-1-technische-risiken">10.1 Technische Risiken</h3>
        <table>
          <thead>
            <tr>
              <th>Risiko</th>
              <th>Wahrscheinlichkeit</th>
              <th>Auswirkung</th>
              <th>Mitigation</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Gerät beschädigen</strong></td>
              <td>Mittel</td>
              <td>Hoch</td>
              <td>Sorgfältiges Arbeiten, Backup-Gerät</td>
            </tr>
            <tr>
              <td><strong>Falsche Spannung</strong></td>
              <td>Niedrig</td>
              <td>Kritisch</td>
              <td>Multimeter-Messung, 3.3V-Logik prüfen</td>
            </tr>
            <tr>
              <td><strong>Chip zerstören</strong></td>
              <td>Niedrig</td>
              <td>Hoch</td>
              <td>Temperaturkontrolle beim Löten</td>
            </tr>
            <tr>
              <td><strong>Verschlüsselte Firmware</strong></td>
              <td>Hoch</td>
              <td>Mittel</td>
              <td>Keine direkte Mitigation, nur Key-Extraktion</td>
            </tr>
            <tr>
              <td><strong>Debug-Interface gesperrt</strong></td>
              <td>Mittel</td>
              <td>Mittel</td>
              <td>Alternative Methoden versuchen</td>
            </tr>
          </tbody>
        </table>
        <h3 id="10-2-rechtliche-aspekte">10.2 Rechtliche Aspekte</h3>
        <p><strong>Erlaubt (bei eigenem Gerät):</strong></p>
        <ul>
          <li>Firmware auslesen</li>
          <li>Reverse Engineering (für Sicherheitsforschung)</li>
          <li>Schwachstellen identifizieren</li>
        </ul>
        <p><strong>Nicht erlaubt:</strong></p>
        <ul>
          <li>Schutzmaßnahmen aktiv umgehen (DMCA § 1201, Deutschland: UrhG § 95a)</li>
          <li>Firmware weiterverbreiten (ohne Lizenz)</li>
          <li>Schwachstellen ausnutzen bei fremden Geräten</li>
        </ul>
        <p><strong>Responsible Disclosure:</strong></p>
        <p>Gefundene Schwachstellen sollten:</p>
        <ol>
          <li>Dem Hersteller gemeldet werden</li>
          <li>Mit angemessener Frist zur Behebung (z.B. 90 Tage)</li>
          <li>Erst danach öffentlich gemacht werden (Koordiniert)</li>
        </ol>
        <h3 id="10-3-ethische-berlegungen">10.3 Ethische Überlegungen</h3>
        <ul>
          <li><strong>Verhältnismäßigkeit:</strong> Ist Chip-Off wirklich nötig?</li>
          <li><strong>Transparenz:</strong> Dokumentation muss nachvollziehbar sein</li>
          <li><strong>Verantwortung:</strong> Gefundene Schwachstellen nicht missbrauchen</li>
        </ul>
        <hr />
        <h2 id="11-beispiel-workflows">11. Beispiel-Workflows</h2>
        <h3 id="11-1-scenario-1-router-firmware-offiziell-verf-gbar-">11.1 Scenario 1: Router-Firmware (offiziell verfügbar)</h3>
        <p><strong>Gerät:</strong> TP-Link Archer C7 v5</p>
        <p><strong>Workflow:</strong></p>
        <ol>
          <li>Hersteller-Webseite besuchen: <code>tp-link.com/support</code></li>
          <li>Modell suchen → Download-Bereich</li>
          <li>Neueste Firmware herunterladen: <code>ArcherC7v5_firmware_201230.bin</code></li>
          <li>
            Hash berechnen:
            <pre><code class="lang-bash"><span class="hljs-selector-tag">sha256sum</span> <span class="hljs-selector-tag">ArcherC7v5_firmware_201230</span><span class="hljs-selector-class">.bin</span>
</code></pre>
          </li>
          <li>Dokumentieren (siehe Template 8.1)</li>
          <li>Mit binwalk analysieren</li>
          <li>Schwachstellen-Analyse durchführen</li>
        </ol>
        <p><strong>Zeitaufwand:</strong> 10 Minuten<br /><strong>Schwierigkeit:</strong> Niedrig<br /><strong>Reproduzierbar:</strong> Ja</p>
        <h3 id="11-2-scenario-2-smart-home-ger-t-ota-mitschnitt-">11.2 Scenario 2: Smart-Home-Gerät (OTA-Mitschnitt)</h3>
        <p><strong>Gerät:</strong> Tuya Smart Plug</p>
        <p><strong>Workflow:</strong></p>
        <ol>
          <li>Gerät in isoliertes Test-WLAN einbinden</li>
          <li>Wireshark auf Gateway starten</li>
          <li>Update-Funktion in App triggern</li>
          <li>Traffic mitschneiden (HTTPS → SSL-Interception nötig)</li>
          <li>Firmware-URL aus Traffic extrahieren</li>
          <li>Firmware direkt von URL herunterladen</li>
          <li>Hash berechnen und dokumentieren</li>
        </ol>
        <p><strong>Zeitaufwand:</strong> 30 Minuten<br /><strong>Schwierigkeit:</strong> Mittel<br /><strong>Reproduzierbar:</strong> Ja (falls URL gleich bleibt)</p>
        <h3 id="11-3-scenario-3-ip-kamera-spi-flash-dump-">11.3 Scenario 3: IP-Kamera (SPI-Flash-Dump)</h3>
        <p><strong>Gerät:</strong> Generische ONVIF IP-Kamera</p>
        <p><strong>Workflow:</strong></p>
        <ol>
          <li>Kamera öffnen (Schrauben entfernen)</li>
          <li>Platine identifizieren</li>
          <li>SPI-Flash-Chip finden (z.B. Winbond W25Q64)</li>
          <li>SOIC-Clip anschließen (CH341A)</li>
          <li>
            flashrom ausführen:
            <pre><code class="lang-bash">sudo flashrom -<span class="hljs-selector-tag">p</span> ch341a_spi -r camera_dump1<span class="hljs-selector-class">.bin</span>
sudo flashrom -<span class="hljs-selector-tag">p</span> ch341a_spi -r camera_dump2.bin
</code></pre>
          </li>
          <li>
            Hashes vergleichen:
            <pre><code class="lang-bash"><span class="hljs-attribute">sha256sum</span> camera_dump<span class="hljs-regexp">*.bin</span>
</code></pre>
          </li>
          <li>Bei Match: Dump als final speichern</li>
          <li>binwalk-Analyse</li>
          <li>Gerät wieder verschließen</li>
        </ol>
        <p><strong>Zeitaufwand:</strong> 45 Minuten<br /><strong>Schwierigkeit:</strong> Mittel-Hoch<br /><strong>Reproduzierbar:</strong> Ja (erfordert Geräteöffnung)</p>
        <h3 id="11-4-scenario-4-embedded-device-uart-u-boot-">11.4 Scenario 4: Embedded Device (UART + U-Boot)</h3>
        <p><strong>Gerät:</strong> Custom IoT-Gateway</p>
        <p><strong>Workflow:</strong></p>
        <ol>
          <li>UART-Pins identifizieren (siehe 6.1)</li>
          <li>USB-UART-Adapter anschließen</li>
          <li>Seriell-Terminal öffnen (<code>screen /dev/ttyUSB0 115200</code>)</li>
          <li>Gerät booten → U-Boot abbrechen (Leertaste drücken)</li>
          <li>U-Boot-Prompt: <code>=&gt;</code></li>
          <li>
            Partitionslayout anzeigen:
            <pre><code><span class="hljs-attribute">printenv
mtdparts</span>
</code></pre>
          </li>
          <li>
            Firmware via TFTP extrahieren:
            <pre><code><span class="hljs-selector-tag">setenv</span> <span class="hljs-selector-tag">serverip</span> 192<span class="hljs-selector-class">.168</span><span class="hljs-selector-class">.1</span><span class="hljs-selector-class">.100</span>
<span class="hljs-selector-tag">tftpboot</span> 0<span class="hljs-selector-tag">x80000000</span> <span class="hljs-selector-tag">kernel</span><span class="hljs-selector-class">.bin</span>
</code></pre>
          </li>
          <li>Dokumentieren</li>
        </ol>
        <p><strong>Zeitaufwand:</strong> 60 Minuten<br /><strong>Schwierigkeit:</strong> Hoch<br /><strong>Reproduzierbar:</strong> Ja (falls U-Boot zugänglich)</p>
        <hr />
        <h2 id="12-qualit-tssicherung">12. Qualitätssicherung</h2>
        <h3 id="12-1-verifikation-der-integrit-t">12.1 Verifikation der Integrität</h3>
        <p><strong>Hash-Vergleich:</strong></p>
        <pre><code class="lang-bash"><span class="hljs-comment"># Mehrere Dumps erstellen</span>
flashrom -p ch341a_spi -r dump1.<span class="hljs-keyword">bin
</span>flashrom -p ch341a_spi -r dump2.<span class="hljs-keyword">bin
</span>flashrom -p ch341a_spi -r dump3.<span class="hljs-keyword">bin
</span>
<span class="hljs-comment"># Hashes vergleichen</span>
<span class="hljs-keyword">sha256sum </span>dump*.<span class="hljs-keyword">bin</span>
</code></pre>
        <p><strong>Erwartet:</strong></p>
        <pre><code><span class="hljs-function"><span class="hljs-title">abc123</span></span>... dump1.bin
<span class="hljs-function"><span class="hljs-title">abc123</span></span>... dump2.bin
<span class="hljs-function"><span class="hljs-title">abc123</span></span>... dump3.bin
</code></pre>
        <p>Falls unterschiedlich → Kontaktproblem oder Flash beschädigt!</p>
        <h3 id="12-2-plausibilit-tspr-fung">12.2 Plausibilitätsprüfung</h3>
        <p><strong>Typische Indikatoren für erfolgreichen Dump:</strong></p>
        <pre><code class="lang-bash"><span class="hljs-meta"># Magic Bytes prüfen</span>
hexdump -C firmware.bin | head

<span class="hljs-meta"># Sollte zeigen:</span>
<span class="hljs-meta"># U-Boot: 27 05 19 56</span>
<span class="hljs-meta"># SquashFS: 68 73 71 73 (hsqs)</span>
<span class="hljs-meta"># JFFS2: 19 85 (oder 85 19)</span>
</code></pre>
        <p><strong>Binwalk-Analyse:</strong></p>
        <pre><code class="lang-bash"><span class="hljs-keyword">binwalk </span>firmware.<span class="hljs-keyword">bin</span>
</code></pre>
        <p>Erwartete Strukturen:</p>
        <ul>
          <li>Bootloader-Header</li>
          <li>Kernel (oft LZMA-komprimiert)</li>
          <li>Rootfs (SquashFS/JFFS2)</li>
        </ul>
        <h3 id="12-3-vergleich-mit-referenz">12.3 Vergleich mit Referenz</h3>
        <p>Falls offizielle Firmware existiert:</p>
        <pre><code class="lang-bash"><span class="hljs-meta"># Download von Hersteller</span>
wget https:<span class="hljs-comment">//vendor.com/firmware_official.bin</span>

<span class="hljs-meta"># Vergleich</span>
diff &lt;(xxd dump.bin) &lt;(xxd firmware_official.bin)
</code></pre>
        <p>Sollte identisch sein (oder erklärbarer Unterschied, z.B. Config-Partition).</p>
        <hr />
        <h2 id="13-archive-und-collaboration">13. Archive und Collaboration</h2>
        <h3 id="13-1-zentrale-firmware-archive">13.1 Zentrale Firmware-Archive</h3>
        <p>Für Reproduzierbarkeit und Zusammenarbeit:</p>
        <p><strong>Öffentliche Archive:</strong></p>
        <ul>
          <li><strong>firmware.re</strong> (Reverse-Engineering-Community)</li>
          <li><strong>GitHub-Repositories</strong> (Tagged Firmware-Dumps)</li>
          <li><strong>Internet Archive</strong> (Wayback Machine für alte Firmware)</li>
        </ul>
        <p><strong>Struktur:</strong></p>
        <pre><code>firmware-archive/
├── vendor1/
│   ├── model_A/
│   │   ├── v1<span class="hljs-number">.0</span><span class="hljs-number">.0</span>/
│   │   │   ├── firmware.bin
│   │   │   ├── SHA256SUMS
│   │   │   └── README.md
│   │   └── v1<span class="hljs-number">.1</span><span class="hljs-number">.0</span>/
│   └── model_B/
└── vendor2/
</code></pre>
        <h3 id="13-2-metadaten-schema">13.2 Metadaten-Schema</h3>
        <p><strong>JSON-Format:</strong></p>
        <pre><code class="lang-json">{
  <span class="hljs-attr">"device"</span>: {
    <span class="hljs-attr">"vendor"</span>: <span class="hljs-string">"ExampleCorp"</span>,
    <span class="hljs-attr">"model"</span>: <span class="hljs-string">"IoT-Gateway-X1000"</span>,
    <span class="hljs-attr">"hw_revision"</span>: <span class="hljs-string">"v2.1"</span>,
    <span class="hljs-attr">"serial"</span>: <span class="hljs-string">"SN123456789"</span>
  },
  <span class="hljs-attr">"firmware"</span>: {
    <span class="hljs-attr">"version"</span>: <span class="hljs-string">"2.3.1"</span>,
    <span class="hljs-attr">"build_date"</span>: <span class="hljs-string">"2025-12-01"</span>,
    <span class="hljs-attr">"filename"</span>: <span class="hljs-string">"firmware_v2.3.1.bin"</span>,
    <span class="hljs-attr">"size_bytes"</span>: <span class="hljs-number">16777216</span>,
    <span class="hljs-attr">"sha256"</span>: <span class="hljs-string">"abc123..."</span>,
    <span class="hljs-attr">"md5"</span>: <span class="hljs-string">"def456..."</span>
  },
  <span class="hljs-attr">"acquisition"</span>: {
    <span class="hljs-attr">"method"</span>: <span class="hljs-string">"SPI Flash Dump"</span>,
    <span class="hljs-attr">"date"</span>: <span class="hljs-string">"2026-02-20"</span>,
    <span class="hljs-attr">"source"</span>: <span class="hljs-string">"Hardware Extraction"</span>,
    <span class="hljs-attr">"tool"</span>: <span class="hljs-string">"CH341A + flashrom"</span>,
    <span class="hljs-attr">"reproducible"</span>: <span class="hljs-literal">true</span>
  },
  <span class="hljs-attr">"analysis"</span>: {
    <span class="hljs-attr">"bootloader"</span>: <span class="hljs-string">"U-Boot 2018.01"</span>,
    <span class="hljs-attr">"kernel"</span>: <span class="hljs-string">"Linux 4.14.98"</span>,
    <span class="hljs-attr">"rootfs"</span>: <span class="hljs-string">"SquashFS 4.0"</span>,
    <span class="hljs-attr">"findings"</span>: [
      <span class="hljs-string">"Hardcoded root password"</span>,
      <span class="hljs-string">"Unencrypted telnet enabled"</span>
    ]
  }
}
</code></pre>
        <hr />
        <h2 id="14-zusammenfassung">14. Zusammenfassung</h2>
        <h3 id="14-1-empfohlener-workflow">14.1 Empfohlener Workflow</h3>
        <p><strong>1. Recherche (1-2 Stunden):</strong></p>
        <ul>
          <li>Ist Firmware offiziell verfügbar?</li>
          <li>Welche Hardware hat das Gerät?</li>
          <li>Gibt es bekannte Schwachstellen?</li>
        </ul>
        <p><strong>2. Beschaffung (variabel):</strong></p>
        <ul>
          <li>Einfachste Methode wählen (offizielle Quellen bevorzugen)</li>
          <li>Bei Hardware-Methoden: Equipment vorbereiten</li>
        </ul>
        <p><strong>3. Verifikation (15 Minuten):</strong></p>
        <ul>
          <li>Mehrfach-Dumps bei Hardware-Methoden</li>
          <li>Hash-Vergleich</li>
          <li>binwalk-Plausibilitätsprüfung</li>
        </ul>
        <p><strong>4. Dokumentation (30 Minuten):</strong></p>
        <ul>
          <li>Template ausfüllen</li>
          <li>Fotos hinzufügen</li>
          <li>Logs archivieren</li>
        </ul>
        <p><strong>5. Analyse (je nach Projekt):</strong></p>
        <ul>
          <li>binwalk/unblob-Extraktion</li>
          <li>Dateisystem mounten</li>
          <li>Strings analysieren</li>
          <li>Binaries reverse-engineeren</li>
        </ul>
        <h3 id="14-2-h-ufigste-fehler-vermeiden">14.2 Häufigste Fehler vermeiden</h3>
        <table>
          <thead>
            <tr>
              <th>Fehler</th>
              <th>Folge</th>
              <th>Vermeidung</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>5V an 3.3V-Logik</strong></td>
              <td>Chip zerstört</td>
              <td>Immer Spannung messen!</td>
            </tr>
            <tr>
              <td><strong>SOIC-Clip falsch rum</strong></td>
              <td>Kein Kontakt / Schaden</td>
              <td>Pin 1 Markierung beachten</td>
            </tr>
            <tr>
              <td><strong>Nur 1x auslesen</strong></td>
              <td>Unerkannte Korruption</td>
              <td>Mindestens 2x, Hash vergleichen</td>
            </tr>
            <tr>
              <td><strong>Keine Dokumentation</strong></td>
              <td>Nicht reproduzierbar</td>
              <td>Sofort dokumentieren</td>
            </tr>
            <tr>
              <td><strong>Gerät eingeschaltet lassen</strong></td>
              <td>Kurzschluss beim Probing</td>
              <td>Immer Strom trennen!</td>
            </tr>
          </tbody>
        </table>
        <h3 id="14-3-kosten-nutzen-abw-gung">14.3 Kosten-Nutzen-Abwägung</h3>
        <table>
          <thead>
            <tr>
              <th>Methode</th>
              <th>Kosten</th>
              <th>Zeitaufwand</th>
              <th>Erfolgsrate</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Offizielle Quellen</td>
              <td>0€</td>
              <td>10 Min</td>
              <td>90% (falls verfügbar)</td>
            </tr>
            <tr>
              <td>OTA-Mitschnitt</td>
              <td>~50€ (Proxy)</td>
              <td>30 Min</td>
              <td>70%</td>
            </tr>
            <tr>
              <td>UART-Zugriff</td>
              <td>~10€</td>
              <td>1h</td>
              <td>60%</td>
            </tr>
            <tr>
              <td>SPI-Dump</td>
              <td>~15€</td>
              <td>1h</td>
              <td>90%</td>
            </tr>
            <tr>
              <td>JTAG</td>
              <td>~60€</td>
              <td>3h</td>
              <td>50% (Debug oft gesperrt)</td>
            </tr>
            <tr>
              <td>Chip-Off</td>
              <td>~500€+</td>
              <td>5h+</td>
              <td>95% (aber invasiv)</td>
            </tr>
          </tbody>
        </table>
        <hr />
        <h2 id="15-weiterf-hrende-ressourcen">15. Weiterführende Ressourcen</h2>
        <h3 id="15-1-literatur">15.1 Literatur</h3>
        <ul>
          <li><strong>&quot;The Hardware Hacker&quot;</strong> – Andrew &quot;bunnie&quot; Huang</li>
          <li><strong>&quot;Practical IoT Hacking&quot;</strong> – Fotios Chantzis et al.</li>
          <li><strong>&quot;The Firmware Handbook&quot;</strong> – Jack Ganssle</li>
        </ul>
        <h3 id="15-2-online-ressourcen">15.2 Online-Ressourcen</h3>
        <ul>
          <li><strong>unblob:</strong> <a href="https://unblob.org">https://unblob.org</a></li>
          <li><strong>Hackaday:</strong> <a href="https://hackaday.com/">IoT-Hacking-Artikel</a></li>
          <li><strong>OWASP IoT Top 10:</strong> <a href="https://owasp.org/www-project-internet-of-things/">https://owasp.org/www-project-internet-of-things/</a></li>
        </ul>
        <h3 id="15-3-tools-frameworks">15.3 Tools &amp; Frameworks</h3>
        <ul>
          <li><strong>Firmwalker:</strong> Filesystem-Analyse (GitHub)</li>
          <li><strong>EMBA:</strong> Embedded Analyzer (GitHub)</li>
          <li><strong>Qiling Framework:</strong> Firmware-Emulation (Python)</li>
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

img {
  max-width: 100%;
}

/* Tables */

table {
  width: 100%;
  border-collapse: collapse;
  background-color: #ffffff;
  font-size: 15px;
}

thead {
  background-color: #2a3253;
  color: white;
}

thead th {
  padding: 14px 18px;
  text-align: left;
  font-weight: bold;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  font-size: 13px;
  border-bottom: 3px solid #697194;
}

tbody tr:nth-child(even) {
  background-color: #f7f9ff;
}

tbody tr:hover {
  background-color: #eef1fd;
  cursor: pointer;
}

tbody td {
  padding: 12px 18px;
  color: #444;
  border-bottom: 1px solid #e0e4ef;
  border-right: 1px solid #e0e4ef;
}

/* Remove right border on last cell */
tbody td:last-child {
  border-right: none;
}

/* Footer */
tfoot td {
  padding: 12px 18px;
  font-weight: bold;
  background-color: #eef1fd;
  color: #4a6cf7;
  border-top: 2px solid #c0c8ef;
}

/* Last row rounded corners */
tbody tr:last-child td:first-child {
  border-radius: 0 0 0 10px;
}

tbody tr:last-child td:last-child {
  border-radius: 0 0 10px 0;
}
</style>
