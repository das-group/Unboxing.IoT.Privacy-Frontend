<template>
  <div class="container py-4">
    <h1 class="mb-4 text-center">Richtlinie für die Netzwerkuntersuchung von IoT-Geräten</h1>

    <div class="card shadow-sm">
      <div class="card-body">
        <p>
          In diesem Artikel wird die Verwendung von bereitgestellten Werkzeugen für die Netzwerkuntersuchung erläutert. Ziel ist die Sammlung von Netzwerkdaten, die auf dieser Plattform hochgeladen
          und ausgewertet werden können.
        </p>

        <p>Unter Anderem soll bestimmt werden,</p>
        <ul>
          <li>mit welchen Servern das IoT-Gerät im Internet kommuniziert (siehe <a href="#wifirecord">wifirecord.sh</a>)</li>
          <li>ob die Verschlüsselung des Geräts vor Angriffen geschützt und technisch korrekt implementiert wurde (siehe <a href="#tlstest">tlstest.sh</a>)</li>
          <li>welche Netzwerkdienste auf dem Gerät laufen (TODO)</li>
        </ul>

        <div class="alert alert-warning" role="alert">Hinweis: Bitte stellen Sie sicher, dass Sie keine personenbezogenen Daten einreichen!</div>

        <hr />

        <h2>Benötigte Utensilien:</h2>

        <ul>
          <li>Linux-Computer mit einem WLAN-Adapter sowie Ethernet-Anschluss</li>
          <ul>
            <li>
              Distribution: Debian-basierend (z.B. Ubuntu oder Raspbian)
              <ul>
                <li>Weitere Distributionen wurden nicht getestet, sollten jedoch funktionieren</li>
                <li>Beispiel: Raspberry Pi, Laptop, o.Ä.</li>
              </ul>
            </li>
            <li>Die Werkzeuge wurden auf einem Raspberry Pi entwickelt und getestet. Sollten Probleme auftreten, dann empfiehlt es sich, dieselbe Plattform zu benutzen.</li>
          </ul>
          <li>
            Die hier zur Verfügung gestellten Skripte:
            <br />
            <a href="https://platform.iot-privacy.info/static/UIoTP_Netzwerkuntersuchung_Werkzeuge.zip" class="btn btn-primary" role="button">Herunterladen</a>
          </li>
        </ul>

        <hr />

        <h2>Vorbereitung:</h2>

        <ul>
          <li>Die Skripte sollen auf den Computer heruntergeladen werden</li>
          <ul>
            <li>Hierbei handelt es sich um Unix-Bash-Skripte</li>
          </ul>
          <li>In jedem Skript werden zu Beginn Variablen mit standardmäßigen Werten definiert, welche auf die eigenen Gegebenheiten angepasst werden müssen</li>
          <li>Die Skripte müssen von einem Benutzerkonto mit <kbd>sudo</kbd>-Berechtigung ausgeführt werden</li>

          <li>Abhängigkeiten bzw. benötigte Pakete werden bei Bedarf i.d.R. automatisiert heruntergeladen</li>
          <ul>
            <li>Sollte dies nicht gelingen, dann müssen die nötigen Pakete manuell installiert werden</li>
          </ul>
        </ul>
      </div>
    </div>

    <!-- wifisetup.sh -->

    <div class="card shadow-sm mt-3" id="wifisetup">
      <div class="card-body">
        <h2>
          WLAN-Testumgebung:
          <b>wifisetup.sh</b>
        </h2>

        <p>
          Das Skript errichtet ein eigenes WLAN-Netzwerk, welches die nachfolgende Untersuchung des Netzwerkverkehrs ermöglicht. IoT-Geräte können sich mit diesem Netzwerk verbinden, und erhalten
          dadurch ihren Internetzugang.
          <u>Hierbei entstehen noch keine verwendbaren Ausgaben.</u> Dieses Skript und die errichtete Umgebung ist jedoch eine Voraussetzung für weitere Skripte, welche hier verzeichnet sind.
        </p>

        Die Standardmäßigen WLAN-Zugangsdaten sind:
        <ul>
          <li>Netzwerkname: <code>UIoTP</code></li>
          <li>Passwort: <code>unboxing</code></li>
        </ul>

        <button class="btn btn-primary" type="button" data-bs-toggle="collapse" aria-expanded="false" data-bs-target="#wifisetupConfig" aria-controls="wifisetupConfig">
          Konfigurationsvariablen (Klick zum Ausklappen)
        </button>

        <div class="collapse" id="wifisetupConfig">
          <div class="card card-body">
            <ul>
              <li>
                <code>WAN_IFACE="eth0"</code>
                <ul>
                  <li>
                    Das WAN-Interface, über den der Linux-Computer mit dem Router bzw. Internet verbunden ist. Dieses Interface könnte auf einigen System auch mit "enXXXX" beginnen (Beispiel:
                    enp0s31f6).
                  </li>
                  <li>
                    Um eine Übersicht an verfügbaren Netzwerkadaptern zu erhalten, führe den Befehl
                    <code> ip addr </code>
                    aus.
                  </li>
                </ul>
              </li>

              <li>
                <code>WIFI_IFACE="wlan0"</code>
                <ul>
                  <li>Das WLAN-Interface, über das das WLAN-Netzwerk errichtet werden soll. Dieses Interface könnte auf einigen System auch mit "wlanX" beginnen.</li>
                  <li>
                    Um eine Übersicht an verfügbaren Netzwerkadaptern zu erhalten, führe den Befehl
                    <code> ip addr </code>
                    aus.
                  </li>
                </ul>
              </li>

              <li>
                <code>BR_IFACE="br0"</code>
                <ul>
                  <li>
                    Das Bridge-Interface. Dieses Interface sollte nicht bereits auf dem System existieren. Sollte lediglich dann auf z.B. „br1“ geändert werden, wenn bereits zuvor ein anderes
                    Bridge-Interface „br0“ errichtet wurde.
                  </li>

                  <li>
                    Um eine Übersicht an verfügbaren Bridge-Interfaces zu erhalten, führe den Befehl
                    <code> brctl show </code>
                    aus.
                  </li>
                </ul>
              </li>

              <li>
                <code>WIFI_SSID="UIoTP"</code>
                <ul>
                  <li>Der WLAN-Netzwerkname für das zu errichtende WLAN-Netzwerk. Kann nach Belieben geändert werden.</li>
                </ul>
              </li>

              <li>
                <code>WIFI_PASSWORD="unboxing"</code>
                <ul>
                  <li>Das zugehörige Passwort für das WLAN. Kann und sollte nach Belieben geändert werden, und die Länge darf nicht unter 8 Zeichen betragen.</li>
                </ul>
              </li>

              <li>
                <code>NETWORK_IP="192.168.200.1"</code>
                <ul>
                  <li>IP-Adresse des zu errichtenden Netzwerkgateways. I.d.R. kein Änderungsbedarf.</li>
                </ul>
              </li>

              <li>
                <code>NETWORK_SUBNET="255.255.255.0"</code>
                <ul>
                  <li>Netzmaske des zu errichtenden Netzwerks. IP-Adresse des zu errichtenden Netzwerkgateways. I.d.R. kein Änderungsbedarf.</li>
                </ul>
              </li>

              <li>
                <code>NETWORK_DHCP_START="192.168.200.2"</code>
                <ul>
                  <li>Start-IP-Adresse des zu errichtenden DHCP-Servers. I.d.R. kein Änderungsbedarf.</li>
                </ul>
              </li>

              <li>
                <code>NETWORK_DHCP_END="192.168.200.254"</code>
                <ul>
                  <li>End-IP-Adresse des zu errichtenden DHCP-Servers. I.d.R. kein Änderungsbedarf.</li>
                  <li>Dies sind die DHCP-Einstellungen für das zu errichtende Netzwerk. IoT-Geräte erhalten eine zufällige IP-Adresse im Bereich von 192.168.200.2-192.168.200.254.</li>
                </ul>
              </li>

              <li>
                <code>NETWORK_DNS="1.1.1.1"</code>
                <ul>
                  <li>DNS-Server für das zu errichtende WLAN-Netzwerk. Standardmäßig wird Cloudflare verwendet. Kann auf einen beliebigen DNS-Server geändert werden (z.B. von Google – 8.8.8.8).</li>
                </ul>
              </li>

              <li>
                <code>MITM_LISTEN_PORT="9900"</code>
                <ul>
                  <li>
                    Netzwerkport, auf den sämtlicher TCP-Netzwerkverkehr umgeleitet wird, sofern die MITM-Umleitung aktiviert wird. Sollte lediglich dann geändert werden, wenn der Port bereits
                    anderweitig in Verwendung ist.
                  </li>
                </ul>
              </li>

              <li>
                <code>DNSMASQ_CONF="dnsmasq.conf"</code>
                <ul>
                  <li>
                    Dateinamen für die Konfigurationsdateien von verwendeten Programmen, welche in denselben Ordner geschrieben werden, in dem sich das Skript befindet. I.d.R. kein Änderungsbedarf.
                  </li>
                </ul>
              </li>

              <li>
                <code>HOSTAPD_CONF="hostapd.conf"</code>
                <ul>
                  <li>
                    Dateinamen für die Konfigurationsdateien von verwendeten Programmen, welche in denselben Ordner geschrieben werden, in dem sich das Skript befindet. I.d.R. kein Änderungsbedarf.
                  </li>
                </ul>
              </li>
            </ul>
          </div>
        </div>

        <hr />

        <h3>Verwendung:</h3>

        <p>
          <code>./wifisetup.sh</code><br />
          Der Aufruf ohne weitere Parameter errichtet ein WLAN-Netzwerk mit den vorkonfigurierten Werten.
        </p>

        <p>
          <code>./wifisetup.sh reset</code><br />
          Der Aufruf mit dem Parameter <code>reset</code> setzt alle Netzwerkinterfaces zurück, welche für die Errichtung des Netzwerks verändert wurden. Sollte lediglich nach dem Gebrauch verwendet
          werden.
        </p>

        <p>
          <code>./wifisetup.sh reset</code><br />
          Der Aufruf mit dem Parameter <code>mitm</code> errichtet ein WLAN-Netzwerk mit den vorkonfigurierten Werten. Zusätzlich wird sämtlicher TCP-Netzwerkverkehr auf den in „MITM_LISTEN_PORT“
          konfigurierten Port umgeleitet. Wird in Konjuktur mit „tlstest.sh“ verwendet.
        </p>

        <p>Mit <kbd>STRG+C</kbd> kann das WLAN-Netzwerk deaktiviert werden.</p>

        <hr />

        <h3>Abhängigkeiten / benötigte Pakete:</h3>

        <ul>
          <li><code>dnsmasq</code> DHCP-Server</li>
          <li><code>hostapd</code> WiFi-Access-Point-Dienst</li>
          <li><code>bridge-utils</code> Werkzeuge für den Umgang mit Bridge-Interfaces</li>
          <li><code>iptables</code> Werkzeug für die Errichtung von Netzwerkregeln</li>
        </ul>

        <hr />

        <button class="btn btn-primary" type="button" data-bs-toggle="collapse" aria-expanded="false" data-bs-target="#wifisetupExplaination" aria-controls="wifisetupExplaination">
          Beschreibung der Funktionsweise (Klick zum Ausklappen)
        </button>

        <div class="collapse" id="wifisetupExplaination">
          <div class="card card-body">
            <img src="@/assets/articles/wifisetup.png" alt="Schematischer Aufbau der Testumgebung" />

            <p>
              Eine Bridge-Interface wird errichtet. Das Programm „hostapd“ dient dem Aufbau eines WLAN-Netzwerks. In einer Konfigurationsdatei werden Parameter wie z.B. Netzwerkname, WLAN- und
              Bridge-Interface oder Verschlüsselungsmodus definiert. Das Programm „dnsmasq“ dient als DHCP-Server und arbeitet auf dem errichteten Bridge-Interface. Auch hier werden die Parameter in
              einer Konfigurationsdatei definiert. Der DHCP-Server vergibt IP-Adressen an verbundene Netzwerkgeräte. Mithilfe von „iptables“ werden Netzwerkregeln errichtet, welche unter Anderem den
              Internetzugriff ermöglichen, sowie die IP-Adressen der verbundenen Geräte von dem übergeordneten Netzwerk isolieren. Im „mitm“-Modus werden TCP-Pakete an den vorkonfigurierten Port
              „MITM_LISTEN_PORT“ umgeleitet. Anschließend werden dnsmasq und hostapd ausgeführt.
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- wifirecord.sh -->

    <div class="card shadow-sm mt-3" id="wifirecord">
      <div class="card-body">
        <h2>
          Aufzeichnung des Netzwerkverkehrs:
          <b>wifirecord.sh</b>
        </h2>

        <p>
          Das Skript speichert Netzwerkverkehr des errichteten WLAN-Netzwerks in einer PCAP-Datei ab. Die somit erzeugte Datei kann auf der Plattform hochgeladen werden. Anschließend wird die erzeugte
          PCAP-Datei ausgewertet, und eine Liste an möglichen MAC-Adressen wird ausgegeben. Anhand des Herstellers muss die korrekte MAC-Adresse gewählt werden.
        </p>

        <p>Die Ausgabe dieses Skripts sowie die ermittelte MAC-Adresse sollen im 6. Schritt, beim Anlegen eines neuen IoT-Geräts, hochgeladen und angegeben werden.</p>

        <p>Voraussetzung: Laufendes <a href="#wifisetup">wifisetup.sh</a>-Skript, <u>ohne</u> <code>mitm</code>-Option</p>

        <button class="btn btn-primary" type="button" data-bs-toggle="collapse" aria-expanded="false" data-bs-target="#wifirecordConfig" aria-controls="wifirecordConfig">
          Konfigurationsvariablen (Klick zum Ausklappen)
        </button>

        <div class="collapse" id="wifirecordConfig">
          <div class="card card-body">
            <ul>
              <li>
                <code>BR_IFACE="br0"</code>
                <ul>
                  <li>Sollte mit dem in <a href="#wifisetup">wifisetup.sh</a> definierten Wert übereinstimmen</li>
                </ul>
              </li>
            </ul>
          </div>
        </div>

        <hr />

        <h3>Verwendung:</h3>

        <p>
          <code>./wifirecord.sh</code><br />
          Der Aufruf ohne weitere Parameter genügt. Der Netzwerkverkehr wird in eine Datei mit dem Namensschema packetcapture_[JahrMonatTagStundeMinute].pcap geschrieben. Beispiel:
          packetcapture_202511091208.pcap
        </p>

        <p>Mit <kbd>STRG+C</kbd> kann die Aufzeichnung beendet werden. Anschließend wird automatisch eine Liste an möglichen MAC-Adressen erstellt und ausgegeben.</p>

        Beispielhafte Ausgabe:

        <div class="card shadow-sm mt-3 mb-3">
          <div class="card-body">
            <samp>
              <pre class="mb-0">
root@~$ ./wifirecord.sh
Recording packet capture to packetcapture_202602231531.pcap
tcpdump: listening on br0, link-type EN10MB (Ethernet), snapshot length 262144 bytes
^C547 packets captured
597 packets received by filter
0 packets dropped by kernel
Possible MAC Addresses:
00:C0:CA:<span class="blur user-select-none" title="Zensiert">01:23:45</span>    Alfa, Inc.
C4:38:75:<span class="blur user-select-none" title="Zensiert">56:67:78</span>    Sonos, Inc.
FA:<span class="blur user-select-none" title="Zensiert">DU:LÜ:MM:EL:00</span>    Unknown
root@~$
</pre>
            </samp>
          </div>
        </div>

        Da in diesem Beispiel ein Lautsprecher des Herstellers "Sonos" untersucht wurde, muss die entsprechende MAC-Adresse, welche mit "Sonos, Inc" gekennzeichnet ist (hier: C4:38:75:...), gewählt
        und auf dieser Plattform in dem entsprechenden Formular angegeben werden.

        <hr />

        <h3>Abhängigkeiten / benötigte Pakete:</h3>

        <ul>
          <li><code>tcpdump</code> Paket-Sniffer</li>
          <li><code>wireshark</code> <sub>debian / apt</sub> bzw. <code>wireshark-cli</code> <sub>arch / pacman</sub> Netzwerkverkehrinspektionswerkzeug</li>
        </ul>

        <hr />

        <button class="btn btn-primary" type="button" data-bs-toggle="collapse" aria-expanded="false" data-bs-target="#wifirecordExplaination" aria-controls="wifirecordExplaination">
          Beschreibung der Funktionsweise (Klick zum Ausklappen)
        </button>

        <div class="collapse" id="wifirecordExplaination">
          <div class="card card-body">
            <img src="@/assets/articles/wifirecord.png" alt="Schematischer Aufbau der Testumgebung" />

            <p>Das Programm „tcpdump“ wird verwendet, um auf dem in wifisetup.sh errichteten Bridge-Interface den durchfließenden Netzwerkverkehr in einer Datei abzuspeichern.</p>

            <p>
              Eine Datenbank mit MAC-Adressen und zugehörigen Herstellernamen wird von Wireshark heruntergeladen (<a href="https://www.wireshark.org/download/automated/data/manuf"
                >https://www.wireshark.org/download/automated/data/manuf</a
              >) und als "wireshark_manufacturer_database.txt" abgespeichert. Die Datenbankdatei kann nach der Verwendung wieder gelöscht werden. Sie wird jedoch bei zukünftiger Ausführung des Skripts
              erneut heruntergeladen.
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- tlstest.sh -->

    <div class="card shadow-sm mt-3" id="tlstest">
      <div class="card-body">
        <h2>
          Test auf TLS-Zertifikatsvalidierungen:
          <b>tlstest.sh</b>
        </h2>

        <p>Das Skript verwendet das Programm "certmitm" um einen automatisierten Penetrationstest durchzuführen, welcher Zertifikatsvalidierungen überprüft.</p>

        <p>Voraussetzung: Laufendes <a href="#wifisetup">wifisetup.sh</a>-Skript, <u>mit</u> <code>mitm</code>-Option</p>

        <button class="btn btn-primary" type="button" data-bs-toggle="collapse" aria-expanded="false" data-bs-target="#tlstestConfig" aria-controls="tlstestConfig">
          Konfigurationsvariablen (Klick zum Ausklappen)
        </button>

        <div class="collapse" id="tlstestConfig">
          <div class="card card-body">
            <ul>
              <li>
                <code>MITM_LISTEN_PORT="9900"</code>
                <ul>
                  <li>Sollte mit dem in <a href="#wifisetup">wifisetup.sh</a> definierten Wert übereinstimmen</li>
                </ul>
              </li>
            </ul>
          </div>
        </div>

        <hr />

        <h3>Verwendung:</h3>

        <p>
          <code>./tlstest.sh</code><br />
          Der Aufruf ohne weitere Parameter genügt. TCP-Netzwerkverkehr, wie z.B. der von HTTP und HTTPS/TLS, wird an das automatisch installierte Programm „certmitm“ weitergeleitet und inspiziert.
          Certmitm liefert Informationen über verwendete oder fehlende Verschlüsselung. Zudem werden von Certmitm übertragene TLS-Zertifikate ausgetauscht, und Reaktionen des IoT-Geräts werden
          ausgegeben. Im Idealfall liefert certmitm die Meldung „[SSL: TLSV1_ALERT_UNKNOWN_CA]“. Das bedeutet, dass das IoT-Gerät das ausgetauschte Zertifikat abgelehnt hat. Wird jedoch eine Meldung
          wie „data intercepted!“ ausgegeben, dann hat das IoT-Gerät das ausgetauschte Zertifikat nicht abgelehnt, die Entschlüsselung von TLS-Netzwerkverkehr gelang, und eine mangelhafte
          TLS-Zertifikatsvalidierung wurde festgestellt. Nachdem alle Tests für einen jeweiligen Hostnamen durchgeführt wurden, wird der Netzwerkverkehr unverändert weitergeleitet, sodass das Gerät
          mit seinem üblichen Ablauf fortfahren kann.
        </p>

        <p>Mit <kbd>STRG+C</kbd> kann certmitm beendet werden.</p>

        <hr />
        <h3>Abhängigkeiten / benötigte Pakete:</h3>

        <ul>
          <li><code>certmitm</code> Zertifikatsvalidierungspentestwerkzeug</li>
          <li><code>git</code> wird für die Installation von <code>certmitm</code> benötigt</li>
          <li><code>python3</code> wird von <code>certmitm</code> benötigt</li>
        </ul>

        <hr />

        <button class="btn btn-primary" type="button" data-bs-toggle="collapse" aria-expanded="false" data-bs-target="#tlstestExplaination" aria-controls="tlstestExplaination">
          Beschreibung der Funktionsweise (Klick zum Ausklappen)
        </button>

        <div class="collapse" id="tlstestExplaination">
          <div class="card card-body">
            <img src="@/assets/articles/tlstest.png" alt="Schematischer Aufbau der Testumgebung" />

            <p>
              Das Programm „certmitm“ wird installiert und ausgeführt. Abhängigkeiten werden dabei in einer virtuellen Python-Umgebung installiert. Certmitm öffnet den in „MITM_LISTEN_PORT“
              definierten Port. TCP-Netzwerkverkehr wird durch die in wifisetup.sh errichteten „iptables“-Regeln auf den geöffneten Port umgeleitet. Cermitm agiert als Man-in-the-Middle und kann
              daraufhin bei TLS-Handshakes das vom Server präsentierte Zertifikat austauschen, und mögliche Fehlerreaktionen beim IoT-Gerät erkennen.
            </p>
          </div>
        </div>
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
</style>
