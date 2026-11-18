// Baut aus der Wetterwarte-HTML (Dropbox, einzige Quelle) das Einbau-Skript web/light/wetterwarte.js
// für die interne Seite auf shuttleberg.com. Keine zweite Codekopie: CSS, Markup und Skript kommen 1:1 aus der HTML,
// hier wird nur für den Einbau umgeschrieben (Shadow DOM, Container Queries, Daten vom Worker).
// Aufruf: node scripts/build-wetterwarte.mjs [Pfad zur Wetterwarte-HTML]   (oder scripts/sync.sh für Engine + Einbau)
//
// Einbau (XMS-HTML-Block, als normaler HTML-Absatz, nicht in einem Spalten-Block):
//   <div id="sb-wetterwarte"></div>
//   <script src="https://sb-wetter.max-27c.workers.dev/wetterwarte.js" defer></script>
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const cfg = JSON.parse(readFileSync(join(root, 'config.json'), 'utf8'));
const src = resolve(root, process.argv[2] || cfg.sourceHtml);   // liegt außerhalb des Repos (Dropbox)
const html = readFileSync(src, 'utf8');
const outFile = join(root, 'web/light/wetterwarte.js');

// Jede Ersetzung muss genau so oft greifen wie erwartet. Ändert sich die HTML an diesen Stellen, bricht der Build ab
// (statt still ein kaputtes Skript zu bauen) und das Skript hier muss nachgezogen werden.
function sub(text, find, repl, times = 1, what = String(find)) {
  const re = typeof find === 'string' ? new RegExp(find.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g') : new RegExp(find.source, find.flags.includes('g') ? find.flags : find.flags + 'g');
  const n = (text.match(re) || []).length;
  if (times === '+' ? n < 1 : n !== times) throw new Error(`Build-Wetterwarte: „${what}“ ${n}× gefunden, erwartet ${times}`);
  return text.replace(re, repl);
}
function between(text, a, b, from = 0) {
  const i = text.indexOf(a, from); if (i < 0) throw new Error('Marker fehlt: ' + a);
  const j = text.indexOf(b, i + a.length); if (j < 0) throw new Error('Marker fehlt: ' + b);
  return [text.slice(i + a.length, j), j + b.length];
}

/* ---------- 1. CSS: :root → :host, Seiten-Regeln raus, Breiten-Abfragen → Container Queries ---------- */
let [css] = between(html, '<style>', '</style>');
css = sub(css, '@media (prefers-reduced-motion:reduce){html{scroll-behavior:auto}}', '');
css = sub(css, /html\{[^}]*\}/, '', 1, 'html{…}');
css = sub(css, /body::before\{[^}]*\}/, '', 1, 'body::before{…}');
css = sub(css, /(^|\})body\{/m, '$1.sbw{', 1, 'body{');
css = sub(css, /(^|\})main\{/m, '$1.main{', 1, 'main{');
css = sub(css, ':root[data-theme="dark"]', ':host([data-theme="dark"])', '+');
css = sub(css, ':root:not([data-theme="light"])', ':host(:not([data-theme="light"]))', '+');
css = sub(css, ':root', ':host', '+');
css = sub(css, /@media \((max|min)-width:(\d+)px\)/, '@container sbw ($1-width:$2px)', '+', '@media (…-width)');
css = sub(css, 'clamp(32px,5vw,50px)', 'clamp(32px,5cqi,50px)');
const leftover = [...css.matchAll(/@media \(([a-z-]+)/g)].map(m => m[1]).filter(k => !k.startsWith('prefers-'));
if (leftover.length || /(^|[\s,}])(html|body)\b/.test(css)) throw new Error('Build-Wetterwarte: unbehandelte Seiten-Regeln im CSS: ' + leftover.join(', '));
css = `/* Einbau: Seiten-CSS bleibt draußen, nur Schrift-Variablen und Farben gelten hier */
:host{all:initial;display:block;--sbw-z:4}
${css}
.sbw{container:sbw/inline-size;-webkit-text-size-adjust:100%;text-align:left}
`;

/* ---------- 2. Markup: <body> ohne Skripte, Tooltip außerhalb des Containers ---------- */
let [body] = between(html, '<body>', '<script src=');
body = sub(body, '<div id="tip" hidden></div>', '');
body = sub(body, '<main class="wrap">', '<div class="wrap main">');
body = sub(body, '</main>', '</div>');
body = body.replace(/\n{3,}/g, '\n\n').trim();

/* ---------- 3. Skript: Haken-Zeile durch Parameter ersetzen, API-Weg sperren ---------- */
const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)];
if (scripts.length !== 1) throw new Error('Build-Wetterwarte: erwartet genau ein Inline-Skript, gefunden ' + scripts.length);
let js = scripts[0][1];
js = sub(js, 'const ROOT=document,HOST=document.documentElement,CFG={};', '/* ROOT, HOST, CFG kommen aus boot() */');
js = sub(js, "const viaKey=()=>!!(S.omKey||'').trim();", 'const viaKey=()=>false; /* Einbau: nie die Open-Meteo-API */');
for (const bad of ['document.getElementById', 'document.querySelector', "L.map('"]) {
  if (js.includes(bad)) throw new Error('Build-Wetterwarte: im Skript steht noch ' + bad + ' (im Shadow DOM nicht nutzbar, ROOT bzw. $() verwenden)');
}

/* ---------- 4. Einbau-Skript schreiben ---------- */
const FONTS = [['Barlow', '400', 'barlow-latin-400'], ['Barlow', '500', 'barlow-latin-500'], ['Barlow', '600', 'barlow-latin-600'],
  ['Barlow Condensed', '500', 'barlow-condensed-latin-500'], ['Barlow Condensed', '600', 'barlow-condensed-latin-600'], ['Barlow Condensed', '700', 'barlow-condensed-latin-700'],
  ['IBM Plex Mono', '400', 'ibm-plex-mono-latin-400'], ['IBM Plex Mono', '500', 'ibm-plex-mono-latin-500']];

const out = `/* Shuttleberg Wetterwarte · Einbau für die interne Seite auf shuttleberg.com
   AUTOMATISCH ERZEUGT von scripts/build-wetterwarte.mjs aus ${src.split('/').slice(-2).join('/')} – nicht von Hand ändern.
   Erzeugt ${new Date().toISOString()}
   Einbau (XMS-HTML-Block):
     <div id="sb-wetterwarte"></div>
     <script src="https://sb-wetter.max-27c.workers.dev/wetterwarte.js" defer></script>
   Optional am div: data-offset="CSS-Selektor" = fixe oder klebende Kopfzeilen der Seite, unter denen die Unternavigation
   klebt (Standard: #outerHeader,#outerBreadcrumbs wie auf shuttleberg.com und absolutpark.com).
   Daten: Open-Meteo-Modelle stündlich vorab vom Worker (data/*.json, AWS Open Data, CC BY 4.0); GeoSphere, LAWIS, RainViewer,
   OpenTopoMap und Windy direkt aus dem Browser. Schriften (OFL) und Leaflet (BSD-2) liegen ebenfalls am Worker. */
(function () {
'use strict';
var SCRIPT = document.currentScript;
var BASE = SCRIPT && SCRIPT.src ? new URL('.', SCRIPT.src).href : 'https://sb-wetter.max-27c.workers.dev/';
var CSS = ${JSON.stringify(css)};
var HTML = ${JSON.stringify(body)};
var FONTS = ${JSON.stringify(FONTS)};

/* Schriften: @font-face wirkt im Shadow DOM nicht, deshalb über die FontFace-API am Dokument anmelden */
function loadFonts() {
  if (!window.FontFace || !document.fonts || loadFonts.done) return; loadFonts.done = true;
  FONTS.forEach(function (f) {
    try { var ff = new FontFace(f[0], 'url(' + BASE + 'vendor/fonts/' + f[2] + '.woff2) format("woff2")', { weight: f[1], style: 'normal', display: 'swap' });
      document.fonts.add(ff); ff.load().catch(function () {}); } catch (e) {}
  });
}
/* Leaflet erst laden, wenn „Karten & Radar“ geöffnet wird */
function loadLeaflet() {
  return new Promise(function (res) {
    if (window.L) return res();
    var s = document.createElement('script'); s.src = BASE + 'vendor/leaflet/leaflet.js';
    s.onload = s.onerror = function () { res(); }; document.head.appendChild(s);
  });
}
/* Unternavigation unter dem Seitenkopf der Homepage: Unterkante der fixen/klebenden Kopfzeilen laufend messen */
function trackOffset(host) {
  var sel = host.getAttribute('data-offset') || '#outerHeader,#outerBreadcrumbs', last = -1, raf = 0;
  function upd() {
    raf = 0; var b = 0;
    try {
      var els = document.querySelectorAll(sel);
      for (var i = 0; i < els.length; i++) {
        var cs = getComputedStyle(els[i]);
        if ((cs.position !== 'fixed' && cs.position !== 'sticky') || cs.display === 'none' || cs.visibility === 'hidden') continue;
        var r = els[i].getBoundingClientRect();
        if (r.height > 0 && r.top < innerHeight * 0.4 && r.bottom > b) b = r.bottom;
      }
    } catch (e) {}
    b = Math.max(0, Math.round(b));
    if (b !== last) { last = b; host.style.setProperty('--sbw-top', b + 'px'); }
  }
  function q() { if (!raf) raf = requestAnimationFrame(upd); }
  addEventListener('scroll', q, { passive: true }); addEventListener('resize', q); upd(); setTimeout(upd, 800);
}
function mount(host) {
  if (host.__sbw) return; host.__sbw = true;
  var root = host.attachShadow({ mode: 'open' });
  root.innerHTML = '<link rel="stylesheet" href="' + BASE + 'vendor/leaflet/leaflet.css"><style>' + CSS + '</style><div class="sbw">' + HTML + '</div><div id="tip" hidden></div>';
  trackOffset(host);
  boot(root, host, { data: BASE + 'data/', loadLeaflet: loadLeaflet });
}
function start() {
  loadFonts();
  var hosts = document.querySelectorAll('#sb-wetterwarte,[data-sb-wetterwarte]');
  for (var i = 0; i < hosts.length; i++) { try { mount(hosts[i]); } catch (e) { console.error('Wetterwarte:', e); } }
}

/* ===== ab hier unverändert aus der Wetterwarte-HTML (nur ROOT/HOST/CFG als Parameter) ===== */
function boot(ROOT, HOST, CFG) {
${js.trim()}
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
`;
writeFileSync(outFile, out);
console.log(`web/light/wetterwarte.js geschrieben (${(out.length / 1024).toFixed(0)} KB) aus ${src}`);
