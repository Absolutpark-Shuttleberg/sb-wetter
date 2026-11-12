// Zieht die Rechenlogik (Abruf, Modellkonsens, Powder-Modell, Tageswerte, Lawinen-Texte)
// aus der Wetterwarte-HTML und schreibt sie als ES-Modul nach lib/engine.mjs.
// So rechnen interne Wetterwarte und Light-Version mit identischem Code.
// Aufruf: node scripts/extract-engine.mjs [Pfad zur Wetterwarte-HTML]
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const cfg = JSON.parse(readFileSync(join(root, 'config.json'), 'utf8'));
const src = resolve(root, process.argv[2] || cfg.sourceHtml);   // Wetterwarte-HTML liegt außerhalb des Repos (Dropbox)
const html = readFileSync(src, 'utf8');

function between(startMarker, endMarker) {
  const a = html.indexOf(startMarker);
  if (a < 0) throw new Error('Marker nicht gefunden: ' + startMarker);
  const b = html.indexOf(endMarker, a);
  if (b < 0) throw new Error('Marker nicht gefunden: ' + endMarker);
  return html.slice(a, b);
}
function line(startsWith) {
  const i = html.indexOf(startsWith);
  if (i < 0) throw new Error('Zeile nicht gefunden: ' + startsWith);
  return html.slice(i, html.indexOf('\n', i));
}

let core = between('/* ======================= Konfiguration', '/* ======================= Diagramm-Helfer');
// Serverseitig gibt es keinen HTTP-Cache; Cloudflare Workers lehnt cache:'no-store' je nach Version ab.
core = core.replace("{signal:ctl.signal,cache:'no-store'}", '{signal:ctl.signal}');

const aval = [line('const PROB='), line('const LVL='), line('const elevTxt='), line('const strip=')].join('\n');
const fc = between('function fcStats(', 'function renderFc(');
const rule = line('function ruleOk(');

const out = `// AUTOMATISCH ERZEUGT von scripts/extract-engine.mjs – nicht von Hand ändern.
// Quelle: ${src.split('/').slice(-2).join('/')} · erzeugt ${new Date().toISOString()}
/* eslint-disable */
const document = globalThis.document || { getElementById: () => null };

${core}
${aval}
${fc}
${rule}

/* ======================= Export ======================= */
export async function run(opts = {}) {
  if (opts.omKey) S.omKey = opts.omKey;
  if (opts.settings) Object.assign(S, opts.settings);
  FORCE = true;
  // opts.om = { det, tal, es, el }: Open-Meteo-Daten aus scripts/om_s3.py (AWS Open Data) statt aus der API
  const O = opts.om;
  const fromOm = (j, id, label) => { setStatus(id, label, j && j.hourly ? 'ok' : 'err', 'AWS Open Data'); return j; };
  const [det, tal, es, el, ar, cl, inc, law] = await Promise.all(O ? [
    fromOm(O.det, 'om-det', 'Open-Meteo-Daten · Einzelmodelle (Berg)'), fromOm(O.tal, 'om-tal', 'Open-Meteo-Daten · Modelle Tal'),
    fromOm(O.es, 'om-ens-s', 'Open-Meteo-Daten · ICON-EPS'), fromOm(O.el, 'om-ens-l', 'Open-Meteo-Daten · ECMWF ENS'),
    loadArome(), loadClaef(), loadInca(), loadLawine()
  ] : [
    loadDet(), loadTal(), loadEnsS(), loadEnsL(), loadArome(), loadClaef(), loadInca(), loadLawine()
  ]);
  if (!det || !det.hourly) {
    const s = STATUS.get('om-det');
    throw new Error('Open-Meteo nicht erreichbar' + (s && s.info ? ': ' + s.info : ''));
  }
  buildAll({ det, tal, es, el, ar, cl, inc });
  LAW = law;
  return {
    NOW, AX, iNow, K, KT, INCA, CL, DAYS, DAYRES, EVENTS, LAW, PLUME, S,
    status: [...STATUS.entries()].map(([id, v]) => ({ id, ...v })),
    fcDay, lp, snowWord, LVL, PROB, elevTxt, strip, toSec, getJSON
  };
}
`;
writeFileSync(join(root, 'lib/engine.mjs'), out);
console.log('lib/engine.mjs geschrieben (' + out.length + ' Zeichen) aus', src);
