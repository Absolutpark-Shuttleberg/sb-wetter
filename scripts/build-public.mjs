// Rechnet die Wetterwarte durch und schreibt die schlanke public.json für die Light-Version.
// Enthält nur, was Gäste brauchen: Jetzt-Werte, Schneebericht, 7 Tage, Lawinen-Zusammenfassung.
// Aufruf: node scripts/build-public.mjs [--om=cache/om] [--out=web/light/public.json] [--aval-date=2026-03-05]
//   --om         Ordner mit det/tal/ens_s/ens_l.json aus scripts/om_s3.py (Standard: cache/om). Gratis-Weg über AWS Open Data.
//   --source=api stattdessen die Open-Meteo-API nutzen (kommerziell nur mit Abo: OM_KEY=... als Umgebungsvariable)
//   --aval-date  lädt einen archivierten Lawinenbericht (nur für Design-Tests, wird als Beispiel markiert)
//   --bergfex-file  gespeicherte bergfex-Seite statt Abruf (nur zum Testen)
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';
import { run } from '../lib/engine.mjs';
import { loadBergfex, parseBergfex } from './bergfex.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const args = Object.fromEntries(process.argv.slice(2).map(a => a.replace(/^--/, '').split('=')));
const cfg = JSON.parse(readFileSync(join(root, 'config.json'), 'utf8'));
const outFile = resolve(root, args.out || 'web/light/public.json');

const ok = v => v != null && isFinite(v);
const r1 = v => ok(v) ? Math.round(v * 10) / 10 : null;
const r0 = v => ok(v) ? Math.round(v) : null;

const t0 = Date.now();
let om = null;
if (args.source !== 'api') {
  const dir = resolve(root, args.om || 'cache/om');
  const rd = f => JSON.parse(readFileSync(join(dir, f), 'utf8'));
  om = { det: rd('det.json'), tal: rd('tal.json'), es: rd('ens_s.json'), el: rd('ens_l.json') };
  const st = rd('status.json');
  const age = (Date.now() - Date.parse(st.erzeugt)) / 36e5;
  if (age > 3) console.warn(`Achtung: Open-Meteo-Daten sind ${age.toFixed(1)} h alt (${st.erzeugt})`);
  // Sicherung: Fehlt der Großteil der Modelle (z. B. weil Open-Meteo den Bucket umbaut), lieber abbrechen
  // als eine schlechte Prognose zu veröffentlichen. Online bleibt dann der letzte gute Stand.
  const nDet = Object.keys(om.det.hourly || {}).filter(k => k !== 'time' && k.startsWith('temperature_2m_')).length;
  if (nDet < 5) throw new Error(`Nur ${nDet} Modelle mit Temperatur (erwartet ca. 10) – Abbruch, nichts veröffentlicht`);
  om.status = st;
}
const E = await run(om ? { om } : { omKey: process.env.OM_KEY || '' });
const { NOW, AX, iNow, K, KT, INCA, DAYS, DAYRES, PLUME, S, lp, fcDay, LVL, PROB, elevTxt, strip, toSec } = E;

/* Jetzt am Berg: INCA-Analyse (gemessen/analysiert), sonst Modellkonsens */
function nowAt(o, Kx) {
  if (o && o.last >= 0) return { t: AX[o.last], T: r1(o.T[o.last]), W: r0(o.W[o.last]), src: 'analyse' };
  return { t: AX[iNow], T: r1(Kx.T[iNow]), W: r0(Kx.W ? Kx.W[iNow] : null), src: 'prognose' };
}
const berg = nowAt(INCA && INCA.berg, K), tal = nowAt(INCA && INCA.tal, KT);
berg.G = r0(K.G ? K.G[iNow] : null);

/* Neuschnee der letzten 24/48 h aus der Analyse */
function sumBack(o, hours) {
  if (!o || o.last < 0) return null;
  let s = 0, n = 0;
  for (let i = o.last; i > o.last - hours && i >= 0; i--) { if (ok(o.SN[i])) { s += o.SN[i]; n++; } }
  return n >= hours * 0.8 ? s : null;
}
const new24 = sumBack(INCA && INCA.berg, 24), new48 = sumBack(INCA && INCA.berg, 48);

/* 7 Tage */
const keys = [];
for (let i = iNow; i < AX.length && keys.length < 7; i++) { const k = lp(AX[i]).key; if (!keys.includes(k)) keys.push(k); }
const days = keys.map(key => {
  const d = fcDay(key); if (!d) return null;
  const k = DAYS.findIndex(x => x.key === key), res = k >= 0 ? DAYRES[k] : null;
  const p = lp(d.t);
  return {
    key, wd: p.wd, d: p.d, m: p.m,
    icon: d.type, text: d.label,
    parts: d.parts.map(x => x.t ? { icon: x.t[0], text: x.t[1], lab: x.lab } : null),
    berg: { max: r0(d.tmax), min: r0(d.tmin) },
    tal: { max: r0(d.ttmax), min: r0(d.ttmin) },
    snow: r0(d.snow),                       // Neuschnee am Kalendertag (cm), Berg
    snowMorning: res ? r0(res.q50) : null,  // bis Liftstart 9 Uhr
    snowLine: ok(d.sl) ? Math.round(d.sl / 100) * 100 : null,
    snowLineWet: !!d.slWet,
    rain: r0(d.rainB),
    gust: r0(d.G)
  };
}).filter(Boolean);

/* Schneeausblick: gleiche Tageswerte wie die Tageskarten, damit Gäste keine zwei Zahlen sehen */
let next = null;
for (const d of days) {
  if (d.snow >= 5) {
    const k = DAYS.findIndex(x => x.key === d.key), r = k >= 0 ? DAYRES[k] : null;
    next = { key: d.key, wd: d.wd, d: d.d, m: d.m, cm: d.snow, powder: !!(r && r.Pp >= 0.5) };
    break;
  }
}
const sum7 = days.reduce((a, d) => a + (d.snow || 0), 0);

/* Lawine */
async function avalanche() {
  let L = E.LAW, demo = null;
  if (args['aval-date']) {
    const d = args['aval-date'];
    const j = await E.getJSON(`https://static.lawinen-warnung.eu/bulletins/${d}/${d}_AT-05_de_CAAMLv6.json`, null, null);
    const b = j && (j.bulletins || []).find(x => (x.regions || []).some(r => r.regionID === 'AT-05-08'));
    if (b) { L = { b }; demo = d; }
  }
  const base = { url: cfg.links.avalanche, region: 'Niedere Tauern Nord' };
  if (!L || L.error) return { ...base, status: 'error' };
  const b = L.b;
  if (L.none || !b) return { ...base, status: 'none' };
  if (!demo && b.validTime && toSec(b.validTime.endTime) < NOW - 36 * 3600) return { ...base, status: 'none' };
  const ratings = (b.dangerRatings || []).filter(r => r.mainValue).map(r => {
    const [n, word] = LVL[r.mainValue] || [0, r.mainValue];
    return { level: n, word, elev: elevTxt(r.elevation), period: r.validTimePeriod === 'all_day' ? '' : (r.validTimePeriod === 'earlier' ? 'vormittags' : 'nachmittags') };
  });
  const max = Math.max(0, ...ratings.map(r => r.level));
  const problems = (b.avalancheProblems || []).map(p => ({ type: p.problemType, word: PROB[p.problemType] || p.problemType, elev: elevTxt(p.elevation) }));
  const aa = b.avalancheActivity || {};
  // Kurzfassung: Schlagzeile plus die ersten ein bis zwei Sätze
  let short = strip(aa.comment || '').replace(/\s+/g, ' ');
  if (short.length > 260) { const cut = short.slice(0, 260); const dot = cut.lastIndexOf('. '); short = (dot > 120 ? cut.slice(0, dot + 1) : cut.replace(/\s\S*$/, '') + ' …'); }
  const tdc = (b.tendency || [])[0];
  return {
    ...base, status: 'ok', demo,
    max, maxWord: (ratings.find(r => r.level === max) || {}).word || '',
    ratings, problems,
    headline: strip(aa.highlights || ''), text: short,
    tendency: tdc ? tdc.tendencyType : null,
    validFrom: b.validTime ? b.validTime.startTime : null,
    validTo: b.validTime ? b.validTime.endTime : null,
    published: b.publicationTime || null
  };
}

/* Offizieller Schneebericht (Schneehöhen pflegt Shuttleberg bei bergfex).
   Ist bergfex nicht erreichbar oder hat den Seitenaufbau geändert: letzten guten Stand
   von der Live-Seite übernehmen (höchstens 7 Tage alt) und im Actions-Log warnen. */
async function officialSnow() {
  const sr = cfg.snowReport || {};
  const o = args['bergfex-file'] ? parseBergfex(readFileSync(resolve(root, args['bergfex-file']), 'utf8')) : await loadBergfex(sr.bergfex);
  if (o.status !== 'error') return o;
  console.log(`::warning::Schneebericht: ${o.info}`);
  try {
    const prev = await (await fetch(sr.fallback, { signal: AbortSignal.timeout(10000) })).json();
    const p = prev && prev.snow && prev.snow.official;
    if (p && p.status === 'ok' && p.updated && Date.now() - Date.parse(p.updated) < 7 * 864e5) return { ...p, info: 'letzter Stand (' + o.info + ')' };
  } catch (e) { }
  return o;
}
const official = await officialSnow();

const out = {
  generated: new Date().toISOString(),
  elev: { berg: S.bergElev, tal: S.talElev },
  now: { berg, tal, today: days[0] ? { icon: days[0].icon, text: days[0].text } : null, snowLine: days[0] ? days[0].snowLine : null },
  snow: { new24: r0(new24), new48: r0(new48), next, sum7, official },
  days,
  avalanche: await avalanche(),
  links: cfg.links,
  // Quellenangaben (CC BY 4.0). Open-Meteo verlangt einen Link neben den Daten.
  credits: [
    { text: 'GeoSphere Austria', url: 'https://data.hub.geosphere.at/' },
    { text: 'Weather data by Open-Meteo.com', url: 'https://open-meteo.com/' },
    { text: 'Lawinenwarndienst Salzburg', url: 'https://lawine.salzburg.at/' }
  ]
};

if (days.length < 7) throw new Error(`Nur ${days.length} Prognosetage – Abbruch, nichts veröffentlicht`);
mkdirSync(dirname(outFile), { recursive: true });
writeFileSync(outFile, JSON.stringify(out, null, 1));
// Technischer Status zum Nachschauen (keine Geheimnisse): welche Quellen und Modelle diesmal geliefert haben
if (!args['aval-date']) {
  const stat = {
    erzeugt: out.generated,
    quellen: [...E.status.map(s => ({ quelle: s.label, ok: s.state === 'ok', info: s.info || '' })),
      { quelle: 'Schneebericht Skigebiet', ok: official.status !== 'error', info: official.info || '' }],
    openMeteo: om ? { abgerufen: om.status.erzeugt, dauer_s: om.status.dauer_s, modelle: Object.keys(om.status.modelle), fehlend: om.status.fehlend, log: om.status.log } : 'API'
  };
  writeFileSync(join(dirname(outFile), 'status.json'), JSON.stringify(stat, null, 1));
}
const failed = E.status.filter(s => s.state === 'err').map(s => s.label + ': ' + s.info);
console.log(`public.json geschrieben (${JSON.stringify(out).length} Zeichen, ${((Date.now() - t0) / 1000).toFixed(1)} s) → ${outFile}`);
if (failed.length) console.log('Fehlgeschlagene Quellen:\n  ' + failed.join('\n  '));
