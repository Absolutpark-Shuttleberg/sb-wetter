# Shuttleberg Wetterwarte · Homepage-Integration

Öffentliche „Wetterwarte Light“ für shuttleberg.com: Jetzt am Berg, Schneebericht, Vorhersage 3/5/7 Tage und Lawinenlage, stündlich aktualisiert. Daten: GeoSphere Austria, Open-Meteo (CC BY 4.0), Lawinenwarndienst Salzburg.

## Aufbau

| Datei | Zweck |
|---|---|
| Wetterwarte-HTML (außerhalb des Repos, Pfad in `config.json`) | die interne Vollversion und Quelle der Rechenlogik |
| `scripts/extract-engine.mjs` → `lib/engine.mjs` | zieht Abruf, Modellkonsens, Powder-Modell, Tageswerte und Lawinentexte 1:1 aus der Wetterwarte. Nach jeder Änderung an der Wetterwarte neu ausführen, dann rechnen intern und öffentlich identisch |
| `scripts/om_s3.py` → `cache/om/*.json` | **Gratis-Weg statt Open-Meteo-API:** liest Berg- und Tal-Punkt direkt aus „Open-Meteo on AWS Open Data“ (s3://openmeteo, CC BY 4.0) und liefert JSON im API-Format. Baut Zellwahl, Höhenkorrektur, abgeleitete Größen und Zeitinterpolation der API nach |
| `scripts/build-public.mjs` → `web/light/public.json` | rechnet einmal durch und schreibt nur, was Gäste brauchen (ca. 4 KB, keine Modellnamen). Liest standardmäßig `cache/om`, mit `--source=api` die API |
| `scripts/build.sh` | beides hintereinander (ca. 15 s Datenabruf + wenige Sekunden Rechnen) |
| `web/light/wetter-light.js` | Einbau-Skript: Shadow DOM (Homepage-CSS stört nicht), Container Queries (passt in jede Spalte), Design Shuttleberg oder AbsolutPark (`data-theme`), Deutsch/Englisch (Sprache der Seite), nutzt die Schriften der jeweiligen Homepage |
| `web/light/index.html` | Vorschau Shuttleberg mit angedeutetem Seitenkopf. `?demo=1` zeigt einen archivierten Lawinenbericht (5.3.2026) |
| `web/light/ap.html` | Vorschau AbsolutPark, `?lang=en` englisch. AP21 gibt es online nicht (Hausschrift), die Vorschau zeigt dann PT Sans |
| `config.json` | Quelle der Wetterwarte, Adresse des offiziellen Schneeberichts, Links |

## Lokal testen

```bash
python3 -m venv ~/.venvs/sb-wetter && ~/.venvs/sb-wetter/bin/pip install -r requirements.txt   # einmalig, außerhalb der Dropbox
node --no-experimental-webstorage scripts/extract-engine.mjs                                     # nach Änderungen an der Wetterwarte
PYTHON=~/.venvs/sb-wetter/bin/python scripts/build.sh --demo
python3 -m http.server 8787 --bind 127.0.0.1 --directory web
```
Dann http://127.0.0.1:8787/light/ öffnen.

## Inhalt Light-Version

- Jetzt am Berg: Temperatur Berg/Tal (GeoSphere-Analyse), Wind, Schneefallgrenze, Wetter heute
- Schneebericht: Schneehöhe Berg/Tal, Schneezustand und letzter Schneefall aus dem offiziellen Schneebericht des Skigebiets (`scripts/bergfex.mjs`, stündlich; ohne Meldung steht „–“), Neuschnee laut Bericht oder sonst 24 h aus der Analyse, Links zu Pisten & Liften und Webcams
- Schneeausblick: nächster Tag mit mind. 5 cm, Summe 7 Tage (gleiche Zahlen wie die Tageskarten)
- Vorhersage 3/5/7 Tage: Symbol, Text, Berg/Tal max/min, Neuschnee, „Schnee ab … m“
- Lawinenlage Niedere Tauern Nord (AT-05-08): Stufe in EAWS-Farbe, Höhenlagen, Probleme, Schlagzeile, Kurztext, Link zu lawine.salzburg.at


## Datenweg ohne Open-Meteo-Abo (Prototyp 12.11.2026)

Open-Meteo stellt seine komplette Datenbank als AWS Open Data bereit (CC BY 4.0, kommerziell erlaubt, Pflicht: Link „Weather data by Open-Meteo.com“ neben den Daten, ist im Widget-Fuß). Bezahlt wird nur die gehostete API. `om_s3.py` liest pro Variable nur die Datenblöcke für unseren Punkt (ca. 100 KB statt 40 MB je Datei).

Nachgebaut und gegen die API geprüft (Prognosestunden ab jetzt, mittlere Abweichung):
- Zellwahl: aus den 3×3 Nachbarn die Zelle mit kleinstem „Höhenunterschied + 50 m je km Entfernung“; bei `*_seamless` (GFS, GEM) immer die nächste Zelle. Trifft 40 von 40 Testfällen.
- Höhenkorrektur 0,65 °C/100 m; AIFS nutzt dafür wie die API das Höhenmodell von IFS 0,25°.
- Abgeleitet: Wind aus u/v, Feuchte aus Taupunkt, m/s → km/h, Pa → hPa; 3-/6-stündliche Modelle kubisch auf Stunden, Niederschlag gleichmäßig verteilt.
- Ergebnis: ICON-EU, ICON-2I, AROME-HD, ARPEGE, ECMWF HRES, AIFS, UKMO, GEM und GFS (Bodenwerte) stimmen auf Rundung (0,00–0,03).

Bekannte Abweichungen und Lücken:
- ICON-D2 im Schnitt ca. 0,2 °C anders (API mischt vermutlich die stündlichen RUC-Läufe dazu).
- GFS-Höhenwerte (Nullgradgrenze, 850 hPa, 700-hPa-Wind, Böen, Luftdruck) kommen aus GFS 0,25°, die API nutzt dort eine andere Quelle.
- ECMWF ENS: 51 Member aus dem Europa-Ausschnitt auf dem 9-km-Gitter (API: 0,25°). Dadurch in diesem Fall ca. 1,5 °C wärmer als die API-Ensembles, dafür stimmig mit ECMWF HRES (Kontrollmitglied 0,25 °C daneben).
- Fehlt noch: ICON-CH1/CH2 (gedrehtes Gitter), HARMONIE (Lambert), ICON-D2-EPS/ICON-EU-EPS (nur natives Dreiecksgitter), AIFS-ENS (N320-Gitter), GEFS (Member nicht im Bucket). AROME Austria ist im Bucket seit 6.11. nicht aktuell, AROME 1 km kommt ohnehin direkt von GeoSphere. Die Engine verteilt die Gewichte automatisch auf die vorhandenen Systeme.
- Vergleich der Light-Version S3 gegen API (12.11., 14 Uhr): Temperaturen gleich oder ±1 °C, Schneeausblick gleich (Fr 11 zu 12 cm), 7-Tage-Summe 31 zu 34 cm, einzelne Tage beim Neuschnee bis 4 cm auseinander.
- Risiko: Open-Meteo kündigt die Anleitung zum Direktzugriff erst an, der Dateiaufbau kann sich ändern. Dann `om_s3.py` anpassen oder auf das API-Abo (Professional, 99 €/Monat) wechseln: `build-public.mjs --source=api` mit `OM_KEY`.

## Betrieb

- **GitHub Actions** (`.github/workflows/wetter.yml`, Repo `Absolutpark-Shuttleberg/sb-wetter`, öffentlich): stündlich um xx:07 UTC, zusätzlich bei jedem Push auf `main` und per Hand („Run workflow“). Ein Lauf: Pakete installieren, `scripts/build.sh` (ca. 16 s), Upload. Schlägt ein Schritt fehl oder liefern zu wenige Modelle, wird nichts hochgeladen und online bleibt der letzte gute Stand. Das Widget zeigt dann „Daten von …“, sobald die Daten älter als 3 Stunden sind.
- **Kosten:** keine. GitHub Actions ist für öffentliche Repos gratis, Cloudflare liefert statische Dateien im Gratis-Plan kostenlos und unbegrenzt aus.
- **Wachhalter:** GitHub pausiert geplante Läufe in öffentlichen Repos nach 60 Tagen ohne Aktivität. `.github/workflows/wachhalter.yml` macht deshalb einmal im Monat einen leeren Commit, wenn der letzte älter als 30 Tage ist.
- **Cloudflare** (`wrangler.jsonc`): Worker `sb-wetter`, nur statische Dateien aus `web/light`. Adresse: https://sb-wetter.max-27c.workers.dev (Vorschau), `/public.json` (Daten), `/status.json` (welche Quellen geliefert haben). Header in `web/light/_headers`: CORS für shuttleberg.com, noindex.
- **Secrets im Repo** (Werte nie in den Chat): `CLOUDFLARE_API_TOKEN` (Cloudflare → My Profile → API Tokens → Vorlage „Edit Cloudflare Workers“, nur dieses Konto) und `CLOUDFLARE_ACCOUNT_ID`.
- **Wetterwarte geändert?** Lokal `node scripts/extract-engine.mjs`, committen, pushen. Der Push startet sofort einen Lauf.
- Interne Seite: die volle Wetterwarte, später ebenfalls auf die S3-Daten umstellen (statt Browser-Abrufen bei Open-Meteo).

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
Ausgewogene spitze Klammern und keine Kommentare mit eigenen Tags, das lehnt der XMS-HTML-Block ab.
