# Shuttleberg Wetterwarte · Homepage-Integration

Zwei Einbauten für shuttleberg.com, beide stündlich aktualisiert, ohne Open-Meteo-Abo:
- **Wetterwarte Light** (öffentlich): Jetzt am Berg, Schneebericht, Vorhersage 3/5/7 Tage und Lawinenlage für Gäste.
- **Wetterwarte intern** (versteckte Seite): die volle Wetterwarte mit Powder-Meter, Beschneiung, Modellvergleich, Ensembles, Saison, Karten.

Daten: GeoSphere Austria, Open-Meteo über AWS Open Data (CC BY 4.0), Lawinenwarndienst Salzburg.

## Aufbau

| Datei | Zweck |
|---|---|
| Wetterwarte-HTML (außerhalb des Repos, Pfad in `config.json`) | einzige Quelle: interne Vollversion und Rechenlogik. Läuft auch allein im Browser und holt die Modelldaten dann ebenfalls vom Worker |
| `scripts/sync.sh` | **nach jeder Änderung an der Wetterwarte:** erzeugt `lib/engine.mjs` und `web/light/wetterwarte.js` neu. Danach beide committen und pushen |
| `scripts/extract-engine.mjs` → `lib/engine.mjs` | zieht Abruf, Modellkonsens, Powder-Modell, Tageswerte und Lawinentexte 1:1 aus der Wetterwarte. Nach jeder Änderung an der Wetterwarte neu ausführen, dann rechnen intern und öffentlich identisch |
| `scripts/om_s3.py` → `cache/om/*.json` | **Gratis-Weg statt Open-Meteo-API:** liest Berg- und Tal-Punkt direkt aus „Open-Meteo on AWS Open Data“ (s3://openmeteo, CC BY 4.0) und liefert JSON im API-Format: Einzelmodelle Berg/Tal, Ensembles, Saisonprognose SEAS5, Status mit Modellläufen. Baut Zellwahl, Höhenkorrektur, abgeleitete Größen und Zeitinterpolation der API nach |
| `scripts/build-public.mjs` → `web/light/public.json` | rechnet einmal durch und schreibt nur, was Gäste brauchen (ca. 4 KB, keine Modellnamen). Liest standardmäßig `cache/om`, mit `--source=api` die API |
| `scripts/build.sh` | beides hintereinander (ca. 17 s Datenabruf + wenige Sekunden Rechnen), danach Kopie der Modelldaten nach `web/light/data/` für die interne Version (nicht im Repo, entsteht im Actions-Lauf) |
| `scripts/build-wetterwarte.mjs` → `web/light/wetterwarte.js` | baut aus der Wetterwarte-HTML das Einbau-Skript für die interne Seite: Shadow DOM, Container Queries, Daten vom Worker, Schriften und Leaflet vom Worker. Bricht ab, wenn sich die HTML an einer umgebauten Stelle geändert hat. Die erzeugte Datei wird committet, weil die Actions die Dropbox nicht sehen |
| `web/light/intern.html` | Vorschau der internen Version mit nachgebautem Seitenkopf von shuttleberg.com (fixer Kopf + klebende Brotkrumen) |
| `web/light/vendor/` | Leaflet 1.9.4 (BSD-2) und die Schriften Barlow, Barlow Condensed, IBM Plex Mono (OFL, Lizenzen liegen dabei). Selbst gehostet statt cdnjs und Google Fonts |
| `web/light/wetter-light.js` | Einbau-Skript: Shadow DOM (Homepage-CSS stört nicht), Container Queries (passt in jede Spalte), Design Shuttleberg oder AbsolutPark (`data-theme`), Deutsch/Englisch (Sprache der Seite), nutzt die Schriften der jeweiligen Homepage |
| `web/light/index.html` | Vorschau Shuttleberg mit angedeutetem Seitenkopf. `?demo=1` zeigt einen archivierten Lawinenbericht (5.3.2026) |
| `web/light/ap.html` | Vorschau AbsolutPark, `?lang=en` englisch. AP21 gibt es online nicht (Hausschrift), die Vorschau zeigt dann PT Sans |
| `config.json` | Quelle der Wetterwarte, Adresse des offiziellen Schneeberichts, Links |

## Lokal testen

```bash
python3 -m venv ~/.venvs/sb-wetter && ~/.venvs/sb-wetter/bin/pip install -r requirements.txt   # einmalig, außerhalb der Dropbox
scripts/sync.sh                                                                                  # nach Änderungen an der Wetterwarte
PYTHON=~/.venvs/sb-wetter/bin/python scripts/build.sh --demo
python3 -m http.server 8787 --bind 127.0.0.1 --directory web
```
Dann http://127.0.0.1:8787/light/ (Light) bzw. http://127.0.0.1:8787/light/intern.html (intern) öffnen. Lokal holt die interne Version die Daten aus `web/light/data/`.

## Inhalt Light-Version

- Jetzt am Berg: Temperatur Berg/Tal (GeoSphere-Analyse), Wind, Schneefallgrenze, Wetter heute
- Schneebericht: Schneehöhe Berg/Tal, Schneezustand und letzter Schneefall aus dem offiziellen Schneebericht des Skigebiets (`scripts/bergfex.mjs`, stündlich; ohne Meldung steht „–“), Neuschnee laut Bericht oder sonst 24 h aus der Analyse, Links zu Pisten & Liften und Webcams
- Schneeausblick: nächster Tag mit mind. 5 cm, Summe 7 Tage (gleiche Zahlen wie die Tageskarten)
- Vorhersage 3/5/7 Tage: Symbol und Text, Symbole für vormittags/nachmittags/nachts, Neuschnee, Schneefallgrenze als Berg-Symbol, Wind am Berg (Richtung als Pfeil, Mittel 8–17 Uhr, Böen ab 40 km/h), Powder-Chance der Wetterwarte (mind. 15 cm guter Neuschnee bis Liftstart), Berg/Tal max/min
- Lawinenlage Niedere Tauern Nord (AT-05-08): Stufe in EAWS-Farbe, Höhenlagen, Probleme, Schlagzeile, Kurztext, Link zu lawine.salzburg.at


## Inhalt interne Version

Die komplette Wetterwarte (Powder-Meter, Wetterumschwünge, Vorhersage, Powder-Kalender, Lawine, Beschneiung, Modellvergleich, Meteogramm, Ensemble, Messwerte, Saison, Karten & Radar, Links, Methodik), im Wetterwarte-Design. Unterschiede zur Einzeldatei von früher:
- Open-Meteo kommt nicht mehr live aus der API, sondern stündlich vorab vom Worker (`/data/*.json`). Im Browser laufen nur noch GeoSphere, LAWIS, RainViewer, OpenTopoMap und Windy (alle mit CORS `*`).
- Standorte Berg/Tal sind fest (`config.json` = `DEFAULTS` in der HTML), das API-Key-Feld ist weg. Einstellbar bleibt die Powder-Schwelle, die Grenzwerte der Beschneiung und Hell/Dunkel (auf der Homepage startet sie hell).
- Der Stand der Modelldaten steht oben neben „Stand“; ab 3 Stunden Alter rot. Der Datenstatus in der Methodik listet, was auf dem Gratis-Weg fehlt.
- Ohne 850-hPa-Werte in den Ensembles zeigt die Karte „Temperatur 850 hPa“ die Einzelmodelle als Linien.

## Datenweg ohne Open-Meteo-Abo (seit 18.11.2026 entschieden)

Open-Meteo stellt seine komplette Datenbank als AWS Open Data bereit (CC BY 4.0, kommerziell erlaubt, Pflicht: Link „Weather data by Open-Meteo.com“ neben den Daten, ist im Widget-Fuß). Bezahlt wird nur die gehostete API. `om_s3.py` liest pro Variable nur die Datenblöcke für unseren Punkt (ca. 100 KB statt 40 MB je Datei).

Nachgebaut und gegen die API geprüft (Prognosestunden ab jetzt, mittlere Abweichung):
- Zellwahl: aus den 3×3 Nachbarn die Zelle mit kleinstem „Höhenunterschied + 50 m je km Entfernung“; bei `*_seamless` (GFS, GEM) immer die nächste Zelle. Trifft 40 von 40 Testfällen.
- Höhenkorrektur 0,65 °C/100 m; AIFS nutzt dafür wie die API das Höhenmodell von IFS 0,25°.
- Abgeleitet: Wind aus u/v, Feuchte aus Taupunkt, m/s → km/h, Pa → hPa; 3-/6-stündliche Modelle kubisch auf Stunden, Niederschlag gleichmäßig verteilt.
- Gitter: regulär, ECMWF-O-Gitter, gedrehtes Gitter (ICON-CH1/CH2) und Lambert (HARMONIE) wie in Open-Meteo (`Domains/RotatedLatLon.swift`, `LambertConformalConic.swift`); die Eckpunkte werden beim Laden gegen die BBOX aus `meta.json` geprüft. N320/O320 (AIFS-ENS, SEAS5) wie `GaussianGrid.swift`.
- Ergebnis: ICON-EU, ICON-2I, AROME-HD, ARPEGE, ECMWF HRES, AIFS, UKMO, GEM, GFS (Bodenwerte), ICON-CH1, ICON-CH2 und HARMONIE stimmen auf Rundung (0,00–0,03 °C, Feuchte bis 0,5 %). Windrichtung 10 m auf 0–0,5° gleich (ICON-D2 und AIFS etwas mehr, siehe unten).
- Saisonprognose: ECMWF SEAS5-Monatsanomalien (Ensemblemittel) aus `data_run/ecmwf_seas5_monthly`, Schneefall wie in der API = Wasseräquivalent × 0,7 cm.

Bekannte Abweichungen und Lücken:
- ICON-D2 im Schnitt ca. 0,2 °C anders (API mischt vermutlich die stündlichen RUC-Läufe dazu).
- GFS-Höhenwerte (Nullgradgrenze, 850 hPa, 700-hPa-Wind, Böen, Luftdruck) kommen aus GFS 0,25°, die API nutzt dort eine andere Quelle.
- ECMWF ENS: 51 Member aus dem Europa-Ausschnitt auf dem 9-km-Gitter (API: 0,25°). Dadurch meist 1,5–2 °C wärmer als die API-Ensembles, dafür stimmig mit ECMWF HRES (Kontrollmitglied 0,25 °C daneben). Der Bucket hat die Läufe teils mit Verzögerung (18.11. früh: neuester vollständiger Lauf 17.11. 00 UTC).
- AIFS-ENS: 51 Member aus dem Europa-Ausschnitt auf dem N320-Gitter (ca. 31 km), 6-stündlich. Für N320 gibt es im Bucket kein Höhenmodell, die Modellhöhe wird bilinear aus dem 0,25°-Höhenmodell von AIFS-ENS geschätzt. Abgleich 18.11.: Tagesmediane Temperatur 0,1–0,7 °C von der API, Niederschlag je Tag bis ca. 2 mm auseinander (anderer Gitterpunkt).
- Ensembles ohne 850 hPa (nicht im Bucket).
- Fehlt: ICON-D2-EPS/ICON-EU-EPS und GEFS (Member nicht im Bucket), AROME Austria (im Bucket seit 6.11. nicht aktuell, AROME 1 km kommt ohnehin direkt von GeoSphere). Die Engine verteilt die Gewichte automatisch auf die vorhandenen Systeme; `status.json` → `fehlend` listet das, die interne Seite zeigt es im Datenstatus.
- Vergleich der Light-Version S3 gegen API (12.11., 14 Uhr): Temperaturen gleich oder ±1 °C, Schneeausblick gleich (Fr 11 zu 12 cm), 7-Tage-Summe 31 zu 34 cm, einzelne Tage beim Neuschnee bis 4 cm auseinander.
- Risiko: Open-Meteo kündigt die Anleitung zum Direktzugriff erst an, der Dateiaufbau kann sich ändern. Dann `om_s3.py` anpassen oder auf das API-Abo (Professional, 99 €/Monat) wechseln: `build-public.mjs --source=api` mit `OM_KEY`.

## Betrieb

- **GitHub Actions** (`.github/workflows/wetter.yml`, Repo `Absolutpark-Shuttleberg/sb-wetter`, öffentlich): stündlich um xx:07 UTC, zusätzlich bei jedem Push auf `main` und per Hand („Run workflow“). Ein Lauf: Pakete installieren, `scripts/build.sh` (ca. 16 s), Upload. Schlägt ein Schritt fehl oder liefern zu wenige Modelle, wird nichts hochgeladen und online bleibt der letzte gute Stand. Das Widget zeigt dann „Daten von …“, sobald die Daten älter als 3 Stunden sind.
- **Kosten:** keine. GitHub Actions ist für öffentliche Repos gratis, Cloudflare liefert statische Dateien im Gratis-Plan kostenlos und unbegrenzt aus.
- **Wachhalter:** GitHub pausiert geplante Läufe in öffentlichen Repos nach 60 Tagen ohne Aktivität. `.github/workflows/wachhalter.yml` macht deshalb einmal im Monat einen leeren Commit, wenn der letzte älter als 30 Tage ist.
- **Cloudflare** (`wrangler.jsonc`): Worker `sb-wetter`, nur statische Dateien aus `web/light`. Adresse: https://sb-wetter.max-27c.workers.dev (Vorschau Light), `/intern` (Vorschau intern), `/public.json` (Daten Light), `/status.json` (welche Quellen geliefert haben), `/data/*.json` (Modelldaten intern, ca. 1,3 MB, komprimiert ca. 0,3 MB), `/wetterwarte.js`, `/vendor/…`. Header in `web/light/_headers`: CORS `*` für Daten, Skripte und Schriften, noindex für alles.
- **Secrets im Repo** (Werte nie in den Chat): `CLOUDFLARE_API_TOKEN` (Cloudflare → My Profile → API Tokens → Vorlage „Edit Cloudflare Workers“, nur dieses Konto) und `CLOUDFLARE_ACCOUNT_ID`.
- **Wetterwarte geändert?** Lokal `scripts/sync.sh`, dann `lib/engine.mjs` und `web/light/wetterwarte.js` committen und pushen. Der Push startet sofort einen Lauf. Bricht `sync.sh` mit „… gefunden, erwartet …“ ab, wurde in der HTML eine Stelle geändert, die der Einbau umschreibt (z. B. die Haken-Zeile `const ROOT=document,…`): dann `scripts/build-wetterwarte.mjs` nachziehen.

## Einbau (XMS-HTML-Block)

shuttleberg.com:
```html
<div id="sb-wetter"></div>
<script src="https://sb-wetter.max-27c.workers.dev/wetter-light.js" defer></script>
```

absolutpark.com:
```html
<div id="sb-wetter" data-theme="ap"></div>
<script src="https://sb-wetter.max-27c.workers.dev/wetter-light.js" defer></script>
```
Die Sprache kommt automatisch aus der Seite (`/de/` oder `/en/`), erzwingen geht mit `data-lang="en"`. Englische Lawinentexte stammen aus dem englischen Bericht des LWD; fehlt er, zeigt das Widget Stufe, Probleme und den Link.

Interne Wetterwarte (eigene, nicht verlinkte Seite auf shuttleberg.com, noindex):
```html
<div id="sb-wetterwarte"></div>
<script src="https://sb-wetter.max-27c.workers.dev/wetterwarte.js" defer></script>
```
Als normalen HTML-Absatz über die volle Breite einsetzen, nicht in einen Spalten-Block (der hat `overflow:hidden`, dann klebt die Unternavigation nicht). Die Unternavigation klebt unter `#outerHeader` und `#outerBreadcrumbs` der Seite; andere Kopfzeilen über `data-offset="CSS-Selektor"` am div.

Ausgewogene spitze Klammern und keine Kommentare mit eigenen Tags, das lehnt der XMS-HTML-Block ab.
