/* Shuttleberg Wetterwarte · Light
   Öffentliche Kurzfassung für shuttleberg.com: Jetzt am Berg, Schneebericht, Vorhersage 3/5/7 Tage, Lawinenlage.
   Einbau (XMS-HTML-Block):
     <div id="sb-wetter"></div>
     <script src="https://HOST/wetter-light.js" defer></script>
   Optional am div: data-src="https://HOST/public.json", data-days="5"
   Schrift: nutzt 'Josefin Sans' der Homepage (dort bereits geladen). */
(function () {
  'use strict';
  const SCRIPT = document.currentScript;
  const BASE = SCRIPT && SCRIPT.src ? new URL('.', SCRIPT.src).href : location.href;
  const TZ = 'Europe/Vienna';
  const REFRESH_MS = 15 * 60 * 1000;
  // Geländeschnitt Kleinarl – Grat – Flachauwinkl (Copernicus-DEM), km / m – aus der Wetterwarte
  const PROFILE = [[0,1003],[0.13,1004],[0.26,1010],[0.39,1089],[0.52,1126],[0.65,1159],[0.78,1183],[0.91,1260],[1.04,1305],[1.17,1332],[1.3,1391],[1.43,1428],[1.56,1452],[1.69,1479],[1.82,1552],[1.95,1620],[2.08,1672],[2.21,1703],[2.34,1708],[2.47,1721],[2.6,1743],[2.73,1779],[2.86,1817],[2.99,1881],[3.12,1833],[3.25,1802],[3.38,1783],[3.51,1762],[3.64,1736],[3.77,1714],[3.9,1708],[4.03,1683],[4.16,1675],[4.29,1659],[4.42,1643],[4.55,1638],[4.68,1616],[4.81,1585],[4.94,1589],[5.07,1571],[5.2,1511],[5.33,1473],[5.46,1440],[5.59,1401],[5.72,1345],[5.85,1283],[5.98,1239],[6.1,1180],[6.23,1148],[6.36,1106],[6.49,1069],[6.62,1039],[6.75,1031],[6.88,1015],[7.01,1018]];

  const CSS = `
:host{
  --blue:#0f5aa1;--blue-dk:#083158;--blue-lt:#f0f5fc;--blue-md:#d9e6f5;
  --sky:#1ea1d5;--sky-lt:#8fd3f2;--yellow:#fcc40d;
  --ink:#232629;--muted:#5d6872;--line:#dae3ed;
  --sun:#fcc40d;--moon:#b8c6d6;--cloud:#cfdae6;--cloud-dk:#9cb0c5;--snow:#1ea1d5;--rain:#0f5aa1;
  --font:'Josefin Sans',Helvetica,Arial,sans-serif;
  display:block;container-type:inline-size;font-family:var(--font);color:var(--ink);line-height:1.45;font-size:16px;
  -webkit-font-smoothing:antialiased;
}
*{box-sizing:border-box}
a{color:var(--blue)}
:focus-visible{outline:3px solid var(--yellow);outline-offset:2px}
.w{display:grid;gap:24px}
.head{text-align:center}
h2{font:700 clamp(28px,4.4cqi,42px)/1.1 var(--font);text-transform:uppercase;color:var(--blue);margin:0;letter-spacing:.01em}
.sub{color:var(--sky);font-weight:700;font-size:clamp(16px,2.2cqi,20px);margin-top:6px}
.stamp{color:var(--muted);font-size:14px;margin-top:6px}
.stamp.old{color:#9a6a00}
.ptitle{font:700 20px/1.15 var(--font);text-transform:uppercase;color:var(--blue);margin:0;letter-spacing:.03em}

/* Kopfzeile: Jetzt + Schneebericht */
.top{display:grid;gap:20px;grid-template-columns:1fr}
@container (min-width:760px){.top{grid-template-columns:7fr 5fr}}

.hero{position:relative;overflow:hidden;color:#fff;padding:24px 26px 0;min-height:320px;display:flex;flex-direction:column;
  background:linear-gradient(165deg,#1468b4 0%,var(--blue) 40%,#0a4378 78%,var(--blue-dk) 100%);
  --cloud:#eef4fa;--cloud-dk:#b7cbe0;--snow:#ffffff;--rain:#a9dcf5;--moon:#e3ebf4}
.hero .lab{font-size:14px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:var(--sky-lt);display:flex;justify-content:space-between;gap:8px;position:relative;z-index:1}
.hero .lab span:last-child{color:#cfe3f5;font-weight:400;letter-spacing:.04em;text-transform:none}
.hero .main{display:flex;align-items:center;gap:6px 20px;margin-top:14px;flex-wrap:wrap;position:relative;z-index:1}
.hero .temp{font-size:clamp(72px,13cqi,112px);font-weight:700;line-height:.85;letter-spacing:-.02em;padding-top:.08em}
.hero .temp sup{font-size:.42em;vertical-align:top;position:relative;top:.12em;margin-left:2px;font-weight:400}
.hero .ico{width:clamp(76px,12cqi,104px);height:clamp(76px,12cqi,104px);flex:none}
.hero .cond{flex-basis:100%;font-size:clamp(20px,3cqi,26px);font-weight:700;margin-top:6px}
.hero .cond small{display:block;font-size:16px;font-weight:400;color:#d4e6f6;margin-top:2px}
.hero .stats{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;margin-top:auto;padding:22px 0 24px;position:relative;z-index:1}
.stat .k{font-size:12px;text-transform:uppercase;letter-spacing:.09em;color:var(--sky-lt);font-weight:700;hyphens:manual}
.stat .v{font-size:clamp(19px,2.6cqi,24px);font-weight:700;margin-top:2px;white-space:nowrap}
.ridge{position:absolute;left:0;right:0;bottom:0;width:100%;height:44%;pointer-events:none}

.snow{background:var(--blue-lt);padding:24px 26px;display:flex;flex-direction:column;gap:16px}
.tiles{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.tile{background:#fff;padding:14px 16px 12px;min-width:0}
.tile .k{font-size:12.5px;color:var(--muted);text-transform:uppercase;letter-spacing:.07em;font-weight:700}
.tile .v{font-size:clamp(28px,4.2cqi,36px);font-weight:700;color:var(--blue);line-height:1.05;margin-top:6px;white-space:nowrap}
.tile .v small{font-size:.5em;margin-left:3px}
.tile .n{font-size:13px;color:var(--muted);margin-top:2px}
.snow .meta{font-size:13px;color:var(--muted);margin-top:-4px}
.links{display:flex;flex-wrap:wrap;gap:8px 18px;margin-top:auto}
.links a{font-weight:700;text-decoration:none;color:var(--blue);font-size:15px}
.links a::after{content:" \\203A"}
.links a:hover{text-decoration:underline}

/* Schneeausblick */
.outlook{display:flex;align-items:center;gap:18px;background:var(--yellow);padding:18px 24px 16px}
.outlook.dry{background:var(--blue-lt)}
.outlook svg{width:46px;height:46px;flex:none}
.outlook .t1{font-size:13px;text-transform:uppercase;letter-spacing:.1em;font-weight:700;color:var(--blue-dk)}
.outlook .t2{font-size:clamp(20px,3cqi,26px);font-weight:700;color:var(--blue-dk);line-height:1.2;margin-top:2px}
.outlook .t3{font-size:15px;color:#3b3200;margin-top:2px}
.outlook.dry .t3{color:var(--muted)}
.tag{display:inline-block;background:var(--blue-dk);color:#fff;font:700 12px/1 var(--font);padding:5px 8px 3px;letter-spacing:.08em;text-transform:uppercase;margin-left:8px;vertical-align:middle}

/* Vorhersage */
.sec{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;margin-bottom:14px}
.seg{display:inline-flex;border:2px solid var(--blue)}
.seg button{appearance:none;border:0;background:#fff;color:var(--blue);font:700 15px/1 var(--font);padding:10px 14px 7px;cursor:pointer;text-transform:uppercase;letter-spacing:.04em}
.seg button+button{border-left:2px solid var(--blue)}
.seg button[aria-pressed="true"]{background:var(--blue);color:#fff}
.seg button:hover:not([aria-pressed="true"]){background:var(--blue-lt)}
.scroll{overflow-x:auto;scrollbar-width:thin}
.days{display:grid;grid-template-columns:repeat(var(--n),minmax(124px,1fr));gap:10px}
.day{border:1px solid var(--line);background:#fff;padding:16px 12px 14px;text-align:center;display:flex;flex-direction:column;align-items:center;gap:6px;position:relative}
.day.today{border-color:var(--blue);box-shadow:inset 0 4px 0 var(--blue)}
.day .wd{font-weight:700;text-transform:uppercase;color:var(--blue);font-size:17px;letter-spacing:.05em}
.day .dt{font-size:14px;color:var(--muted)}
.day .ico{width:64px;height:64px}
.day .tx{font-size:15px;line-height:1.25;min-height:2.5em}
.temps{width:100%;display:grid;gap:5px;border-top:1px solid var(--line);padding-top:10px;margin-top:2px}
.trow{display:flex;justify-content:space-between;align-items:baseline;gap:6px;font-size:12.5px;color:var(--muted);text-transform:uppercase;letter-spacing:.06em;font-weight:700}
.trow b{font-size:19px;color:var(--ink);letter-spacing:0;text-transform:none}
.trow .lo{color:var(--muted);font-weight:400;font-size:15px}
.snowc{display:flex;flex-direction:column;align-items:center;gap:4px;min-height:52px;justify-content:flex-start;margin-top:4px}
.chip{display:inline-flex;align-items:center;gap:6px;background:var(--sky);color:#fff;font-weight:700;padding:6px 10px 4px;font-size:15px;white-space:nowrap}
.chip svg{width:14px;height:14px}
.chip.lite{background:var(--blue-md);color:var(--blue-dk)}
.nosnow{color:#9aa6b2;font-size:14px;padding-top:6px}
.sl{font-size:12.5px;color:var(--muted)}

/* Lawine */
.aval{border:1px solid var(--line);padding:24px 26px}
.av-g{display:grid;gap:22px;grid-template-columns:1fr;margin-top:16px}
@container (min-width:700px){.av-g{grid-template-columns:180px 1fr}}
.lv-box svg{width:56px;height:56px}
.lv{display:flex;flex-direction:column;align-items:flex-start;gap:10px}
.lv-box{width:120px;height:120px;background:var(--c);color:#111;display:grid;place-items:center;font:700 64px/1 var(--font);padding-top:8px}
.lv-box.l5{background:repeating-linear-gradient(45deg,#e30613 0 14px,#111 14px 28px);color:#fff}
.lv-word{font-size:26px;font-weight:700;color:var(--ink);text-transform:capitalize;line-height:1.1}
.lv-of{font-size:14px;color:var(--muted)}
.av-h{display:flex;justify-content:space-between;align-items:baseline;gap:8px 16px;flex-wrap:wrap}
.av-h>div{display:flex;align-items:baseline;flex-wrap:wrap;gap:8px}
.av-reg{color:var(--sky);font-weight:700}
.rates{list-style:none;margin:0;padding:0;display:grid;gap:8px}
.rates li{display:flex;align-items:center;gap:10px;font-size:16px}
.rates .sq{width:26px;height:26px;background:var(--c);display:grid;place-items:center;font:700 15px/1 var(--font);padding-top:3px;flex:none;color:#111}
.probs{display:flex;flex-wrap:wrap;gap:8px;margin-top:14px}
.probs .chip{background:var(--blue-lt);color:var(--blue-dk);font-size:14px}
.av-hl{font-size:19px;font-weight:700;margin:16px 0 4px;line-height:1.3}
.av-tx{margin:0;color:#3a4148;max-width:68ch}
.av-meta{font-size:13.5px;color:var(--muted);margin-top:12px}
.btn{display:inline-block;background:var(--yellow);color:var(--ink);font:700 15px/1 var(--font);padding:13px 18px 10px;text-decoration:none;text-transform:uppercase;letter-spacing:.05em;margin-top:16px}
.btn:hover{background:#ebb707}
.demo{display:inline-block;background:#fff4cc;color:#6b5200;border:1px dashed #d9a800;font-size:12.5px;padding:4px 8px 2px;font-weight:700}
.note{font-size:13.5px;color:var(--muted);margin-top:10px}

.foot{display:flex;flex-wrap:wrap;justify-content:space-between;gap:6px 16px;font-size:13px;color:var(--muted);border-top:1px solid var(--line);padding-top:12px}
.foot a{color:var(--muted);text-decoration:underline;text-underline-offset:2px}
.foot a:hover{color:var(--blue)}
.err{background:var(--blue-lt);padding:24px;text-align:center}
.skel{height:320px;background:linear-gradient(90deg,var(--blue-lt),#e6eef8,var(--blue-lt));background-size:200% 100%;animation:sh 1.4s infinite linear}
@keyframes sh{to{background-position:-200% 0}}
@media (prefers-reduced-motion:reduce){.skel{animation:none}}

/* Schmal: Tage als Liste */
@container (max-width:620px){
  .hero{padding:20px 18px 0;min-height:290px}
  .snow,.aval{padding:20px 18px}
  .outlook{padding:16px 18px 14px;gap:14px}
  .outlook svg{width:38px;height:38px}
  .days{grid-template-columns:1fr;gap:0;border-top:1px solid var(--line)}
  .scroll{overflow:visible}
  .day{display:grid;grid-template-columns:62px 46px minmax(0,1fr) auto;grid-template-areas:"when ico tx temps" "when ico snowc temps";
    text-align:left;align-items:center;border:0;border-bottom:1px solid var(--line);padding:12px 2px;gap:2px 12px;box-shadow:none}
  .day.today{box-shadow:inset 4px 0 0 var(--blue);padding-left:12px;border-color:var(--line)}
  .when{grid-area:when}.day .ico{grid-area:ico;width:46px;height:46px}.tx{grid-area:tx;min-height:0!important}
  .temps{grid-area:temps;border:0;padding:0;margin:0;width:auto;min-width:104px}
  .snowc{grid-area:snowc;flex-direction:row;align-items:center;min-height:0;margin:0;gap:8px;flex-wrap:wrap}
  .day .wd{font-size:15px}.day .dt{font-size:13px}
  .chip{padding:4px 8px 2px;font-size:13.5px}
  .nosnow{display:none}
  .lv{flex-direction:row;align-items:center;gap:16px}
  .lv-box{width:76px;height:76px;font-size:42px}
  .lv-word{font-size:22px}
  .stat .k{font-size:11px;letter-spacing:.06em}
  .tile{padding:12px 12px 10px}
  .tile .k{font-size:11.5px;letter-spacing:.05em}
  .day{grid-template-columns:76px 40px minmax(0,1fr) auto}
  .day .ico{width:40px;height:40px}
  .temps{min-width:92px}
  .trow{font-size:11px}
  .trow b{font-size:17px}
  .trow .lo{font-size:14px}
}
`;

  /* ---------- Helfer ---------- */
  const ok = v => v != null && isFinite(v);
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const NF = new Intl.NumberFormat('de-DE', { maximumFractionDigits: 0 });
  const num = v => ok(v) ? NF.format(Math.round(v)) : '–';
  const deg = v => { if (!ok(v)) return '–'; const r = Math.round(v); return (r < 0 ? '−' : '') + Math.abs(r) + '°'; };
  const m100 = v => ok(v) ? NF.format(Math.round(v / 100) * 100) + '\u00a0m' : '–';
  const cap = s => s ? s.charAt(0).toUpperCase() + s.slice(1) : '';
  const pad = n => String(n).padStart(2, '0');
  const WDL = { Mo: 'Montag', Di: 'Dienstag', Mi: 'Mittwoch', Do: 'Donnerstag', Fr: 'Freitag', Sa: 'Samstag', So: 'Sonntag' };
  const dayKey = d => new Intl.DateTimeFormat('en-CA', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit' }).format(d);
  const hm = d => new Intl.DateTimeFormat('de-AT', { timeZone: TZ, hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(d);
  const dmy = d => new Intl.DateTimeFormat('de-AT', { timeZone: TZ, weekday: 'short', day: '2-digit', month: '2-digit' }).format(d).replace(',', '');
  function rel(key) {
    const t = new Date(), k0 = dayKey(t), k1 = dayKey(new Date(t.getTime() + 864e5)), k2 = dayKey(new Date(t.getTime() + 2 * 864e5));
    return key === k0 ? 'heute' : key === k1 ? 'morgen' : key === k2 ? 'übermorgen' : null;
  }

  /* ---------- Icons (aus der Wetterwarte) ---------- */
  const P2 = v => +v.toFixed(1);
  const icCloud = (dx, dy, s, fill) => { const c = (x, y, r) => `<circle cx="${P2(dx + x * s)}" cy="${P2(dy + y * s)}" r="${P2(r * s)}"/>`; return `<g fill="${fill}">${c(22, 30, 9)}${c(33, 24, 12)}${c(44, 31, 8)}<rect x="${P2(dx + 13 * s)}" y="${P2(dy + 30 * s)}" width="${P2(39 * s)}" height="${P2(9 * s)}" rx="${P2(4.5 * s)}"/></g>`; };
  const icSun = (cx, cy, r) => { let s = `<g stroke="var(--sun)" stroke-width="2.6" stroke-linecap="round">`; for (let k = 0; k < 8; k++) { const a = k * Math.PI / 4; s += `<line x1="${P2(cx + Math.cos(a) * r * 1.38)}" y1="${P2(cy + Math.sin(a) * r * 1.38)}" x2="${P2(cx + Math.cos(a) * r * 1.78)}" y2="${P2(cy + Math.sin(a) * r * 1.78)}"/>`; } return s + `</g><circle cx="${cx}" cy="${cy}" r="${r}" fill="var(--sun)"/>`; };
  const icMoon = (cx, cy, r) => `<path d="M${P2(cx + r * .3)} ${P2(cy - r * .95)}A${r} ${r} 0 1 0 ${P2(cx + r * .95)} ${P2(cy + r * .3)}A${P2(r * .8)} ${P2(r * .8)} 0 0 1 ${P2(cx + r * .3)} ${P2(cy - r * .95)}Z" fill="var(--moon)"/>`;
  const icFlake = (x, y, s) => { let o = ''; for (const a of [0, 60, 120]) { const r = a * Math.PI / 180; o += `<line x1="${P2(x - Math.cos(r) * s)}" y1="${P2(y - Math.sin(r) * s)}" x2="${P2(x + Math.cos(r) * s)}" y2="${P2(y + Math.sin(r) * s)}"/>`; } return `<g stroke="var(--snow)" stroke-width="2" stroke-linecap="round">${o}</g>`; };
  const icDrop = (x, y) => `<path d="M${x} ${y - 5}C${x + 3.4} ${y - .6} ${x + 3.4} ${y + 3.4} ${x} ${y + 3.4}C${x - 3.4} ${y + 3.4} ${x - 3.4} ${y - .6} ${x} ${y - 5}Z" fill="var(--rain)"/>`;
  function wxIcon(type, label, cls) {
    let g = ''; const up = f => icCloud(0, -6, 1, f);
    switch (type) {
      case 'sun': g = icSun(32, 32, 11); break;
      case 'moon': g = icMoon(32, 32, 15); break;
      case 'partly': g = icSun(23, 22, 9) + icCloud(7, 9, 1, 'var(--cloud)'); break;
      case 'partly-night': g = icMoon(24, 21, 11) + icCloud(7, 9, 1, 'var(--cloud)'); break;
      case 'cloudy': g = icSun(22, 18, 7) + icCloud(-4, 2, .9, 'var(--cloud-dk)') + icCloud(6, 9, 1, 'var(--cloud)'); break;
      case 'overcast': g = icCloud(-4, 0, .9, 'var(--cloud)') + icCloud(6, 9, 1, 'var(--cloud-dk)'); break;
      case 'snow': g = up('var(--cloud)') + icFlake(22, 47, 4.5) + icFlake(34, 54, 4.5) + icFlake(46, 47, 4.5); break;
      case 'snow-heavy': g = up('var(--cloud-dk)') + icFlake(18, 44, 4.2) + icFlake(31, 48, 4.2) + icFlake(44, 44, 4.2) + icFlake(24, 56, 4.2) + icFlake(38, 56, 4.2); break;
      case 'rain': g = up('var(--cloud-dk)') + icDrop(22, 48) + icDrop(34, 54) + icDrop(46, 48); break;
      case 'sleet': g = up('var(--cloud-dk)') + icFlake(23, 48, 4.5) + icDrop(35, 53) + icFlake(46, 48, 4.5); break;
    }
    return `<svg class="${cls || 'ico'}" viewBox="0 0 64 64" role="img" aria-label="${esc(label || type)}">${g}</svg>`;
  }
  const FLAKE = '<svg viewBox="0 0 16 16" aria-hidden="true"><g stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><line x1="8" y1="1.5" x2="8" y2="14.5"/><line x1="2.4" y1="4.8" x2="13.6" y2="11.2"/><line x1="2.4" y1="11.2" x2="13.6" y2="4.8"/></g></svg>';
  const BIG_FLAKE = '<svg viewBox="0 0 48 48" aria-hidden="true"><g stroke="#083158" stroke-width="3" stroke-linecap="round" fill="none"><line x1="24" y1="4" x2="24" y2="44"/><line x1="6.7" y1="14" x2="41.3" y2="34"/><line x1="6.7" y1="34" x2="41.3" y2="14"/><path d="M19 8l5 5 5-5M19 40l5-5 5 5M8.5 21l6.8-1.8L13.5 12.4M39.5 27l-6.8 1.8 1.8 6.8M8.5 27l6.8 1.8-1.8 6.8M39.5 21l-6.8-1.8 1.8-6.8"/></g></svg>';
  const SUN_BIG = '<svg viewBox="0 0 48 48" aria-hidden="true"><g stroke="#0f5aa1" stroke-width="3" stroke-linecap="round"><line x1="24" y1="3" x2="24" y2="9"/><line x1="24" y1="39" x2="24" y2="45"/><line x1="3" y1="24" x2="9" y2="24"/><line x1="39" y1="24" x2="45" y2="24"/><line x1="9.2" y1="9.2" x2="13.4" y2="13.4"/><line x1="34.6" y1="34.6" x2="38.8" y2="38.8"/><line x1="9.2" y1="38.8" x2="13.4" y2="34.6"/><line x1="34.6" y1="13.4" x2="38.8" y2="9.2"/></g><circle cx="24" cy="24" r="9" fill="#fcc40d"/></svg>';

  function ridgeSVG() {
    const W = 1000, H = 240, x = km => P2(km / 7.01 * W), y = m => P2(H - (m - 900) * 0.2);
    const pts = PROFILE.map(([k, m]) => `${x(k)},${y(m)}`).join(' L');
    const back = PROFILE.map(([k, m]) => `${P2(W - x(k) * 0.9 - 40)},${P2(y(m) - 26)}`).join(' L');
    return `<svg class="ridge" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" aria-hidden="true">
      <path d="M0,${H} L${back} L0,${P2(y(1003) - 26)} Z" fill="#fff" fill-opacity=".05"/>
      <path d="M0,${H} L${pts} L${W},${H} Z" fill="#fff" fill-opacity=".09"/>
      <path d="M${pts}" fill="none" stroke="#fff" stroke-opacity=".28" stroke-width="1.5" vector-effect="non-scaling-stroke"/></svg>`;
  }

  /* ---------- Bausteine ---------- */
  function hero(D) {
    const n = D.now, b = n.berg || {}, t = n.tal || {}, td = n.today || {}, d0 = (D.days || [])[0] || {};
    const when = b.t ? hm(new Date(b.t * 1000)) + ' Uhr' : '';
    return `<section class="hero" aria-label="Jetzt am Berg">
      ${ridgeSVG()}
      <div class="lab"><span>Jetzt am Berg</span><span>${esc(when)}</span></div>
      <div class="main">
        <div class="temp">${ok(b.T) ? (Math.round(b.T) < 0 ? '−' : '') + Math.abs(Math.round(b.T)) : '–'}<sup>°C</sup></div>
        ${wxIcon(td.icon, td.text)}
        <div class="cond">Heute ${esc(td.text || '')}<small>Berg ${deg(d0.berg && d0.berg.max)} / ${deg(d0.berg && d0.berg.min)} · Tal ${deg(d0.tal && d0.tal.max)} / ${deg(d0.tal && d0.tal.min)}</small></div>
      </div>
      <div class="stats">
        <div class="stat"><div class="k">Im Tal</div><div class="v">${deg(t.T)}</div></div>
        <div class="stat"><div class="k">Wind Berg</div><div class="v">${ok(b.W) ? num(b.W) + '\u00a0km/h' : '–'}</div></div>
        <div class="stat"><div class="k">Schneefall&shy;grenze</div><div class="v">${m100(n.snowLine)}</div></div>
      </div>
    </section>`;
  }

  function snowReport(D) {
    // official = offizieller Schneebericht des Skigebiets (status ok/none/error), Neuschnee 24 h sonst aus der Analyse
    const s = D.snow || {}, o = s.official || {}, has = o.status === 'ok';
    const cmv = v => ok(v) ? `${num(v)}<small>cm</small>` : '–';
    const ago = key => { const t = Date.now(); return key === dayKey(new Date(t)) ? 'heute' : key === dayKey(new Date(t - 864e5)) ? 'gestern' : null; };
    const day = iso => { const d = new Date(iso.length === 10 ? iso + 'T12:00:00Z' : iso); const r = ago(dayKey(d)); return r ? cap(r) : dmy(d); };
    const neu = has && ok(o.neu);
    const meta = has
      ? [o.updated ? `Stand: ${day(o.updated)}, ${hm(new Date(o.updated))} Uhr` : '', o.zustand ? `Schnee: ${o.zustand}` : ''].filter(Boolean).join(' · ')
      : 'Aktuell liegt kein offizieller Schneebericht vor.';
    return `<section class="snow" aria-label="Schneebericht">
      <h3 class="ptitle">Schneebericht</h3>
      <div class="tiles">
        <div class="tile"><div class="k">Schneehöhe Berg</div><div class="v">${has ? cmv(o.berg) : '–'}</div></div>
        <div class="tile"><div class="k">Schneehöhe Tal</div><div class="v">${has ? cmv(o.tal) : '–'}</div></div>
        <div class="tile"><div class="k">Neuschnee${neu ? '' : ' 24&nbsp;h'}</div><div class="v">${neu ? cmv(o.neu) : cmv(s.new24)}</div><div class="n">${neu ? 'laut Schneebericht' : 'am Berg'}</div></div>
        <div class="tile"><div class="k">Letzter Schneefall</div><div class="v" style="font-size:22px">${has && o.lastSnowfall ? esc(day(o.lastSnowfall)) : '–'}</div>${has && o.lastSnowfall ? '<div class="n">in der Region</div>' : ''}</div>
      </div>
      ${meta ? `<div class="meta">${esc(meta)}</div>` : ''}
      <div class="links">
        ${D.links && D.links.lifts ? `<a href="${esc(D.links.lifts)}">Geöffnete Pisten &amp; Lifte</a>` : ''}
        ${D.links && D.links.webcams ? `<a href="${esc(D.links.webcams)}">Webcams</a>` : ''}
      </div>
    </section>`;
  }

  function outlook(D) {
    const s = D.snow || {}, nx = s.next;
    if (nx) {
      const r = rel(nx.key), when = r ? cap(r) : WDL[nx.wd] || nx.wd;
      const rest = ok(s.sum7) && s.sum7 > nx.cm ? `In den nächsten 7 Tagen insgesamt rund ${num(s.sum7)} cm.` : 'Am Berg, Prognose für den ganzen Tag.';
      return `<section class="outlook" aria-label="Schneeausblick">${BIG_FLAKE}<div>
        <div class="t1">Neuschnee in Sicht${nx.powder ? '<span class="tag">Powder-Alarm</span>' : ''}</div>
        <div class="t2">${esc(when)}: rund ${num(nx.cm)} cm</div>
        <div class="t3">${rest}</div></div></section>`;
    }
    const t = ok(s.sum7) && s.sum7 >= 2 ? `Nur ein paar Flocken, in 7 Tagen zusammen rund ${num(s.sum7)} cm.` : 'Die nächsten Tage bleibt es weitgehend trocken.';
    return `<section class="outlook dry" aria-label="Schneeausblick">${SUN_BIG}<div>
      <div class="t1">Schneeausblick</div><div class="t2">Kein größerer Neuschnee in Sicht</div><div class="t3">${t}</div></div></section>`;
  }

  function forecast(D, n) {
    const today = dayKey(new Date());
    const days = (D.days || []).filter(d => d.key >= today).slice(0, n);
    const cards = days.map((d, i) => {
      const r = rel(d.key), wd = r && r !== 'übermorgen' ? cap(r) : WDL[d.wd] || d.wd;
      const wet = (d.snow >= 1) || (d.rain >= 1);
      const snow = d.snow >= 1
        ? `<span class="chip${d.snow < 5 ? ' lite' : ''}">${FLAKE}${num(d.snow)} cm</span>`
        : `<span class="nosnow">kein Neuschnee</span>`;
      return `<article class="day${d.key === today ? ' today' : ''}" aria-label="${esc(wd)}">
        <div class="when"><div class="wd">${esc(wd)}</div><div class="dt">${pad(d.d)}.${pad(d.m)}.</div></div>
        ${wxIcon(d.icon, d.text)}
        <div class="tx">${esc(cap(d.text))}</div>
        <div class="snowc">${snow}${wet && ok(d.snowLine) ? `<span class="sl">Schnee ab ${m100(d.snowLine)}</span>` : ''}</div>
        <div class="temps">
          <div class="trow"><span>Berg</span><b>${deg(d.berg.max)}<span class="lo"> / ${deg(d.berg.min)}</span></b></div>
          <div class="trow"><span>Tal</span><b>${deg(d.tal.max)}<span class="lo"> / ${deg(d.tal.min)}</span></b></div>
        </div>
      </article>`;
    }).join('');
    return `<section aria-label="Vorhersage">
      <div class="sec"><h3 class="ptitle">Vorhersage</h3>
        <div class="seg" role="group" aria-label="Zeitraum">${[3, 5, 7].map(k => `<button type="button" data-n="${k}" aria-pressed="${k === n}">${k} Tage</button>`).join('')}</div></div>
      <div class="scroll"><div class="days" style="--n:${days.length}">${cards}</div></div>
    </section>`;
  }

  const EAWS = { 1: '#ccff66', 2: '#ffff00', 3: '#ff9900', 4: '#ff0000', 5: '#e30613' };
  function avalanche(D) {
    const A = D.avalanche || {}, url = A.url || 'https://lawine.salzburg.at/';
    const cta = `<a class="btn" href="${esc(url)}" target="_blank" rel="noopener">Ganzer Lawinenlagebericht</a>`;
    const scope = `<p class="note">Der Lagebericht gilt für das freie Gelände abseits gesicherter Pisten.</p>`;
    const head = extra => `<div class="av-h"><div><h3 class="ptitle">Lawinenlage</h3>${extra || ''}</div><span class="av-reg">${esc(A.region || 'Niedere Tauern Nord')}</span></div>`;
    if (A.status !== 'ok') {
      const msg = A.status === 'error'
        ? 'Der Lawinenwarndienst ist gerade nicht erreichbar.'
        : 'Derzeit gibt es keinen täglichen Lagebericht für unsere Region. Sobald der Lawinenwarndienst Salzburg startet, steht hier die Zusammenfassung.';
      const mtn = '<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M3 41 19 13l8 13 5-7 13 22Z" fill="#0f5aa1" fill-opacity=".22"/><path d="M19 13l4.6 7.5-2.6-1.2-2.4 2.6-2.4-2.2-2.2 1.4Z" fill="#fff"/></svg>';
      return `<section class="aval" aria-label="Lawinenlage">${head()}<div class="av-g">
        <div class="lv"><div class="lv-box" style="--c:var(--blue-lt)">${mtn}</div></div>
        <div><p class="av-tx">${msg}</p>${cta}</div></div></section>`;
    }
    const max = A.max || 0;
    const rates = (A.ratings || []).length > 1 || ((A.ratings || [])[0] && A.ratings[0].elev !== 'alle Höhenlagen')
      ? `<ul class="rates">${A.ratings.map(r => `<li><span class="sq" style="--c:${EAWS[r.level] || '#ddd'}">${r.level || '–'}</span><span><b>${esc(cap(r.word))}</b> ${esc(r.elev)}${r.period ? ' · ' + esc(r.period) : ''}</span></li>`).join('')}</ul>` : '';
    const probs = (A.problems || []).length ? `<div class="probs">${A.problems.map(p => `<span class="chip">${esc(p.word)}</span>`).join('')}</div>` : '';
    const vt = A.validTo ? new Date(A.validTo) : null;
    const meta = vt ? `Gültig bis ${dmy(vt)}, ${hm(vt)} Uhr` : '';
    const demo = A.demo ? `<span class="demo">Beispiel vom ${esc(A.demo.split('-').reverse().join('.'))}</span>` : '';
    return `<section class="aval" aria-label="Lawinenlage">${head(demo)}<div class="av-g">
      <div class="lv"><div class="lv-box${max === 5 ? ' l5' : ''}" style="--c:${EAWS[max] || '#ddd'}" aria-hidden="true">${max || '–'}</div>
        <div><div class="lv-word">${esc(A.maxWord || '')}</div><div class="lv-of">Gefahrenstufe ${max} von 5</div></div></div>
      <div>
        ${rates}${probs}
        ${A.headline ? `<p class="av-hl">${esc(A.headline)}</p>` : ''}
        ${A.text ? `<p class="av-tx">${esc(A.text)}</p>` : ''}
        <div class="av-meta">${esc(meta)}${meta ? ' · ' : ''}Lawinenwarndienst Salzburg</div>
        ${scope}${cta}
      </div></div>
    </section>`;
  }

  function credits(c) {
    if (!Array.isArray(c)) return esc(c || '');
    return c.map(x => x.url ? `<a href="${esc(x.url)}" target="_blank" rel="noopener">${esc(x.text)}</a>` : esc(x.text)).join(' · ');
  }

  function render(root, D, st) {
    const gen = new Date(D.generated), age = (Date.now() - gen) / 36e5;
    const r = rel(dayKey(gen));
    const stamp = `${age > 3 ? 'Daten von' : 'Aktualisiert'} ${r || dmy(gen)}, ${hm(gen)} Uhr`;
    root.querySelector('.w').innerHTML = `
      <header class="head"><h2>Wetter &amp; Schnee</h2><div class="sub">Shuttleberg Flachauwinkl – Kleinarl</div><div class="stamp${age > 3 ? ' old' : ''}">${esc(stamp)}</div></header>
      <div class="top">${hero(D)}${snowReport(D)}</div>
      ${outlook(D)}
      ${forecast(D, st.n)}
      ${avalanche(D)}
      <footer class="foot"><span>Daten: ${credits(D.credits)}</span><span>Prognosen ohne Gewähr</span></footer>`;
    root.querySelectorAll('.seg button').forEach(b => b.addEventListener('click', () => {
      st.n = +b.dataset.n; try { localStorage.setItem('sbw.days', st.n); } catch (e) { }
      render(root, D, st);
      const sb = root.querySelector(`.seg button[data-n="${st.n}"]`); if (sb) sb.focus();
    }));
  }

  async function mount(el) {
    if (el.__sbw) return; el.__sbw = true;
    const root = el.attachShadow({ mode: 'open' });
    root.innerHTML = `<style>${CSS}</style><div class="w"><div class="skel" aria-busy="true" aria-label="Wetter wird geladen"></div></div>`;
    const src = el.getAttribute('data-src') || new URL('public.json', BASE).href;
    let saved = null; try { saved = +localStorage.getItem('sbw.days'); } catch (e) { }
    const st = { n: [3, 5, 7].includes(saved) ? saved : ([3, 5, 7].includes(+el.dataset.days) ? +el.dataset.days : 5) };
    let D = null;
    const load = async () => {
      try {
        const r = await fetch(src, { cache: 'no-cache' });
        if (!r.ok) throw new Error('HTTP ' + r.status);
        D = await r.json(); render(root, D, st);
      } catch (e) {
        if (!D) root.querySelector('.w').innerHTML = `<div class="err"><h3 class="ptitle">Wetter &amp; Schnee</h3><p>Die Wetterdaten sind gerade nicht erreichbar. Bitte später nochmal probieren.</p><a class="btn" href="https://lawine.salzburg.at/" target="_blank" rel="noopener">Lawinenlagebericht</a></div>`;
      }
    };
    await load();
    setInterval(() => { if (document.visibilityState === 'visible') load(); }, REFRESH_MS);
  }

  function init() { document.querySelectorAll('#sb-wetter,[data-sb-wetter]').forEach(mount); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
