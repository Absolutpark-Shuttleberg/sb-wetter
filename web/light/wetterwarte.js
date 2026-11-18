/* Shuttleberg Wetterwarte · Einbau für die interne Seite auf shuttleberg.com
   AUTOMATISCH ERZEUGT von scripts/build-wetterwarte.mjs aus Shuttleberg Wetterwarte/Shuttleberg-Wetterwarte.html – nicht von Hand ändern.
   Erzeugt 2026-11-18T07:19:41.811Z
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
var CSS = "/* Einbau: Seiten-CSS bleibt draußen, nur Schrift-Variablen und Farben gelten hier */\n:host{all:initial;display:block;--sbw-z:4}\n\n/* Layout: Leitstand oben (Powder-Meter · Wetterumschwünge · Jetzt), darunter Tagesstreifen, danach Fachpanels untereinander */\n:host{\n  --bg:#EBF0F4; --surface:#FFFFFF; --surface-2:#F4F7FA; --ink:#0F1D2B; --muted:#5A6B7C; --line:#D2DBE3; --grid:#E6ECF1;\n  --accent:#E2560F; --accent-ink:#FFFFFF; --accent-soft:#FCE3D4;\n  --snow:#2B66D0; --snow-soft:#CFE0FA; --rain:#12927F; --warm:#CC3D4E; --wind:#7553C4;\n  --ok:#2E8F40; --warn:#C77700; --crit:#C9303C;\n  --night:rgba(15,29,43,.045); --shadow:0 10px 30px rgba(15,29,43,.12);\n  --map-filter:none;\n  --font-display:'Barlow Condensed','Arial Narrow',Arial,sans-serif;\n  --font-body:'Barlow','Helvetica Neue',Arial,sans-serif;\n  --font-mono:'IBM Plex Mono',ui-monospace,Menlo,Consolas,monospace;\n  --av1:#CCFF66; --av2:#FFFF00; --av3:#FF9900; --av4:#FF0000; --av5:#1A1A1A;\n  color-scheme:light;\n}\n@media (prefers-color-scheme:dark){:host(:not([data-theme=\"light\"])){\n  --bg:#0A121B; --surface:#111C27; --surface-2:#162330; --ink:#E3EBF2; --muted:#8B9CAD; --line:#223241; --grid:#1A2733;\n  --accent:#FF7A3D; --accent-ink:#1B0B02; --accent-soft:#3A2116;\n  --snow:#7EAEFF; --snow-soft:#1D3354; --rain:#3CC6B1; --warm:#FF6E7D; --wind:#B39CFF;\n  --ok:#5DC46F; --warn:#F2A93B; --crit:#FF5E69;\n  --night:rgba(0,0,0,.22); --shadow:0 10px 30px rgba(0,0,0,.45);\n  --map-filter:invert(.9) hue-rotate(180deg) saturate(.5) brightness(.95);\n  color-scheme:dark;\n}}\n:host([data-theme=\"dark\"]){\n  --bg:#0A121B; --surface:#111C27; --surface-2:#162330; --ink:#E3EBF2; --muted:#8B9CAD; --line:#223241; --grid:#1A2733;\n  --accent:#FF7A3D; --accent-ink:#1B0B02; --accent-soft:#3A2116;\n  --snow:#7EAEFF; --snow-soft:#1D3354; --rain:#3CC6B1; --warm:#FF6E7D; --wind:#B39CFF;\n  --ok:#5DC46F; --warn:#F2A93B; --crit:#FF5E69;\n  --night:rgba(0,0,0,.22); --shadow:0 10px 30px rgba(0,0,0,.45);\n  --map-filter:invert(.9) hue-rotate(180deg) saturate(.5) brightness(.95);\n  color-scheme:dark;\n}\n*{box-sizing:border-box}\n[hidden]{display:none!important}\n\n\n.sbw{margin:0;background:var(--bg);color:var(--ink);font:400 15px/1.5 var(--font-body);font-variant-numeric:tabular-nums}\na{color:var(--snow)}\nbutton,select,input{font:inherit;color:inherit}\n:focus-visible{outline:2px solid var(--accent);outline-offset:2px}\n.wrap{max-width:1320px;margin:0 auto;padding-left:max(16px,env(safe-area-inset-left,0px));padding-right:max(16px,env(safe-area-inset-right,0px))}\n.mono{font-family:var(--font-mono)}\n.muted{color:var(--muted)}\n\n/* Kopf */\n.masthead{background:var(--surface);border-bottom:1px solid var(--line)}\n.mast{display:flex;flex-wrap:wrap;gap:14px 28px;align-items:flex-end;justify-content:space-between;padding-block:20px 16px}\n.eyebrow{font:500 11.5px/1.3 var(--font-mono);letter-spacing:.07em;text-transform:uppercase;color:var(--muted);margin-bottom:6px}\nh1{font:700 clamp(32px,5cqi,50px)/.92 var(--font-display);letter-spacing:.005em;text-transform:uppercase;margin:0;text-wrap:balance}\nh1 .tick{color:var(--accent)}\n.mast-meta{display:flex;flex-direction:column;align-items:flex-end;gap:8px;min-width:0}\n.stamp{font:500 12px/1.4 var(--font-mono);color:var(--muted);text-align:right}\n.stamp.loading::before{content:\"\";display:inline-block;width:8px;height:8px;border-radius:50%;background:var(--accent);margin-right:8px;animation:pulse 1s infinite alternate}\n@keyframes pulse{from{opacity:.25}to{opacity:1}}\n.actions{display:flex;gap:6px;flex-wrap:wrap;justify-content:flex-end}\n.btn{appearance:none;border:1px solid var(--line);background:var(--surface-2);border-radius:7px;padding:7px 12px;font:600 13px/1 var(--font-display);letter-spacing:.06em;text-transform:uppercase;cursor:pointer}\n.btn:hover{border-color:var(--muted)}\n.btn.primary{background:var(--accent);border-color:var(--accent);color:var(--accent-ink)}\n.btn[aria-pressed=\"true\"]{background:var(--ink);color:var(--surface);border-color:var(--ink)}\n@container sbw (max-width:620px){.mast-meta{align-items:flex-start}.stamp{text-align:left}.actions{justify-content:flex-start}}\n\n/* --sbw-top: Höhe des Seitenkopfs der Homepage (setzt der Einbau), --sbw-z: unter dem Menü der Homepage */\n.subnav{position:sticky;top:calc(env(safe-area-inset-top,0px) + var(--sbw-top,0px));z-index:var(--sbw-z,30);background:var(--surface);border-bottom:1px solid var(--line)}\n\n.subnav .wrap{display:flex;gap:2px;overflow-x:auto;scrollbar-width:none}\n.subnav .wrap::-webkit-scrollbar{display:none}\n.subnav a{font:600 13.5px/1 var(--font-display);letter-spacing:.07em;text-transform:uppercase;color:var(--muted);text-decoration:none;padding:13px 10px 11px;white-space:nowrap;border-bottom:2px solid transparent}\n.subnav a:hover,.subnav a.on{color:var(--ink);border-bottom-color:var(--accent)}\n.navsep{font:500 10.5px/1 var(--font-mono);letter-spacing:.07em;text-transform:uppercase;color:var(--muted);padding:15px 4px 11px 14px;margin-left:6px;border-left:1px solid var(--line);white-space:nowrap;opacity:.8}\n\n/* Detailbereich: zugeklappte Bereiche mit Kurzfassung */\n.divider{display:flex;flex-wrap:wrap;align-items:flex-end;justify-content:space-between;gap:10px 18px;border-top:2px solid var(--ink);padding-top:16px}\n.divider h2{font:600 25px/1.05 var(--font-display);letter-spacing:.03em;text-transform:uppercase;margin:0}\n.divider p{margin:4px 0 0;color:var(--muted);font-size:14px}\n.folds{display:flex;flex-direction:column;border-bottom:1px solid var(--line)}\n.fold{border-top:1px solid var(--line)}\n.fold-h{position:relative;display:grid;grid-template-columns:minmax(0,210px) minmax(0,1fr) auto;align-items:center;gap:6px 18px;padding:15px 0;border-radius:6px}\n.fold-h h2{margin:0;font:600 21px/1.1 var(--font-display);letter-spacing:.03em;text-transform:uppercase}\n.fold-btn{appearance:none;border:0;background:none;padding:0;margin:0;font:inherit;letter-spacing:inherit;text-transform:inherit;color:inherit;cursor:pointer;text-align:left}\n.fold-btn::after{content:\"\";position:absolute;inset:0}\n.fold-btn:focus-visible{outline:none}\n.fold-h:has(.fold-btn:focus-visible){outline:2px solid var(--accent);outline-offset:2px}\n.fold-sum{color:var(--muted);font-size:14px;line-height:1.4;min-width:0}\n.fold-i{font:600 12px/1 var(--font-display);letter-spacing:.07em;text-transform:uppercase;border:1px solid var(--line);border-radius:99px;padding:6px 12px;background:var(--surface);white-space:nowrap}\n.fold-h:hover .fold-i{border-color:var(--muted)}\n.fold.open .fold-i{background:var(--ink);color:var(--surface);border-color:var(--ink)}\n.fold-b{padding-bottom:24px}\n.fold-desc{margin:0 0 12px;color:var(--muted);font-size:14px;max-width:72ch}\n@container sbw (max-width:700px){.fold-h{grid-template-columns:minmax(0,1fr) auto}.fold-sum{grid-column:1/-1;grid-row:2}}\n.linkbtn{appearance:none;border:0;background:none;padding:10px 0 0;color:var(--snow);font:600 13px/1.2 var(--font-display);letter-spacing:.06em;text-transform:uppercase;cursor:pointer;text-align:left}\n.linkbtn:hover{color:var(--accent)}\n\n/* Vorhersage-Band: ein Tag pro Spalte, Zeilen = Piktogramm, Tageszeiten, Temperaturkurve, Neuschnee, Schneefallgrenze, Wind, Powder */\n:host{--sun:#EFA51A;--moon:#AEBBCB;--cloud:#C6D1DC;--cloud-dk:#8E9EAF}\n@media (prefers-color-scheme:dark){:host(:not([data-theme=\"light\"])){--sun:#FFC24A;--moon:#C6D1DE;--cloud:#6A7B8D;--cloud-dk:#45556A}}\n:host([data-theme=\"dark\"]){--sun:#FFC24A;--moon:#C6D1DE;--cloud:#6A7B8D;--cloud-dk:#45556A}\n.fc-card{padding:10px 8px 12px}\n.fc-scroll{overflow-x:auto;overscroll-behavior-x:contain}\n.fc{display:grid;grid-template-columns:repeat(var(--n,5),minmax(96px,1fr));min-width:calc(var(--n,5) * 96px)}\n.fc>.c{padding:7px 6px;text-align:center;min-width:0}\n.fc>.cb{border-left:1px solid var(--grid)}\n.fc>.rz{background:var(--surface-2)}\n.fc-d b{display:block;font:600 15px/1.1 var(--font-display);letter-spacing:.06em;text-transform:uppercase}\n.fc-d span{font:500 11px var(--font-mono);color:var(--muted)}\n.fc-i svg{width:68px;height:68px;display:block;margin:0 auto}\n.fc-i span{display:block;font-size:12.5px;line-height:1.25;color:var(--muted);min-height:2.5em}\n.fc-p{display:flex;justify-content:center;gap:2px}\n.fc-p div{display:flex;flex-direction:column;align-items:center;font:500 9.5px/1.1 var(--font-mono);color:var(--muted)}\n.fc-p svg{width:32px;height:32px}\n@container sbw (max-width:560px){.fc>.c{padding:7px 3px}.fc-p{gap:0}.fc-p svg{width:29px;height:29px}}\n#fcLegend svg{width:14px;height:14px;vertical-align:-2px;margin-right:4px;color:var(--muted)}\n.fc>.fc-t{grid-column:1/-1;padding:0}\n.fc-t svg{display:block}\n.fc-v{display:flex;align-items:center;justify-content:center;gap:5px;flex-wrap:wrap;font:600 15px/1.2 var(--font-display);letter-spacing:.02em}\n.fc-v svg{width:16px;height:16px;flex:0 0 16px}\n.fc-v small{flex-basis:100%;font:400 11.5px/1.3 var(--font-body);color:var(--muted);letter-spacing:0}\n.fc-v.muted{color:var(--muted);font-weight:500}\n.fc-v.warn{color:var(--crit)}\n.fc .pw{font:600 11.5px var(--font-mono);padding:3px 8px;border-radius:99px;border:1px solid var(--line);color:var(--muted)}\n.fc .pw.hot{background:var(--accent);border-color:var(--accent);color:var(--accent-ink)}\n.fc .pw.mid{border-color:var(--accent);color:var(--accent)}\n\n/* Beschneiung: Stufen der Feuchttemperatur */\n:host{--sn0:#EEF2F6;--sn1:#D3E3FA;--sn2:#97BCF1;--sn3:#4F86DD;--sn4:#1F4A9E}\n@media (prefers-color-scheme:dark){:host(:not([data-theme=\"light\"])){--sn0:#16222E;--sn1:#1B304D;--sn2:#28508F;--sn3:#4879CF;--sn4:#9CC0FF}}\n:host([data-theme=\"dark\"]){--sn0:#16222E;--sn1:#1B304D;--sn2:#28508F;--sn3:#4879CF;--sn4:#9CC0FF}\n.sn-now{display:grid;gap:12px;grid-template-columns:repeat(auto-fit,minmax(min(100%,230px),1fr));margin-bottom:12px}\n.snc{border-top:4px solid var(--c,var(--line))}\n.snc .lv{font:500 11px/1.2 var(--font-mono);letter-spacing:.05em;text-transform:uppercase;color:var(--muted)}\n.snc .tw{font:700 30px/1.05 var(--font-display);margin-top:4px}\n.snc .tw small{font:500 12px var(--font-mono);color:var(--muted);margin-left:6px}\n.snc .meta{font-size:12.5px;color:var(--muted);margin-top:2px}\n.snchips{display:flex;gap:6px;flex-wrap:wrap;margin-top:8px}\n.chip.yes{color:var(--ok);border-color:color-mix(in srgb,var(--ok) 45%,transparent);background:color-mix(in srgb,var(--ok) 10%,var(--surface))}\n.chip.no{opacity:.75}\n.chip.att{color:var(--warn);border-color:color-mix(in srgb,var(--warn) 45%,transparent);background:color-mix(in srgb,var(--warn) 10%,var(--surface))}\n.sn-tools{display:grid;gap:12px;grid-template-columns:repeat(auto-fit,minmax(min(100%,330px),1fr));margin-top:12px}\n.sn-form{display:grid;gap:10px}\n.sn-calc{grid-template-columns:repeat(2,minmax(0,1fr))}\n.frow label.chk{flex-direction:row;align-items:center;gap:8px;text-transform:none;letter-spacing:0;font:500 13.5px var(--font-body);color:var(--ink)}\n.frow label.chk input{width:auto;accent-color:var(--accent)}\n.calc-out{margin-top:12px;display:flex;flex-direction:column;gap:6px}\n.calc-out .big{font:700 28px var(--font-display)}\n.sn-info{display:grid;gap:12px;grid-template-columns:repeat(auto-fit,minmax(min(100%,290px),1fr));margin-top:12px}\n.sn-info h4{font:600 15px/1.1 var(--font-display);letter-spacing:.06em;text-transform:uppercase;margin:0 0 8px}\n.sn-info ul{margin:0;padding-left:18px;font-size:13.5px;line-height:1.45}\n.sn-info li+li{margin-top:6px}\n.src{font-size:12px;color:var(--muted);margin:10px 0 0}\n#snNights td{text-align:left;white-space:normal;min-width:118px;vertical-align:top}\n#snNights td small{display:block;color:var(--muted);font-size:11.5px;line-height:1.35}\n#snNights td.none{color:var(--muted)}\n#snNights td .hrs{font:600 16px var(--font-display)}\n#snNights td.best{background:color-mix(in srgb,var(--snow) 9%,transparent)}\n\n.main{display:flex;flex-direction:column;gap:34px;padding-block:22px 48px}\nsection{scroll-margin-top:calc(56px + var(--sbw-top,0px));min-width:0}\n.sec-h{display:flex;flex-wrap:wrap;align-items:baseline;justify-content:space-between;gap:6px 18px;margin-bottom:12px}\n.sec-h h2{font:600 25px/1.05 var(--font-display);letter-spacing:.03em;text-transform:uppercase;margin:0}\n.sec-h p{margin:0;color:var(--muted);font-size:14px;max-width:72ch}\n.card{background:var(--surface);border:1px solid var(--line);border-radius:10px;padding:16px;min-width:0}\n.card-h{display:flex;align-items:baseline;justify-content:space-between;gap:10px;margin-bottom:10px;flex-wrap:wrap}\n.card-h h3{font:600 17px/1.1 var(--font-display);letter-spacing:.06em;text-transform:uppercase;margin:0}\n.chip{display:inline-flex;align-items:center;gap:6px;font:500 11.5px/1 var(--font-mono);letter-spacing:.03em;padding:5px 8px;border-radius:99px;background:var(--surface-2);border:1px solid var(--line);color:var(--muted);white-space:nowrap}\n.note{font-size:13px;color:var(--muted);margin:10px 0 0}\n.empty{color:var(--muted);font-size:14px;padding:18px 4px}\n.err{color:var(--crit)}\n\n/* Leitstand */\n.lage{display:grid;gap:16px;grid-template-columns:minmax(0,1fr);align-items:start}\n@container sbw (min-width:780px){.lage{grid-template-columns:minmax(0,1fr) minmax(0,1fr)}.lage .meter{grid-column:1/-1}}\n@container sbw (min-width:1200px){.lage{grid-template-columns:minmax(0,1.32fr) minmax(0,1fr) minmax(0,1fr)}.lage .meter{grid-column:auto}}\n.meter{position:relative;overflow:hidden}\n.meter::after{content:\"\";position:absolute;inset:0 0 auto 0;height:4px;background:var(--accent)}\n.meter-top{display:flex;gap:6px 18px;align-items:flex-end;justify-content:center;flex-wrap:wrap}\n.gauge{flex:1 1 190px;max-width:340px;min-width:0}\n.gauge svg,.stake svg{display:block;width:100%;height:auto}\n.stake{flex:0 0 112px}\n@container sbw (max-width:480px){.meter-top{flex-wrap:nowrap;gap:6px}.stake{flex-basis:86px}}\n@container sbw (max-width:480px){.alert{grid-template-columns:minmax(0,1fr)}.alert .x{grid-column:1}}\n.verdict{text-align:center;font:700 22px/1.1 var(--font-display);letter-spacing:.04em;text-transform:uppercase;margin:2px 0 4px}\n.verdict-sub{text-align:center;color:var(--muted);font-size:14px;margin:0 0 12px}\n.facts{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%,200px),1fr));gap:8px}\n.fact{background:var(--surface);padding:9px 11px;min-width:0;border:1px solid var(--line);border-radius:8px}\n.fact .k{font:500 11px/1.2 var(--font-mono);letter-spacing:.05em;text-transform:uppercase;color:var(--muted)}\n.fact .v{font:600 18px/1.25 var(--font-display);letter-spacing:.02em;margin-top:3px}\n.fact .s{font-size:12.5px;color:var(--muted);line-height:1.35}\n.fact.warnf .v{color:var(--crit)}\n.sysbars{margin-top:12px;display:grid;gap:5px}\n.sysbar{display:grid;grid-template-columns:minmax(0,205px) minmax(0,1fr) 44px;gap:8px;align-items:center;font-size:12.5px}\n.sysbar .lbl{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:var(--muted)}\n.sysbar .trk{height:8px;background:var(--surface-2);border-radius:4px;overflow:hidden;border:1px solid var(--line)}\n.sysbar .fill{height:100%;background:var(--accent)}\n.sysbar .pct{font:500 12px var(--font-mono);text-align:right}\n\n.alerts{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:8px}\n.alert{display:grid;grid-template-columns:auto minmax(0,1fr);gap:4px 10px;padding:10px 11px;border:1px solid var(--line);border-left:4px solid var(--c,var(--muted));border-radius:8px;background:var(--surface)}\n.alert .tag{font:600 11px/1 var(--font-mono);letter-spacing:.05em;text-transform:uppercase;color:var(--c);padding-top:3px;white-space:nowrap}\n.alert .t{font:600 16px/1.15 var(--font-display);letter-spacing:.03em}\n.alert .x{grid-column:2;font-size:13.5px;color:var(--muted);line-height:1.4}\n.a-powder{--c:var(--accent)} .a-snow{--c:var(--snow)} .a-change{--c:var(--wind)} .a-warn{--c:var(--crit)} .a-info{--c:var(--rain)}\n.a-powder{background:var(--accent-soft)}\n\n.profile svg{display:block;width:100%;height:auto}\n.kv{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px 14px;margin-top:10px}\n.kv .k{font:500 11px/1.2 var(--font-mono);letter-spacing:.05em;text-transform:uppercase;color:var(--muted)}\n.kv .v{font:600 21px/1.15 var(--font-display);letter-spacing:.02em}\n.kv .s{font-size:12px;color:var(--muted)}\n\n/* Powder-Kalender */\n.cal{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}\n@container sbw (min-width:560px){.cal{grid-template-columns:repeat(5,minmax(0,1fr))}}\n@container sbw (min-width:1180px){.cal{grid-template-columns:repeat(10,minmax(0,1fr))}}\n.day{appearance:none;text-align:left;cursor:pointer;background:var(--surface);border:1px solid var(--line);border-radius:9px;padding:10px 10px 9px;display:flex;flex-direction:column;gap:5px;min-width:0;position:relative}\n.day:hover{border-color:var(--muted)}\n.day[aria-pressed=\"true\"]{border-color:var(--accent);box-shadow:inset 0 0 0 1px var(--accent)}\n.day .dn{font:600 14px/1 var(--font-display);letter-spacing:.06em;text-transform:uppercase}\n.day .dd{font:500 11px/1 var(--font-mono);color:var(--muted)}\n.day .pp{font:700 30px/1 var(--font-display)}\n.day .pp small{font-size:15px;font-weight:600;margin-left:1px}\n.day .bar{height:6px;border-radius:3px;background:var(--surface-2);overflow:hidden;border:1px solid var(--line)}\n.day .bar i{display:block;height:100%;background:var(--accent)}\n.day .sn{font:600 15px/1.1 var(--font-display);color:var(--snow)}\n.day .sn span{font:400 11.5px var(--font-mono);color:var(--muted)}\n.day .mt{font:400 11.5px/1.35 var(--font-mono);color:var(--muted)}\n.day.hot .pp{color:var(--accent)}\n.day .badge{position:absolute;top:8px;right:8px;font:600 10px/1 var(--font-mono);letter-spacing:.05em;text-transform:uppercase;padding:3px 5px;border-radius:4px;background:var(--accent);color:var(--accent-ink)}\n\n/* Charts */\n.toolbar{display:flex;flex-wrap:wrap;gap:6px;align-items:center;margin-bottom:10px}\n.toolbar .lab{font:500 11px var(--font-mono);letter-spacing:.05em;text-transform:uppercase;color:var(--muted);margin-right:4px}\n.seg{display:inline-flex;border:1px solid var(--line);border-radius:7px;overflow:hidden}\n.seg button{appearance:none;border:0;background:var(--surface-2);padding:6px 10px;font:600 12.5px/1 var(--font-display);letter-spacing:.05em;cursor:pointer;color:var(--muted)}\n.seg button+button{border-left:1px solid var(--line)}\n.seg button[aria-pressed=\"true\"]{background:var(--ink);color:var(--surface)}\n.chart{width:100%;min-width:0;position:relative}\nsvg.tc{display:block;max-width:100%;height:auto;touch-action:pan-y}\n.tc text{fill:var(--muted);font:500 10.5px var(--font-mono)}\n.tc .val{fill:var(--ink);font:500 11px var(--font-mono)}\n.tc .pt{fill:var(--ink);font:600 12.5px var(--font-display);letter-spacing:.06em;text-transform:uppercase}\n.tc .gl{stroke:var(--grid);stroke-width:1}\n.tc .night{fill:var(--night)}\n.tc .mid{stroke:var(--line);stroke-width:1}\n.tc .now{stroke:var(--accent);stroke-width:1.5;stroke-dasharray:4 3}\n.tc .nowt{fill:var(--accent);font-weight:600}\n.tc .xh-l{stroke:var(--ink);stroke-width:1;opacity:.5}\n.tc .ref{stroke:var(--muted);stroke-width:1;stroke-dasharray:2 3}\n.tc .reft{fill:var(--muted)}\n.tc .ref-thr{stroke:var(--accent);stroke-width:1.2;stroke-dasharray:5 3}\n.ln{fill:none;stroke-linejoin:round;stroke-linecap:round}\n.l-tb{stroke:var(--ink);stroke-width:2}\n.l-tt{stroke:var(--warm);stroke-width:1.6;stroke-dasharray:5 4}\n.b-ens{fill:var(--snow-soft);opacity:.85}\n.l-sl{stroke:var(--snow);stroke-width:2}\n.l-fz{stroke:var(--warm);stroke-width:1.4;stroke-dasharray:4 3}\n.r-snow{fill:var(--snow)} .r-rain{fill:var(--rain)}\n.l-lv1{stroke:var(--warm);stroke-width:2} .l-lv2{stroke:var(--rain);stroke-width:2} .l-lv3{stroke:var(--snow);stroke-width:2}\n.l-wt{stroke:var(--wind);stroke-width:1.3;opacity:.5}\n.l-cum{stroke:var(--accent);stroke-width:2.2}\n.l-last{stroke:var(--muted);stroke-width:1.5;stroke-dasharray:5 4}\n.l-w{stroke:var(--wind);stroke-width:1.8} .l-g{stroke:var(--wind);stroke-width:1.2;stroke-dasharray:3 3;opacity:.8}\n.arr{stroke:var(--muted);stroke-width:1.4;fill:none}\n.l-med{stroke:var(--ink);stroke-width:2.4}\n.b-q{fill:var(--accent);opacity:.16}\n.l-q{stroke:var(--accent);stroke-width:1;stroke-dasharray:3 3}\n.l-det{stroke:var(--ink);stroke-width:1.6;stroke-dasharray:6 3}\n.pl{fill:none;stroke-width:1;opacity:.28}\n.pl.s-hr,.pl.s-gd{stroke:var(--muted);opacity:.6}\n.s-ecmwf_ifs025{stroke:#2B66D0;--sc:#2B66D0} .s-ecmwf_aifs025{stroke:#7553C4;--sc:#7553C4} .s-gfs025{stroke:#12927F;--sc:#12927F} .s-icon_eu_eps{stroke:#D07A00;--sc:#D07A00} .s-icon_d2_eps{stroke:#C9303C;--sc:#C9303C}\n:host([data-theme=\"dark\"]) .s-ecmwf_ifs025{stroke:#7EAEFF;--sc:#7EAEFF}\n:host([data-theme=\"dark\"]) .s-ecmwf_aifs025{stroke:#B39CFF;--sc:#B39CFF}\n:host([data-theme=\"dark\"]) .s-gfs025{stroke:#3CC6B1;--sc:#3CC6B1}\n:host([data-theme=\"dark\"]) .s-icon_eu_eps{stroke:#F2A93B;--sc:#F2A93B}\n:host([data-theme=\"dark\"]) .s-icon_d2_eps{stroke:#FF6E7D;--sc:#FF6E7D}\n@media (prefers-color-scheme:dark){:host(:not([data-theme=\"light\"])) .s-ecmwf_ifs025{stroke:#7EAEFF;--sc:#7EAEFF}:host(:not([data-theme=\"light\"])) .s-ecmwf_aifs025{stroke:#B39CFF;--sc:#B39CFF}:host(:not([data-theme=\"light\"])) .s-gfs025{stroke:#3CC6B1;--sc:#3CC6B1}:host(:not([data-theme=\"light\"])) .s-icon_eu_eps{stroke:#F2A93B;--sc:#F2A93B}:host(:not([data-theme=\"light\"])) .s-icon_d2_eps{stroke:#FF6E7D;--sc:#FF6E7D}}\n.legend{display:flex;flex-wrap:wrap;gap:6px 14px;font-size:12.5px;color:var(--muted);margin-top:8px}\n.legend i{display:inline-block;width:16px;height:0;border-top:2px solid currentColor;vertical-align:middle;margin-right:5px}\n.legend .sw{display:inline-block;width:12px;height:10px;vertical-align:middle;margin-right:5px;border-radius:2px}\n.syschip{appearance:none;cursor:pointer;display:inline-flex;align-items:center;gap:6px;border:1px solid var(--line);background:var(--surface);border-radius:99px;padding:5px 10px;font:500 12px/1 var(--font-body)}\n.syschip i{width:10px;height:10px;border-radius:50%;background:var(--sc)}\n.syschip[aria-pressed=\"false\"]{opacity:.45}\n.syschip[aria-pressed=\"false\"] i{background:transparent;border:1.5px solid var(--sc)}\n.grid2{display:grid;gap:16px;grid-template-columns:minmax(0,1fr)}\n@container sbw (min-width:1000px){.grid2{grid-template-columns:minmax(0,1fr) minmax(0,1fr)}}\n\n#tip{position:fixed;z-index:60;pointer-events:none;background:var(--surface);color:var(--ink);border:1px solid var(--line);border-radius:8px;padding:8px 10px;font:400 12.5px/1.45 var(--font-body);box-shadow:var(--shadow);max-width:290px}\n#tip b{font:600 13px var(--font-display);letter-spacing:.05em;text-transform:uppercase}\n#tip .r{display:flex;justify-content:space-between;gap:14px}\n#tip .r span:last-child{font-family:var(--font-mono);font-size:12px}\n\n/* Tabellen */\n.tablewrap{overflow-x:auto;border:1px solid var(--line);border-radius:9px;background:var(--surface)}\ntable{border-collapse:collapse;width:100%;font-size:13.5px}\nth,td{padding:7px 9px;text-align:right;white-space:nowrap;border-bottom:1px solid var(--grid)}\nth:first-child,td:first-child{text-align:left;position:sticky;left:0;background:var(--surface)}\nthead th{font:600 12.5px var(--font-display);letter-spacing:.06em;text-transform:uppercase;color:var(--muted);background:var(--surface-2)}\nthead th:first-child{background:var(--surface-2)}\ntbody tr.grp td{font:600 12px var(--font-mono);letter-spacing:.05em;text-transform:uppercase;color:var(--muted);background:var(--surface-2);text-align:left}\ntd.m small{display:block;color:var(--muted);font-size:11.5px}\ntd.h{font-family:var(--font-mono);font-size:12.5px}\ntd.h0{color:var(--muted)}\ntd.h1{background:color-mix(in srgb,var(--snow) 10%,transparent)}\ntd.h2{background:color-mix(in srgb,var(--snow) 24%,transparent)}\ntd.h3{background:color-mix(in srgb,var(--snow) 42%,transparent);font-weight:600}\ntd.h4{background:var(--accent);color:var(--accent-ink);font-weight:600}\ntd.na{color:var(--line)}\n.tablewrap tr.kons td{font-weight:600;border-bottom:2px solid var(--line)}\n.tablewrap tr.kons td:first-child{box-shadow:inset 3px 0 0 var(--accent)}\n.tablewrap tr.grp-row td{background:var(--surface-2);cursor:pointer}\n.tablewrap tr.grp-row:hover td{background:color-mix(in srgb,var(--surface-2) 70%,var(--line))}\n.gbtn{appearance:none;border:0;background:none;padding:0;cursor:pointer;color:var(--ink);font:600 14px/1.2 var(--font-display);letter-spacing:.05em;text-transform:uppercase;display:inline-flex;gap:8px;align-items:center}\n.gbtn .chev{display:inline-grid;place-items:center;width:18px;height:18px;border:1px solid var(--muted);border-radius:4px;font:600 12px/1 var(--font-mono)}\n.gbtn .gc{font:500 11px var(--font-mono);color:var(--muted);letter-spacing:0}\ntd.m.sub{padding-left:36px}\n\n/* Stationen */\n.stations{display:grid;gap:12px;grid-template-columns:repeat(auto-fill,minmax(min(100%,250px),1fr))}\n.st .nm{font:600 18px/1.1 var(--font-display);letter-spacing:.03em}\n.st .el{font:500 11.5px var(--font-mono);color:var(--muted)}\n.st .big{font:700 34px/1 var(--font-display);margin:8px 0 2px}\n.st .rows{display:grid;grid-template-columns:auto 1fr;gap:2px 12px;font-size:13px}\n.st .rows span:nth-child(odd){color:var(--muted)}\n.st .rows span:nth-child(even){text-align:right;font-family:var(--font-mono);font-size:12.5px}\n.spark{display:block;width:100%;height:36px;margin-top:8px}\n\n/* Saison */\n.kpis{display:grid;gap:10px;grid-template-columns:repeat(auto-fit,minmax(min(100%,190px),1fr));margin-bottom:12px}\n.kpi .k{font:500 11px/1.2 var(--font-mono);letter-spacing:.05em;text-transform:uppercase;color:var(--muted)}\n.kpi .v{font:700 28px/1.05 var(--font-display);margin-top:4px}\n.kpi .s{font-size:12.5px;color:var(--muted)}\n.seas{display:grid;gap:10px}\n.seas-row{display:grid;grid-template-columns:120px minmax(0,1fr);gap:10px;align-items:center}\n.seas-row .lbl{font:600 13px var(--font-display);letter-spacing:.05em;text-transform:uppercase}\n.seas-cells{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:4px}\n.sc{border-radius:6px;padding:6px 4px;text-align:center;border:1px solid var(--line)}\n.sc .mo{font:500 11px var(--font-mono);color:var(--muted)}\n.sc .va{font:600 15px var(--font-display)}\n@container sbw (max-width:560px){.seas-row{grid-template-columns:1fr}}\n\n/* Karten */\n#radar{height:440px;border-radius:9px;border:1px solid var(--line);overflow:hidden;background:var(--surface-2);isolation:isolate}\n.basetiles img{filter:var(--map-filter)}\n.leaflet-container{font:inherit}\n.leaflet-control-attribution{font-size:10px!important;line-height:1.3}\n.radarbar{display:flex;align-items:center;gap:10px;margin-top:8px;flex-wrap:wrap}\n.windy{width:100%;height:440px;border:1px solid var(--line);border-radius:9px;background:var(--surface-2);display:block}\n\n/* Lawine */\n.aval{display:grid;gap:14px;grid-template-columns:minmax(0,1fr)}\n@container sbw (min-width:900px){.aval{grid-template-columns:minmax(0,320px) minmax(0,1fr)}}\n.lvl{display:flex;flex-direction:column;gap:8px}\n.lvl-row{display:grid;grid-template-columns:62px minmax(0,1fr);align-items:center;gap:12px}\n.lvl-n{width:62px;height:62px;border-radius:8px;display:grid;place-items:center;font:700 34px var(--font-display);color:#111;border:1px solid rgba(0,0,0,.15)}\n.lvl-t{font:600 18px/1.15 var(--font-display);letter-spacing:.03em}\n.lvl-t small{display:block;font:400 12.5px var(--font-body);color:var(--muted);letter-spacing:0}\n.probs{display:flex;flex-wrap:wrap;gap:6px;margin-top:6px}\n.prose{max-width:72ch}\n.prose p{margin:.3em 0 .8em}\n.iframe-box{margin-top:12px}\n.iframe-box iframe{width:100%;height:640px;border:1px solid var(--line);border-radius:9px;background:#fff}\n\n/* Links & Methodik */\n.links{display:grid;gap:14px;grid-template-columns:repeat(auto-fill,minmax(min(100%,290px),1fr))}\n.links h3{font:600 15px/1.1 var(--font-display);letter-spacing:.07em;text-transform:uppercase;margin:0 0 8px}\n.links ul{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:7px}\n.links a{text-decoration:none;color:var(--ink);font-weight:500}\n.links a:hover{color:var(--accent)}\n.links li span{display:block;font-size:12.5px;color:var(--muted);line-height:1.35}\ndetails.md{border:1px solid var(--line);border-radius:9px;background:var(--surface);padding:0 16px}\ndetails.md+details.md{margin-top:8px}\ndetails.md summary{cursor:pointer;padding:13px 0;font:600 16px var(--font-display);letter-spacing:.05em;text-transform:uppercase;list-style:none;display:flex;gap:10px;align-items:baseline}\ndetails.md summary::-webkit-details-marker{display:none}\ndetails.md summary::before{content:\"+\";font:500 15px var(--font-mono);color:var(--accent);width:12px}\ndetails.md[open] summary::before{content:\"–\"}\ndetails.md .prose{padding-bottom:12px}\n.wtab td,.wtab th{text-align:left}\n.status{list-style:none;margin:0;padding:0;display:grid;gap:4px;grid-template-columns:repeat(auto-fill,minmax(min(100%,330px),1fr));font-size:13px}\n.status li{display:flex;gap:8px;align-items:baseline}\n.status .dot{width:8px;height:8px;border-radius:50%;flex:0 0 8px;transform:translateY(-1px)}\n.dot.ok{background:var(--ok)} .dot.err{background:var(--crit)} .dot.na{background:var(--line)}\nfooter{border-top:1px solid var(--line);background:var(--surface);padding-block:18px 26px;font-size:12.5px;color:var(--muted)}\nfooter p{margin:.3em 0;max-width:110ch}\n\n/* Einstellungen */\ndialog{border:1px solid var(--line);border-radius:12px;background:var(--surface);color:var(--ink);padding:0;width:min(560px,calc(100vw - 32px));box-shadow:var(--shadow)}\ndialog::backdrop{background:rgba(8,14,20,.45)}\ndialog form{padding:18px}\ndialog h3{font:600 20px var(--font-display);letter-spacing:.05em;text-transform:uppercase;margin:0 0 12px}\n.fgrid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px}\n.fgrid label,.frow label{display:flex;flex-direction:column;gap:4px;font:500 11.5px var(--font-mono);letter-spacing:.04em;text-transform:uppercase;color:var(--muted)}\n.fgrid input,.frow input{border:1px solid var(--line);border-radius:7px;background:var(--surface-2);padding:8px 9px;font:500 14px var(--font-mono);color:var(--ink);text-transform:none;width:100%}\nfieldset{border:1px solid var(--line);border-radius:9px;margin:0 0 12px;padding:10px 12px 12px}\nlegend{font:600 13px var(--font-display);letter-spacing:.06em;text-transform:uppercase;padding:0 4px}\n.frow{display:grid;gap:10px}\n.dlg-actions{display:flex;justify-content:flex-end;gap:8px;margin-top:14px;flex-wrap:wrap}\n@container sbw (max-width:480px){.fgrid{grid-template-columns:1fr 1fr}}\n\n.sbw{container:sbw/inline-size;-webkit-text-size-adjust:100%;text-align:left}\n";
var HTML = "<header class=\"masthead\">\n  <div class=\"wrap mast\">\n    <div>\n      <div class=\"eyebrow\" id=\"eyebrow\">Flachauwinkl · Kleinarl · Radstädter Tauern Nord</div>\n      <h1>Shuttleberg <span class=\"tick\">/</span> Wetterwarte</h1>\n    </div>\n    <div class=\"mast-meta\">\n      <div class=\"stamp loading\" id=\"stamp\">Lade Daten …</div>\n      <div class=\"actions\">\n        <button class=\"btn primary\" id=\"btnRefresh\" type=\"button\">Aktualisieren</button>\n        <button class=\"btn\" id=\"btnSettings\" type=\"button\">Einstellungen</button>\n        <button class=\"btn\" id=\"btnTheme\" type=\"button\" aria-label=\"Darstellung umschalten\">Auto</button>\n      </div>\n    </div>\n  </div>\n</header>\n<nav class=\"subnav\" aria-label=\"Bereiche\"><div class=\"wrap\">\n  <a href=\"#lage\">Lage</a><a href=\"#vorhersage\">Vorhersage</a><a href=\"#kalender\">Powder-Kalender</a><a href=\"#lawine\">Lawine</a><a href=\"#beschneiung\">Beschneiung</a><span class=\"navsep\">Details</span><a href=\"#modelle\">Modelle</a><a href=\"#meteogramm\">Meteogramm</a><a href=\"#ensemble\">Ensemble</a><a href=\"#messwerte\">Messwerte</a><a href=\"#saison\">Saison</a><a href=\"#karten\">Karten &amp; Radar</a><a href=\"#profi\">Links</a><a href=\"#methodik\">Methodik</a>\n</div></nav>\n\n<div class=\"wrap main\">\n\n<section id=\"lage\" aria-label=\"Lage\">\n  <div class=\"lage\">\n    <article class=\"card meter\" id=\"meterCard\">\n      <div class=\"card-h\"><h3>Powder-Meter</h3><span class=\"chip\" id=\"meterDay\">–</span></div>\n      <div class=\"meter-top\">\n        <div class=\"gauge\" id=\"gauge\" aria-live=\"polite\"></div>\n        <div class=\"stake\" id=\"stake\"></div>\n      </div>\n      <div class=\"verdict\" id=\"verdict\">Daten werden geladen</div>\n      <p class=\"verdict-sub\" id=\"verdictSub\">Gleich da: alle Wettermodelle und Ensemble-Läufe für den Shuttleberg.</p>\n      <div class=\"facts\" id=\"facts\"></div>\n      <div class=\"sysbars\" id=\"sysbars\" hidden></div>\n      <button class=\"linkbtn\" type=\"button\" id=\"meterMore\" aria-expanded=\"false\">Mehr Details</button>\n    </article>\n    <article class=\"card\">\n      <div class=\"card-h\"><h3>Wetterumschwünge</h3><span class=\"chip\" id=\"alertCount\">nächste 10 Tage</span></div>\n      <ul class=\"alerts\" id=\"alerts\"><li class=\"empty\">Wird berechnet …</li></ul>\n    </article>\n    <article class=\"card\">\n      <div class=\"card-h\"><h3>Jetzt am Berg</h3><span class=\"chip\" id=\"nowStamp\">INCA-Analyse</span></div>\n      <div class=\"profile\" id=\"profile\"></div>\n      <div class=\"kv\" id=\"nowKv\"></div>\n    </article>\n  </div>\n</section>\n\n<section id=\"vorhersage\">\n  <div class=\"sec-h\"><h2>Vorhersage</h2><div class=\"toolbar\" style=\"margin:0\"><span class=\"lab\">Zeitraum</span><div class=\"seg\" id=\"fcRange\"></div></div></div>\n  <div class=\"card fc-card\"><div class=\"fc-scroll\"><div class=\"fc\" id=\"fc\"><div class=\"empty\">Wird berechnet …</div></div></div>\n    <div class=\"legend\" id=\"fcLegend\"></div></div>\n</section>\n\n<section id=\"kalender\">\n  <div class=\"sec-h\"><h2>Powder-Kalender</h2><p id=\"calNote\">Neuschnee jeweils von 9 Uhr am Vortag bis 9 Uhr (Liftstart) am Berg. Tag antippen, dann zeigt das Powder-Meter die Details.</p></div>\n  <div class=\"cal\" id=\"cal\"><div class=\"empty\">Wird berechnet …</div></div>\n</section>\n\n<section id=\"lawine\">\n  <div class=\"sec-h\"><h2>Lawinenlagebericht</h2><p>Offizieller Bericht des Lawinenwarndienstes Salzburg (LAWIS) für unsere Region Niedere Tauern Nord (AT-05-08).</p></div>\n  <div class=\"card\" id=\"aval\"><div class=\"empty\">Lade Lagebericht …</div></div>\n</section>\n\n<section id=\"beschneiung\">\n  <div class=\"sec-h\"><h2>Beschneiung</h2><p>Für das Beschneiungs-Team: Schneifenster für Tal, Mitte und Berg aus Feuchttemperatur (Feuchtkugeltemperatur), Lufttemperatur und Wind. Die Grenzwerte unten an eure Anlage anpassen.</p></div>\n  <div class=\"sn-now\" id=\"snNow\"><div class=\"empty\">Wird berechnet …</div></div>\n  <div class=\"card\">\n    <div class=\"card-h\"><h3>Schneifenster · 7 Tage</h3><span class=\"chip\">stündlich, Modellkonsens</span></div>\n    <div class=\"chart\" id=\"snStrip\"></div>\n    <div class=\"legend\" id=\"snLegend\"></div>\n  </div>\n  <div class=\"card\" style=\"margin-top:12px\">\n    <div class=\"card-h\"><h3>Temperatur, Niederschlag &amp; Wind</h3><span class=\"chip\">stündlich, Modellkonsens</span></div>\n    <div class=\"toolbar\"><span class=\"lab\">Zeitraum</span><div class=\"seg\" id=\"swRange\"></div></div>\n    <div class=\"toolbar\"><span class=\"lab\">Temperatur</span><div class=\"seg\" id=\"swMode\"></div></div>\n    <div class=\"chart\" id=\"snWx\"></div>\n    <div class=\"legend\" id=\"snWxLegend\"></div>\n  </div>\n  <div class=\"card\" style=\"margin-top:12px\">\n    <div class=\"card-h\"><h3>Schneinächte</h3><span class=\"chip\">jeweils 12 bis 12 Uhr</span></div>\n    <div class=\"tablewrap\" id=\"snNights\"></div>\n    <p class=\"note\">Stunden = schneibar mit Propellermaschine. Menge = Richtwert für <strong>eine</strong> typische Propellermaschine (24 kW) aus einer veröffentlichten Beispielrechnung: rund 9 m³ Schnee pro Stunde bei −3 °C, rund 60 m³ bei −10 °C. Echte Leistung je nach Gerät, Wasserdruck und Wassertemperatur.</p>\n  </div>\n  <div class=\"sn-tools\">\n    <div class=\"card\">\n      <div class=\"card-h\"><h3>Grenzwerte eurer Anlage</h3></div>\n      <div class=\"frow sn-form\">\n        <label>Start Propellermaschine (Feuchttemp. °C)<input id=\"snProp\" type=\"number\" step=\"0.5\" min=\"-8\" max=\"0\"></label>\n        <label>Start Lanze (Feuchttemp. °C) · Annahme, bitte prüfen<input id=\"snLance\" type=\"number\" step=\"0.5\" min=\"-10\" max=\"0\"></label>\n        <label>Wind-Hinweis ab (km/h Mittelwind) · Annahme<input id=\"snWind\" type=\"number\" step=\"5\" min=\"10\" max=\"80\"></label>\n      </div>\n      <p class=\"note\">Gespeichert nur in diesem Browser. Propeller-Startwert −2,5 °C = gängige Startschwelle, moderne Geräte schaffen teils −2,0 °C.</p>\n    </div>\n    <div class=\"card\">\n      <div class=\"card-h\"><h3>Feuchttemperatur-Rechner</h3></div>\n      <div class=\"frow sn-form sn-calc\">\n        <label>Lufttemperatur (°C)<input id=\"cT\" type=\"number\" step=\"0.5\" value=\"-1\"></label>\n        <label>Relative Luftfeuchte (%)<input id=\"cRH\" type=\"number\" step=\"5\" min=\"5\" max=\"100\" value=\"60\"></label>\n      </div>\n      <div id=\"cOut\" class=\"calc-out\"></div>\n    </div>\n  </div>\n  <div class=\"sn-info\">\n    <div class=\"card\"><h4>Feuchttemperatur entscheidet</h4><ul>\n      <li>Sie zeigt, wie weit sich ein Wasser-Luft-Gemisch durch Verdunstung abkühlen kann. Bei trockener Luft liegt sie deutlich unter der Lufttemperatur.</li>\n      <li>Beispiele: 0 °C bei 90 % Feuchte ergibt −0,6 °C, 0 °C bei 30 % ergibt −4,3 °C, +2 °C bei 30 % ergibt −2,8 °C.</li>\n      <li>Als wirtschaftliche Obergrenze gelten −2,5 bis −2 °C. Je kälter, desto mehr und trockenerer Schnee.</li>\n      <li>Bis Mitte Dezember liegen über 70 % der Schneistunden zwischen −2 und −5 °C, also oft im Grenzbereich.</li>\n    </ul><p class=\"src\">Quellen: <a href=\"https://de.wikipedia.org/wiki/Schneekanone\" target=\"_blank\" rel=\"noopener\">Wikipedia</a>, <a href=\"https://www.snowsportsnews.com/articles/technoalpin-marginal-temperatures-increased-power-when-it-really-counts\" target=\"_blank\" rel=\"noopener\">TechnoAlpin</a></p></div>\n    <div class=\"card\"><h4>Propeller oder Lanze</h4><ul>\n      <li><strong>Propellermaschine:</strong> Ein Ventilator bläst den Wasser-Druckluft-Nebel weit hinaus, die lange Flugzeit lässt die Tropfen gefrieren. Mehr Energie (Beispielgerät 24 kW), lauter, gut im Grenzbereich.</li>\n      <li><strong>Lanze:</strong> 12 bis 14 m hohes Rohr, Druckluft zerstäubt das Wasser, die Fallhöhe gibt Zeit zum Gefrieren. Etwa halber Energiebedarf pro m³ Schnee und leise, aber windanfälliger, mit kleinerer Reichweite und geringerer Leistung.</li>\n      <li>Energie: rund 0,6–0,7 kWh/m³ Schnee bei Lanzen, 1–2 kWh/m³ bei Propellern. Die WKO nennt 1 bis 3 kWh/m³ allgemein.</li>\n    </ul><p class=\"src\">Quellen: <a href=\"https://de.wikipedia.org/wiki/Schneekanone\" target=\"_blank\" rel=\"noopener\">Wikipedia DE</a>, <a href=\"https://en.wikipedia.org/wiki/Snowmaking\" target=\"_blank\" rel=\"noopener\">Wikipedia EN</a>, <a href=\"https://www.wko.at/transport-verkehr/seilbahnen/beschneiung\" target=\"_blank\" rel=\"noopener\">WKO</a></p></div>\n    <div class=\"card\"><h4>Wasser und Kühlung</h4><ul>\n      <li>Faustregel: 4 °C kälteres Wasser senkt die nötige Feuchttemperatur um etwa 1 °C. Kühltürme verteilen das Wasser über Waben und kühlen es, das spart rund 15 %.</li>\n      <li>Für 1 m³ technischen Schnee braucht es etwa 0,4–0,5 m³ Wasser. Technischer Schnee wiegt 300–500 kg/m³, Naturschnee 10–80 kg/m³.</li>\n      <li>In Österreich kommt fast 90 % des Schneiwassers aus Speicherteichen mit Schmelz- und Niederschlagswasser.</li>\n    </ul><p class=\"src\">Quellen: <a href=\"https://www.snowsportsnews.com/articles/technoalpin-marginal-temperatures-increased-power-when-it-really-counts\" target=\"_blank\" rel=\"noopener\">TechnoAlpin</a>, <a href=\"https://de.wikipedia.org/wiki/Schneekanone\" target=\"_blank\" rel=\"noopener\">Wikipedia</a>, <a href=\"https://www.wko.at/transport-verkehr/seilbahnen/beschneiung\" target=\"_blank\" rel=\"noopener\">WKO</a></p></div>\n  </div>\n</section>\n\n<div class=\"divider\"><div><h2>Details</h2><p>Für alle, die tiefer einsteigen wollen. Zugeklappt zeigt jeder Bereich eine Kurzfassung.</p></div><button class=\"btn\" type=\"button\" id=\"foldAll\">Alle öffnen</button></div>\n\n<section id=\"modelle\">\n  <div class=\"sec-h\"><h2>Modellvergleich</h2><p>Neuschnee in cm bis 9 Uhr des jeweiligen Tages, Berg. Gruppenzeilen zeigen den Median der Gruppe. Antippen klappt die einzelnen Modelle auf.</p></div>\n  <div class=\"tablewrap\" id=\"modelTable\"><div class=\"empty\">Wird berechnet …</div></div>\n</section>\n\n<div class=\"folds\">\n<section id=\"meteogramm\" class=\"fold\">\n  <div class=\"fold-h\"><h2><button class=\"fold-btn\" type=\"button\" aria-expanded=\"false\" aria-controls=\"meteogramm-b\">Meteogramm</button></h2><span class=\"fold-sum\" id=\"sum-meteogramm\">Wird berechnet …</span><span class=\"fold-i\" aria-hidden=\"true\">Öffnen</span></div>\n  <div class=\"fold-b\" id=\"meteogramm-b\" hidden>\n  <p class=\"fold-desc\">Konsens aller Einzelmodelle (Median). Das Band zeigt die Spannweite der Ensembles (10–90 %). Vergangene Stunden kommen aus der INCA-Analyse von GeoSphere.</p>\n  <div class=\"card\">\n    <div class=\"toolbar\"><span class=\"lab\">Zeitraum</span><div class=\"seg\" id=\"mgRange\"></div></div>\n    <div class=\"chart\" id=\"mg\"></div>\n    <div class=\"legend\" id=\"mgLegend\"></div>\n  </div>\n  </div>\n</section>\n\n<section id=\"ensemble\" class=\"fold\">\n  <div class=\"fold-h\"><h2><button class=\"fold-btn\" type=\"button\" aria-expanded=\"false\" aria-controls=\"ensemble-b\">Ensemble</button></h2><span class=\"fold-sum\" id=\"sum-ensemble\">Wird berechnet …</span><span class=\"fold-i\" aria-hidden=\"true\">Öffnen</span></div>\n  <div class=\"fold-b\" id=\"ensemble-b\" hidden>\n  <p class=\"fold-desc\">Jede Linie ist ein eigener Modelllauf. Je enger die Linien zusammenliegen, desto sicherer die Prognose. Band und Median gewichtet nach Vorlaufzeit (siehe Methodik).</p>\n  <div class=\"toolbar\" id=\"ensChips\"></div>\n  <div class=\"grid2\">\n    <div class=\"card\"><div class=\"card-h\"><h3>Neuschnee kumuliert · Berg</h3><span class=\"chip\" id=\"ensSnowChip\">ab jetzt</span></div><div class=\"chart\" id=\"plumeSnow\"></div>\n      <div class=\"legend\"><span><i style=\"color:var(--ink)\"></i>Median</span><span><span class=\"sw\" style=\"background:var(--accent);opacity:.25\"></span>10–90 %</span><span><i style=\"color:var(--accent);border-top-style:dashed\"></i>Powder-Schwelle</span></div></div>\n    <div class=\"card\"><div class=\"card-h\"><h3>Temperatur 850 hPa</h3><span class=\"chip\">≈ 1.500 m freie Atmosphäre</span></div><div class=\"chart\" id=\"plumeT850\"></div>\n      <div class=\"legend\"><span><i style=\"color:var(--ink)\"></i>Median</span><span><i style=\"color:var(--ink);border-top-style:dashed\"></i>Einzelmodelle (Konsens)</span><span>Unter −5 °C: Schnee meist bis ins Tal</span></div>\n      <p class=\"note\" id=\"t850Note\" hidden>Die Ensemble-Läufe liefern auf dem Gratis-Datenweg keine 850-hPa-Temperatur. Die dünnen Linien sind deshalb die Einzelmodelle.</p></div>\n  </div>\n  </div>\n</section>\n\n<section id=\"messwerte\" class=\"fold\">\n  <div class=\"fold-h\"><h2><button class=\"fold-btn\" type=\"button\" aria-expanded=\"false\" aria-controls=\"messwerte-b\">Messwerte</button></h2><span class=\"fold-sum\" id=\"sum-messwerte\">Lade Stationen …</span><span class=\"fold-i\" aria-hidden=\"true\">Öffnen</span></div>\n  <div class=\"fold-b\" id=\"messwerte-b\" hidden>\n  <p class=\"fold-desc\">TAWES-Stationen von GeoSphere Austria rund um den Shuttleberg, 10-Minuten-Werte. Kurve = Temperatur der letzten 24 Stunden.</p>\n  <div class=\"stations\" id=\"stations\"><div class=\"empty\">Lade Stationen …</div></div>\n  </div>\n</section>\n\n<section id=\"saison\" class=\"fold\">\n  <div class=\"fold-h\"><h2><button class=\"fold-btn\" type=\"button\" aria-expanded=\"false\" aria-controls=\"saison-b\">Saison 2026/27</button></h2><span class=\"fold-sum\" id=\"sum-saison\">Lade Schneedaten …</span><span class=\"fold-i\" aria-hidden=\"true\">Öffnen</span></div>\n  <div class=\"fold-b\" id=\"saison-b\" hidden>\n  <p class=\"fold-desc\">Schneehöhe aus SNOWGRID (GeoSphere, 1-km-Schneemodell aus Messnetz und Wetterdaten) im Vergleich zum Mittel 1991–2020 und zum letzten Winter. Darunter die Saisonprognose von ECMWF.</p>\n  <div class=\"kpis\" id=\"seasonKpis\"></div>\n  <div class=\"card\">\n    <div class=\"toolbar\"><span class=\"lab\">Höhe</span><div class=\"seg\" id=\"sgLevel\"><button type=\"button\" data-l=\"berg\" aria-pressed=\"true\">Berg</button><button type=\"button\" data-l=\"tal\" aria-pressed=\"false\">Tal</button></div></div>\n    <div class=\"chart\" id=\"seasonChart\"><div class=\"empty\">Lade 35 Jahre Schneedaten …</div></div>\n    <div class=\"legend\"><span><i style=\"color:var(--accent)\"></i>Saison 2026/27</span><span><i style=\"color:var(--muted);border-top-style:dashed\"></i>Saison 2025/26</span><span><i style=\"color:var(--snow)\"></i>Median 1991–2020</span><span><span class=\"sw\" style=\"background:var(--snow-soft)\"></span>10–90 % der Winter 1991–2020</span></div>\n    <p class=\"note\">SNOWGRID rechnet auf 1-km-Zellen und mittelt dabei das Gelände. Absolute Werte können deshalb von euren Messungen am Berg abweichen. Für den Vergleich mit anderen Wintern spielt das keine Rolle.</p>\n  </div>\n  <div class=\"card\" style=\"margin-top:12px\">\n    <div class=\"card-h\"><h3>Saisonprognose ECMWF SEAS5</h3><span class=\"chip\">Abweichung vom Modellmittel</span></div>\n    <div class=\"seas\" id=\"seas\"><div class=\"empty\">Lade Saisonprognose …</div></div>\n    <p class=\"note\">Saisonprognosen zeigen für die Alpen nur Tendenzen. Sie sagen nichts über einzelne Schneefälle, und die Trefferquote in Mitteleuropa ist gering. Als Hintergrund lesen, nicht als Planungsgrundlage.</p>\n  </div>\n  </div>\n</section>\n\n<section id=\"karten\" class=\"fold\">\n  <div class=\"fold-h\"><h2><button class=\"fold-btn\" type=\"button\" aria-expanded=\"false\" aria-controls=\"karten-b\">Karten &amp; Radar</button></h2><span class=\"fold-sum\" id=\"sum-karten\">Niederschlagsradar der letzten zwei Stunden und Prognosekarten für Neuschnee, Wind und Temperatur</span><span class=\"fold-i\" aria-hidden=\"true\">Öffnen</span></div>\n  <div class=\"fold-b\" id=\"karten-b\" hidden>\n  <p class=\"fold-desc\">Links: Niederschlagsradar der letzten zwei Stunden. Rechts: Prognosekarten über Windy, mit Ebene und Modell frei wählbar.</p>\n  <div class=\"grid2\">\n    <div class=\"card\">\n      <div class=\"card-h\"><h3>Radar</h3><span class=\"chip\" id=\"radarTime\">–</span></div>\n      <div id=\"radar\" role=\"img\" aria-label=\"Radarkarte\"></div>\n      <div class=\"radarbar\"><button class=\"btn\" id=\"radarPlay\" type=\"button\">Pause</button><span class=\"note\" style=\"margin:0\">Radar: RainViewer. Rote Punkte: Berg und Tal.</span></div>\n    </div>\n    <div class=\"card\">\n      <div class=\"card-h\"><h3>Prognosekarte</h3></div>\n      <div class=\"toolbar\"><span class=\"lab\">Ebene</span><div class=\"seg\" id=\"windyOv\"></div></div>\n      <div class=\"toolbar\"><span class=\"lab\">Modell</span><div class=\"seg\" id=\"windyMod\"></div></div>\n      <iframe class=\"windy\" id=\"windy\" title=\"Windy-Prognosekarte\" loading=\"lazy\" referrerpolicy=\"no-referrer-when-downgrade\"></iframe>\n    </div>\n  </div>\n  </div>\n</section>\n\n<section id=\"profi\" class=\"fold\">\n  <div class=\"fold-h\"><h2><button class=\"fold-btn\" type=\"button\" aria-expanded=\"false\" aria-controls=\"profi-b\">Profi-Links</button></h2><span class=\"fold-sum\" id=\"sum-profi\">ECMWF-Meteogramm, meteoblue-Ensembles, GeoSphere-Karten, LWD Salzburg, Webcams</span><span class=\"fold-i\" aria-hidden=\"true\">Öffnen</span></div>\n  <div class=\"fold-b\" id=\"profi-b\" hidden>\n  <p class=\"fold-desc\">Rohdaten, Ensemble-Meteogramme und Fachkarten, schon auf den Shuttleberg eingestellt, wo die Seite das erlaubt.</p>\n  <div class=\"links\">\n    <div class=\"card\"><h3>Ensemble &amp; Modelle</h3><ul>\n      <li><a href=\"https://charts.ecmwf.int/products/opencharts_meteogram?epsgram=classical_15d&amp;lat=47.30&amp;lon=13.345&amp;station_name=Shuttleberg\" target=\"_blank\" rel=\"noopener\">ECMWF ENS-Meteogramm 15 Tage</a><span>Original-Plumes von ECMWF für unseren Gitterpunkt</span></li>\n      <li><a href=\"https://www.meteoblue.com/de/wetter/vorhersage/multimodelensemble/47.300N13.345E\" target=\"_blank\" rel=\"noopener\">meteoblue Multimodell-Ensemble</a><span>Über 100 Läufe aus 6 Ensemble-Systemen</span></li>\n      <li><a href=\"https://www.meteoblue.com/de/wetter/vorhersage/multimodel/47.300N13.345E\" target=\"_blank\" rel=\"noopener\">meteoblue MultiModel</a><span>Einzelmodelle nebeneinander</span></li>\n      <li><a href=\"https://www.wetter3.de/\" target=\"_blank\" rel=\"noopener\">wetter3.de</a><span>GFS-, ICON- und ECMWF-Karten, Höhenwetterkarten, Diagramme</span></li>\n      <li><a href=\"https://www.wetterzentrale.de/\" target=\"_blank\" rel=\"noopener\">Wetterzentrale</a><span>Topkarten, Ensembles, Archiv</span></li>\n    </ul></div>\n    <div class=\"card\"><h3>GeoSphere Austria</h3><ul>\n      <li><a href=\"https://www.geosphere.at/de/karten/wetterprognose\" target=\"_blank\" rel=\"noopener\">Prognosekarten</a><span>Offizielle Karten des österreichischen Wetterdienstes</span></li>\n      <li><a href=\"https://www.geosphere.at/de/karten/aktuelles-wetter\" target=\"_blank\" rel=\"noopener\">Aktuelles Wetter</a><span>Messwerte und Analysen österreichweit</span></li>\n      <li><a href=\"https://www.geosphere.at/de/karten/wetterportal/wetteranimationen-und-satellitenbilder\" target=\"_blank\" rel=\"noopener\">Animationen &amp; Satellit</a><span>Radar- und Satellitenschleifen</span></li>\n      <li><a href=\"https://data.hub.geosphere.at/\" target=\"_blank\" rel=\"noopener\">GeoSphere Data Hub</a><span>Rohdaten: AROME, C-LAEF, INCA, SNOWGRID, Stationen</span></li>\n    </ul></div>\n    <div class=\"card\"><h3>Schnee &amp; Lawine</h3><ul>\n      <li><a href=\"https://lawine.salzburg.at/\" target=\"_blank\" rel=\"noopener\">Lawinenwarndienst Salzburg</a><span>Lagebericht, Blog, Infos (tägliche Berichte ab Anfang Dezember)</span></li>\n      <li><a href=\"https://www.salzburg.gv.at/lawine/#/map\" target=\"_blank\" rel=\"noopener\">LWD Salzburg Messstationen</a><span>Schneehöhen und Wind der Lawinenwarndienst-Stationen</span></li>\n      <li><a href=\"https://www.lawis.at/profile?lang=de\" target=\"_blank\" rel=\"noopener\">LAWIS Schneeprofile</a><span>Aktuelle Schneedeckenuntersuchungen</span></li>\n      <li><a href=\"https://www.lawis.at/incident?lang=de\" target=\"_blank\" rel=\"noopener\">LAWIS Lawinenereignisse</a><span>Gemeldete Abgänge</span></li>\n      <li><a href=\"https://www.avalanches.org/\" target=\"_blank\" rel=\"noopener\">EAWS</a><span>Europäische Lawinenwarndienste, Gefahrenstufen-Karte</span></li>\n    </ul></div>\n    <div class=\"card\"><h3>Karten &amp; Kameras</h3><ul>\n      <li><a href=\"https://www.windy.com/47.300/13.345?snowAccu,47.300,13.345,10\" target=\"_blank\" rel=\"noopener\">Windy Vollansicht</a><span>Neuschnee-Akkumulation, Modellvergleich, Profile</span></li>\n      <li><a href=\"https://www.shuttleberg.com/de/info-service/webcams/\" target=\"_blank\" rel=\"noopener\">Shuttleberg Webcams</a><span>Eigene Kameras am Berg</span></li>\n      <li><a href=\"https://www.foto-webcam.eu/\" target=\"_blank\" rel=\"noopener\">foto-webcam.eu</a><span>Hochauflösende Alpen-Webcams mit Archiv</span></li>\n      <li><a href=\"https://www.lightningmaps.org/\" target=\"_blank\" rel=\"noopener\">LightningMaps</a><span>Blitze live (Gewitterschnee, Frühjahr)</span></li>\n    </ul></div>\n  </div>\n  </div>\n</section>\n\n<section id=\"methodik\" class=\"fold\">\n  <div class=\"fold-h\"><h2><button class=\"fold-btn\" type=\"button\" aria-expanded=\"false\" aria-controls=\"methodik-b\">Methodik</button></h2><span class=\"fold-sum\" id=\"sum-methodik\">Wie das Powder-Meter rechnet, Gewichtung der Modelle, Grenzen, Datenstatus</span><span class=\"fold-i\" aria-hidden=\"true\">Öffnen</span></div>\n  <div class=\"fold-b\" id=\"methodik-b\" hidden>\n  <p class=\"fold-desc\">So rechnet die Wetterwarte. Die Modelldaten von Open-Meteo werden stündlich vorab für Berg und Tal geholt. GeoSphere, Lawinenbericht und Radar kommen live. Gerechnet wird im Browser.</p>\n  <details class=\"md\" open><summary>Powder-Meter: Was die Prozentzahl bedeutet</summary><div class=\"prose\">\n    <p>Das Powder-Meter zeigt die Wahrscheinlichkeit, dass am gewählten Tag zum Liftstart <strong>skibarer Tiefschnee</strong> am Berg liegt. Gezählt wird jeder einzelne Modelllauf als eigenes Szenario. Ein Lauf zählt als „Powder“, wenn der effektive Neuschnee die Schwelle (Standard 15 cm) erreicht:</p>\n    <p class=\"mono\" style=\"font-size:13px\">Effektiv = Neuschnee 24 h bis 9 Uhr + 0,4 × Neuschnee vom Vortag + 0,5 × Schneefall 9–12 Uhr</p>\n    <p>Danach wird die Qualität abgezogen: Regen am Berg (≥ 1 mm: ×0,6, ≥ 3 mm: ×0,2), nasser Schneefall über +0,5 °C (×0,6), Erwärmung auf ≥ 4 °C am Vormittag (×0,7) und Wind beim Schneefall (≥ 45 km/h: ×0,6, ≥ 60 km/h: ×0,3). Der Mittelwert aller gewichteten Szenarien ergibt die Powder-Chance.</p>\n    <p>Die Unterlage (Altschnee) fließt bewusst nicht in die Prozentzahl ein, sie steht als eigene Angabe daneben. Gerade im Frühwinter heißt Powder auf dünner Unterlage: Steinkontakt einplanen.</p>\n  </div></details>\n  <details class=\"md\"><summary>Neuschnee aus Niederschlag</summary><div class=\"prose\">\n    <p>Aus jedem Modell wird stündlich der Niederschlag genommen und selbst in Schnee umgerechnet, damit alle Modelle gleich behandelt werden:</p>\n    <p><strong>Schneeanteil</strong> über die Feuchttemperatur (Formel nach Stull 2011): bei ≤ 0 °C nur Schnee, bei ≥ 1,6 °C nur Regen, dazwischen gemischt. Fehlt die Luftfeuchte, wird die Lufttemperatur verwendet (Schnee bis +0,5 °C, Regen ab +2,5 °C).</p>\n    <p><strong>Schneedichte</strong> über das Verhältnis Neuschnee zu Wasser (SLR), abhängig von der Temperatur: bei 0 °C etwa 9:1 (1 mm ≈ 0,9 cm), bei −4 °C 13:1, bei −10 °C 18:1 (sehr leichter Pulver). Starker Wind verdichtet: bei 60 km/h wird das Verhältnis um 25 % reduziert.</p>\n    <p>Die Temperatur kommt höhenkorrigiert für die eingestellte Berghöhe ({BERG} m). Vergangene Stunden werden durch die INCA-Analyse ersetzt (Messnetz + Radar), damit bereits gefallener Schnee korrekt drin ist.</p>\n  </div></details>\n  <details class=\"md\"><summary>Gewichtung der Modelle nach Vorlaufzeit</summary><div class=\"prose\">\n    <p>Hochaufgelöste Modelle sehen die Tauern-Topografie viel besser (Nordstau!), reichen aber nur 1,5 bis 5 Tage. Globale Ensembles reichen 15 Tage, glätten die Berge aber auf 25-km-Gitter. Deshalb ändert sich die Gewichtung mit der Vorlaufzeit:</p>\n    <div class=\"tablewrap\"><table class=\"wtab\"><thead><tr><th>System</th><th>bis 60 h</th><th>60–132 h</th><th>ab 132 h</th></tr></thead><tbody>\n      <tr><td>Hochaufgelöst (AROME 1 km, AROME-AT, ICON-D2, ICON-CH1/CH2, ICON-2I, HARMONIE, AROME-HD)</td><td>30 %</td><td>5 %</td><td>–</td></tr>\n      <tr><td>C-LAEF 1 km (GeoSphere-Ensemble, Perzentile)</td><td>15 %</td><td>–</td><td>–</td></tr>\n      <tr><td>ICON-D2-EPS (20 Läufe, 2 km)</td><td>15 %</td><td>–</td><td>–</td></tr>\n      <tr><td>ECMWF ENS (51 Läufe)</td><td>15 %</td><td>35 %</td><td>45 %</td></tr>\n      <tr><td>ICON-EU-EPS (40 Läufe)</td><td>10 %</td><td>15 %</td><td>–</td></tr>\n      <tr><td>ECMWF AIFS-ENS (51 Läufe, KI-Modell)</td><td>8 %</td><td>20 %</td><td>27 %</td></tr>\n      <tr><td>GEFS (31 Läufe)</td><td>4 %</td><td>10 %</td><td>18 %</td></tr>\n      <tr><td>Globale Einzelmodelle (ECMWF HRES, AIFS, ICON-EU, ARPEGE, UKMO, GFS, GEM)</td><td>3 %</td><td>15 %</td><td>10 %</td></tr>\n    </tbody></table></div>\n    <p>Fehlt ein System (Laufzeit zu Ende, Abruf gescheitert oder auf dem Gratis-Datenweg nicht verfügbar<span id=\"missSys\"></span>), wird sein Gewicht auf die vorhandenen umgelegt. C-LAEF liefert nur Perzentile (10/50/90 %). Daraus wird die Wahrscheinlichkeit stückweise linear interpoliert.</p>\n  </div></details>\n  <details class=\"md\"><summary>Wetterumschwünge: Was erkannt wird</summary><div class=\"prose\">\n    <p>Alle Kriterien laufen auf dem Modellkonsens (Median) für die nächsten 10 Tage:</p>\n    <p><strong>Powder-Alarm</strong> ab 50 % Powder-Chance, <strong>Powder möglich</strong> ab 30 %. <strong>Neuschnee</strong> ab 5 cm im Median. <strong>Kaltfront</strong>: 850-hPa-Temperatur fällt um ≥ 7 K in 24 h. <strong>Warmluft</strong>: steigt um ≥ 8 K. <strong>Regen bis zum Berg</strong>: ≥ 5 mm Regen am Berg in 24 h. <strong>Südföhn</strong>: Wind in 3.000 m aus 140–230° mit ≥ 55 km/h über 3 h. <strong>Sturm</strong>: Böen ≥ 75 km/h am Berg. <strong>Druckfall</strong>: ≥ 8 hPa in 24 h. <strong>Nordstau</strong>: Höhenwind aus West bis Nord, ≥ 30 km/h, ≥ 10 mm Niederschlag. <strong>Tauwetter</strong>: ≥ +5 °C am Berg über 4 h. <strong>Beschneiungsfenster</strong>: Feuchttemperatur im Tal ≤ −2,5 °C über mindestens 6 h (gängige Faustregel).</p>\n  </div></details>\n  <details class=\"md\"><summary>Grenzen und ehrliche Hinweise</summary><div class=\"prose\">\n    <p>Grobe Ensembles (25 km) unterschätzen Staulagen an der Tauern-Nordseite oft, die hochaufgelösten Modelle überschätzen dafür manchmal Schauer. Der Konsens dämpft beides, ersetzt aber kein Messfeld. Windverfrachtung, Sonneneinstrahlung je Exposition und Setzung werden nicht modelliert.</p>\n    <p>Am meisten bringt eine Kalibrierung mit euren eigenen Neuschneemessungen vom Berg: Nach ein paar Wochen sieht man, ob die Schwelle oder die Dichteannahme angepasst werden sollte.</p>\n    <p>Die Open-Meteo-Daten kommen aus „Open-Meteo on AWS Open Data“ (CC BY 4.0, mit Quellenangabe auch kommerziell nutzbar) und werden stündlich für Berg und Tal vorab gerechnet. Deshalb sind die Standorte fest eingestellt. Unterschiede zur Open-Meteo-API: ECMWF ENS kommt vom 9-km-Gitter (oft etwas wärmer, dafür näher an ECMWF HRES), AIFS-ENS vom 31-km-Gitter, ICON-D2 ohne die stündlichen Zwischenläufe. GeoSphere-Daten sind frei nutzbar (CC BY 4.0).</p>\n  </div></details>\n  <details class=\"md\"><summary>Datenstatus dieser Abfrage</summary><div class=\"prose\" style=\"max-width:none\"><ul class=\"status\" id=\"status\"><li>Noch keine Abfrage.</li></ul></div></details>\n  </div>\n</section>\n</div>\n\n</div>\n\n<footer><div class=\"wrap\">\n  <p><strong>Datenquellen:</strong> GeoSphere Austria – AROME 1 km, C-LAEF, INCA, SNOWGRID, TAWES (CC BY 4.0) · <a href=\"https://open-meteo.com/\" target=\"_blank\" rel=\"noopener\">Weather data by Open-Meteo.com</a> (CC BY 4.0, über AWS Open Data) mit Daten von DWD, ECMWF, MeteoSchweiz, Météo-France, ItaliaMeteo, DMI, Met Office, NOAA, CMC · Lawinenwarndienst Salzburg über lawinen-warnung.eu (LAWIS) · Radar: RainViewer · Karte: © OpenStreetMap-Mitwirkende, SRTM, OpenTopoMap (CC-BY-SA) · Windy.com</p>\n  <p>Modellprognosen, keine Garantie. Für Entscheidungen im Gelände gelten Lagebericht und eigene Beurteilung vor Ort.</p>\n</div></footer>\n\n<dialog id=\"dlg\">\n  <form method=\"dialog\" id=\"setForm\">\n    <h3>Einstellungen</h3>\n    <fieldset><legend>Powder</legend><div class=\"frow\">\n      <label>Powder-Schwelle (cm effektiver Neuschnee)<input id=\"fThr\" type=\"number\" step=\"1\" min=\"3\" max=\"80\"></label>\n    </div></fieldset>\n    <fieldset><legend>Standorte</legend>\n      <p class=\"note\" style=\"margin:0\" id=\"fLoc\"></p>\n    </fieldset>\n    <div class=\"dlg-actions\">\n      <button class=\"btn\" type=\"button\" id=\"setReset\">Standard</button>\n      <button class=\"btn\" value=\"cancel\" type=\"submit\" formnovalidate>Abbrechen</button>\n      <button class=\"btn primary\" value=\"save\" type=\"submit\" id=\"setSave\">Speichern &amp; neu laden</button>\n    </div>\n  </form>\n</dialog>";
var FONTS = [["Barlow","400","barlow-latin-400"],["Barlow","500","barlow-latin-500"],["Barlow","600","barlow-latin-600"],["Barlow Condensed","500","barlow-condensed-latin-500"],["Barlow Condensed","600","barlow-condensed-latin-600"],["Barlow Condensed","700","barlow-condensed-latin-700"],["IBM Plex Mono","400","ibm-plex-mono-latin-400"],["IBM Plex Mono","500","ibm-plex-mono-latin-500"]];

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
(function(){
'use strict';

/* ======================= Konfiguration ======================= */
// Einbau-Haken: ROOT = Dokument bzw. Shadow Root, HOST = Element für data-theme, CFG = Einstellungen des Einbaus.
// scripts/build-wetterwarte.mjs ersetzt genau diese Zeile, wenn es daraus das Homepage-Skript baut.
/* ROOT, HOST, CFG kommen aus boot() */
const DEFAULTS={bergLat:47.300,bergLon:13.345,bergElev:1950,talLat:47.3007,talLon:13.3966,talElev:1000,thr:15,omKey:'',snProp:-2.5,snLance:-3,snWind:30};
const store={get(k,d){try{const v=localStorage.getItem(k);return v==null?d:JSON.parse(v);}catch(e){return d;}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v));}catch(e){}}};
let S=Object.assign({},DEFAULTS,store.get('swx.settings',{}));
// Standorte fest: die Open-Meteo-Daten werden stündlich vorab für genau diese Punkte gerechnet (config.json im Repo sb-wetter)
for(const k of ['bergLat','bergLon','bergElev','talLat','talLon','talElev','omKey'])S[k]=DEFAULTS[k];
// Modelldaten: Worker sb-wetter (Gratis-Weg über AWS Open Data, stündlich per GitHub Actions). Die Open-Meteo-API nur mit Abo-Key (S.omKey, setzt nur scripts/build-public.mjs).
const DATA=CFG.data||'https://sb-wetter.max-27c.workers.dev/data/';
const TZ='Europe/Vienna';
const GS='https://dataset.api.hub.geosphere.at/v1';
const REGION='AT-05-08';
const REFRESH_MIN=30;

const DET_MODELS=[
  {id:'geosphere_arome_austria',label:'AROME Austria',org:'GeoSphere',res:'2,5 km',block:'hr'},
  {id:'icon_d2',label:'ICON-D2',org:'DWD',res:'2,2 km',block:'hr'},
  {id:'meteoswiss_icon_ch1',label:'ICON-CH1',org:'MeteoSchweiz',res:'1 km',block:'hr'},
  {id:'meteoswiss_icon_ch2',label:'ICON-CH2',org:'MeteoSchweiz',res:'2,1 km',block:'hr'},
  {id:'italia_meteo_arpae_icon_2i',label:'ICON-2I',org:'ItaliaMeteo',res:'2,2 km',block:'hr'},
  {id:'dmi_harmonie_arome_europe',label:'HARMONIE-AROME',org:'DMI',res:'2 km',block:'hr'},
  {id:'meteofrance_arome_france_hd',label:'AROME-HD',org:'Météo-France',res:'1,3 km',block:'hr'},
  {id:'icon_eu',label:'ICON-EU',org:'DWD',res:'7 km',block:'gd'},
  {id:'meteofrance_arpege_europe',label:'ARPEGE',org:'Météo-France',res:'11 km',block:'gd'},
  {id:'ecmwf_ifs',label:'ECMWF HRES',org:'ECMWF',res:'9 km',block:'gd'},
  {id:'ecmwf_aifs025_single',label:'ECMWF AIFS',org:'ECMWF',res:'28 km',block:'gd'},
  {id:'ukmo_global_deterministic_10km',label:'UKMO Global',org:'Met Office',res:'10 km',block:'gd'},
  {id:'gfs_seamless',label:'GFS',org:'NOAA',res:'13 km',block:'gd'},
  {id:'gem_seamless',label:'GEM',org:'CMC',res:'15 km',block:'gd'}
];
const GS_AROME={id:'gs_arome1k',label:'AROME 1 km',org:'GeoSphere',res:'1 km',block:'hr'};
const ENS_SYS=[
  {id:'icon_d2_eps',suffix:'icon_d2_eps',label:'ICON-D2-EPS',org:'DWD',res:'2,2 km'},
  {id:'icon_eu_eps',suffix:'icon_eu_eps',label:'ICON-EU-EPS',org:'DWD',res:'13 km'},
  {id:'ecmwf_ifs025',suffix:'ecmwf_ifs025_ensemble',label:'ECMWF ENS',org:'ECMWF',res:'25 km'},
  {id:'ecmwf_aifs025',suffix:'ecmwf_aifs025_ensemble',label:'ECMWF AIFS-ENS',org:'ECMWF',res:'25 km'},
  {id:'gfs025',suffix:'ncep_gefs025',label:'GEFS',org:'NOAA',res:'25 km'}
];
const SYS_LABEL={hr:'Hochaufgelöste Modelle',gd:'Globale Einzelmodelle',claef:'C-LAEF 1 km',icon_d2_eps:'ICON-D2-EPS',icon_eu_eps:'ICON-EU-EPS',ecmwf_ifs025:'ECMWF ENS',ecmwf_aifs025:'ECMWF AIFS-ENS',gfs025:'GEFS'};
const STATIONS=[{id:'11149',name:'Obertauern',elev:1772},{id:'11208',name:'Radstadt',elev:835},{id:'11179',name:'Großarltal',elev:882},{id:'11267',name:'Dachstein-Hunerkogel',elev:2700}];
// Geländeschnitt Kleinarl – Grat – Flachauwinkl (Copernicus-DEM), km / m
const PROFILE=[[0,1003],[0.13,1004],[0.26,1010],[0.39,1089],[0.52,1126],[0.65,1159],[0.78,1183],[0.91,1260],[1.04,1305],[1.17,1332],[1.3,1391],[1.43,1428],[1.56,1452],[1.69,1479],[1.82,1552],[1.95,1620],[2.08,1672],[2.21,1703],[2.34,1708],[2.47,1721],[2.6,1743],[2.73,1779],[2.86,1817],[2.99,1881],[3.12,1833],[3.25,1802],[3.38,1783],[3.51,1762],[3.64,1736],[3.77,1714],[3.9,1708],[4.03,1683],[4.16,1675],[4.29,1659],[4.42,1643],[4.55,1638],[4.68,1616],[4.81,1585],[4.94,1589],[5.07,1571],[5.2,1511],[5.33,1473],[5.46,1440],[5.59,1401],[5.72,1345],[5.85,1283],[5.98,1239],[6.1,1180],[6.23,1148],[6.36,1106],[6.49,1069],[6.62,1039],[6.75,1031],[6.88,1015],[7.01,1018]];

/* ======================= Helfer ======================= */
const $=id=>ROOT.getElementById(id);
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const ok=v=>v!=null&&isFinite(v);
const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
const NF0=new Intl.NumberFormat('de-DE',{maximumFractionDigits:0});
const NF1=new Intl.NumberFormat('de-DE',{minimumFractionDigits:1,maximumFractionDigits:1});
const f0=v=>ok(v)?NF0.format(Math.round(v)+0):'–';
const f1=v=>ok(v)?NF1.format(Math.round(v*10)/10+0):'–';
const fT=v=>{if(!ok(v))return '–';const r=Math.round(v*10)/10+0;return (r<0?'−':'')+NF1.format(Math.abs(r))+' °C';};
const fT0=v=>{if(!ok(v))return '–';const r=Math.round(v)+0;return (r<0?'−':'')+NF0.format(Math.abs(r))+'°';};
const fCm=v=>!ok(v)?'–':v<0.5?'0':v<1?'<1':f0(v);
const fM=v=>ok(v)?f0(Math.round(v/50)*50)+' m':'–';
const pct=v=>ok(v)?f0(v*100)+' %':'–';
const sgnK=v=>{if(!ok(v))return '–';const r=Math.round(v*10)/10+0;return (r>0?'+':r<0?'−':'±')+NF1.format(Math.abs(r));};
const avg=a=>{let s=0,n=0;for(const v of a)if(ok(v)){s+=v;n++;}return n?s/n:null;};
function median(a){const b=a.filter(ok).sort((x,y)=>x-y);if(!b.length)return null;const m=b.length>>1;return b.length%2?b[m]:(b[m-1]+b[m])/2;}
function quant(a,q){const b=a.filter(ok).sort((x,y)=>x-y);if(!b.length)return null;const p=(b.length-1)*q,i=Math.floor(p),f=p-i;return i+1<b.length?b[i]+f*(b[i+1]-b[i]):b[i];}
function wq(items,qs){
  const a=items.filter(x=>ok(x.v)&&x.w>0).sort((x,y)=>x.v-y.v);
  if(!a.length)return qs.map(()=>null);
  const tot=a.reduce((s,x)=>s+x.w,0);let c=0;const cum=a.map(x=>{const m=(c+x.w/2)/tot;c+=x.w;return m;});
  return qs.map(q=>{if(q<=cum[0])return a[0].v;if(q>=cum[cum.length-1])return a[a.length-1].v;for(let i=1;i<a.length;i++){if(cum[i]>=q){const f=(q-cum[i-1])/((cum[i]-cum[i-1])||1);return a[i-1].v+f*(a[i].v-a[i-1].v);}}return a[a.length-1].v;});
}
function cdfExceed(x,a,b,c){ // P(X>=x) aus p10/p50/p90
  if(!ok(a)||!ok(b)||!ok(c))return null;
  if(x<=0)return 1;
  if(x<=a)return a>0?1-0.1*(x/a):0.9;
  if(x<=b)return 0.9-0.4*(x-a)/Math.max(b-a,1e-6);
  if(x<=c)return 0.5-0.4*(x-b)/Math.max(c-b,1e-6);
  return 0.1*Math.exp(-(x-c)/Math.max(c-b,1));
}
const COMPASS=['N','NO','O','SO','S','SW','W','NW'];
const dirName=d=>ok(d)?COMPASS[Math.round(((d%360)+360)%360/45)%8]:'–';

/* Zeit (Europe/Vienna) */
const DTF=new Intl.DateTimeFormat('en-GB',{timeZone:TZ,year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',weekday:'short',hourCycle:'h23'});
const WD={Mon:'Mo',Tue:'Di',Wed:'Mi',Thu:'Do',Fri:'Fr',Sat:'Sa',Sun:'So'};
const WDL={Mo:'Montag',Di:'Dienstag',Mi:'Mittwoch',Do:'Donnerstag',Fr:'Freitag',Sa:'Samstag',So:'Sonntag'};
const MON=['Jän','Feb','Mär','Apr','Mai','Jun','Jul','Aug','Sep','Okt','Nov','Dez'];
const lpC=new Map();
function lp(sec){let r=lpC.get(sec);if(r)return r;const o={};for(const p of DTF.formatToParts(new Date(sec*1000)))o[p.type]=p.value;r={y:+o.year,m:+o.month,d:+o.day,h:(+o.hour)%24,mi:+o.minute,wd:WD[o.weekday]||o.weekday,key:o.year+'-'+o.month+'-'+o.day};if(lpC.size>30000)lpC.clear();lpC.set(sec,r);return r;}
const pad=n=>String(n).padStart(2,'0');
const fDay=s=>{const p=lp(s);return `${p.wd} ${pad(p.d)}.${pad(p.m)}.`;};
const fTime=s=>{const p=lp(s);return `${pad(p.h)}:${pad(p.mi)}`;};
const isoUTC=s=>new Date(s*1000).toISOString().slice(0,16);
function relDay(s){const k=lp(s).key;if(k===lp(NOW).key)return 'heute';if(k===lp(NOW+86400).key)return 'morgen';if(k===lp(NOW+2*86400).key)return 'übermorgen';return fDay(s);}
function relDayCap(s){const r=relDay(s);return r.charAt(0).toUpperCase()+r.slice(1);}
function partOfDay(s){const h=lp(s).h;return h<6?'früh':h<11?'vormittags':h<14?'mittags':h<18?'nachmittags':h<22?'abends':'nachts';}

/* Meteorologie */
function wetBulb(T,RH){if(!ok(T))return null;if(!ok(RH))return T;RH=clamp(RH,5,100);
  return T*Math.atan(0.151977*Math.sqrt(RH+8.313659))+Math.atan(T+RH)-Math.atan(RH-1.676331)+0.00391838*Math.pow(RH,1.5)*Math.atan(0.023101*RH)-4.686035;}
function snowFrac(T,Tw,hasRH){if(!ok(T))return null;if(hasRH&&ok(Tw))return clamp((1.6-Tw)/1.6,0,1);return clamp((2.5-T)/2.0,0,1);}
const SLR_TAB=[[-25,14],[-15,17],[-10,18],[-7,16],[-4,13],[-2,11],[0,9],[1,7.5],[2,6]];
function slr(T,W){if(!ok(T))T=0;let r=SLR_TAB[SLR_TAB.length-1][1];
  if(T<=SLR_TAB[0][0])r=SLR_TAB[0][1];else for(let i=1;i<SLR_TAB.length;i++){if(T<=SLR_TAB[i][0]){const[x0,y0]=SLR_TAB[i-1],[x1,y1]=SLR_TAB[i];r=y0+(y1-y0)*(T-x0)/(x1-x0);break;}}
  if(ok(W))r*=1-0.25*clamp((W-25)/35,0,1);return r;}
function quality(R,Ts,Ws,Tmax){let q=1;if(R>=3)q*=.2;else if(R>=1)q*=.6;if(ok(Ts)&&Ts>.5)q*=.6;if(ok(Tmax)&&Tmax>=4)q*=.7;if(ok(Ws)){if(Ws>=60)q*=.3;else if(Ws>=45)q*=.6;}return q;}
function sysWeights(lead){
  if(lead<=60)return {hr:.30,claef:.15,icon_d2_eps:.15,ecmwf_ifs025:.15,icon_eu_eps:.10,ecmwf_aifs025:.08,gfs025:.04,gd:.03};
  if(lead<=132)return {ecmwf_ifs025:.35,ecmwf_aifs025:.20,icon_eu_eps:.15,gd:.15,gfs025:.10,hr:.05};
  return {ecmwf_ifs025:.45,ecmwf_aifs025:.27,gfs025:.18,gd:.10};
}

/* ======================= Zustand ======================= */
let NOW=Math.floor(Date.now()/1000), AX=[], AXI=new Map(), iNow=0;
let SERIES=[], TALS=[], CL=null, INCA=null, K=null, KT=null, ENSQ=null, PLUME=null, DAYS=[], DAYRES=[], EVENTS=[];
let SG=null, SEAS=null, LAW=null, TAWES=null, META={};
let selDay=0, mgRange=5, sgLevel='berg', hidden=new Set(), lastLoad=0, loading=false;
let openGrp=new Set(store.get('swx.mgrp',[])), meterMore=!!store.get('swx.meterMore',false), alertsAll=false;
const STATUS=new Map();

/* ======================= Abruf ======================= */
function setStatus(id,label,state,info){STATUS.set(id,{label,state,info:info||''});}
/* Zwischenspeicher: schont das Abrufkontingent bei häufigem Neuladen und springt ein, wenn ein Abruf scheitert */
const CK='swx.c.';let FORCE=false;
function cacheGet(url,maxAge){try{const raw=localStorage.getItem(CK+url);if(!raw)return null;const o=JSON.parse(raw);if(Date.now()-o.t<=maxAge*1000)return o;}catch(e){}return null;}
function cachePut(url,j){const v=JSON.stringify({t:Date.now(),j});try{localStorage.setItem(CK+url,v);}catch(e){try{for(let i=localStorage.length-1;i>=0;i--){const k=localStorage.key(i);if(k&&k.indexOf(CK)===0&&k!==CK+url)localStorage.removeItem(k);}localStorage.setItem(CK+url,v);}catch(e2){}}}
async function getJSON(url,id,label,opt){
  opt=opt||{};
  if(opt.ttl&&!FORCE){const c=cacheGet(url,opt.ttl);if(c){if(id)setStatus(id,label,'ok',`Zwischenspeicher von ${fTime(Math.floor(c.t/1000))} Uhr`);return c.j;}}
  const ctl=new AbortController();const tm=setTimeout(()=>ctl.abort(),opt.timeout||45000);
  try{
    const r=await fetch(url,{signal:ctl.signal,cache:'no-store'});
    if(r.status===404&&opt.allow404){if(id)setStatus(id,label,'ok',opt.info404||'keine Daten');return {__404:true};}
    if(!r.ok){let msg='';try{const j=await r.json();msg=j.reason||j.detail||'';}catch(e){}throw new Error('HTTP '+r.status+(msg?' – '+msg:''));}
    const j=await r.json();if(j&&j.error)throw new Error(j.reason||'Fehler');
    if(id)setStatus(id,label,'ok');if(opt.ttl)cachePut(url,j);return j;
  }catch(e){
    const why=e.name==='AbortError'?'Zeitüberschreitung':e.message;
    if(opt.ttl){const c=cacheGet(url,6*3600);if(c){if(id)setStatus(id,label,'ok',`Abruf gescheitert (${why}), zeige Daten von ${fTime(Math.floor(c.t/1000))} Uhr`);return c.j;}}
    if(id)setStatus(id,label,'err',why);return null;}
  finally{clearTimeout(tm);}
}
function om(kind,params){
  const key=(S.omKey||'').trim();
  const host={fc:'api.open-meteo.com/v1/forecast',ens:'ensemble-api.open-meteo.com/v1/ensemble',seas:'seasonal-api.open-meteo.com/v1/seasonal'}[kind];
  const q=Object.entries(params).map(([k,v])=>k+'='+encodeURIComponent(v).replace(/%2C/g,',')).join('&');
  return 'https://'+(key?'customer-':'')+host+'?'+q+(key?'&apikey='+encodeURIComponent(key):'');
}
const ll=(a,b)=>`${(+a).toFixed(4)},${(+b).toFixed(4)}`;
const V_DET='temperature_2m,relative_humidity_2m,precipitation,freezing_level_height,wind_speed_10m,wind_gusts_10m,cloud_cover,pressure_msl,temperature_850hPa,wind_speed_700hPa,wind_direction_700hPa,wind_direction_10m';
const V_ENS='temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m';
const TAL_MODELS=['geosphere_arome_austria','icon_d2','meteoswiss_icon_ch2','icon_eu','ecmwf_ifs','gfs_seamless'];
const TTL=15*60;
// Ohne Abo-Key: vorab berechnete Dateien vom Worker (gleiches Format wie die API). Mit Key: Open-Meteo-API (nur Fallback im Build).
const viaKey=()=>false; /* Einbau: nie die Open-Meteo-API */
const fromData=(file,id,label)=>getJSON(DATA+file,id,label+' (AWS Open Data, stündlich)',{timeout:30000});
const loadDet=()=>viaKey()?getJSON(om('fc',{latitude:S.bergLat,longitude:S.bergLon,elevation:S.bergElev,hourly:V_DET,models:DET_MODELS.map(m=>m.id).join(','),past_days:2,forecast_days:16,timeformat:'unixtime',timezone:TZ}),'om-det','Open-Meteo · Einzelmodelle (Berg)',{ttl:TTL}):fromData('det.json','om-det','Open-Meteo-Daten · Einzelmodelle Berg');
const loadTal=()=>viaKey()?getJSON(om('fc',{latitude:S.talLat,longitude:S.talLon,elevation:S.talElev,hourly:V_ENS,models:TAL_MODELS.join(','),past_days:2,forecast_days:16,timeformat:'unixtime',timezone:TZ}),'om-tal','Open-Meteo · Modelle Tal',{ttl:TTL}):fromData('tal.json','om-tal','Open-Meteo-Daten · Modelle Tal');
const loadEnsS=()=>viaKey()?getJSON(om('ens',{latitude:S.bergLat,longitude:S.bergLon,elevation:S.bergElev,hourly:V_ENS,models:'icon_d2_eps,icon_eu_eps',past_days:2,forecast_days:6,timeformat:'unixtime',timezone:TZ}),'om-ens-s','Open-Meteo · ICON-D2-EPS, ICON-EU-EPS',{ttl:TTL}):fromData('ens_s.json','om-ens-s','Open-Meteo-Daten · ICON-EPS');
const loadEnsL=()=>viaKey()?getJSON(om('ens',{latitude:S.bergLat,longitude:S.bergLon,elevation:S.bergElev,hourly:V_ENS+',temperature_850hPa',models:'ecmwf_ifs025,ecmwf_aifs025,gfs025',past_days:2,forecast_days:16,timeformat:'unixtime',timezone:TZ}),'om-ens-l','Open-Meteo · ECMWF ENS, AIFS-ENS, GEFS',{ttl:TTL}):fromData('ens_l.json','om-ens-l','Open-Meteo-Daten · ECMWF ENS, AIFS-ENS');
const loadSeas=()=>viaKey()?getJSON(om('seas',{latitude:S.bergLat,longitude:S.bergLon,models:'ecmwf_seas5',monthly:'temperature_2m_anomaly,precipitation_anomaly,snowfall_anomaly'}),'om-seas','Open-Meteo · ECMWF SEAS5',{ttl:12*3600}):fromData('seas.json','om-seas','Open-Meteo-Daten · ECMWF SEAS5');
// Status des stündlichen Laufs: Zeitpunkt, Modellläufe (Spalte „Lauf“), auf dem Gratis-Weg fehlende Systeme
const loadOmStatus=()=>viaKey()?Promise.resolve(null):getJSON(DATA+'status.json',null,null,{timeout:15000});
const loadArome=()=>getJSON(`${GS}/timeseries/forecast/nwp-v2-1h-1km?lat_lon=${ll(S.bergLat,S.bergLon)}&lat_lon=${ll(S.talLat,S.talLon)}&parameters=2t,2r,tp,10u,10v,10fg,snowlmt,tcc,msl`,'gs-arome','GeoSphere · AROME 1 km',{ttl:TTL});
const loadClaef=()=>getJSON(`${GS}/timeseries/forecast/ensemble-v2-1h-1km?lat_lon=${ll(S.bergLat,S.bergLon)}&parameters=sf_p10,sf_p50,sf_p90,tp_p50,2t_p50,10u_p50,10v_p50,snowlmt_p50`,'gs-claef','GeoSphere · C-LAEF 1 km',{ttl:TTL});
function loadInca(){const n=Math.floor(Date.now()/3600000)*3600;return getJSON(`${GS}/timeseries/historical/inca-v2-1h-1km?parameters=2t,2r,tp,10u,10v&start=${isoUTC(n-74*3600)}&end=${isoUTC(n+3600)}&lat_lon=${ll(S.bergLat,S.bergLon)}&lat_lon=${ll(S.talLat,S.talLon)}`,'gs-inca','GeoSphere · INCA-Analyse 1 km');}
function loadTawes(){const n=Math.floor(Date.now()/600000)*600;const ids=STATIONS.map(s=>s.id).join(',');
  return Promise.all([
    getJSON(`${GS}/station/current/tawes-v1-10min?parameters=TL,RF,FF,FFX,DD,RR,SCHNEE,P&station_ids=${ids}`,'gs-tawes','GeoSphere · TAWES-Stationen'),
    getJSON(`${GS}/station/historical/tawes-v1-10min?parameters=TL,RF,FF,FFX,DD,RR,SCHNEE&station_ids=${ids}&start=${isoUTC(n-24*3600)}&end=${isoUTC(n+600)}`,null,null)
  ]);}
async function loadLawine(){
  const j=await getJSON('https://static.lawinen-warnung.eu/bulletins/latest/AT-05_de_CAAMLv6.json','lawis','Lawinenwarndienst Salzburg (LAWIS)',{allow404:true,info404:'noch kein Bericht veröffentlicht'});
  if(!j)return {error:true};if(j.__404)return {none:true};
  const b=(j.bulletins||[]).find(x=>(x.regions||[]).some(r=>r.regionID===REGION));
  return b?{b}:{none:true};
}
async function loadSnowgrid(){
  const key='swx.sg.v4',today=lp(Math.floor(Date.now()/1000)).key,ck=ll(S.bergLat,S.bergLon)+'|'+ll(S.talLat,S.talLon);
  const c=store.get(key,null);
  if(c&&c.day===today&&c.ck===ck){setStatus('gs-sg','GeoSphere · SNOWGRID 1991–heute','ok','aus Zwischenspeicher');return c.data;}
  const end=new Date().toISOString().slice(0,10);
  const j=await getJSON(`${GS}/timeseries/historical/snowgrid_cl-v2-1d-1km?parameters=snow_depth&start=1990-08-01&end=${end}&lat_lon=${ll(S.bergLat,S.bergLon)}&lat_lon=${ll(S.talLat,S.talLon)}`,'gs-sg','GeoSphere · SNOWGRID 1991–heute',{timeout:60000});
  if(!j||!j.features)return null;
  const data=procSnowgrid(j);store.set(key,{day:today,ck,data});return data;
}
const MISS_LABEL={geosphere_arome_austria:'AROME Austria 2,5 km',icon_d2_eps:'ICON-D2-EPS',icon_eu_eps:'ICON-EU-EPS',gfs025:'GEFS',temperature_850hPa_ensemble:'Ensembles in 850 hPa'};
let OMGEN=null;
function applyOmStatus(st){
  META={};OMGEN=null;if(!st)return;
  OMGEN=st.erzeugt?Math.round(Date.parse(st.erzeugt)/1000):null;
  for(const[id,t]of Object.entries(st.laeufe||{}))if(ok(t)&&Date.now()/1000-t<2.5*86400)META[id]=t;
  const miss=Object.keys(st.fehlend||{});
  for(const k of miss)setStatus('miss-'+k,MISS_LABEL[k]||k,'na','auf dem Gratis-Datenweg nicht verfügbar');
  const sys=miss.filter(k=>k!=='temperature_850hPa_ensemble').map(k=>MISS_LABEL[k]||k),el=$('missSys');
  if(el)el.textContent=sys.length?`; derzeit: ${sys.join(', ')}`:'';
}

/* ======================= Aufbereitung ======================= */
const toSec=s=>Math.round(Date.parse(s)/1000);
function align(times,arr,fn){const out=new Array(AX.length).fill(null);if(!arr)return out;for(let j=0;j<times.length;j++){const i=AXI.get(times[j]);if(i!==undefined&&arr[j]!=null)out[i]=fn?fn(arr[j]):arr[j];}return out;}
function nearestFeature(fc,lat,lon){if(!fc||!fc.features||!fc.features.length)return null;let best=null,bd=1e9;for(const f of fc.features){const[x,y]=f.geometry.coordinates;const d=(x-lon)**2+(y-lat)**2;if(d<bd){bd=d;best=f;}}return best;}
const hasData=a=>!!a&&a.some(v=>v!=null);
function gsSeries(fc,f,def){
  const t=fc.timestamps.map(toSec),p=f.properties.parameters,g=k=>p[k]?p[k].data:null;
  const u=g('10u'),v=g('10v');const W=u&&v?u.map((x,i)=>x==null||v[i]==null?null:Math.hypot(x,v[i])*3.6):null;
  return Object.assign({sid:def.id,label:def.label,sys:def.block,kind:'det',meta:def},{
    T:align(t,g('2t')),RH:align(t,g('2r')),P:align(t,g('tp')),W:align(t,W),G:align(t,g('10fg'),x=>x*3.6),
    SL:align(t,g('snowlmt')),CC:align(t,g('tcc')),PM:align(t,g('msl'),x=>x/100),FZL:null,T850:null,W7:null,D7:null});
}
function parseEns(j,systems){
  const res=[];if(!j||!j.hourly)return res;const h=j.hourly,t=h.time;
  const VAR={T:'temperature_2m',RH:'relative_humidity_2m',P:'precipitation',W:'wind_speed_10m',T850:'temperature_850hPa'};
  for(const sys of systems){
    const mids=new Set();
    for(const k of Object.keys(h)){if(!k.endsWith('_'+sys.suffix))continue;const rest=k.slice(0,-(sys.suffix.length+1));const m=rest.match(/_member(\d+)$/);mids.add(m?m[1]:'00');}
    for(const mid of [...mids].sort()){
      const s={sid:sys.id+'#'+mid,label:sys.label,sys:sys.id,kind:'ens'};
      for(const[k,v]of Object.entries(VAR)){const key=mid==='00'?`${v}_${sys.suffix}`:`${v}_member${mid}_${sys.suffix}`;s[k]=h[key]?align(t,h[key]):null;}
      if(hasData(s.P)&&hasData(s.T))res.push(s);
    }
  }
  return res;
}
function splice(s,obs){if(!obs)return;for(let i=0;i<=obs.last&&i<AX.length;i++){if(obs.P[i]==null)continue;if(s.P)s.P[i]=obs.P[i];if(s.T&&obs.T[i]!=null)s.T[i]=obs.T[i];if(s.RH&&obs.RH[i]!=null)s.RH[i]=obs.RH[i];if(s.W&&obs.W[i]!=null)s.W[i]=obs.W[i];}}
function derive(s){
  const n=AX.length;s.SN=new Array(n).fill(null);s.RN=new Array(n).fill(null);s.TW=new Array(n).fill(null);
  for(let i=0;i<n;i++){const P=s.P?s.P[i]:null,T=s.T?s.T[i]:null;if(T!=null)s.TW[i]=wetBulb(T,s.RH?s.RH[i]:null);if(P==null||T==null)continue;
    const RH=s.RH?s.RH[i]:null,f=snowFrac(T,s.TW[i],RH!=null),W=s.W?s.W[i]:null;s.SN[i]=P*f*slr(T,W)/10;s.RN[i]=P*(1-f);}
}
function consensus(list,extraSL){
  const n=AX.length,keys=['T','RH','P','SN','RN','W','G','FZL','CC','PM','T850','SL','TW'],R={};
  for(const k of keys){R[k]=new Array(n).fill(null);for(let i=0;i<n;i++){const v=[];for(const s of list){const a=s[k];if(a&&a[i]!=null)v.push(a[i]);}if(k==='SL'&&extraSL)for(const a of extraSL)if(a&&a[i]!=null)v.push(a[i]);if(v.length)R[k][i]=median(v);}}
  // Wind als Vektor mitteln: Höhenwind 700 hPa (W7/D7) und Windrichtung 10 m am Berg (D10)
  const vec=(wk,dk,outW)=>{const D=new Array(n).fill(null);if(outW)R[outW]=new Array(n).fill(null);
    for(let i=0;i<n;i++){const us=[],vs=[];for(const s of list){if(!s[wk]||!s[dk]||s[wk][i]==null||s[dk][i]==null)continue;const r=s[dk][i]*Math.PI/180,w=Math.max(s[wk][i],0.1);us.push(-w*Math.sin(r));vs.push(-w*Math.cos(r));}
      if(us.length){const u=median(us),v=median(vs);if(outW)R[outW][i]=Math.hypot(u,v);D[i]=(Math.atan2(-u,-v)*180/Math.PI+360)%360;}}
    return D;};
  R.D7=vec('W7','D7','W7');R.D10=vec('W','D10');
  return R;
}
function buildAll(src){
  NOW=Math.floor(Date.now()/1000);
  AX=src.det.hourly.time;AXI=new Map(AX.map((t,i)=>[t,i]));
  iNow=0;for(let i=0;i<AX.length;i++){if(AX[i]<=NOW)iNow=i;else break;}
  SERIES=[];
  const h=src.det.hourly;
  for(const m of DET_MODELS){const g=v=>h[v+'_'+m.id]||null;
    const s={sid:m.id,label:m.label,sys:m.block,kind:'det',meta:m,T:g('temperature_2m'),RH:g('relative_humidity_2m'),P:g('precipitation'),W:g('wind_speed_10m'),G:g('wind_gusts_10m'),FZL:g('freezing_level_height'),CC:g('cloud_cover'),PM:g('pressure_msl'),T850:g('temperature_850hPa'),W7:g('wind_speed_700hPa'),D7:g('wind_direction_700hPa'),D10:g('wind_direction_10m')};
    if(!hasData(s.FZL)){ // Fallback: 0-Grad-Grenze aus 850 hPa (≈1.500 m) bzw. 2-m-Temperatur am Berg, ~6,5 K/km
      s.FZL=AX.map((t,i)=>s.T850&&s.T850[i]!=null?clamp(1500+s.T850[i]*155,0,4500):s.T&&s.T[i]!=null?clamp(S.bergElev+s.T[i]/0.0065,0,4500):null);s.fzlEst=true;}
    s.SL=s.FZL.map(v=>v==null?null:Math.max(0,v-300));
    if(hasData(s.P)&&hasData(s.T))SERIES.push(s);}
  let gsTal=null;
  if(src.ar&&src.ar.features){const fb=nearestFeature(src.ar,S.bergLat,S.bergLon),ft=nearestFeature(src.ar,S.talLat,S.talLon);
    if(fb){const s=gsSeries(src.ar,fb,GS_AROME);if(hasData(s.P))SERIES.push(s);}
    if(ft&&ft!==fb)gsTal=gsSeries(src.ar,ft,GS_AROME);}
  SERIES.push(...parseEns(src.es,ENS_SYS.filter(e=>e.id==='icon_d2_eps'||e.id==='icon_eu_eps')));
  SERIES.push(...parseEns(src.el,ENS_SYS.filter(e=>['ecmwf_ifs025','ecmwf_aifs025','gfs025'].includes(e.id))));
  // INCA
  INCA=null;
  if(src.inc&&src.inc.features){const t=src.inc.timestamps.map(toSec);const mk=f=>{if(!f)return null;const p=f.properties.parameters,g=k=>p[k]?p[k].data:null;const u=g('10u'),v=g('10v');
      const o={T:align(t,g('2t')),RH:align(t,g('2r')),P:align(t,g('tp')),W:align(t,u&&v?u.map((x,i)=>x==null||v[i]==null?null:Math.hypot(x,v[i])*3.6):null)};
      o.last=-1;for(let i=0;i<AX.length;i++)if(o.P[i]!=null&&o.T[i]!=null)o.last=i;derive(o);return o;};
    const fb=nearestFeature(src.inc,S.bergLat,S.bergLon),ft=nearestFeature(src.inc,S.talLat,S.talLon);
    INCA={berg:mk(fb),tal:ft!==fb?mk(ft):null};}
  if(INCA&&INCA.berg&&INCA.berg.last>=0)for(const s of SERIES)splice(s,INCA.berg);
  // C-LAEF
  CL=null;
  if(src.cl&&src.cl.features&&src.cl.features[0]){const t=src.cl.timestamps.map(toSec),p=src.cl.features[0].properties.parameters,g=k=>p[k]?p[k].data:null;
    const u=g('10u_p50'),v=g('10v_p50');
    CL={sf10:align(t,g('sf_p10')),sf50:align(t,g('sf_p50')),sf90:align(t,g('sf_p90')),tp50:align(t,g('tp_p50')),T:align(t,g('2t_p50')),W:align(t,u&&v?u.map((x,i)=>x==null||v[i]==null?null:Math.hypot(x,v[i])*3.6):null),SL:align(t,g('snowlmt_p50'))};
    if(!hasData(CL.sf50))CL=null;
    else if(INCA&&INCA.berg){const o=INCA.berg;for(let i=0;i<=o.last;i++){if(o.P[i]==null||o.SN[i]==null)continue;const swe=o.P[i]-(o.RN[i]||0);CL.sf10[i]=CL.sf50[i]=CL.sf90[i]=swe;CL.tp50[i]=o.P[i];CL.T[i]=o.T[i];if(o.W[i]!=null)CL.W[i]=o.W[i];}}}
  SERIES.forEach(derive);
  // Tal
  TALS=[];
  if(src.tal&&src.tal.hourly){const th=src.tal.hourly,tt=th.time;for(const id of TAL_MODELS){const g=v=>th[v+'_'+id]?align(tt,th[v+'_'+id]):null;const s={sid:id,T:g('temperature_2m'),RH:g('relative_humidity_2m'),P:g('precipitation'),W:g('wind_speed_10m')};if(hasData(s.T))TALS.push(s);}}
  if(gsTal&&hasData(gsTal.T))TALS.push(gsTal);
  if(INCA&&INCA.tal&&INCA.tal.last>=0)for(const s of TALS)splice(s,INCA.tal);
  TALS.forEach(derive);
  K=consensus(SERIES.filter(s=>s.kind==='det'),CL?[CL.SL]:null);
  KT=consensus(TALS);
  // Ensemble-Band Temperatur
  ENSQ={T10:new Array(AX.length).fill(null),T90:new Array(AX.length).fill(null)};
  const ens=SERIES.filter(s=>s.kind==='ens');
  for(let i=0;i<AX.length;i++){const v=[];for(const s of ens)if(s.T[i]!=null)v.push(s.T[i]);if(v.length>=10){ENSQ.T10[i]=quant(v,.1);ENSQ.T90[i]=quant(v,.9);}}
  PLUME=buildPlume();
  DAYS=[];const todayKey=lp(NOW).key;
  for(let i=0;i<AX.length;i++){const p=lp(AX[i]);if(p.h===9&&p.mi===0&&p.key>=todayKey)DAYS.push({key:p.key,iEnd:i,t:AX[i]});}
  DAYRES=DAYS.map(evalDay);
  EVENTS=detectEvents();
  // Standardtag: höchste Powder-Chance der nächsten 7 Tage
  let best=-1,bi=Math.min(1,DAYRES.length-1);
  DAYRES.forEach((r,k)=>{if(r&&k<7&&r.Pp>best+0.02){best=r.Pp;bi=k;}});
  if(best<0.05){bi=lp(NOW).h>=12&&DAYRES.length>1?1:0;}
  selDay=Math.max(0,bi);
}

/* ======================= Powder-Modell ======================= */
function evalMember(s,iEnd,thr){
  const i0=iEnd-23;if(i0<0)return null;
  let N24=0,R24=0,ws=0,Tsw=0,Wsw=0,wn=0;
  for(let i=i0;i<=iEnd;i++){const sn=s.SN[i];if(sn==null)return null;N24+=sn;R24+=s.RN[i]||0;if(sn>0){ws+=sn;Tsw+=sn*s.T[i];if(s.W&&s.W[i]!=null){Wsw+=sn*s.W[i];wn+=sn;}}}
  let N48=N24,full=true;for(let i=iEnd-47;i<i0;i++){if(i<0||s.SN[i]==null){full=false;break;}N48+=s.SN[i];}if(!full)N48=N24;
  let Nd=0;for(let i=iEnd+1;i<=iEnd+3&&i<AX.length;i++)if(s.SN[i]!=null)Nd+=s.SN[i];
  let Tmax=null;for(let i=iEnd;i<=iEnd+6&&i<AX.length;i++)if(s.T[i]!=null)Tmax=Tmax==null?s.T[i]:Math.max(Tmax,s.T[i]);
  const E=N24+0.4*(N48-N24)+0.5*Nd,Ts=ws>0?Tsw/ws:null,Ws=wn>0?Wsw/wn:null,q=quality(R24,Ts,Ws,Tmax);
  return {N24,N48,E,R24,Ts,Ws,Tmax,q,hit:E>=thr,score:E>=thr?q:0};
}
function evalClaef(iEnd,thr){
  if(!CL)return null;const i0=iEnd-23;if(i0<0)return null;
  const N=[],E=[],PR=[];
  for(const p of ['10','50','90']){const sf=CL['sf'+p];let n24=0;
    for(let i=i0;i<=iEnd;i++){if(sf[i]==null)return null;n24+=sf[i]*slr(CL.T[i],CL.W[i])/10;}
    let n48=n24,full=true;for(let i=iEnd-47;i<i0;i++){if(i<0||sf[i]==null){full=false;break;}n48+=sf[i]*slr(CL.T[i],CL.W[i])/10;}if(!full)n48=n24;
    let nd=0;for(let i=iEnd+1;i<=iEnd+3&&i<AX.length;i++)if(sf[i]!=null)nd+=sf[i]*slr(CL.T[i],CL.W[i])/10;
    N.push(n24);E.push(n24+0.4*(n48-n24)+0.5*nd);PR.push(n48-n24);}
  let R=0,ws=0,Tsw=0,Wsw=0,wn=0;
  for(let i=i0;i<=iEnd;i++){const s=CL.sf50[i]||0,tp=CL.tp50[i];if(tp!=null)R+=Math.max(0,tp-s);if(s>0){ws+=s;Tsw+=s*(CL.T[i]||0);if(CL.W[i]!=null){Wsw+=s*CL.W[i];wn+=s;}}}
  let Tmax=null;for(let i=iEnd;i<=iEnd+6&&i<AX.length;i++)if(CL.T[i]!=null)Tmax=Tmax==null?CL.T[i]:Math.max(Tmax,CL.T[i]);
  const Ts=ws>0?Tsw/ws:null,Ws=wn>0?Wsw/wn:null,q=quality(R,Ts,Ws,Tmax),Pa=cdfExceed(thr,E[0],E[1],E[2]);
  return {N,E,PR,Pa,Pp:Pa*q,P5:cdfExceed(5,N[0],N[1],N[2]),Ts,Ws,R,Tmax};
}
function evalDay(d){
  const thr=S.thr,lead=Math.max(0,(d.t-NOW)/3600),W=sysWeights(lead),parts=[];
  for(const[sys,w]of Object.entries(W)){
    if(sys==='claef'){const c=evalClaef(d.iEnd,thr);if(c&&ok(c.Pa))parts.push({sys,w,n:1,Pp:c.Pp,Pa:c.Pa,P5:c.P5,N:c.N.map(v=>[v,1/3]),E:c.E.map(v=>[v,1/3]),PR:[c.PR[1]],Ts:[c.Ts],Ws:[c.Ws],R:[c.R],Tm:[c.Tmax]});continue;}
    const all=SERIES.filter(s=>s.sys===sys);if(!all.length)continue;
    const ms=all.map(s=>evalMember(s,d.iEnd,thr)).filter(Boolean);if(!ms.length)continue;
    if(sys!=='hr'&&sys!=='gd'&&ms.length<all.length*.5)continue;
    parts.push({sys,w,n:ms.length,Pp:avg(ms.map(m=>m.score)),Pa:avg(ms.map(m=>m.hit?1:0)),P5:avg(ms.map(m=>m.N24>=5?1:0)),N:ms.map(m=>[m.N24,1/ms.length]),E:ms.map(m=>[m.E,1/ms.length]),PR:ms.map(m=>m.N48-m.N24),Ts:ms.map(m=>m.Ts),Ws:ms.map(m=>m.Ws),R:ms.map(m=>m.R24),Tm:ms.map(m=>m.Tmax)});
  }
  const ws=parts.reduce((a,p)=>a+p.w,0);if(!ws)return null;
  for(const p of parts)p.wn=p.w/ws;
  const sum=f=>parts.reduce((a,p)=>a+p.wn*(p[f]||0),0);
  const[q10,q50,q90]=wq(parts.flatMap(p=>p.N.map(([v,f])=>({v,w:p.wn*f}))),[.1,.5,.9]);
  const wi=key=>parts.flatMap(p=>{const a=p[key].filter(ok);return a.map(v=>({v,w:p.wn/a.length}));});
  const Ts=wq(wi('Ts'),[.5])[0],Ws=wq(wi('Ws'),[.5])[0],[R,R90]=wq(wi('R'),[.5,.9]),Tmx=wq(wi('Tm'),[.5])[0],prev=wq(wi('PR'),[.5])[0];
  const e50=wq(parts.flatMap(p=>p.E.map(([v,f])=>({v,w:p.wn*f}))),[.5])[0];
  const why=[];if(ok(R)&&R>=1)why.push(`Regen am Berg (${f1(R)} mm)`);if(ok(Ts)&&Ts>.5)why.push('nasser Schneefall');if(ok(Tmx)&&Tmx>=4)why.push(`Erwärmung auf ${fT0(Tmx)} bis 15 Uhr`);if(ok(Ws)&&Ws>=45)why.push(`Wind ${f0(Ws)} km/h beim Schneefall`);
  // Konsens-Beschreibung
  const win=[];for(let i=d.iEnd-23;i<=d.iEnd;i++)if(i>=0)win.push(i);
  const dayIdx=[];for(let i=0;i<AX.length;i++)if(lp(AX[i]).key===d.key)dayIdx.push(i);
  const pick=(arr,idx)=>idx.map(i=>arr?arr[i]:null).filter(ok);
  const SLw=pick(K.SL,win),Tday=pick(K.T,dayIdx),Ttal=pick(KT.T,dayIdx),Gday=pick(K.G,dayIdx);
  const cc=pick(K.CC,dayIdx.filter(i=>{const h=lp(AX[i]).h;return h>=9&&h<=15;}));
  const D7=pick(K.D7,win),W7=pick(K.W7,win),Pw=pick(K.P,win);
  let preSnow=0;for(let i=iNow+1;i<=d.iEnd-24&&i<AX.length;i++)if(PLUME&&PLUME.q50[i]!=null){preSnow=PLUME.q50[i];}
  const spread=ok(q90)&&ok(q10)?q90-q10:null;
  let conf='gering';if(ok(spread)){if(lead<=54&&spread<=Math.max(8,0.8*(q50||0)))conf='hoch';else if(lead<=132&&spread<=Math.max(14,1.2*(q50||0)))conf='mittel';}
  const u7=avg(D7.map((d,k)=>-W7[k]*Math.sin(d*Math.PI/180))),v7=avg(D7.map((d,k)=>-W7[k]*Math.cos(d*Math.PI/180)));
  const dir7=ok(u7)&&ok(v7)?(Math.atan2(-u7,-v7)*180/Math.PI+360)%360:null,spd7=ok(u7)&&ok(v7)?Math.hypot(u7,v7):null;
  const Psum=Pw.reduce((a,b)=>a+b,0);
  const nordstau=ok(dir7)&&(dir7>=270||dir7<=20)&&spd7>=30&&Psum>=10;
  return {Pp:sum('Pp'),Pa:sum('Pa'),P5:sum('P5'),q10,q50,q90,Ts,Ws,R,R90,Tmx,prev,e50,why,lead,conf,
    runs:parts.reduce((a,p)=>a+p.n,0),parts:parts.map(p=>({sys:p.sys,wn:p.wn,n:p.n,Pp:p.Pp,Pa:p.Pa})),
    SLmin:SLw.length?Math.min(...SLw):null,SLmax:SLw.length?Math.max(...SLw):null,
    Tmin:Tday.length?Math.min(...Tday):null,Tmax:Tday.length?Math.max(...Tday):null,
    TtalMin:Ttal.length?Math.min(...Ttal):null,TtalMax:Ttal.length?Math.max(...Ttal):null,
    Gmax:Gday.length?Math.max(...Gday):null,CC:avg(cc),dir7,spd7,Psum,nordstau,preSnow};
}
function buildPlume(){
  const n=AX.length,cum=new Map();
  const cumOf=a=>{const o=new Array(n).fill(null);let c=0;o[iNow]=0;for(let i=iNow+1;i<n;i++){if(a[i]==null)break;c+=a[i];o[i]=c;}return o;};
  for(const s of SERIES)cum.set(s.sid,cumOf(s.SN));
  let CLc=null;
  if(CL){CLc=['10','50','90'].map(p=>cumOf(CL['sf'+p].map((v,i)=>v==null?null:v*slr(CL.T[i],CL.W[i])/10)));}
  const q10=new Array(n).fill(null),q50=new Array(n).fill(null),q90=new Array(n).fill(null);
  for(let i=iNow;i<n;i++){
    const W=sysWeights((AX[i]-NOW)/3600),groups={};
    for(const s of SERIES){const v=cum.get(s.sid)[i];if(v==null)continue;(groups[s.sys]=groups[s.sys]||[]).push(v);}
    if(CLc){const a=CLc.map(c=>c[i]).filter(ok);if(a.length===3)groups.claef=a;}
    let ws=0;for(const k in groups)if(W[k])ws+=W[k];if(!ws)continue;
    const items=[];for(const k in groups){if(!W[k])continue;const arr=groups[k];for(const v of arr)items.push({v,w:W[k]/ws/arr.length});}
    const r=wq(items,[.1,.5,.9]);
    // kumulierte Größen können nicht sinken: Sprünge durch auslaufende Systeme glätten
    q10[i]=i>iNow&&q10[i-1]!=null?Math.max(r[0],q10[i-1]):r[0];q50[i]=i>iNow&&q50[i-1]!=null?Math.max(r[1],q50[i-1]):r[1];q90[i]=i>iNow&&q90[i-1]!=null?Math.max(r[2],q90[i-1]):r[2];
  }
  return {cum,q10,q50,q90};
}
function snowWord(Ts){if(!ok(Ts))return ['–',''];if(Ts<=-7)return ['Champagne','sehr leicht und trocken'];if(Ts<=-3)return ['Trockener Pulver','leicht, gut zu fahren'];if(Ts<=-0.5)return ['Kompakter Pulver','etwas schwerer'];if(Ts<=0.5)return ['Feucht','schwer, gesetzt'];return ['Nass','Pappschnee'];}
function windWord(W){if(!ok(W))return ['–',''];if(W<20)return ['Ruhig','kaum Windeinfluss'];if(W<40)return ['Mäßig','teils windgepresst'];if(W<60)return ['Stark','verblasen, Triebschnee'];return ['Sturm','Schnee wird verfrachtet'];}
function verdict(p){if(!ok(p))return '–';if(p<.1)return 'Kein Powder in Sicht';if(p<.3)return 'Möglich, im Auge behalten';if(p<.5)return 'Gute Chancen';if(p<.75)return 'Powder-Alarm';return 'Fix Powder – Wecker stellen';}

/* ======================= Wetterumschwünge ======================= */
function detectEvents(){
  const ev=[],end=Math.min(AX.length-1,iNow+240);
  DAYS.forEach((d,k)=>{const r=DAYRES[k];if(!r||k>9)return;const when=relDayCap(d.t);
    const dump=ok(r.prev)&&r.prev>=S.thr*.6&&(!ok(r.q50)||r.q50<S.thr);
    const amt=dump?`Tag nach dem Schneefall: rund ${fCm(r.prev)} cm vom Vortag, dazu ${fCm(r.q50)} cm frisch bis Liftstart.`:`Erwartet ${fCm(r.q50)} cm bis Liftstart (Spanne ${fCm(r.q10)}–${fCm(r.q90)} cm).`;
    const qual=!dump&&ok(r.Ts)?` Qualität: ${snowWord(r.Ts)[0]}.`:'';
    const ded=r.Pa-r.Pp>.05&&r.why.length?` Abzug: ${r.why.join(', ')}.`:'';
    if(r.Pp>=.5)ev.push({t:d.t-3*3600,type:'powder',tag:'Powder-Alarm',title:`${when}: ${pct(r.Pp)} Powder-Chance`,text:amt+qual+ded+(r.nordstau?' Nordstaulage: unsere Tauern-Nordseite bekommt viel ab.':'')});
    else if(r.Pp>=.3)ev.push({t:d.t-3*3600,type:'powder',tag:'Powder möglich',title:`${when}: ${pct(r.Pp)} Powder-Chance`,text:amt+ded+' Noch unsicher, weiter beobachten.'});
    else if(ok(r.q50)&&r.q50>=5)ev.push({t:d.t-3*3600,type:'snow',tag:'Neuschnee',title:`${when}: rund ${fCm(r.q50)} cm`,text:`Spanne ${fCm(r.q10)}–${fCm(r.q90)} cm bis 9 Uhr, Schneefallgrenze ${fM(r.SLmin)}${r.SLmax-r.SLmin>150?' bis '+fM(r.SLmax):''}.`});
    if(ok(r.R)&&r.R>=5)ev.push({t:d.t-6*3600,type:'warn',tag:'Regen am Berg',title:`${when}: Regen bis ${f0(S.bergElev)} m`,text:`Etwa ${f0(r.R)} mm Regen auf Berghöhe, Schneefallgrenze bis ${fM(r.SLmax)}. Bruchharsch danach wahrscheinlich.`});
    if(r.nordstau&&r.Pp<.3)ev.push({t:d.t-6*3600,type:'change',tag:'Nordstau',title:`${when}: Nordstaulage`,text:`Strömung aus ${dirName(r.dir7)} in 3.000 m, ${f0(r.Psum)} mm Niederschlag. Die Tauern-Nordseite staut.`});
  });
  const scanRuns=(cond,minLen,make)=>{let i=iNow;while(i<=end){if(cond(i)){let j=i;while(j+1<=end&&cond(j+1))j++;if(j-i+1>=minLen)make(i,j);i=j+1;}else i++;}};
  // Kaltfront / Warmluft
  const T8=K.T850;let skip=-1;
  for(let i=iNow;i+24<=end;i++){if(i<skip||T8[i]==null||T8[i+24]==null)continue;const d=T8[i+24]-T8[i];
    if(d<=-7){let bi=i,bd=d;for(let j=i;j<i+12&&j+24<=end;j++){if(T8[j]!=null&&T8[j+24]!=null&&T8[j+24]-T8[j]<bd){bd=T8[j+24]-T8[j];bi=j;}}
      const tm=AX[bi+12];ev.push({t:tm,type:'change',tag:'Kaltfront',title:`${relDayCap(tm)} ${partOfDay(tm)}: Kaltfront`,text:`Temperatur in 1.500 m fällt um ${f0(-bd)} K in 24 h, auf ${fT0(T8[bi+24])}. Danach Schnee bis ${fM(K.SL[bi+24])}.`});skip=bi+36;}
    else if(d>=8){const tm=AX[i+12];ev.push({t:tm,type:'warn',tag:'Warmluft',title:`${relDayCap(tm)} ${partOfDay(tm)}: Warmluftvorstoß`,text:`Temperatur in 1.500 m steigt um ${f0(d)} K in 24 h, Nullgradgrenze auf ${fM(K.FZL[i+24])}.`});skip=i+36;}}
  scanRuns(i=>K.D7[i]!=null&&K.D7[i]>=140&&K.D7[i]<=230&&K.W7[i]>=55,3,(a,b)=>{let mx=0;for(let i=a;i<=b;i++)mx=Math.max(mx,K.W7[i]);ev.push({t:AX[a],type:'warn',tag:'Südföhn',title:`${relDayCap(AX[a])} ${partOfDay(AX[a])}: Südföhn`,text:`Bis ${f0(mx)} km/h aus Süd in 3.000 m über ${b-a+1} h. Föhnsturm am Tauernkamm, rasche Erwärmung, Schnee wird verfrachtet.`});});
  scanRuns(i=>K.G[i]!=null&&K.G[i]>=75,2,(a,b)=>{let mx=0;for(let i=a;i<=b;i++)mx=Math.max(mx,K.G[i]);ev.push({t:AX[a],type:'warn',tag:'Sturm',title:`${relDayCap(AX[a])} ${partOfDay(AX[a])}: Sturmböen am Berg`,text:`Böen bis ${f0(mx)} km/h auf ${f0(S.bergElev)} m.`});});
  skip=-1;for(let i=iNow;i+24<=end;i++){if(i<skip||K.PM[i]==null||K.PM[i+24]==null)continue;const d=K.PM[i+24]-K.PM[i];if(d<=-8){ev.push({t:AX[i+12],type:'change',tag:'Druckfall',title:`${relDayCap(AX[i+12])} ${partOfDay(AX[i+12])}: rascher Druckfall`,text:`Luftdruck fällt um ${f0(-d)} hPa in 24 h. Deutliches Zeichen für einen Wetterumschwung.`});skip=i+36;}}
  scanRuns(i=>K.T[i]!=null&&K.T[i]>=5,4,(a,b)=>{let mx=-99;for(let i=a;i<=b;i++)mx=Math.max(mx,K.T[i]);ev.push({t:AX[a],type:'warn',tag:'Tauwetter',title:`${relDayCap(AX[a])}: Tauwetter am Berg`,text:`Bis ${fT0(mx)} auf ${f0(S.bergElev)} m über ${b-a+1} h.`});});
  scanRuns(i=>KT.TW[i]!=null&&KT.TW[i]<=S.snProp,6,(a,b)=>{let mn=99;for(let i=a;i<=b;i++)mn=Math.min(mn,KT.TW[i]);ev.push({t:AX[a],type:'info',tag:'Beschneiung',title:`${relDayCap(AX[a])} ab ${fTime(AX[a])}: Schneifenster im Tal`,text:`${b-a+1} h schneibar auf ${f0(S.talElev)} m (Feuchttemperatur bis ${fT(mn)}). Details im Bereich Beschneiung.`});});
  return ev.filter(e=>e.t>=NOW-12*3600).sort((a,b)=>a.t-b.t);
}

/* ======================= Diagramm-Helfer ======================= */
function niceTicks(min,max,n){const span=max-min||1,raw=span/(n||5),mag=Math.pow(10,Math.floor(Math.log10(raw))),st=[1,2,2.5,5,10].map(m=>m*mag).find(s=>s>=raw)||raw;const out=[];for(let v=Math.ceil(min/st)*st;v<=max+1e-9;v+=st)out.push(+v.toFixed(6));return out;}
function range(arrs,i0,i1,pad,minSpan){let lo=Infinity,hi=-Infinity;for(const a of arrs){if(!a)continue;for(let i=Math.max(0,i0);i<=i1&&i<a.length;i++){const v=a[i];if(v!=null&&isFinite(v)){if(v<lo)lo=v;if(v>hi)hi=v;}}}if(!isFinite(lo))return [0,1];if(hi-lo<(minSpan||0)){const m=(hi+lo)/2;lo=m-minSpan/2;hi=m+minSpan/2;}const p=(hi-lo)*(pad||0.08);return [lo-p,hi+p];}
const tip=$('tip');
function showTip(html,x,y){tip.innerHTML=html;tip.hidden=false;const r=tip.getBoundingClientRect(),vw=innerWidth,vh=innerHeight;let l=x+14,t=y+14;if(l+r.width>vw-8)l=x-r.width-14;if(l<8)l=8;if(t+r.height>vh-8)t=y-r.height-14;if(t<8)t=8;tip.style.left=l+'px';tip.style.top=t+'px';
  // Im Einbau kann ein Element der Homepage (transform, contain) der Bezugsrahmen für position:fixed sein: Versatz ausgleichen
  const q=tip.getBoundingClientRect();if(Math.abs(q.left-l)>.5||Math.abs(q.top-t)>.5){tip.style.left=(2*l-q.left)+'px';tip.style.top=(2*t-q.top)+'px';}}
function hideTip(){tip.hidden=true;}
const tr=(k,v)=>`<div class="r"><span>${k}</span><span>${v}</span></div>`;

function timeChart(host,cfg){
  const W=Math.max(300,Math.floor(host.clientWidth||640)),narrow=W<560;
  const padL=narrow?36:46,padR=cfg.panels.some(p=>p.y2)?(narrow?34:44):12,iw=W-padL-padR;
  const ts=cfg.ts||AX,t0=cfg.t0,t1=cfg.t1;
  let y=4;const P=cfg.panels.map(p=>{const o=Object.assign({},p);o.y0=y+18;o.y1=o.y0+p.h;y=o.y1+22;return o;});
  const H=P[P.length-1].y1+(cfg.months?24:28);
  const X=t=>padL+(t-t0)/(t1-t0)*iw;
  const uid=host.id+'c'+Math.random().toString(36).slice(2,7);
  const o=[`<svg class="tc" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="${esc(cfg.label||'')}"><defs>`];
  P.forEach((p,k)=>o.push(`<clipPath id="${uid}${k}"><rect x="${padL}" y="${p.y0}" width="${iw}" height="${p.h}"/></clipPath>`));o.push('</defs>');
  // Nacht + Tageslinien / Monate
  const top=P[0].y0,bot=P[P.length-1].y1;
  if(!cfg.months){
    let tt=Math.floor(t0/3600)*3600,ns=null;const nights=[],mids=[],noons=[];
    for(;tt<=t1+3600;tt+=3600){const p=lp(tt),night=p.h<7||p.h>=17;if(night&&ns==null)ns=tt;if(!night&&ns!=null){nights.push([ns,tt]);ns=null;}if(p.h===0)mids.push(tt);if(p.h===12)noons.push(tt);}
    if(ns!=null)nights.push([ns,t1]);
    for(const p of P)for(const[a,b]of nights){const xa=Math.max(padL,X(a)),xb=Math.min(W-padR,X(b));if(xb>xa)o.push(`<rect class="night" x="${xa.toFixed(1)}" y="${p.y0}" width="${(xb-xa).toFixed(1)}" height="${p.h}"/>`);}
    for(const m of mids){const x=X(m);if(x>padL&&x<W-padR)o.push(`<line class="mid" x1="${x.toFixed(1)}" x2="${x.toFixed(1)}" y1="${top}" y2="${bot}"/>`);}
    const dayW=86400/(t1-t0)*iw,every=dayW<30?Math.ceil(30/dayW):1;
    noons.forEach((m,k)=>{if(k%every)return;const x=X(m);if(x<padL+12||x>W-padR-12)return;const p=lp(m);o.push(`<text x="${x.toFixed(1)}" y="${bot+16}" text-anchor="middle">${dayW<46?p.wd:`${p.wd} ${pad(p.d)}.`}</text>`);});
  }else{
    for(const m of cfg.months){const x=X(m.t);if(x>=padL&&x<=W-padR)o.push(`<line class="mid" x1="${x.toFixed(1)}" x2="${x.toFixed(1)}" y1="${top}" y2="${bot}"/>`);const xm=X(m.t+15*86400);if(xm<W-padR)o.push(`<text x="${xm.toFixed(1)}" y="${bot+16}" text-anchor="middle">${m.label}</text>`);}
  }
  for(let k=0;k<P.length;k++){
    const p=P[k],Y=v=>p.y1-(v-p.y.min)/(p.y.max-p.y.min)*p.h,Y2=p.y2?v=>p.y1-(v-p.y2.min)/(p.y2.max-p.y2.min)*p.h:Y;
    o.push(`<text class="pt" x="${padL}" y="${p.y0-6}">${esc(p.title)}</text>`);
    const ticks=p.y.ticks||niceTicks(p.y.min,p.y.max,p.y.n||4);
    for(const v of ticks){const yy=Y(v);if(yy<p.y0-1||yy>p.y1+1)continue;o.push(`<line class="gl" x1="${padL}" x2="${W-padR}" y1="${yy.toFixed(1)}" y2="${yy.toFixed(1)}"/><text x="${padL-5}" y="${(yy+3.5).toFixed(1)}" text-anchor="end">${(p.y.fmt||f0)(v)}</text>`);}
    if(p.y2){for(const v of (p.y2.ticks||niceTicks(p.y2.min,p.y2.max,4))){const yy=Y2(v);if(yy<p.y0-1||yy>p.y1+1)continue;o.push(`<text x="${W-padR+5}" y="${(yy+3.5).toFixed(1)}">${(p.y2.fmt||f0)(v)}</text>`);}}
    o.push(`<g clip-path="url(#${uid}${k})">`);
    for(const L of p.layers){const Yl=L.axis==='y2'?Y2:Y,lts=L.ts||ts;
      if(L.type==='line'){let d='',pen=false;for(let i=0;i<L.v.length;i++){const v=L.v[i],t=lts[i];if(v==null||!isFinite(v)||t<t0-86400*2||t>t1+86400*2){pen=false;continue;}d+=(pen?'L':'M')+X(t).toFixed(1)+' '+Yl(v).toFixed(1);pen=true;}if(d)o.push(`<path class="ln ${L.cls}" d="${d}"/>`);}
      else if(L.type==='band'){let seg=[];const flush=()=>{if(seg.length>1){const up=seg.map(i=>X(lts[i]).toFixed(1)+' '+Yl(L.hi[i]).toFixed(1)),dn=seg.slice().reverse().map(i=>X(lts[i]).toFixed(1)+' '+Yl(L.lo[i]).toFixed(1));o.push(`<path class="${L.cls}" d="M${up.join('L')}L${dn.join('L')}Z"/>`);}seg=[];};
        for(let i=0;i<L.lo.length;i++){const t=lts[i];if(L.lo[i]==null||L.hi[i]==null||t<t0-86400||t>t1+86400){flush();continue;}seg.push(i);}flush();}
      else if(L.type==='bars'){const hs=L.hrs||1,bw=X(t0+hs*3600)-X(t0),w=Math.max(1,bw*(L.wf||1)-(narrow?0:0.4));for(let i=0;i<L.v.length;i++){const v=L.v[i],t=lts[i];if(v==null||v<=0.0001||t<t0||t>t1+hs*3600)continue;const b=L.base?(L.base[i]||0):0,y1=Yl(b),y2=Yl(b+v);o.push(`<rect class="${L.cls}" x="${(X(t-hs*3600)+bw*(L.off||0)).toFixed(1)}" y="${y2.toFixed(1)}" width="${w.toFixed(1)}" height="${Math.max(0.6,y1-y2).toFixed(1)}"/>`);}}
      else if(L.type==='vals'){const step=L.every||6;for(let i=0;i<L.v.length;i++){const t=lts[i],v=L.v[i];if(t<t0||t>t1||!ok(v))continue;const h=lp(t).h;if(step>=24?h!==12:h%step)continue;const x=X(t);if(x<padL+16||x>W-padR-16)continue;o.push(`<text class="val" x="${x.toFixed(1)}" y="${(p.y0+p.h/2+4).toFixed(1)}" text-anchor="middle">${(L.fmt||f0)(v)}</text>`);}}
      else if(L.type==='arrows'){const step=L.every||6;for(let i=0;i<L.dir.length;i++){const t=lts[i];if(t<t0||t>t1||L.dir[i]==null||lp(t).h%step)continue;const x=X(t),yy=p.y0+9;o.push(`<g transform="translate(${x.toFixed(1)} ${yy}) rotate(${L.dir[i].toFixed(0)})"><path class="arr" d="M0 -6L0 6M-3 2L0 6L3 2"/></g>`);}}
    }
    o.push('</g>');
    for(const r of (p.refs||[])){const yy=(r.axis==='y2'?Y2:Y)(r.y);if(yy<p.y0||yy>p.y1)continue;o.push(`<line class="${r.cls||'ref'}" x1="${padL}" x2="${W-padR}" y1="${yy.toFixed(1)}" y2="${yy.toFixed(1)}"/>`);if(r.label)o.push(`<text class="reft" x="${W-padR-4}" y="${(yy-4).toFixed(1)}" text-anchor="end">${esc(r.label)}</text>`);}
  }
  if(cfg.now&&cfg.now>t0&&cfg.now<t1){const x=X(cfg.now);o.push(`<line class="now" x1="${x.toFixed(1)}" x2="${x.toFixed(1)}" y1="${top}" y2="${bot}"/><text class="nowt" x="${(x+4).toFixed(1)}" y="${top+10}">jetzt</text>`);}
  o.push(`<line class="xh-l" x1="0" x2="0" y1="${top}" y2="${bot}" style="display:none"/><rect class="ov" x="${padL}" y="${top}" width="${iw}" height="${bot-top}" fill="transparent"/></svg>`);
  host.innerHTML=o.join('');
  const svg=host.querySelector('svg'),xh=svg.querySelector('.xh-l'),ov=svg.querySelector('.ov');
  if(cfg.tip){const mv=ev=>{const r=svg.getBoundingClientRect(),sx=(ev.clientX-r.left)*(W/r.width),t=t0+(sx-padL)/iw*(t1-t0);const i=cfg.idx(t);if(i==null){xh.style.display='none';hideTip();return;}const xx=X(ts[i]);xh.setAttribute('x1',xx);xh.setAttribute('x2',xx);xh.style.display='';showTip(cfg.tip(i),ev.clientX,ev.clientY);};
    ov.addEventListener('pointermove',mv);ov.addEventListener('pointerdown',mv);ov.addEventListener('pointerleave',()=>{xh.style.display='none';hideTip();});}
}
function idxNear(t){const i=Math.round((t-AX[0])/3600);return i>=0&&i<AX.length?i:null;}

/* ======================= Rendering ======================= */
function safe(fn){try{fn();}catch(e){console.error(e);}}
function isOpen(id){return openSet.has(id);}
function setSum(id,t){const e=$('sum-'+id);if(e)e.textContent=t;}
function renderSummaries(){
  if(!K)return;
  const i1=Math.min(AX.length-1,iNow+120),T=[],SL=[],G=[];let P=0;
  for(let i=iNow+1;i<=i1;i++){if(K.T[i]!=null)T.push(K.T[i]);if(K.SL[i]!=null)SL.push(K.SL[i]);if(K.G[i]!=null)G.push(K.G[i]);if(K.P[i]!=null)P+=K.P[i];}
  setSum('meteogramm',`Nächste 5 Tage am Berg: ${fT0(Math.min(...T))} bis ${fT0(Math.max(...T))} · Schneefallgrenze ${fM(Math.min(...SL))} bis ${fM(Math.max(...SL))} · Niederschlag ${P<1?'kaum':'rund '+f0(P)+' mm'} · Böen bis ${f0(Math.max(...G))} km/h`);
  const n=SERIES.filter(s=>s.kind==='ens').length,i7=Math.min(AX.length-1,iNow+168);
  setSum('ensemble',n&&PLUME?`${n} Läufe · Neuschnee bis ${fDay(AX[i7])}: Median ${fCm(PLUME.q50[i7])} cm, Spanne ${fCm(PLUME.q10[i7])} bis ${fCm(PLUME.q90[i7])} cm`:'Ensemble-Daten gerade nicht verfügbar');
}
function renderMeter(){
  const r=DAYRES[selDay],d=DAYS[selDay];
  if(!r||!d){$('verdict').textContent='Keine Daten für diesen Tag';return;}
  const dl=relDay(d.t);$('meterDay').textContent=(dl==='heute'||dl==='morgen'||dl==='übermorgen'?relDayCap(d.t)+' · '+fDay(d.t):WDL[lp(d.t).wd]+' '+pad(lp(d.t).d)+'.'+pad(lp(d.t).m)+'.')+' · bis 9 Uhr';
  $('gauge').innerHTML=gaugeSVG(r.Pp);$('stake').innerHTML=stakeSVG(r.q10,r.q50,r.q90,S.thr);
  $('verdict').textContent=verdict(r.Pp);
  $('verdictSub').textContent=`${pct(r.Pa)} Chance auf ≥ ${S.thr} cm effektiven Neuschnee`+(r.Pa-r.Pp>.05&&r.why.length?` · Abzug: ${r.why.join(', ')}`:'')+` · ${r.runs} Modellläufe`;
  const sw=snowWord(r.Ts),ww=windWord(r.Ws);
  const base=SG&&SG.berg?SG.berg.now:null,baseEst=ok(base)?base+0.7*(r.preSnow||0):null;
  const cc=r.CC,sicht=!ok(cc)?['–','']:cc<30?['Bluebird','Sonne am Vormittag']:cc<70?['Wechselnd','teils Sonne']:['Trüb','flaches Licht'];
  const facts=[
    ['Neuschnee bis 9 Uhr',ok(r.q50)?`${fCm(r.q50)} cm`:'–',`Spanne ${fCm(r.q10)}–${fCm(r.q90)} cm (10–90 %)`],
    ['Schneequalität',r.q50>=1?sw[0]:'–',r.q50>=1?sw[1]+(ok(r.Ts)?`, ${fT(r.Ts)} beim Schneefall`:''):'kein nennenswerter Schneefall'],
    ['Wind beim Schneefall',r.q50>=1?ww[0]:'–',r.q50>=1&&ok(r.Ws)?`${ww[1]}, Ø ${f0(r.Ws)} km/h`:''],
    ['Schneefallgrenze',ok(r.SLmin)?(r.SLmax-r.SLmin>150?`${fM(r.SLmin)}–${fM(r.SLmax)}`:fM((r.SLmin+r.SLmax)/2)):'–','im 24-h-Fenster'],
    ['Regen am Berg',ok(r.R)&&r.R>=0.5?`${f1(r.R)} mm`:'kein Regen',ok(r.R90)&&r.R90>=1?`im ungünstigen Fall ${f0(r.R90)} mm`:'',ok(r.R)&&r.R>=1],
    ['Sicht am Vormittag',sicht[0],ok(cc)?`${sicht[1]}, Bewölkung ${f0(cc)} %`:''],
    ['Unterlage (grob)',ok(baseEst)?`≈ ${f0(baseEst)} cm`:'–',ok(base)?(baseEst<30?'dünn, Steinkontakt einplanen':'SNOWGRID + Prognose'):'SNOWGRID lädt …',ok(baseEst)&&baseEst<30],
    ['Prognosesicherheit',r.conf.charAt(0).toUpperCase()+r.conf.slice(1),`${f0(r.lead)} h Vorlauf`]
  ];
  const CORE=new Set(['Neuschnee bis 9 Uhr','Schneequalität','Wind beim Schneefall','Prognosesicherheit']);
  const vis=facts.filter(f=>meterMore||CORE.has(f[0])||f[3]),hid=facts.length-vis.length;
  $('facts').innerHTML=vis.map(f=>`<div class="fact${f[3]?' warnf':''}"><div class="k">${f[0]}</div><div class="v">${f[1]}</div><div class="s">${f[2]||''}</div></div>`).join('');
  $('sysbars').hidden=!meterMore;const mb=$('meterMore');mb.setAttribute('aria-expanded',String(meterMore));
  mb.textContent=meterMore?'Weniger anzeigen':(hid?`Mehr Details: ${hid} weitere Werte und die Modellsysteme`:'Mehr Details: Modellsysteme');
  $('sysbars').innerHTML=`<div class="k muted mono" style="font-size:11px;letter-spacing:.05em;text-transform:uppercase;margin-top:4px">Was sagen die Systeme? Powder-Chance je System, oben = stärkstes Gewicht</div>`+
    r.parts.slice().sort((a,b)=>b.wn-a.wn).map(p=>`<div class="sysbar" title="Gewicht im Powder-Meter: ${f0(p.wn*100)} % · ${p.n} Läufe"><span class="lbl">${SYS_LABEL[p.sys]}</span><span class="trk"><span class="fill" style="display:block;width:${clamp(p.Pp*100,0,100).toFixed(1)}%"></span></span><span class="pct">${pct(p.Pp)}</span></div>`).join('');
}
function gaugeSVG(p){
  const cx=130,cy=128,R=104,sw=20,ang=v=>Math.PI*(1-v),pt=(v,r)=>[cx+r*Math.cos(ang(v)),cy-r*Math.sin(ang(v))];
  const arc=(a,b,r)=>{const[x0,y0]=pt(a,r),[x1,y1]=pt(b,r);return `M${x0.toFixed(2)} ${y0.toFixed(2)}A${r} ${r} 0 0 1 ${x1.toFixed(2)} ${y1.toFixed(2)}`;};
  const segs=[[0,.1],[.1,.3],[.3,.5],[.5,.75],[.75,1]];
  let s=`<svg viewBox="-10 0 280 150" role="img" aria-label="Powder-Chance ${pct(p)}">`;
  segs.forEach(([a,b])=>{s+=`<path d="${arc(a+.003,b-.003,R)}" stroke="var(--surface-2)" stroke-width="${sw}" fill="none"/><path d="${arc(a+.003,b-.003,R+sw/2-1)}" stroke="var(--line)" stroke-width="1" fill="none"/>`;});
  [0,.25,.5,.75,1].forEach(v=>{const[x,y]=pt(v,R+sw/2+9);s+=`<text x="${x.toFixed(1)}" y="${(y+3).toFixed(1)}" text-anchor="middle" style="fill:var(--muted);font:500 10px var(--font-mono)">${v*100}</text>`;});
  const v=clamp(ok(p)?p:0,0,1);
  if(v>=.005){s+=`<path d="${arc(0,v,R)}" stroke="var(--accent)" stroke-width="${sw}" fill="none"/>`;}
  const[mx,my]=pt(v,R);s+=`<circle cx="${mx.toFixed(1)}" cy="${my.toFixed(1)}" r="${sw/2+3}" fill="var(--surface)" stroke="var(--accent)" stroke-width="3"/>`;
  s+=`<text x="${cx}" y="${cy-22}" text-anchor="middle" style="fill:var(--ink);font:700 54px var(--font-display)">${ok(p)?f0(p*100):'–'}<tspan style="font-size:26px"> %</tspan></text>`;
  s+=`<text x="${cx}" y="${cy-2}" text-anchor="middle" style="fill:var(--muted);font:500 10px var(--font-mono);letter-spacing:.08em">POWDER-CHANCE</text></svg>`;
  return s;
}
function stakeSVG(q10,q50,q90,thr){
  // Schneepegel: rot-weiße 10-cm-Ringe, Schneedecke = Median, Klammer = 10–90 %
  const mx=Math.min(150,Math.max(50,Math.ceil(((ok(q90)?q90:0)+8)/10)*10,Math.ceil((thr+10)/10)*10)),top=12,bot=232,Y=v=>bot-clamp(v,0,mx)/mx*(bot-top);
  let s=`<svg viewBox="0 0 120 250" role="img" aria-label="Schneepegel: Median ${fCm(q50)} Zentimeter">`;
  const step=mx>80?20:10;for(let v=0;v<=mx;v+=step)s+=`<text x="22" y="${(Y(v)+3.5).toFixed(1)}" text-anchor="end" style="fill:var(--muted);font:500 10px var(--font-mono)">${v}</text>`;
  for(let v=0;v<mx;v+=10){s+=`<rect x="30" y="${Y(v+10).toFixed(1)}" width="13" height="${(Y(v)-Y(v+10)).toFixed(1)}" fill="${(v/10)%2?'var(--surface)':'var(--accent)'}" stroke="var(--accent)" stroke-width="1"/>`;}
  if(ok(q50)&&q50>0.2){const ys=Y(q50);s+=`<path d="M27 ${bot}L27 ${(ys+3).toFixed(1)}Q48 ${(ys-4).toFixed(1)} 70 ${ys.toFixed(1)}T98 ${(ys+2).toFixed(1)}L98 ${bot}Z" fill="var(--snow-soft)" fill-opacity=".8" stroke="var(--snow)" stroke-width="1.5"/>`;}
  s+=`<rect x="24" y="${bot}" width="78" height="3" fill="var(--muted)"/>`;
  if(ok(q10)&&ok(q90)&&q90>0.2){const a=Y(q90),b=Y(q10);s+=`<path d="M104 ${a.toFixed(1)}H110V${b.toFixed(1)}H104" fill="none" stroke="var(--ink)" stroke-width="1.4"/>`;}
  const yt=Y(thr);s+=`<line x1="26" x2="100" y1="${yt.toFixed(1)}" y2="${yt.toFixed(1)}" stroke="var(--ink)" stroke-dasharray="4 3" stroke-width="1.2"/><text x="98" y="${(yt-4).toFixed(1)}" text-anchor="end" style="fill:var(--ink);font:600 9.5px var(--font-mono);paint-order:stroke;stroke:var(--surface);stroke-width:3px">${thr} cm</text>`;
  s+=`<text x="64" y="248" text-anchor="middle" style="fill:var(--muted);font:500 9px var(--font-mono)">Neuschnee cm</text></svg>`;
  return s;
}
function renderCalendar(){
  const box=$('cal');if(!DAYRES.length){box.innerHTML='<div class="empty">Keine Prognosedaten.</div>';return;}
  const n=Math.min(DAYS.length,10);let h='';
  for(let k=0;k<n;k++){const d=DAYS[k],r=DAYRES[k];if(!r)continue;const p=lp(d.t),rel=relDay(d.t);
    h+=`<button type="button" class="day${r.Pp>=.5?' hot':''}" data-k="${k}" aria-pressed="${k===selDay}">
      ${r.Pp>=.5?'<span class="badge">Alarm</span>':''}
      <span class="dn">${rel==='heute'?'Heute':rel==='morgen'?'Morgen':p.wd}</span><span class="dd">${pad(p.d)}.${pad(p.m)}.</span>
      <span class="pp">${f0(r.Pp*100)}<small>%</small></span>
      <span class="bar"><i style="width:${clamp(r.Pp*100,0,100).toFixed(1)}%"></i></span>
      <span class="sn">${fCm(r.q50)} cm <span>${fCm(r.q10)}–${fCm(r.q90)}</span></span>
      ${ok(r.prev)&&r.prev>=S.thr*.6?`<span class="mt" style="color:var(--snow)">+${fCm(r.prev)} Vortag</span>`:''}
      <span class="mt">${fT0(r.Tmin)} / ${fT0(r.Tmax)}<br>SFG ${ok(r.SLmin)?f0(Math.round(r.SLmin/100)*100):'–'}</span>${ok(r.Gmax)&&r.Gmax>=60?`<span class="mt" style="color:var(--crit)">Böen ${f0(r.Gmax)} km/h</span>`:''}
    </button>`;}
  box.innerHTML=h;
  box.querySelectorAll('.day').forEach(b=>b.addEventListener('click',()=>{selDay=+b.dataset.k;box.querySelectorAll('.day').forEach(x=>x.setAttribute('aria-pressed',x===b));safe(renderMeter);$('lage').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});}));
  $('calNote').textContent=`Neuschnee jeweils von 9 Uhr am Vortag bis 9 Uhr (Liftstart) auf ${f0(S.bergElev)} m. Prozent = Powder-Chance (≥ ${S.thr} cm effektiv, skibar). SFG = Schneefallgrenze. Tag antippen für Details.`;
}
function renderAlerts(){
  const ul=$('alerts');
  if(!EVENTS.length){ul.innerHTML='<li class="empty">Keine markanten Umschwünge in den nächsten 10 Tagen. Ruhige Lage.</li>';$('alertCount').textContent='nächste 10 Tage';return;}
  const cls={powder:'a-powder',snow:'a-snow',change:'a-change',warn:'a-warn',info:'a-info'},RANK={powder:0,warn:1,snow:2,change:2,info:3},MAXA=4;
  // zugeklappt: die 4 wichtigsten (Powder vor Warnung vor Umschwung vor Info), zeitlich sortiert
  const list=alertsAll?EVENTS:EVENTS.map((e,i)=>[e,i]).sort((a,b)=>RANK[a[0].type]-RANK[b[0].type]||a[1]-b[1]).slice(0,MAXA).sort((a,b)=>a[1]-b[1]).map(x=>x[0]);
  ul.innerHTML=list.map(e=>`<li class="alert ${cls[e.type]}"><span class="tag">${esc(e.tag)}</span><span class="t">${esc(e.title)}</span><span class="x">${esc(e.text)}</span></li>`).join('')+(EVENTS.length>MAXA?`<li><button class="linkbtn" type="button" id="alertsMore">${alertsAll?'Weniger anzeigen':`Alle ${EVENTS.length} Hinweise anzeigen`}</button></li>`:'');
  const am=$('alertsMore');if(am)am.addEventListener('click',()=>{alertsAll=!alertsAll;safe(renderAlerts);});
  $('alertCount').textContent=`${EVENTS.length} Hinweis${EVENTS.length===1?'':'e'} · 10 Tage`;
}
function renderNow(){
  const W=360,H=170,x0=8,x1=W-8,yTop=14,yBot=H-22;
  const SLn=K?K.SL[iNow]:null;let i9=null;for(let i=iNow+1;i<AX.length;i++){const p=lp(AX[i]);if(p.h===9&&p.key!==lp(NOW).key){i9=i;break;}}
  const SLt=i9!=null&&K?K.SL[i9]:null,FZn=K?K.FZL[iNow]:null;
  const eMin=Math.min(S.talElev,600),eMax=Math.max(2700,S.bergElev+500);const Y=e=>yBot-(e-eMin)/(eMax-eMin)*(yBot-yTop);
  const pmin=1003,pmax=1881,sc=e=>S.talElev+(e-pmin)/(pmax-pmin)*(S.bergElev-S.talElev),dmax=PROFILE[PROFILE.length-1][0],X=d=>x0+d/dmax*(x1-x0);
  const pts=PROFILE.map(([d,e])=>`${X(d).toFixed(1)} ${Y(sc(e)).toFixed(1)}`);
  const terr=`M${x0} ${yBot}L${pts.join('L')}L${x1} ${yBot}Z`;
  let s=`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Geländeschnitt mit Schneefallgrenze"><defs><clipPath id="terrClip"><path d="${terr}"/></clipPath></defs>`;
  s+=`<path d="${terr}" fill="var(--surface-2)" stroke="var(--ink)" stroke-width="1.6"/>`;
  const labs=[],lineY=v=>Y(clamp(v,eMin,eMax)),mTxt=v=>v>eMax?'> '+fM(eMax):fM(v);
  if(ok(SLn)){const ys=lineY(SLn);s+=`<rect x="0" y="0" width="${W}" height="${ys.toFixed(1)}" fill="var(--snow-soft)" clip-path="url(#terrClip)"/><path d="${terr}" fill="none" stroke="var(--ink)" stroke-width="1.6"/><line x1="${x0}" x2="${x1}" y1="${ys.toFixed(1)}" y2="${ys.toFixed(1)}" stroke="var(--snow)" stroke-width="2"/>`;labs.push({y:ys-5,txt:'jetzt '+mTxt(SLn),c:'var(--snow)',side:'l',w:600});}
  if(ok(SLt)){const ys=lineY(SLt);s+=`<line x1="${x0}" x2="${x1}" y1="${ys.toFixed(1)}" y2="${ys.toFixed(1)}" stroke="var(--snow)" stroke-width="1.4" stroke-dasharray="5 4"/>`;labs.push({y:ys-5,txt:`${relDay(AX[i9])} 9 Uhr ${mTxt(SLt)}`,c:'var(--snow)',side:'r',w:500});}
  if(ok(FZn)){const yf=lineY(FZn);s+=`<line x1="${x0}" x2="${x1}" y1="${yf.toFixed(1)}" y2="${yf.toFixed(1)}" stroke="var(--warm)" stroke-width="1" stroke-dasharray="2 3"/>`;labs.push({y:yf-5,txt:'0 °C '+mTxt(FZn),c:'var(--warm)',side:'r',w:500});}
  for(const side of ['l','r']){const L=labs.filter(l=>l.side===side).sort((a,b)=>a.y-b.y);for(let k=1;k<L.length;k++)if(L[k].y-L[k-1].y<12)L[k].y=L[k-1].y+12;
    for(const l of L)s+=`<text x="${side==='l'?x0+2:x1-2}" y="${clamp(l.y,10,H-26).toFixed(1)}" text-anchor="${side==='l'?'start':'end'}" style="fill:${l.c};font:${l.w} 10.5px var(--font-mono);paint-order:stroke;stroke:var(--surface);stroke-width:3px">${esc(l.txt)}</text>`;}
  const peak=PROFILE.reduce((a,b)=>b[1]>a[1]?b:a);
  s+=`<text x="${X(0)+2}" y="${H-6}" style="fill:var(--muted);font:500 10px var(--font-mono)">Kleinarl</text><text x="${x1-2}" y="${H-6}" text-anchor="end" style="fill:var(--muted);font:500 10px var(--font-mono)">Flachauwinkl ${f0(S.talElev)} m</text><text x="${(X(peak[0])+4).toFixed(1)}" y="${(Y(S.bergElev)-5).toFixed(1)}" style="fill:var(--ink);font:600 10.5px var(--font-mono);paint-order:stroke;stroke:var(--surface);stroke-width:3px">▲ ${f0(S.bergElev)} m</text></svg>`;
  s+=`<div class="legend" style="margin-top:4px"><span><i style="color:var(--snow)"></i>Schneefallgrenze jetzt</span><span><i style="color:var(--snow);border-top-style:dashed"></i>morgen 9 Uhr</span><span><i style="color:var(--warm);border-top-style:dotted"></i>0-Grad-Grenze</span></div>`;
  $('profile').innerHTML=s;
  const ib=INCA&&INCA.berg,it=INCA&&INCA.tal,li=ib?ib.last:-1;
  const sum24=(o,k)=>{if(!o||o.last<0)return null;let s=0;for(let i=Math.max(0,o.last-23);i<=o.last;i++)s+=o[k][i]||0;return s;};
  const vb=li>=0?ib.T[li]:null,vt=it&&it.last>=0?it.T[it.last]:null,twt=it&&it.last>=0?it.TW[it.last]:null;
  const kv=[
    ['Berg '+f0(S.bergElev)+' m',fT(vb),li>=0?`Wind ${f0(ib.W[li])} km/h · RF ${f0(ib.RH[li])} %`:'INCA lädt …'],
    ['Tal '+f0(S.talElev)+' m',fT(vt),ok(twt)?`Feuchttemp. ${fT(twt)}${twt<=S.snProp?' · schneibar':''}`:''],
    ['Neuschnee 24 h',ib?`${fCm(sum24(ib,'SN'))} cm`:'–',ib?`Niederschlag ${f1(sum24(ib,'P'))} mm (INCA)`:''],
    ['Schneehöhe',SG&&SG.berg&&ok(SG.berg.now)?`${f0(SG.berg.now)} cm`:'–',SG&&SG.tal&&ok(SG.tal.now)?`Tal ${f0(SG.tal.now)} cm · SNOWGRID ${SG.lastLabel}`:'SNOWGRID lädt …']
  ];
  $('nowKv').innerHTML=kv.map(k=>`<div><div class="k">${k[0]}</div><div class="v">${k[1]}</div><div class="s">${k[2]}</div></div>`).join('');
  $('nowStamp').textContent=li>=0?`INCA ${fTime(AX[li])} Uhr`:'INCA-Analyse';
}
function renderMeteogram(){
  if(!isOpen('meteogramm'))return;
  const host=$('mg');if(!K){host.innerHTML='<div class="empty">Keine Daten.</div>';return;}
  const seg=$('mgRange');if(!seg.childElementCount){seg.innerHTML=[3,5,7,10,16].map(n=>`<button type="button" data-n="${n}">${n} Tage</button>`).join('');seg.querySelectorAll('button').forEach(b=>b.addEventListener('click',()=>{mgRange=+b.dataset.n;safe(renderMeteogram);}));}
  seg.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',+b.dataset.n===mgRange));
  const t0=NOW-18*3600,t1=Math.min(AX[AX.length-1],NOW+mgRange*86400),i0=Math.max(0,idxNear(t0)||0),i1=idxNear(t1)||AX.length-1;
  const[tl,th]=range([K.T,KT.T,ENSQ.T10,ENSQ.T90],i0,i1,.08,8);
  const slMax=Math.max(S.bergElev+400,range([K.SL,K.FZL],i0,i1,.05)[1]),slMin=Math.min(S.talElev-300,range([K.SL],i0,i1,.05)[0]);
  const rain=K.P.map((p,i)=>p==null?null:Math.min(p,K.RN[i]||0)),snow=K.P.map((p,i)=>p==null?null:Math.max(0,p-(rain[i]||0)));
  const cum=PLUME.q50,pMax=Math.max(2,range([K.P],i0,i1,0)[1]*1.15),cMax=Math.max(10,range([cum],i0,i1,0)[1]*1.15);
  const gMax=Math.max(40,range([K.G,K.W],i0,i1,0)[1]*1.1);
  timeChart(host,{label:'Meteogramm',t0,t1,now:NOW,idx:idxNear,panels:[
    {title:'Temperatur °C',h:150,y:{min:tl,max:th,fmt:f0},refs:[{y:0,cls:'ref',label:'0 °C'}],layers:[{type:'band',lo:ENSQ.T10,hi:ENSQ.T90,cls:'b-ens'},{type:'line',v:KT.T,cls:'l-tt'},{type:'line',v:K.T,cls:'l-tb'}]},
    {title:'Schneefallgrenze m',h:110,y:{min:slMin,max:slMax,fmt:v=>f0(v)},refs:[{y:S.bergElev,label:'Berg'},{y:S.talElev,label:'Tal'}],layers:[{type:'line',v:K.FZL,cls:'l-fz'},{type:'line',v:K.SL,cls:'l-sl'}]},
    {title:'Niederschlag mm/h · Neuschnee kumuliert cm',h:120,y:{min:0,max:pMax,fmt:f1},y2:{min:0,max:cMax,fmt:f0},layers:[{type:'bars',v:snow,cls:'r-snow'},{type:'bars',v:rain,base:snow,cls:'r-rain'},{type:'line',v:cum,cls:'l-cum',axis:'y2'}]},
    {title:'Wind Berg km/h',h:105,y:{min:0,max:gMax,fmt:f0},layers:[{type:'line',v:K.G,cls:'l-g'},{type:'line',v:K.W,cls:'l-w'},{type:'arrows',dir:K.D7,every:mgRange>7?12:6}]}
  ],tip:i=>`<b>${fDay(AX[i])} ${fTime(AX[i])}</b>`+tr(`Berg ${f0(S.bergElev)} m`,fT(K.T[i]))+(ok(ENSQ.T10[i])?tr('Ensemble 10–90 %',`${fT0(ENSQ.T10[i])} … ${fT0(ENSQ.T90[i])}`):'')+tr(`Tal ${f0(S.talElev)} m`,fT(KT.T[i]))+tr('Schneefallgrenze',fM(K.SL[i]))+tr('0-Grad-Grenze',fM(K.FZL[i]))+tr('Niederschlag',ok(K.P[i])?`${f1(K.P[i])} mm${K.P[i]>0.05?(rain[i]>snow[i]?' (Regen)':' (Schnee)'):''}`:'–')+(i>iNow?tr('Neuschnee seit jetzt',`${fCm(cum[i])} cm`):'')+tr('Wind / Böen',`${f0(K.W[i])} / ${f0(K.G[i])} km/h`)+tr('Höhenwind 3.000 m',ok(K.D7[i])?`${dirName(K.D7[i])} ${f0(K.W7[i])} km/h`:'–')+(i<=iNow&&INCA&&INCA.berg&&i<=INCA.berg.last?'<div class="muted" style="font-size:11px;margin-top:3px">Vergangenheit: INCA-Analyse</div>':'')});
  $('mgLegend').innerHTML=`<span><i style="color:var(--ink)"></i>Berg ${f0(S.bergElev)} m</span><span><i style="color:var(--warm);border-top-style:dashed"></i>Tal ${f0(S.talElev)} m</span><span><span class="sw" style="background:var(--snow-soft)"></span>Ensemble 10–90 %</span><span><i style="color:var(--snow)"></i>Schneefallgrenze</span><span><i style="color:var(--warm);border-top-style:dotted"></i>0-Grad-Grenze</span><span><span class="sw" style="background:var(--snow)"></span>Schnee</span><span><span class="sw" style="background:var(--rain)"></span>Regen</span><span><i style="color:var(--accent)"></i>Neuschnee kumuliert</span><span><i style="color:var(--wind)"></i>Wind · Böen strichliert · Pfeile: Höhenwind</span>`;
}
function renderEnsemble(){
  if(!isOpen('ensemble')||!PLUME)return;
  const chips=$('ensChips');
  const counts={};SERIES.filter(s=>s.kind==='ens').forEach(s=>counts[s.sys]=(counts[s.sys]||0)+1);
  chips.innerHTML='<span class="lab">Systeme</span>'+ENS_SYS.filter(e=>counts[e.id]).map(e=>`<button type="button" class="syschip s-${e.id}" data-s="${e.id}" aria-pressed="${!hidden.has(e.id)}"><i></i>${e.label} <span class="mono muted" style="font-size:11px">${counts[e.id]}</span></button>`).join('');
  chips.querySelectorAll('.syschip').forEach(b=>b.addEventListener('click',()=>{const s=b.dataset.s;hidden.has(s)?hidden.delete(s):hidden.add(s);safe(renderEnsemble);}));
  const ens=SERIES.filter(s=>s.kind==='ens'&&!hidden.has(s.sys));
  const t0=NOW,t1=AX[AX.length-1];
  let mx=S.thr*1.3;for(const s of ens){const c=PLUME.cum.get(s.sid);for(let i=iNow;i<c.length;i++)if(c[i]!=null&&c[i]>mx)mx=c[i];}
  mx=Math.min(mx*1.05,Math.max(S.thr*2,(quant(PLUME.q90.filter(ok),1)||0)*1.6,40));
  const layers=ens.map(s=>({type:'line',v:PLUME.cum.get(s.sid),cls:'pl s-'+s.sys}));
  layers.push({type:'band',lo:PLUME.q10,hi:PLUME.q90,cls:'b-q'},{type:'line',v:PLUME.q50,cls:'l-med'});
  timeChart($('plumeSnow'),{label:'Neuschnee kumuliert',t0,t1,idx:idxNear,panels:[{title:'cm ab jetzt',h:230,y:{min:0,max:mx,fmt:f0},refs:[{y:S.thr,cls:'ref-thr',label:`${S.thr} cm`}],layers}],
    tip:i=>{if(i<=iNow)return `<b>jetzt</b>`;let h=`<b>bis ${fDay(AX[i])} ${fTime(AX[i])}</b>`+tr('Median',`${fCm(PLUME.q50[i])} cm`)+tr('10–90 %',`${fCm(PLUME.q10[i])}–${fCm(PLUME.q90[i])} cm`);
      for(const e of ENS_SYS){const v=SERIES.filter(s=>s.sys===e.id).map(s=>PLUME.cum.get(s.sid)[i]).filter(ok);if(v.length)h+=tr(`${e.label} (${v.length})`,`${fCm(median(v))} cm`);}return h;}});
  $('ensSnowChip').textContent=`${ens.length} Läufe sichtbar`;
  // Ohne 850 hPa in den Ensembles (Gratis-Datenweg) die Einzelmodelle als Linien zeigen
  const t8det=!SERIES.some(s=>s.kind==='ens'&&s.T850&&hasData(s.T850));
  const t8=SERIES.filter(s=>t8det?(s.kind==='det'&&s.T850&&hasData(s.T850)):(s.kind==='ens'&&s.T850&&hasData(s.T850)&&!hidden.has(s.sys)));
  $('t850Note').hidden=!t8det;
  const q=[new Array(AX.length).fill(null),new Array(AX.length).fill(null)];
  for(let i=0;i<AX.length;i++){const v=t8.map(s=>s.T850[i]).filter(ok);if(v.length>=5){q[0][i]=median(v);}}
  const i0=Math.max(0,iNow-24),[lo,hi]=range([...t8.map(s=>s.T850),K.T850],i0,AX.length-1,.05,10);
  timeChart($('plumeT850'),{label:'Temperatur 850 hPa',t0:NOW-24*3600,t1,now:NOW,idx:idxNear,panels:[{title:'°C in 850 hPa',h:230,y:{min:Math.min(lo,-8),max:Math.max(hi,4),fmt:f0},refs:[{y:0,label:'0 °C'},{y:-5,label:'−5 °C'}],
    layers:[...t8.map(s=>({type:'line',v:s.T850,cls:'pl s-'+s.sys})),{type:'line',v:K.T850,cls:'l-det'},{type:'line',v:q[0],cls:'l-med'}]}],
    tip:i=>{const v=t8.map(s=>s.T850[i]).filter(ok);return `<b>${fDay(AX[i])} ${fTime(AX[i])}</b>`+tr(t8det?'Median Einzelmodelle':'Median Ensemble',fT(median(v)))+tr('10–90 %',v.length?`${fT0(quant(v,.1))} … ${fT0(quant(v,.9))}`:'–')+tr('Einzelmodelle',fT(K.T850[i]));}});
}
function renderModelTable(){
  const box=$('modelTable');if(!DAYS.length){box.innerHTML='<div class="empty">Keine Daten.</div>';return;}
  const n=Math.min(7,DAYS.length),thr=S.thr;
  const cell=v=>{if(!ok(v))return '<td class="h na">·</td>';const c=v<0.5?'h0':v<5?'h1':v<thr?'h2':v<thr*2?'h3':'h4';return `<td class="h ${c}">${fCm(v)}</td>`;};
  const run=id=>META[id]?(()=>{const p=new Date(META[id]*1000);return `${pad(p.getUTCDate())}.${pad(p.getUTCMonth()+1)}. ${pad(p.getUTCHours())} UTC`;})():'';
  let h=`<table><thead><tr><th>Modell</th>${DAYS.slice(0,n).map(d=>`<th>${relDay(d.t)==='heute'?'Heute':relDay(d.t)==='morgen'?'Morgen':lp(d.t).wd} ${pad(lp(d.t).d)}.</th>`).join('')}<th>Σ</th><th>Auflösung</th><th>Lauf</th></tr></thead>`;
  const fs=v=>ok(v)?fCm(v):'–',tot=a=>{const t=a.filter(ok);return t.length?t.reduce((x,y)=>x+y,0):null;};
  const detVals=s=>DAYS.slice(0,n).map(d=>{const m=evalMember(s,d.iEnd,thr);return m?m.N24:null;});
  const kv=DAYRES.slice(0,n).map(r=>r?r.q50:null);
  h+=`<tbody><tr class="kons"><td class="m">Konsens<small>Median aller Systeme, gewichtet wie im Powder-Meter</small></td>${kv.map(cell).join('')}<td class="h"><b>${fs(tot(kv))}</b></td><td class="h"></td><td class="h"></td></tr></tbody>`;
  const G=[
    {id:'hr',title:'Hochaufgelöst',sub:'1–2,5 km · bis 5 Tage',rows:SERIES.filter(s=>s.kind==='det'&&s.sys==='hr').map(s=>({label:s.label,org:s.meta.org,res:s.meta.res,vals:detVals(s),run:s.sid==='gs_arome1k'?(SERIES._gsRef||''):run(s.sid)}))},
    {id:'gd',title:'Global & regional',sub:'7–28 km · bis 16 Tage',rows:SERIES.filter(s=>s.kind==='det'&&s.sys==='gd').map(s=>({label:s.label,org:s.meta.org,res:s.meta.res,vals:detVals(s),run:run(s.sid)}))},
    {id:'ens',title:'Ensembles',sub:'Median der Läufe je System',rows:ENS_SYS.map(e=>{const mem=SERIES.filter(s=>s.sys===e.id);if(!mem.length)return null;return {label:`${e.label} · ${mem.length} Läufe`,org:e.org,res:e.res,vals:DAYS.slice(0,n).map(d=>median(mem.map(s=>{const m=evalMember(s,d.iEnd,thr);return m?m.N24:null;}))),run:run(e.id)};}).filter(Boolean)}
  ];
  if(CL)G[0].rows.push({label:'C-LAEF (Median)',org:'GeoSphere-Ensemble',res:'1 km',vals:DAYS.slice(0,n).map(d=>{const c=evalClaef(d.iEnd,thr);return c?c.N[1]:null;}),run:SERIES._clRef||''});
  for(const g of G){if(!g.rows.length)continue;const open=openGrp.has(g.id),med=DAYS.slice(0,n).map((d,k)=>median(g.rows.map(r=>r.vals[k])));
    h+=`<tbody data-g="${g.id}"><tr class="grp-row"><td class="m"><button type="button" class="gbtn" aria-expanded="${open}"><span class="chev">${open?'−':'+'}</span>${g.title}<span class="gc">${g.rows.length}</span></button><small>${g.sub}</small></td>${med.map(cell).join('')}<td class="h"><b>${fs(tot(med))}</b></td><td class="h"></td><td class="h"></td></tr>`;
    if(open)for(const r of g.rows)h+=`<tr><td class="m sub">${esc(r.label)}<small>${esc(r.org)}</small></td>${r.vals.map(cell).join('')}<td class="h">${fs(tot(r.vals))}</td><td class="h">${r.res}</td><td class="h muted">${r.run}</td></tr>`;
    h+='</tbody>';}
  h+='</table>';box.innerHTML=h;
  box.querySelectorAll('tbody[data-g] .grp-row').forEach(tr=>tr.addEventListener('click',()=>{const g=tr.parentElement.dataset.g;openGrp.has(g)?openGrp.delete(g):openGrp.add(g);store.set('swx.mgrp',[...openGrp]);safe(renderModelTable);const b=box.querySelector(`tbody[data-g="${g}"] .gbtn`);if(b)b.focus({preventScroll:true});}));
}
function renderStations(){
  const box=$('stations');const nowj=TAWES&&TAWES[0],hist=TAWES&&TAWES[1];
  if(!nowj||!nowj.features){box.innerHTML='<div class="empty err">Stationsdaten nicht erreichbar.</div>';setSum('messwerte','Stationsdaten gerade nicht erreichbar');return;}
  const sp=[];
  const tsNow=nowj.timestamps&&nowj.timestamps[0];
  const hb={};if(hist&&hist.features){const ht=hist.timestamps.map(toSec);for(const f of hist.features){hb[f.properties.station]={t:ht,p:f.properties.parameters};}}
  const lat0=S.talLat,lon0=S.talLon;
  box.innerHTML=STATIONS.map(st=>{const f=nowj.features.find(x=>String(x.properties.station)===st.id);if(!f)return '';
    const hh=hb[st.id],hv=k=>{if(!hh||!hh.p[k])return null;const a=hh.p[k].data;for(let i=a.length-1;i>=0;i--)if(a[i]!=null)return a[i];return null;};
    const p=f.properties.parameters,v=k=>{const c=p[k]&&p[k].data?p[k].data[0]:null;return c!=null?c:hv(k);};const[lon,lat]=f.geometry.coordinates;
    const dkm=Math.hypot((lat-lat0)*111.2,(lon-lon0)*111.2*Math.cos(lat0*Math.PI/180)),brg=(Math.atan2((lon-lon0)*Math.cos(lat0*Math.PI/180),lat-lat0)*180/Math.PI+360)%360;
    let rr=null,sn0=null,spark='';
    if(hh){const r=hh.p.RR?hh.p.RR.data:[];rr=r.some(x=>x!=null)?r.reduce((a,b)=>a+(b||0),0):null;const sd=hh.p.SCHNEE?hh.p.SCHNEE.data.filter(ok):[];if(sd.length)sn0=sd[0];
      const T=hh.p.TL?hh.p.TL.data:[];const vals=T.filter(ok);if(vals.length>3){const lo=Math.min(...vals),hi=Math.max(...vals),span=Math.max(hi-lo,1);let d='',pen=false;T.forEach((x,i)=>{if(!ok(x)){pen=false;return;}const X=(i/(T.length-1)*236+2).toFixed(1),Y=(32-(x-lo)/span*28).toFixed(1);d+=(pen?'L':'M')+X+' '+Y;pen=true;});
        const zy=lo<0&&hi>0?(32-(0-lo)/span*28).toFixed(1):null;spark=`<svg class="spark" viewBox="0 0 240 36" preserveAspectRatio="none">${zy?`<line x1="0" x2="240" y1="${zy}" y2="${zy}" stroke="var(--line)" stroke-dasharray="2 3"/>`:''}<path d="${d}" fill="none" stroke="var(--ink)" stroke-width="1.6" vector-effect="non-scaling-stroke"/></svg><div class="mono muted" style="font-size:10.5px;display:flex;justify-content:space-between"><span>−24 h</span><span>${fT0(lo)} … ${fT0(hi)}</span><span>jetzt</span></div>`;}}
    const sn=v('SCHNEE'),ff=v('FF'),fx=v('FFX');if(ok(v('TL')))sp.push(`${st.name} ${fT(v('TL'))}`);
    return `<article class="card st"><div class="nm">${esc(st.name)}</div><div class="el">${f0(st.elev)} m · ${f0(dkm)} km ${dirName(brg)} von Flachauwinkl</div>
      <div class="big">${fT(v('TL'))}</div>
      <div class="rows"><span>Wind</span><span>${ok(ff)?`${dirName(v('DD'))} ${f0(ff*3.6)} km/h`:'–'}</span><span>Böen</span><span>${ok(fx)?f0(fx*3.6)+' km/h':'–'}</span><span>Rel. Feuchte</span><span>${ok(v('RF'))?f0(v('RF'))+' %':'–'}</span><span>Niederschlag 24 h</span><span>${ok(rr)?f1(rr)+' mm':'–'}</span><span>Schneehöhe</span><span>${ok(sn)?f0(sn)+' cm'+(ok(sn0)?` (${sn-sn0>=0?'+':'−'}${f0(Math.abs(sn-sn0))} in 24 h)`:''):'kein Sensor / –'}</span></div>${spark}</article>`;}).join('')+(tsNow?`<p class="note" style="grid-column:1/-1">Stand ${fDay(toSec(tsNow))} ${fTime(toSec(tsNow))} Uhr.</p>`:'');
  setSum('messwerte',sp.length?sp.join(' · ')+(tsNow?` · Stand ${fTime(toSec(tsNow))} Uhr`:''):'Keine aktuellen Messwerte');
}
function procSnowgrid(j){
  const ts=j.timestamps.map(toSec),ML=[[10,31],[11,30],[12,31],[1,31],[2,28],[3,31],[4,30],[5,31]],tmpl=[];
  for(const[m,n]of ML)for(let d=1;d<=n;d++)tmpl.push(pad(m)+'-'+pad(d));const pos=new Map(tmpl.map((k,i)=>[k,i]));
  const nowD=new Date(),cy=nowD.getUTCMonth()+1>=8?nowD.getUTCFullYear():nowD.getUTCFullYear()-1;
  const out={tmpl,curSY:cy};
  const feats=[nearestFeature(j,S.bergLat,S.bergLon),nearestFeature(j,S.talLat,S.talLon)];
  ['berg','tal'].forEach((nm,fi)=>{const f=feats[fi];if(!f)return;const arr=f.properties.parameters.snow_depth.data,by=new Map();let lastV=null;
    ts.forEach((t,i)=>{const dt=new Date(t*1000),y=dt.getUTCFullYear(),m=dt.getUTCMonth()+1,d=dt.getUTCDate(),p=pos.get(pad(m)+'-'+pad(d));if(arr[i]!=null)lastV=arr[i]*100;if(p===undefined)return;const sy=m>=8?y:y-1;if(!by.has(sy))by.set(sy,new Array(tmpl.length).fill(null));by.get(sy)[p]=arr[i]==null?null:arr[i]*100;});
    const p10=[],p50=[],p90=[];for(let p=0;p<tmpl.length;p++){const v=[];for(let sy=1991;sy<=2020;sy++){const a=by.get(sy);if(a&&a[p]!=null)v.push(a[p]);}p10.push(quant(v,.1));p50.push(quant(v,.5));p90.push(quant(v,.9));}
    const cur=by.get(cy)||new Array(tmpl.length).fill(null);
    let lastIdx=-1;cur.forEach((v,i)=>{if(v!=null)lastIdx=i;});
    let rank=null;if(lastIdx>=0){const v=[];for(let sy=1991;sy<=2020;sy++){const a=by.get(sy);if(a&&a[lastIdx]!=null)v.push(a[lastIdx]);}if(v.length)rank=v.filter(x=>x<cur[lastIdx]).length/v.length+0.5*v.filter(x=>x===cur[lastIdx]).length/v.length;}
    const maxes=[];for(let sy=1991;sy<=2020;sy++){const a=by.get(sy);if(a){const v=a.filter(ok);if(v.length>200)maxes.push(Math.max(...v));}}
    // Beginn der dauerhaften Schneedecke: erster Tag, ab dem 14 Tage in Folge ≥ 5 cm liegen
    const fsd=new Map();let run=0,runStart=0;
    ts.forEach((t,i)=>{const v=arr[i];if(v!=null&&v>=0.05){if(!run)runStart=t;run++;if(run===14){const dt=new Date(runStart*1000),y=dt.getUTCFullYear(),m=dt.getUTCMonth()+1,sy=m>=8?y:y-1;if(!fsd.has(sy))fsd.set(sy,Math.round((runStart-Date.UTC(sy,7,1)/1000)/86400));}}else run=0;});
    const offs=[];for(let sy=1991;sy<=2020;sy++)if(fsd.has(sy))offs.push(fsd.get(sy));
    const mo=offs.length>=15?quant(offs,.5):null,first=ok(mo)?(()=>{const d=new Date(Date.UTC(2026,7,1)+Math.round(mo)*86400000);return `${d.getUTCDate()}. ${MONLONG[d.getUTCMonth()]}`;})():null;
    out[nm]={p10,p50,p90,cur,last:by.get(cy-1)||[],now:lastV,lastIdx,rank,maxMed:quant(maxes,.5),first};});
  const lt=ts[ts.length-1],d=new Date(lt*1000);out.lastLabel=`${pad(d.getUTCDate())}.${pad(d.getUTCMonth()+1)}.`;out.lastT=lt;
  return out;
}
function renderSeasonSum(){
  const p=[];
  if(SG&&SG.berg){const x=SG.berg;p.push(`Schneehöhe Berg ${ok(x.now)?f0(x.now)+' cm':'–'}`+(x.lastIdx>=0&&ok(x.p50[x.lastIdx])?` (üblich um diese Zeit: ${f0(x.p50[x.lastIdx])} cm)`:''));}
  if(SEAS&&SEAS.monthly){const m=SEAS.monthly,t=m.time||[],a=m.temperature_2m_anomaly||[];const w=t.map((s,i)=>[+s.slice(5,7),a[i]]).filter(([mo,v])=>(mo===12||mo===1||mo===2)&&ok(v)).map(x=>x[1]);
    if(w.length){const v=avg(w);p.push(`Saisonprognose Dez–Feb: ${sgnK(v)} K, also ${v>0.3?'wärmer':v<-0.3?'kälter':'etwa normal'}`);}}
  setSum('saison',p.length?p.join(' · '):'Schneedaten nicht erreichbar');
}
function renderSeason(){
  if(!isOpen('saison'))return;
  const box=$('seasonChart');
  if(!SG){box.innerHTML='<div class="empty err">SNOWGRID-Daten nicht erreichbar.</div>';$('seasonKpis').innerHTML='';return;}
  const g=SG[sgLevel];if(!g){box.innerHTML='<div class="empty">Keine Daten.</div>';return;}
  const sy=SG.curSY,tsS=SG.tmpl.map(k=>{const m=+k.slice(0,2),d=+k.slice(3);return Date.UTC(m>=8?sy:sy+1,m-1,d,12)/1000;});
  const months=[10,11,12,1,2,3,4,5].map(m=>({t:Date.UTC(m>=8?sy:sy+1,m-1,1)/1000,label:MON[m-1]}));
  const mx=Math.max(40,...g.p90.filter(ok),...g.cur.filter(ok),...g.last.filter(ok))*1.08;
  const idxS=t=>{const i=Math.round((t-tsS[0])/86400);return i>=0&&i<tsS.length?i:null;};
  timeChart(box,{label:'Schneehöhe Saison',ts:tsS,t0:tsS[0]-43200,t1:tsS[tsS.length-1]+43200,months,idx:idxS,panels:[{title:`Schneehöhe cm · ${sgLevel==='berg'?'Berg '+f0(S.bergElev):'Tal '+f0(S.talElev)} m`,h:230,y:{min:0,max:mx,fmt:f0},
    layers:[{type:'band',lo:g.p10,hi:g.p90,cls:'b-ens'},{type:'line',v:g.p50,cls:'l-sl'},{type:'line',v:g.last,cls:'l-last'},{type:'line',v:g.cur,cls:'l-cum'}]}],
    tip:i=>{const k=SG.tmpl[i];return `<b>${+k.slice(3)}. ${MON[+k.slice(0,2)-1]}</b>`+tr('2026/27',ok(g.cur[i])?f0(g.cur[i])+' cm':'–')+tr('2025/26',ok(g.last[i])?f0(g.last[i])+' cm':'–')+tr('Median 1991–2020',f0(g.p50[i])+' cm')+tr('10–90 %',`${f0(g.p10[i])}–${f0(g.p90[i])} cm`);}});
  const kp=[];
  for(const[nm,lab,el]of [['berg','Berg',S.bergElev],['tal','Tal',S.talElev]]){const x=SG[nm];if(!x)continue;const li=x.lastIdx,med=li>=0?x.p50[li]:null;
    kp.push([`Schneehöhe ${lab} ${f0(el)} m`,ok(x.now)?f0(x.now)+' cm':'–',li>=0?`Median 1991–2020 am ${SG.lastLabel}: ${f0(med)} cm`+(ok(x.rank)?` · mehr Schnee als in ${f0(x.rank*100)} % der Winter`:''):'Saison noch ohne Daten']);}
  const lastSeasonMax=SG.berg?Math.max(0,...SG.berg.last.filter(ok)):null,climMax=SG.berg?SG.berg.maxMed:null;
  kp.push(['Letzter Winter Berg (Maximum)',ok(lastSeasonMax)?f0(lastSeasonMax)+' cm':'–',`Typisches Saisonmaximum 1991–2020: ${f0(climMax)} cm`]);
  $('seasonKpis').innerHTML=kp.map(k=>`<div class="card kpi"><div class="k">${k[0]}</div><div class="v">${k[1]}</div><div class="s">${k[2]}</div></div>`).join('');
}
function renderSeas(){
  const box=$('seas');
  if(!SEAS||!SEAS.monthly){box.innerHTML='<div class="empty err">Saisonprognose nicht erreichbar.</div>';return;}
  const m=SEAS.monthly,t=m.time||[];
  const rows=[['Temperatur','temperature_2m_anomaly',v=>sgnK(v)+' K',v=>v>0?'var(--warm)':'var(--snow)',2],['Niederschlag','precipitation_anomaly',v=>(v>0?'+':v<0?'−':'±')+f0(Math.abs(v))+' mm',v=>v>0?'var(--snow)':'var(--warm)',40],['Schneefall','snowfall_anomaly',v=>(v>0?'+':v<0?'−':'±')+f0(Math.abs(v))+' cm',v=>v>0?'var(--snow)':'var(--warm)',20]];
  box.innerHTML=rows.map(([lab,key,fmt,col,scale])=>{const a=m[key]||[];return `<div class="seas-row"><div class="lbl">${lab}</div><div class="seas-cells">${t.slice(0,6).map((tt,i)=>{const v=a[i];const al=ok(v)?clamp(Math.abs(v)/scale,0,1)*0.55:0;return `<div class="sc" style="background:color-mix(in srgb,${ok(v)?col(v):'transparent'} ${f0(al*100)}%,transparent)"><div class="mo">${MON[+tt.slice(5,7)-1]}</div><div class="va">${ok(v)?fmt(v):'–'}</div></div>`;}).join('')}</div></div>`;}).join('');
}
const PROB={new_snow:'Neuschnee',wind_slab:'Triebschnee',persistent_weak_layers:'Altschnee',wet_snow:'Nassschnee',gliding_snow:'Gleitschnee',favourable_situation:'Günstige Situation',cornices:'Wechten',no_distinct_avalanche_problem:'kein ausgeprägtes Problem'};
const LVL={low:[1,'gering'],moderate:[2,'mäßig'],considerable:[3,'erheblich'],high:[4,'groß'],very_high:[5,'sehr groß'],no_snow:[0,'kein Schnee'],no_rating:[0,'keine Einstufung']};
const elevTxt=e=>{if(!e)return 'alle Höhenlagen';const f=v=>v==='treeline'?'Waldgrenze':f0(+v)+' m';if(e.lowerBound&&e.upperBound)return `${f(e.lowerBound)} – ${f(e.upperBound)}`;if(e.lowerBound)return `oberhalb ${f(e.lowerBound)}`;return `unterhalb ${f(e.upperBound)}`;};
const strip=s=>String(s||'').replace(/<br\s*\/?>/gi,'\n').replace(/<[^>]+>/g,'').trim();
function renderAval(){
  const box=$('aval');const iframeUrl='https://lawinen-warnung.eu/bulletin/latest?headless=1&province=AT-05&language=de&map-ratio=3%2F1';
  const iframeBtn=`<div class="iframe-box" id="avIframe"><button class="btn" type="button" id="avLoad">Offizielle Ansicht von lawine.salzburg.at laden</button></div>`;
  const bindIframe=()=>{const b=$('avLoad');if(b)b.addEventListener('click',()=>{$('avIframe').innerHTML=`<iframe src="${iframeUrl}" title="Lawinenlagebericht Salzburg" loading="lazy"></iframe>`;});};
  if(!LAW||LAW.error){box.innerHTML=`<p class="err">Lawinenwarndienst nicht erreichbar.</p><p><a href="https://lawine.salzburg.at/" target="_blank" rel="noopener">lawine.salzburg.at öffnen</a></p>`;return;}
  const b=LAW.b,stale=b&&b.validTime&&toSec(b.validTime.endTime)<NOW-36*3600;
  if(LAW.none||!b||stale){box.innerHTML=`<div class="prose"><p><strong>Derzeit kein aktueller Lagebericht.</strong> Der Lawinenwarndienst Salzburg startet die täglichen Berichte Anfang Dezember. Sobald der erste Bericht erscheint, stehen hier automatisch Gefahrenstufe, Lawinenprobleme und Kurztext für Niedere Tauern Nord.</p>${stale?`<p class="muted">Letzter Bericht gültig bis ${fDay(toSec(b.validTime.endTime))}.</p>`:''}<p>Bis dahin: <a href="https://lawine.salzburg.at/blog" target="_blank" rel="noopener">Blog des LWD Salzburg</a> mit Infos zur Schneelage im Frühwinter.</p></div>${iframeBtn}`;bindIframe();return;}
  const ratings=(b.dangerRatings||[]).filter(r=>r.mainValue);const maxL=Math.max(0,...ratings.map(r=>(LVL[r.mainValue]||[0])[0]));
  const per={all_day:'',earlier:'vormittags',later:'nachmittags'};
  const lv=ratings.map(r=>{const[n,t]=LVL[r.mainValue]||[0,r.mainValue];return `<div class="lvl-row"><div class="lvl-n" style="background:var(--av${clamp(n,1,5)});${n===5?'color:#fff':''}">${n||'–'}</div><div class="lvl-t">${t}<small>${elevTxt(r.elevation)}${per[r.validTimePeriod]?' · '+per[r.validTimePeriod]:''}</small></div></div>`;}).join('');
  const probs=(b.avalancheProblems||[]).map(p=>`<span class="chip">${PROB[p.problemType]||p.problemType} · ${elevTxt(p.elevation)}${p.aspects&&p.aspects.length&&p.aspects.length<8?' · '+p.aspects.map(a=>a.replace('E','O')).join(' '):''}</span>`).join('');
  const aa=b.avalancheActivity||{},sp=b.snowpackStructure||{},tdc=(b.tendency||[])[0];
  const tend={increasing:'zunehmend',steady:'gleichbleibend',decreasing:'abnehmend'};
  box.innerHTML=`<div class="aval"><div><div class="lvl">${lv||'<div class="empty">Keine Einstufung</div>'}</div><div class="probs">${probs}</div>
    <p class="note">Gültig ${fDay(toSec(b.validTime.startTime))} ${fTime(toSec(b.validTime.startTime))} bis ${fDay(toSec(b.validTime.endTime))} ${fTime(toSec(b.validTime.endTime))} · veröffentlicht ${fDay(toSec(b.publicationTime))} ${fTime(toSec(b.publicationTime))}</p></div>
    <div class="prose">${aa.highlights?`<p><strong>${esc(strip(aa.highlights))}</strong></p>`:''}${aa.comment?`<p>${esc(strip(aa.comment))}</p>`:''}${sp.comment?`<p class="muted"><strong>Schneedecke:</strong> ${esc(strip(sp.comment))}</p>`:''}${tdc?`<p class="muted"><strong>Tendenz ${tend[tdc.tendencyType]||''}:</strong> ${esc(strip(tdc.highlights))}</p>`:''}
    <p><a href="https://lawine.salzburg.at/" target="_blank" rel="noopener">Vollständiger Bericht auf lawine.salzburg.at</a></p></div></div>${iframeBtn}`;
  bindIframe();
  if(maxL>=3)EVENTS.unshift({t:NOW,type:'warn',tag:'Lawine',title:`Lawinengefahr ${LVL[ratings.find(r=>(LVL[r.mainValue]||[0])[0]===maxL).mainValue][1]} (${maxL})`,text:'Laut Lawinenwarndienst Salzburg, Niedere Tauern Nord.'});
}
function renderStatus(){
  const all=[...STATUS.values()].filter(s=>s.state!=='na');if(all.length)setSum('methodik',`Wie das Powder-Meter rechnet, Gewichtung, Grenzen · ${all.filter(s=>s.state==='ok').length} von ${all.length} Datenquellen erreichbar`);
  const ul=$('status');ul.innerHTML=[...STATUS.values()].map(s=>`<li><span class="dot ${s.state}"></span><span><strong>${esc(s.label)}</strong>${s.info?` <span class="muted">– ${esc(s.info)}</span>`:''}</span></li>`).join('')||'<li>Noch keine Abfrage.</li>';
}
function setStamp(){
  const st=$('stamp');
  if(loading){st.classList.add('loading');st.textContent='Lade Daten …';return;}
  st.classList.remove('loading');
  const err=[...STATUS.values()].filter(s=>s.state==='err').length;
  const t=Math.floor(lastLoad/1000);
  // Modelldaten kommen stündlich vom Worker: Alter anzeigen, ab 3 Stunden als Warnung
  const og=OMGEN,old=ok(og)&&t-og>3*3600,omTxt=ok(og)?` · Modelldaten ${old?`<span class="err">von ${relDay(og)} ${fTime(og)} Uhr</span>`:`${fTime(og)} Uhr`}`:'';
  st.innerHTML=`Stand ${fTime(t)} Uhr · ${SERIES.length?SERIES.length+' Modellläufe':''}${omTxt}${err?` · <span class="err">${err} Quelle${err>1?'n':''} ausgefallen</span>`:''}<br>nächste Aktualisierung ${fTime(t+REFRESH_MIN*60)} Uhr`;
}
function updateEyebrow(){$('eyebrow').textContent=`Flachauwinkl · Kleinarl · ${f0(S.talElev)}–${f0(S.bergElev)} m · Lawinenregion Niedere Tauern Nord`;}

/* ======================= Vorhersage-Band mit Piktogrammen ======================= */
let fcDays=[3,5,7].includes(store.get('swx.fcDays',5))?store.get('swx.fcDays',5):5;
const P2=v=>+v.toFixed(1);
function icCloud(dx,dy,s,fill){const c=(x,y,r)=>`<circle cx="${P2(dx+x*s)}" cy="${P2(dy+y*s)}" r="${P2(r*s)}"/>`;return `<g fill="${fill}">${c(22,30,9)}${c(33,24,12)}${c(44,31,8)}<rect x="${P2(dx+13*s)}" y="${P2(dy+30*s)}" width="${P2(39*s)}" height="${P2(9*s)}" rx="${P2(4.5*s)}"/></g>`;}
function icSun(cx,cy,r){let s=`<g stroke="var(--sun)" stroke-width="2.6" stroke-linecap="round">`;for(let k=0;k<8;k++){const a=k*Math.PI/4;s+=`<line x1="${P2(cx+Math.cos(a)*r*1.38)}" y1="${P2(cy+Math.sin(a)*r*1.38)}" x2="${P2(cx+Math.cos(a)*r*1.78)}" y2="${P2(cy+Math.sin(a)*r*1.78)}"/>`;}return s+`</g><circle cx="${cx}" cy="${cy}" r="${r}" fill="var(--sun)"/>`;}
function icMoon(cx,cy,r){return `<path d="M${P2(cx+r*.3)} ${P2(cy-r*.95)}A${r} ${r} 0 1 0 ${P2(cx+r*.95)} ${P2(cy+r*.3)}A${P2(r*.8)} ${P2(r*.8)} 0 0 1 ${P2(cx+r*.3)} ${P2(cy-r*.95)}Z" fill="var(--moon)"/>`;}
function icFlake(x,y,s){let o='';for(const a of [0,60,120]){const r=a*Math.PI/180;o+=`<line x1="${P2(x-Math.cos(r)*s)}" y1="${P2(y-Math.sin(r)*s)}" x2="${P2(x+Math.cos(r)*s)}" y2="${P2(y+Math.sin(r)*s)}"/>`;}return `<g stroke="var(--snow)" stroke-width="2" stroke-linecap="round">${o}</g>`;}
function icDrop(x,y){return `<path d="M${x} ${y-5}C${x+3.4} ${y-.6} ${x+3.4} ${y+3.4} ${x} ${y+3.4}C${x-3.4} ${y+3.4} ${x-3.4} ${y-.6} ${x} ${y-5}Z" fill="var(--rain)"/>`;}
function wxIcon(type,label){
  let g='';const up=(fill)=>icCloud(0,-6,1,fill);
  switch(type){
    case 'sun':g=icSun(32,32,11);break;
    case 'moon':g=icMoon(32,32,15);break;
    case 'partly':g=icSun(23,22,9)+icCloud(7,9,1,'var(--cloud)');break;
    case 'partly-night':g=icMoon(24,21,11)+icCloud(7,9,1,'var(--cloud)');break;
    case 'cloudy':g=icSun(22,18,7)+icCloud(-4,2,.9,'var(--cloud-dk)')+icCloud(6,9,1,'var(--cloud)');break;
    case 'overcast':g=icCloud(-4,0,.9,'var(--cloud)')+icCloud(6,9,1,'var(--cloud-dk)');break;
    case 'snow':g=up('var(--cloud)')+icFlake(22,47,4.5)+icFlake(34,54,4.5)+icFlake(46,47,4.5);break;
    case 'snow-heavy':g=up('var(--cloud-dk)')+icFlake(18,44,4.2)+icFlake(31,48,4.2)+icFlake(44,44,4.2)+icFlake(24,56,4.2)+icFlake(38,56,4.2);break;
    case 'rain':g=up('var(--cloud-dk)')+icDrop(22,48)+icDrop(34,54)+icDrop(46,48);break;
    case 'sleet':g=up('var(--cloud-dk)')+icFlake(23,48,4.5)+icDrop(35,53)+icFlake(46,48,4.5);break;
  }
  return `<svg viewBox="0 0 64 64" role="img" aria-label="${esc(label||type)}">${g}</svg>`;
}
const MINI={
  snow:'<svg viewBox="0 0 16 16" aria-hidden="true"><g stroke="var(--snow)" stroke-width="1.6" stroke-linecap="round"><line x1="8" y1="1.5" x2="8" y2="14.5"/><line x1="2.4" y1="4.8" x2="13.6" y2="11.2"/><line x1="2.4" y1="11.2" x2="13.6" y2="4.8"/></g></svg>',
  rain:'<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 2C11 6.5 12 8.7 12 10.3A4 4 0 0 1 4 10.3C4 8.7 5 6.5 8 2Z" fill="var(--rain)"/></svg>',
  mtn:'<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M1 14L6 5l3 4.5 2-2.8L15 14Z" fill="var(--muted)"/><path d="M6 5l1.8 3.3-1.4-.6L4.9 8.8Z" fill="var(--surface)"/></svg>',
  arrow:d=>`<svg viewBox="-8 -8 16 16" aria-hidden="true"><g transform="rotate(${Math.round(d)})"><path d="M0 -6L0 6M-3.5 2.5L0 6L3.5 2.5" stroke="currentColor" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round"/></g></svg>`
};
function fcStats(idx){
  const st={P:0,RN:0,SN:0,G:null,n:idx.length},cc=[];
  for(const i of idx){const p=K.P[i];if(ok(p)){st.P+=p;st.RN+=Math.min(p,K.RN[i]||0);}if(ok(K.SN[i]))st.SN+=K.SN[i];if(ok(K.G[i]))st.G=st.G==null?K.G[i]:Math.max(st.G,K.G[i]);if(ok(K.CC[i]))cc.push(K.CC[i]);}
  st.CC=avg(cc);return st;
}
function wxType(st,night){
  const long=st.n>=8,pThr=long?0.8:0.4;
  if(st.P>=pThr){const sf=clamp(1-st.RN/st.P,0,1);
    if(sf>=.7)return st.SN>=(long?10:5)?['snow-heavy','Starker Schneefall']:['snow','Schneefall'];
    if(sf<=.3)return ['rain','Regen'];return ['sleet','Schneeregen'];}
  const c=st.CC;if(!ok(c))return [night?'moon':'sun','–'];
  if(c<25)return night?['moon','klar']:['sun','sonnig'];
  if(c<60)return night?['partly-night','teils bewölkt']:['partly','heiter bis wolkig'];
  if(c<85)return night?['overcast','bewölkt']:['cloudy','überwiegend bewölkt'];
  return ['overcast','bedeckt'];
}
function fcDay(key){
  const idx=[];for(let i=0;i<AX.length;i++)if(lp(AX[i]).key===key)idx.push(i);if(!idx.length)return null;
  const h=i=>lp(AX[i]).h,between=(a,b)=>idx.filter(i=>h(i)>=a&&h(i)<b),last=idx[idx.length-1];
  const night=[...between(18,24)];for(let i=last+1;i<=last+6&&i<AX.length;i++)night.push(i);
  const day=fcStats(between(8,17)),parts=[[between(6,12),false,'vorm.'],[between(12,18),false,'nachm.'],[night,true,'nachts']].map(([ix,nt,lab])=>{const t=ix.length?wxType(fcStats(ix),nt):null;return {t,lab};});
  let [type,label]=wxType(day,false);const all=fcStats(idx);
  if(ok(all.G)&&all.G>=75)label+=', stürmisch';else if(ok(all.G)&&all.G>=50)label+=', windig';
  const pick=(arr)=>idx.map(i=>arr?arr[i]:null).filter(ok);
  const tb=pick(K.T),tt=pick(KT.T);
  // Neuschnee Kalendertag: gemessen (INCA) bis jetzt + Prognose (gewichteter Median) ab jetzt
  let snow=0;const ib=INCA&&INCA.berg;if(ib)for(const i of idx)if(i<=iNow&&i<=ib.last&&ok(ib.SN[i]))snow+=ib.SN[i];
  const q=i=>{if(!PLUME||i<=iNow)return 0;for(let j=i;j>iNow;j--)if(ok(PLUME.q50[j]))return PLUME.q50[j];return 0;};
  if(last>iNow)snow+=q(last)-q(Math.max(idx[0]-1,iNow));
  const rainB=all.RN;let rainT=0;for(const i of idx)if(ok(KT.P[i]))rainT+=Math.min(KT.P[i],KT.RN[i]||0);
  const wet=idx.filter(i=>ok(K.P[i])&&K.P[i]>=0.1).map(i=>K.SL[i]).filter(ok),slAll=pick(K.SL);
  const dayIx=between(8,17),us=[],vs=[];for(const i of dayIx){if(ok(K.D7[i])&&ok(K.W7[i])){const r=K.D7[i]*Math.PI/180;us.push(-K.W7[i]*Math.sin(r));vs.push(-K.W7[i]*Math.cos(r));}}
  const dir=us.length?(Math.atan2(-avg(us),-avg(vs))*180/Math.PI+360)%360:null;
  const dk=DAYS.findIndex(d=>d.key===key),res=dk>=0?DAYRES[dk]:null;
  return {key,t:AX[idx[0]],type,label,parts,tmax:tb.length?Math.max(...tb):null,tmin:tb.length?Math.min(...tb):null,ttmax:tt.length?Math.max(...tt):null,ttmin:tt.length?Math.min(...tt):null,
    snow:Math.max(0,snow),rainB,rainT,sl:wet.length?Math.min(...wet):(slAll.length?Math.min(...slAll):null),slWet:wet.length>0,G:all.G,dir,pp:res?res.Pp:null};
}
function renderFc(){
  const box=$('fc'),seg=$('fcRange');
  if(!seg.childElementCount){seg.innerHTML=[3,5,7].map(n=>`<button type="button" data-n="${n}">${n} Tage</button>`).join('');seg.querySelectorAll('button').forEach(b=>b.addEventListener('click',()=>{fcDays=+b.dataset.n;store.set('swx.fcDays',fcDays);safe(renderFc);}));}
  seg.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(+b.dataset.n===fcDays)));
  if(!K||!KT){box.innerHTML='<div class="empty">Keine Prognosedaten.</div>';return;}
  const keys=[];for(let i=iNow;i<AX.length&&keys.length<fcDays;i++){const k=lp(AX[i]).key;if(!keys.includes(k))keys.push(k);}
  const D=keys.map(fcDay).filter(Boolean),N=D.length;
  const cell=(k,inner,cls)=>`<div class="c${k?' cb':''}${cls?' '+cls:''}">${inner}</div>`;
  let h='';
  D.forEach((d,k)=>{const p=lp(d.t),rel=relDay(d.t);h+=cell(k,`<div class="fc-d"><b>${rel==='heute'?'Heute':rel==='morgen'?'Morgen':WDL[p.wd]}</b><span>${p.wd} ${pad(p.d)}.${pad(p.m)}.</span></div>`);});
  D.forEach((d,k)=>{h+=cell(k,`<div class="fc-i">${wxIcon(d.type,d.label)}<span>${esc(d.label)}</span></div>`);});
  D.forEach((d,k)=>{h+=cell(k,`<div class="fc-p">${d.parts.map(p=>`<div>${p.t?wxIcon(p.t[0],p.lab+': '+p.t[1]):'<svg viewBox="0 0 64 64"></svg>'}${p.lab}</div>`).join('')}</div>`);});
  h+=`<div class="c fc-t" id="fcT"></div>`;
  D.forEach((d,k)=>{h+=cell(k,`<div class="fc-v muted" style="font-size:13px">Tal ${fT0(d.ttmin)} / ${fT0(d.ttmax)}</div>`);});
  D.forEach((d,k)=>{const s=d.snow>=0.5;let x=s?`<div class="fc-v">${MINI.snow}${fCm(d.snow)} cm`:`<div class="fc-v muted">${MINI.snow}–`;
    if(d.rainB>=1)x+=`<small>${MINI.rain} Regen am Berg ${f0(d.rainB)} mm</small>`;else if(s&&d.rainT>=1)x+=`<small>Tal: Regen</small>`;h+=cell(k,x+'</div>','rz');});
  D.forEach((d,k)=>{h+=cell(k,`<div class="fc-v${d.slWet?'':' muted'}">${MINI.mtn}${ok(d.sl)?f0(Math.round(d.sl/100)*100)+' m':'–'}</div>`);});
  D.forEach((d,k)=>{const w=ok(d.G)&&d.G>=60;h+=cell(k,`<div class="fc-v${w?' warn':''}">${ok(d.dir)?MINI.arrow(d.dir):''}${f0(d.G)} km/h</div>`,'rz');});
  D.forEach((d,k)=>{const p=d.pp;h+=cell(k,ok(p)?`<span class="pw${p>=.5?' hot':p>=.3?' mid':''}">Powder ${pct(p)}</span>`:'<span class="pw">Powder –</span>');});
  box.style.setProperty('--n',N);box.innerHTML=h;
  drawFcTemps(D);
  $('fcLegend').innerHTML=`<span><i style="color:var(--warm)"></i>Höchstwert Berg ${f0(S.bergElev)} m</span><span><i style="color:var(--snow)"></i>Tiefstwert Berg</span><span>${MINI.snow} Neuschnee am Berg pro Kalendertag</span><span>${MINI.mtn} Schneefallgrenze (grau: kein Niederschlag)</span><span>${MINI.arrow(225)} Windrichtung in 3.000 m · Zahl = stärkste Böe am Berg</span><span>Powder = Chance bis 9 Uhr, wie im Powder-Meter</span>`;
}
function drawFcTemps(D){
  const host=$('fcT');if(!host)return;const W=Math.max(200,host.clientWidth||600),N=D.length,H=104,cw=W/N;
  const vals=D.flatMap(d=>[d.tmax,d.tmin]).filter(ok);if(!vals.length){host.innerHTML='';return;}
  let lo=Math.min(...vals),hi=Math.max(...vals);if(hi-lo<6){const m=(hi+lo)/2;lo=m-3;hi=m+3;}
  const top=24,bot=H-24,Y=v=>bot-(v-lo)/(hi-lo)*(bot-top),X=k=>(k+.5)*cw;
  let s=`<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="Temperaturverlauf am Berg">`;
  for(let k=1;k<N;k++)s+=`<line x1="${P2(k*cw)}" x2="${P2(k*cw)}" y1="0" y2="${H}" stroke="var(--grid)"/>`;
  if(lo<0&&hi>0)s+=`<line x1="0" x2="${W}" y1="${P2(Y(0))}" y2="${P2(Y(0))}" stroke="var(--line)" stroke-dasharray="3 4"/><text x="4" y="${P2(Y(0)-4)}" style="fill:var(--muted);font:500 10px var(--font-mono)">0°</text>`;
  const path=a=>a.map((v,k)=>ok(v)?`${k&&ok(a[k-1])?'L':'M'}${P2(X(k))} ${P2(Y(v))}`:'').join('');
  const mx=D.map(d=>d.tmax),mn=D.map(d=>d.tmin);
  s+=`<path d="${path(mx)}" fill="none" stroke="var(--warm)" stroke-width="2.2" stroke-linejoin="round"/><path d="${path(mn)}" fill="none" stroke="var(--snow)" stroke-width="2.2" stroke-linejoin="round"/>`;
  D.forEach((d,k)=>{const x=P2(X(k));
    if(ok(d.tmax))s+=`<circle cx="${x}" cy="${P2(Y(d.tmax))}" r="4" fill="var(--warm)" stroke="var(--surface)" stroke-width="1.5"/><text x="${x}" y="${P2(Y(d.tmax)-9)}" text-anchor="middle" style="fill:var(--ink);font:600 14px var(--font-display)">${fT0(d.tmax)}</text>`;
    if(ok(d.tmin))s+=`<circle cx="${x}" cy="${P2(Y(d.tmin))}" r="4" fill="var(--snow)" stroke="var(--surface)" stroke-width="1.5"/><text x="${x}" y="${P2(Y(d.tmin)+19)}" text-anchor="middle" style="fill:var(--muted);font:600 13px var(--font-display)">${fT0(d.tmin)}</text>`;});
  host.innerHTML=s+'</svg>';
}

/* ======================= Beschneiung ======================= */
const SN_CLS=['zu warm','Grenzbereich','gut','sehr gut','optimal'];
const MONLONG=['Jänner','Februar','März','April','Mai','Juni','Juli','August','September','Oktober','November','Dezember'];
function snClass(Tw){if(!ok(Tw)||Tw>S.snProp)return 0;if(Tw>S.snLance)return 1;if(Tw>-5)return 2;if(Tw>-8)return 3;return 4;}
// Richtwert m³ Schnee/h für eine typische 24-kW-Propellermaschine (Beispielrechnung: −3 °C ≈ 1 l/s → 9 m³/h, −10 °C ≈ 7 l/s → ~60 m³/h, 400 kg/m³)
function snRate(Tw){if(!ok(Tw)||Tw>S.snProp)return 0;let ls;
  if(Tw>-3){ls=0.5+0.5*clamp((S.snProp-Tw)/Math.max(S.snProp+3,0.01),0,1);}else if(Tw>-10)ls=1+(-3-Tw)*6/7;else ls=7;
  return ls*3.6/0.4;}
function snLevels(){
  if(!K||!KT)return null;
  const n=AX.length,eT=S.talElev,eB=S.bergElev,eM=Math.round((eT+eB)/2/25)*25,f=(eM-eT)/((eB-eT)||1);
  const mk=(T,RH,W)=>({T,RH,W,TW:T.map((t,i)=>ok(t)?wetBulb(t,RH?RH[i]:null):null)});
  const Tm=new Array(n).fill(null),RHm=new Array(n).fill(null),Wm=new Array(n).fill(null);
  for(let i=0;i<n;i++){const a=KT.T[i],b=K.T[i];if(ok(a)&&ok(b))Tm[i]=a+(b-a)*f;const ra=KT.RH[i],rb=K.RH[i];RHm[i]=ok(ra)&&ok(rb)?ra+(rb-ra)*f:ok(rb)?rb:ok(ra)?ra:null;Wm[i]=avg([KT.W[i],K.W[i]]);}
  return [Object.assign({key:'berg',label:'Berg',elev:eB},mk(K.T,K.RH,K.W)),Object.assign({key:'mitte',label:'Mitte',elev:eM},mk(Tm,RHm,Wm)),Object.assign({key:'tal',label:'Tal',elev:eT},mk(KT.T,KT.RH,KT.W))];
}
function snWindows(L){
  const noons=[];for(let i=0;i<AX.length;i++)if(lp(AX[i]).h===12)noons.push(i);
  const k=noons.findIndex(i=>AX[i]>NOW);if(k<0)return [];
  const starts=[k>0?noons[k-1]:iNow,...noons.slice(k)].slice(0,8),out=[];
  for(let w=0;w<starts.length-1;w++){const a=starts[w],b=starts[w+1];
    out.push({a,b,res:L.map(lv=>{let h=0,hl=0,m3=0,mn=null,first=null,windy=0;
      for(let i=Math.max(a,iNow);i<b;i++){const tw=lv.TW[i];if(!ok(tw))continue;mn=mn==null?tw:Math.min(mn,tw);
        if(tw<=S.snProp){h++;m3+=snRate(tw);if(first==null)first=i;if(tw<=S.snLance)hl++;if(ok(lv.W[i])&&lv.W[i]>=S.snWind)windy++;}}
      return {h,hl,m3,mn,first,windy};})});}
  return out;
}
function snWinLabel(w){const p=lp(AX[w.b]);return p.key===lp(NOW).key?'bis heute Mittag':`Nacht auf ${WDL[p.wd]}`;}
function renderSnow(){
  const L=snLevels();if(!L){setSum('beschneiung','Prognosedaten fehlen');return;}
  const Wn=snWindows(L),fw=Wn.find(w=>w.res.some(r=>r.h>=3));
  if(fw){const mn=Math.min(...fw.res.map(r=>r.mn).filter(ok));setSum('beschneiung',`Nächstes Schneifenster ${snWinLabel(fw)}: ${L.map((lv,k)=>`${lv.label} ${fw.res[k].h} h`).join(', ')} · tiefste Feuchttemperatur ${fT(mn)}`);}
  else{const mn=Math.min(...L.flatMap(lv=>lv.TW.slice(iNow,iNow+168).filter(ok)));setSum('beschneiung',`Kein Schneifenster in den nächsten 7 Tagen · tiefste Feuchttemperatur ${fT(mn)}`);}
  safe(()=>renderSnNow(L));safe(()=>renderSnStrip(L));safe(()=>renderSnWx(L));safe(()=>renderSnNights(L,Wn));safe(renderSnCalc);
}
function renderSnNow(L){
  const ib=INCA&&INCA.berg&&INCA.berg.last>=0?INCA.berg:null,it=INCA&&INCA.tal&&INCA.tal.last>=0?INCA.tal:null;
  $('snNow').innerHTML=L.map(lv=>{
    let T=null,RH=null,W=null,src='Modell';
    if(lv.key==='berg'&&ib){T=ib.T[ib.last];RH=ib.RH[ib.last];W=ib.W[ib.last];src='INCA '+fTime(AX[ib.last]);}
    else if(lv.key==='tal'&&it){T=it.T[it.last];RH=it.RH[it.last];W=it.W[it.last];src='INCA '+fTime(AX[it.last]);}
    else if(lv.key==='mitte'&&ib&&it){const f=(lv.elev-S.talElev)/((S.bergElev-S.talElev)||1),g=(a,b)=>ok(a)&&ok(b)?a+(b-a)*f:null;T=g(it.T[it.last],ib.T[ib.last]);RH=g(it.RH[it.last],ib.RH[ib.last]);W=avg([it.W[it.last],ib.W[ib.last]]);src='INCA, interpoliert';}
    if(!ok(T)){T=lv.T[iNow];RH=lv.RH[iNow];W=lv.W[iNow];src='Modell';}
    const tw=wetBulb(T,RH),cl=snClass(tw),prop=ok(tw)&&tw<=S.snProp,lan=ok(tw)&&tw<=S.snLance,windy=ok(W)&&W>=S.snWind;
    let next='';if(!prop){for(let i=iNow+1;i<Math.min(AX.length,iNow+72);i++){if(ok(lv.TW[i])&&lv.TW[i]<=S.snProp){next=`Nächste schneibare Stunde: ${relDay(AX[i])} ${fTime(AX[i])} Uhr`;break;}}if(!next)next='In den nächsten 3 Tagen keine schneibare Stunde';}
    return `<div class="card snc" style="--c:var(--sn${cl})"><div class="lv">${lv.label} ${f0(lv.elev)} m · ${src}</div><div class="tw">${fT(tw)}<small>Feuchttemp.</small></div><div class="meta">Luft ${fT(T)} · Feuchte ${f0(RH)} % · Wind ${f0(W)} km/h</div>
      <div class="snchips"><span class="chip ${prop?'yes':'no'}">Propeller ${prop?'ja':'nein'}</span><span class="chip ${lan?'yes':'no'}">Lanze ${lan?'ja':'nein'}</span>${windy?'<span class="chip att">windig</span>':''}</div>${next?`<div class="meta" style="margin-top:8px">${next}</div>`:''}</div>`;}).join('');
}
function renderSnStrip(L){
  const host=$('snStrip'),W=Math.max(300,Math.floor(host.clientWidth||640)),narrow=W<560,padL=narrow?44:96,padR=6,rowH=narrow?22:28,gap=5,top=20;
  const i0=iNow,i1=Math.min(AX.length-1,iNow+168),n=i1-i0+1,cw=(W-padL-padR)/n,H=top+L.length*(rowH+gap);
  let s=`<svg class="tc" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="Schneifenster der nächsten 7 Tage">`;
  L.forEach((lv,r)=>{const y=top+r*(rowH+gap);
    s+=`<text x="${padL-8}" y="${(y+rowH/2+4).toFixed(1)}" text-anchor="end" class="pt" style="font-size:12px">${lv.label}${narrow?'':' '+f0(lv.elev)}</text>`;
    for(let i=i0;i<=i1;i++){const cl=snClass(lv.TW[i]),x=padL+(i-i0)*cw;s+=`<rect x="${x.toFixed(2)}" y="${y}" width="${(cw+0.6).toFixed(2)}" height="${rowH}" fill="var(--sn${cl})"/>`;}});
  for(let i=i0;i<=i1;i++){const p=lp(AX[i]),x=padL+(i-i0)*cw;
    if(p.h===0)s+=`<line x1="${x.toFixed(1)}" x2="${x.toFixed(1)}" y1="${top-3}" y2="${H}" stroke="var(--surface)" stroke-width="2"/>`;
    if(p.h===12)s+=`<text x="${x.toFixed(1)}" y="12" text-anchor="middle">${narrow?p.wd:p.wd+' '+pad(p.d)+'.'}</text>`;}
  s+=`<line class="xh-l" x1="0" x2="0" y1="${top-3}" y2="${H}" style="display:none"/><rect class="ov" x="${padL}" y="${top}" width="${W-padL-padR}" height="${H-top}" fill="transparent"/></svg>`;
  host.innerHTML=s;
  const svg=host.querySelector('svg'),xh=svg.querySelector('.xh-l'),ov=svg.querySelector('.ov');
  const mv=ev=>{const r=svg.getBoundingClientRect(),sx=(ev.clientX-r.left)*(W/r.width),i=i0+Math.floor((sx-padL)/cw);if(i<i0||i>i1){hideTip();return;}
    const x=padL+(i-i0+0.5)*cw;xh.setAttribute('x1',x);xh.setAttribute('x2',x);xh.style.display='';
    showTip(`<b>${fDay(AX[i])} ${fTime(AX[i])}</b>`+L.map(lv=>{const cl=snClass(lv.TW[i]);return tr(`${lv.label}: ${SN_CLS[cl]}`,`${fT(lv.TW[i])} · Luft ${fT0(lv.T[i])}`);}).join('')+tr('Wind Berg / Tal',`${f0(L[0].W[i])} / ${f0(L[2].W[i])} km/h`),ev.clientX,ev.clientY);};
  ov.addEventListener('pointermove',mv);ov.addEventListener('pointerdown',mv);ov.addEventListener('pointerleave',()=>{xh.style.display='none';hideTip();});
  const sw=c=>`<span class="sw" style="background:var(--${c})"></span>`;
  const fm=v=>(v<0?'−':'')+NF1.format(Math.abs(v));
  $('snLegend').innerHTML=`<span>${sw('sn0')}zu warm (über ${fm(S.snProp)} °C)</span><span>${sw('sn1')}Grenzbereich, nur Propeller</span><span>${sw('sn2')}gut, auch Lanze (ab ${fm(S.snLance)} °C)</span><span>${sw('sn3')}sehr gut (ab −5 °C)</span><span>${sw('sn4')}optimal (ab −8 °C)</span><span>Mitte = zwischen Tal und Berg interpoliert</span>`;
}
// Temperatur (Tal/Mitte/Berg), Niederschlag/Neuschnee und Wind – Aufbau wie das GeoSphere-Pistenwetter
let swRange=5,swMode='luft';
function renderSnWx(L){
  const host=$('snWx'),redraw=()=>safe(()=>renderSnWx(snLevels()));
  const segR=$('swRange');if(!segR.childElementCount){segR.innerHTML=[3,5,7].map(n=>`<button type="button" data-n="${n}">${n} Tage</button>`).join('');segR.querySelectorAll('button').forEach(b=>b.addEventListener('click',()=>{swRange=+b.dataset.n;redraw();}));}
  segR.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',+b.dataset.n===swRange));
  const segM=$('swMode');if(!segM.childElementCount){segM.innerHTML=[['luft','Lufttemperatur'],['feucht','Feuchttemperatur']].map(([k,t])=>`<button type="button" data-m="${k}">${t}</button>`).join('');segM.querySelectorAll('button').forEach(b=>b.addEventListener('click',()=>{swMode=b.dataset.m;redraw();}));}
  segM.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',b.dataset.m===swMode));
  const narrow=(host.clientWidth||640)<560,hrs=narrow?6:3,wet=swMode==='feucht',key=wet?'TW':'T',[B,M,T]=L;
  const t0=NOW-12*3600,t1=Math.min(AX[AX.length-1],NOW+swRange*86400),i0=Math.max(0,idxNear(t0)||0),i1=idxNear(t1)||AX.length-1;
  let [tl,th]=range([T[key],M[key],B[key]],i0,i1,.08,8);
  if(wet){tl=Math.min(tl,S.snProp-1);th=Math.max(th,S.snProp+1);}
  // Summen je 3 h (schmal: 6 h), Wert steht am Blockende wie bei Open-Meteo
  const blk=a=>{const out=new Array(AX.length).fill(null);for(let i=i0;i<=Math.min(AX.length-1,i1+hrs);i++){if(lp(AX[i]).h%hrs)continue;let sm=0,c=0;for(let j=i-hrs+1;j<=i;j++)if(j>=0&&ok(a[j])){sm+=a[j];c++;}out[i]=c?sm:null;}return out;};
  const PB=blk(K.P),SB=blk(K.SN),PT=blk(KT.P),ST=blk(KT.SN),bEnd=i=>{for(let k=i;k<Math.min(AX.length,i+hrs);k++)if(!(lp(AX[k]).h%hrs))return k;return i;};
  const pMax=Math.max(2,range([PB,SB],i0,i1,0)[1]*1.15),pAx={min:0,max:pMax,fmt:pMax<5?f1:f0};
  const gMax=Math.max(S.snWind*1.6,range([K.G,K.W,KT.W],i0,i1,0)[1]*1.3); // Luft nach oben für die Richtungspfeile
  const fm=v=>(v<0?'−':'')+NF1.format(Math.abs(v)),fH=v=>f0(Math.round(v/100)*100);
  const pxH=((host.clientWidth||640)-(narrow?70:90))/((t1-t0)/3600),vStep=[3,6,12,24].find(st=>st*pxH>=38)||24;
  timeChart(host,{label:'Temperatur, Niederschlag und Wind',t0,t1,now:NOW,idx:idxNear,panels:[
    {title:`Niederschlag mm · Neuschnee cm · je ${hrs} h, Berg`,h:90,y:pAx,y2:pAx,layers:[{type:'bars',v:PB,cls:'r-rain',hrs,off:.08,wf:.42},{type:'bars',v:SB,cls:'r-snow',hrs,off:.5,wf:.42}]},
    {title:wet?'Feuchttemperatur °C':'Lufttemperatur °C',h:170,y:{min:tl,max:th,fmt:f0},refs:[{y:0,cls:'ref',label:'0 °C'}].concat(wet?[{y:S.snProp,cls:'ref-thr',label:`Start Propeller ${fm(S.snProp)} °C`}]:[]),layers:[{type:'line',v:T[key],cls:'l-lv1'},{type:'line',v:M[key],cls:'l-lv2'},{type:'line',v:B[key],cls:'l-lv3'}]},
    {title:'Frostgrenze m',h:20,y:{min:0,max:1,ticks:[]},layers:[{type:'vals',v:K.FZL,every:vStep,fmt:fH}]},
    {title:'Schneefallgrenze m',h:20,y:{min:0,max:1,ticks:[]},layers:[{type:'vals',v:K.SL,every:vStep,fmt:fH}]},
    {title:'Wind km/h',h:115,y:{min:0,max:gMax,fmt:f0},refs:[{y:S.snWind,cls:'ref-thr',label:`Wind-Hinweis ${f0(S.snWind)} km/h`}].concat(gMax>=90?[{y:60,cls:'ref',label:'Sturm 60 km/h'}]:[]),layers:[{type:'line',v:KT.W,cls:'l-wt'},{type:'line',v:K.G,cls:'l-g'},{type:'line',v:K.W,cls:'l-w'},{type:'arrows',dir:K.D10||[],every:narrow?(swRange>3?12:6):(swRange>5?6:3)}]}
  ],tip:i=>{const j=bEnd(i);return `<b>${fDay(AX[i])} ${fTime(AX[i])}</b>`
    +[T,M,B].map(lv=>tr(`${lv.label} ${f0(lv.elev)} m`,`${fT(lv.T[i])} · feucht ${fT(lv.TW[i])}`)).join('')
    +tr(`Niederschlag ${hrs} h bis ${fTime(AX[j])}`,`Berg ${f1(PB[j])} · Tal ${f1(PT[j])} mm`)
    +tr(`Neuschnee ${hrs} h bis ${fTime(AX[j])}`,`Berg ${fCm(SB[j])} · Tal ${fCm(ST[j])} cm`)
    +tr('Frostgrenze (0 °C)',fM(K.FZL[i]))+tr('Schneefallgrenze',fM(K.SL[i]))
    +tr('Wind Berg',`${K.D10&&ok(K.D10[i])?dirName(K.D10[i])+' ':''}${f0(K.W[i])} km/h · Böen ${f0(K.G[i])}`)
    +tr('Wind Tal',`${f0(KT.W[i])} km/h`);}});
  $('snWxLegend').innerHTML=`<span><span class="sw" style="background:var(--rain)"></span>Niederschlag</span><span><span class="sw" style="background:var(--snow)"></span>Neuschnee</span>`
    +`<span><i style="color:var(--warm)"></i>Tal ${f0(T.elev)} m</span><span><i style="color:var(--rain)"></i>Mitte ${f0(M.elev)} m (interpoliert)</span><span><i style="color:var(--snow)"></i>Berg ${f0(B.elev)} m</span>`
    +(wet?`<span><i style="color:var(--accent);border-top-style:dashed"></i>Start Propeller (Grenzwert unten)</span>`:'')
    +`<span><i style="color:var(--wind)"></i>Wind Berg · Böen strichliert</span><span><i style="color:var(--wind);opacity:.5"></i>Wind Tal</span><span>Pfeile: Windrichtung Berg</span>`;
}
function renderSnNights(L,Wn){
  const box=$('snNights');if(!Wn.length){box.innerHTML='<div class="empty">Keine Prognosedaten.</div>';return;}
  const best=Math.max(0,...Wn.flatMap(w=>w.res.map(r=>r.m3)));
  let h=`<table><thead><tr><th>Fenster</th>${L.map(lv=>`<th style="text-align:left">${lv.label} ${f0(lv.elev)} m</th>`).join('')}</tr></thead><tbody>`;
  for(const w of Wn){const pa=lp(AX[w.a]),pb=lp(AX[w.b]);
    h+=`<tr><td class="m">${snWinLabel(w)}<small>${pad(pa.d)}.${pad(pa.m)}. 12 Uhr – ${pad(pb.d)}.${pad(pb.m)}. 12 Uhr</small></td>`+w.res.map(r=>{
      if(!r.h)return `<td class="none">–<small>tiefste ${fT(r.mn)}</small></td>`;
      return `<td class="${best>0&&r.m3>=best*0.999?'best':''}"><span class="hrs">${r.h} h</span> ab ${fTime(AX[r.first])} Uhr<small>davon Lanze ${r.hl} h · tiefste ${fT(r.mn)}</small><small>≈ ${f0(Math.round(r.m3/10)*10)} m³ Schnee je Propellermaschine</small>${r.windy?`<small style="color:var(--warn)">${r.windy} h windig (ab ${f0(S.snWind)} km/h)</small>`:''}</td>`;}).join('')+'</tr>';}
  box.innerHTML=h+'</tbody></table>';
}
function renderSnCalc(){
  const T=parseFloat($('cT').value),RH=parseFloat($('cRH').value),out=$('cOut');
  if(!ok(T)||!ok(RH)){out.innerHTML='<div class="muted">Werte eingeben.</div>';return;}
  const tw=wetBulb(T,clamp(RH,5,100)),cl=snClass(tw),prop=tw<=S.snProp,lan=tw<=S.snLance;
  out.innerHTML=`<div class="big">${fT(tw)}</div><div class="muted" style="font-size:13px">Feuchttemperatur · Stufe: ${SN_CLS[cl]} · Richtwert ${f0(snRate(tw))} m³ Schnee/h je Propellermaschine</div><div class="snchips"><span class="chip ${prop?'yes':'no'}">Propeller ${prop?'ja':'nein'}</span><span class="chip ${lan?'yes':'no'}">Lanze ${lan?'ja':'nein'}</span></div>`;
}
function initSnForm(){
  const map2={snProp:'snProp',snLance:'snLance',snWind:'snWind'};
  for(const id in map2){const el=$(id);el.value=S[map2[id]];el.addEventListener('change',()=>{const v=parseFloat(el.value);if(!ok(v))return;S[map2[id]]=v;snChanged();});}
  ['cT','cRH'].forEach(id=>$(id).addEventListener('input',()=>safe(renderSnCalc)));
}
function snChanged(){store.set('swx.settings',S);safe(renderSnow);if(K){EVENTS=detectEvents();safe(renderAval);safe(renderAlerts);}}

/* ======================= Karten ======================= */
let map=null,radarLayers=[],radarFrames=[],radarIdx=0,radarTimer=null,radarPlaying=!matchMedia('(prefers-reduced-motion: reduce)').matches;
// Leaflet kommt in der Einzeldatei per <script> im Kopf, im Einbau erst beim Öffnen von „Karten & Radar“ (CFG.loadLeaflet)
function initMap(){
  if(map)return;
  const noLib=()=>{$('radar').innerHTML='<div class="empty">Kartenbibliothek nicht geladen.</div>';};
  if(!window.L&&CFG.loadLeaflet){if(!initMap.p)initMap.p=CFG.loadLeaflet();initMap.p.then(()=>{if(window.L)initMap();else noLib();});return;}
  if(!window.L){noLib();return;}
  map=L.map($('radar'),{scrollWheelZoom:false,attributionControl:true}).setView([47.36,13.42],7);
  L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',{subdomains:'abc',maxZoom:15,className:'basetiles',attribution:'© OpenStreetMap-Mitwirkende, SRTM | OpenTopoMap (CC-BY-SA)'}).addTo(map);
  [[S.bergLat,S.bergLon,'Berg'],[S.talLat,S.talLon,'Tal']].forEach(([a,b,n])=>L.circleMarker([a,b],{radius:5,color:'#fff',weight:2,fillColor:'#E2560F',fillOpacity:1}).bindTooltip(n).addTo(map));
  loadRadar();
}
async function loadRadar(){
  const j=await getJSON('https://api.rainviewer.com/public/weather-maps.json','radar','RainViewer · Radar');
  if(!j||!j.radar||!map){renderStatus();return;}
  radarLayers.forEach(l=>map.removeLayer(l));radarLayers=[];
  radarFrames=(j.radar.past||[]).slice(-12);
  radarLayers=radarFrames.map(f=>L.tileLayer(`${j.host}${f.path}/256/{z}/{x}/{y}/2/1_1.png`,{opacity:0,maxNativeZoom:7,maxZoom:15,zIndex:5,attribution:'Radar: RainViewer'}).addTo(map));
  radarIdx=radarFrames.length-1;showFrame(radarIdx);if(radarPlaying)playRadar();
}
function showFrame(i){radarLayers.forEach((l,k)=>l.setOpacity(k===i?.75:0));const f=radarFrames[i];if(f)$('radarTime').textContent=`${fDay(f.time)} ${fTime(f.time)} Uhr`;}
function playRadar(){clearInterval(radarTimer);radarTimer=setInterval(()=>{if(!radarLayers.length)return;radarIdx=(radarIdx+1)%radarLayers.length;showFrame(radarIdx);},radarIdx===radarLayers.length-1?900:600);$('radarPlay').textContent='Pause';}
$('radarPlay').addEventListener('click',()=>{radarPlaying=!radarPlaying;if(radarPlaying)playRadar();else{clearInterval(radarTimer);$('radarPlay').textContent='Abspielen';}});
const WOV=[['snowAccu','Neuschnee'],['snowcover','Schneehöhe'],['rain','Niederschlag'],['temp','Temperatur'],['wind','Wind'],['clouds','Wolken']],WMOD=[['ecmwf','ECMWF'],['iconEu','ICON-EU'],['gfs','GFS']];
let wOv='snowAccu',wMod='ecmwf';
function renderWindy(){
  const mk=(id,list,cur,set)=>{const el=$(id);el.innerHTML=list.map(([k,l])=>`<button type="button" data-k="${k}" aria-pressed="${k===cur}">${l}</button>`).join('');el.querySelectorAll('button').forEach(b=>b.addEventListener('click',()=>{set(b.dataset.k);renderWindy();}));};
  mk('windyOv',WOV,wOv,k=>wOv=k);mk('windyMod',WMOD,wMod,k=>wMod=k);
  const lat=(+S.bergLat).toFixed(3),lon=(+S.bergLon).toFixed(3);
  const src=`https://embed.windy.com/embed2.html?lat=${lat}&lon=${lon}&detailLat=${lat}&detailLon=${lon}&width=650&height=450&zoom=8&level=surface&overlay=${wOv}&product=${wMod}&menu=&message=true&marker=true&calendar=now&pressure=&type=map&location=coordinates&detail=&metricWind=km%2Fh&metricTemp=%C2%B0C&radarRange=-1`;
  const f=$('windy');if(isOpen('karten')&&f.getAttribute('src')!==src)f.setAttribute('src',src);
}

/* ======================= Ablauf ======================= */
function renderForecast(){[renderMeter,renderFc,renderCalendar,renderAlerts,renderNow,renderMeteogram,renderEnsemble,renderModelTable,renderSummaries,renderSnow].forEach(safe);}
async function loadAll(){
  if(loading)return;loading=true;setStamp();STATUS.clear();
  const pTw=loadTawes().then(r=>{TAWES=r;safe(renderStations);});
  const pSe=loadSeas().then(j=>{SEAS=j;safe(renderSeas);safe(renderSeasonSum);});
  const pSg=loadSnowgrid().then(d=>{SG=d;safe(renderSeason);safe(renderSeasonSum);});
  const pLa=loadLawine().then(j=>{LAW=j;});
  const[det,tal,es,el,ar,cl,inc,oms]=await Promise.all([loadDet(),loadTal(),loadEnsS(),loadEnsL(),loadArome(),loadClaef(),loadInca(),loadOmStatus()]);
  FORCE=false;applyOmStatus(oms);
  if(!det||!det.hourly){
    loading=false;lastLoad=Date.now();setStamp();renderStatus();
    const s=STATUS.get('om-det');$('verdict').textContent='Prognosedaten nicht erreichbar';
    $('verdictSub').innerHTML=`Die Modelldaten sind gerade nicht erreichbar${s&&s.info?` (${esc(s.info)})`:''}. In ein paar Minuten erneut versuchen.`;
    await Promise.allSettled([pTw,pSe,pSg,pLa]);safe(renderAval);renderStatus();return;}
  try{buildAll({det,tal,es,el,ar,cl,inc});}catch(e){console.error(e);$('verdict').textContent='Fehler bei der Berechnung';$('verdictSub').textContent=String(e.message||e);}
  if(ar&&ar.reference_time){const t=toSec(ar.reference_time),d=new Date(t*1000);SERIES._gsRef=`${pad(d.getUTCDate())}.${pad(d.getUTCMonth()+1)}. ${pad(d.getUTCHours())} UTC`;}
  if(cl&&cl.reference_time){const t=toSec(cl.reference_time),d=new Date(t*1000);SERIES._clRef=`${pad(d.getUTCDate())}.${pad(d.getUTCMonth()+1)}. ${pad(d.getUTCHours())} UTC`;}
  renderForecast();
  loading=false;lastLoad=Date.now();setStamp();renderStatus();
  await Promise.allSettled([pSg,pLa]);
  safe(renderMeter);safe(renderNow);safe(renderAval);safe(renderAlerts);
  await pTw;await pSe;renderStatus();setStamp();
}

/* Theme */
const THEMES=['auto','light','dark'],THEME_LBL={auto:'Auto',light:'Hell',dark:'Dunkel'};
// Als Einzeldatei automatisch hell/dunkel, auf der Homepage startet sie hell wie die Seite (Umschalter bleibt)
let theme=store.get('swx.theme',HOST===document.documentElement?'auto':'light');
function applyTheme(){if(theme==='auto')HOST.removeAttribute('data-theme');else HOST.setAttribute('data-theme',theme);$('btnTheme').textContent=THEME_LBL[theme];}
$('btnTheme').addEventListener('click',()=>{theme=THEMES[(THEMES.indexOf(theme)+1)%3];store.set('swx.theme',theme);applyTheme();});
applyTheme();

/* Einstellungen */
const F={fThr:'thr'};
const NF4=new Intl.NumberFormat('de-DE',{minimumFractionDigits:3,maximumFractionDigits:4});
function fillForm(src){for(const[id,k]of Object.entries(F))$(id).value=src[k];
  $('fLoc').textContent=`Berg ${f0(S.bergElev)} m (${NF4.format(S.bergLat)} N, ${NF4.format(S.bergLon)} O) · Tal Flachauwinkl ${f0(S.talElev)} m (${NF4.format(S.talLat)} N, ${NF4.format(S.talLon)} O). Fest eingestellt, weil die Modelldaten stündlich vorab für diese Punkte gerechnet werden.`;}
$('btnSettings').addEventListener('click',()=>{fillForm(S);$('dlg').showModal();});
$('setReset').addEventListener('click',()=>fillForm(DEFAULTS));
$('dlg').addEventListener('close',()=>{if($('dlg').returnValue!=='save')return;const v=$('fThr').value;
  S.thr=clamp(Math.round(v===''||!isFinite(+v)?DEFAULTS.thr:+v),3,80);store.set('swx.settings',S);loadAll();});

/* Navigation-Hervorhebung */
const navLinks=[...ROOT.querySelectorAll('.subnav a')];
const io=new IntersectionObserver(es=>{es.forEach(e=>{if(e.isIntersecting){navLinks.forEach(a=>a.classList.toggle('on',a.getAttribute('href')==='#'+e.target.id));}});},{rootMargin:'-45% 0px -50% 0px'});
ROOT.querySelectorAll('section[id]').forEach(s=>io.observe(s));
$('sgLevel').querySelectorAll('button').forEach(b=>b.addEventListener('click',()=>{sgLevel=b.dataset.l;$('sgLevel').querySelectorAll('button').forEach(x=>x.setAttribute('aria-pressed',x===b));safe(renderSeason);}));

/* Größe & Auto-Refresh */
let lastW=innerWidth,rt=null;
addEventListener('resize',()=>{if(Math.abs(innerWidth-lastW)<8)return;lastW=innerWidth;clearTimeout(rt);rt=setTimeout(()=>{if(K){safe(renderFc);safe(renderMeteogram);safe(renderEnsemble);safe(renderSnow);}if(SG)safe(renderSeason);},180);});
$('btnRefresh').addEventListener('click',()=>{if(loading)return;FORCE=true;loadAll();if(map)loadRadar();});
setInterval(()=>{if(document.visibilityState==='visible'&&!loading&&Date.now()-lastLoad>REFRESH_MIN*60000){loadAll();if(map)loadRadar();}},60000);
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'&&!loading&&lastLoad&&Date.now()-lastLoad>REFRESH_MIN*60000){loadAll();if(map)loadRadar();}});

/* ======================= Aufklappbereiche ======================= */
const FOLDS=['meteogramm','ensemble','messwerte','saison','karten','profi','methodik'];
let openSet=new Set((store.get('swx.open',[])||[]).filter(id=>FOLDS.includes(id)));
function onOpen(id){
  if(id==='meteogramm')safe(renderMeteogram);else if(id==='ensemble')safe(renderEnsemble);else if(id==='saison')safe(renderSeason);
  else if(id==='karten'){renderWindy();if(!map){try{initMap();}catch(e){console.error(e);}}else setTimeout(()=>map.invalidateSize(),60);}
}
function setFold(id,open,persist){const sec=$(id);if(!sec)return;
  if(open)openSet.add(id);else openSet.delete(id);
  sec.querySelector('.fold-b').hidden=!open;sec.querySelector('.fold-btn').setAttribute('aria-expanded',String(open));
  sec.querySelector('.fold-i').textContent=open?'Schließen':'Öffnen';sec.classList.toggle('open',open);
  if(persist!==false)store.set('swx.open',[...openSet]);
  if(open)onOpen(id);
  $('foldAll').textContent=FOLDS.every(f=>openSet.has(f))?'Alle schließen':'Alle öffnen';
}
FOLDS.forEach(id=>{$(id).querySelector('.fold-btn').addEventListener('click',()=>setFold(id,!isOpen(id)));setFold(id,isOpen(id),false);});
$('foldAll').addEventListener('click',()=>{const all=FOLDS.every(isOpen);FOLDS.forEach(id=>setFold(id,!all));});
// Sprunglinks per Skript: im Einbau (Shadow DOM) findet der Browser die Ziele nicht selbst, und die Adresse der Homepage bleibt unverändert
const smooth=()=>matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth';
navLinks.forEach(a=>a.addEventListener('click',e=>{const id=a.getAttribute('href').slice(1),el=$(id);if(!el)return;e.preventDefault();
  if(FOLDS.includes(id)&&!isOpen(id))setFold(id,true);
  el.scrollIntoView({behavior:smooth(),block:'start'});
  if(HOST===document.documentElement)history.replaceState(null,'','#'+id);}));
if(/^#[a-z]+$/.test(location.hash)){const id=location.hash.slice(1),el=$(id);
  if(el&&FOLDS.includes(id))setFold(id,true);
  if(el&&el.tagName==='SECTION'&&HOST!==document.documentElement)setTimeout(()=>el.scrollIntoView({block:'start'}),400);}
initSnForm();
$('meterMore').addEventListener('click',()=>{meterMore=!meterMore;store.set('swx.meterMore',meterMore);safe(renderMeter);});

updateEyebrow();renderWindy();
loadAll();
ROOT.querySelector('#methodik details:nth-of-type(2) .prose').innerHTML=ROOT.querySelector('#methodik details:nth-of-type(2) .prose').innerHTML.replace('{BERG}',f0(S.bergElev));
})();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
