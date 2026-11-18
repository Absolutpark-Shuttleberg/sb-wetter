#!/bin/bash
# Nach jeder Änderung an der Wetterwarte-HTML (Dropbox): Engine für die Light-Version und Einbau-Skript für die
# interne Seite neu erzeugen. Danach die beiden Dateien committen und pushen, der Push startet den Upload.
# Aufruf: scripts/sync.sh [Pfad zur Wetterwarte-HTML]   (Standard: sourceHtml aus config.json)
set -euo pipefail
cd "$(dirname "$0")/.."
node scripts/extract-engine.mjs "$@"
node scripts/build-wetterwarte.mjs "$@"
git status --short lib/engine.mjs web/light/wetterwarte.js
