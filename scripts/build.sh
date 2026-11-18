#!/bin/bash
# Kompletter Lauf ohne Open-Meteo-API: Daten aus AWS Open Data holen, Engine rechnen, public.json schreiben.
# PYTHON zeigt auf ein Python mit den Paketen aus requirements.txt (Standard: python3).
# Aufruf: scripts/build.sh            (schreibt web/light/public.json, status.json und web/light/data/*.json)
#         scripts/build.sh --demo     (zusätzlich public-demo.json mit Lawinenbericht 5.3.2026)
set -euo pipefail
cd "$(dirname "$0")/.."
PY="${PYTHON:-python3}"
NODE_FLAGS=""
if node --no-experimental-webstorage -e 0 >/dev/null 2>&1; then NODE_FLAGS="--no-experimental-webstorage"; fi
"$PY" -I scripts/om_s3.py --out cache/om
node $NODE_FLAGS scripts/build-public.mjs --om=cache/om
# Interne Wetterwarte (wetterwarte.js) lädt die Modelldaten direkt: erst nach erfolgreichem Build kopieren
mkdir -p web/light/data
cp cache/om/det.json cache/om/tal.json cache/om/ens_s.json cache/om/ens_l.json cache/om/status.json web/light/data/
if [ -f cache/om/seas.json ]; then cp cache/om/seas.json web/light/data/; else rm -f web/light/data/seas.json; fi
if [ "${1:-}" = "--demo" ]; then
  node $NODE_FLAGS scripts/build-public.mjs --om=cache/om --aval-date=2026-03-05 --out=web/light/public-demo.json
fi
