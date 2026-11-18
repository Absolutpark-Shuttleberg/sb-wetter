/* Wetterwarte Light · Shuttleberg / AbsolutPark
   Öffentliche Kurzfassung: Jetzt am Berg, Schneebericht, Vorhersage 3/5/7 Tage, Lawinenlage.
   Einbau (XMS-HTML-Block):
     <div id="sb-wetter"></div>
     <script src="https://HOST/wetter-light.js" defer></script>
   Optional am div:
     data-theme="ap"   Design der AbsolutPark-Homepage (ohne Angabe: Shuttleberg)
     data-lang="en"    Sprache de/en (ohne Angabe: Sprache der Seite aus <html lang>, sonst Deutsch)
     data-days="5"     Startansicht 3/5/7 Tage
     data-src="https://HOST/public.json"
   Schriften: nutzt die Schriften der jeweiligen Homepage (SB: Josefin Sans · AP: PT Sans + AP21). */
(function () {
  'use strict';
  const SCRIPT = document.currentScript;
  const BASE = SCRIPT && SCRIPT.src ? new URL('.', SCRIPT.src).href : location.href;
  const TZ = 'Europe/Vienna';
  const REFRESH_MS = 15 * 60 * 1000;
  // Geländeschnitt Kleinarl – Grat – Flachauwinkl (Copernicus-DEM), km / m – aus der Wetterwarte
  const PROFILE = [[0,1003],[0.13,1004],[0.26,1010],[0.39,1089],[0.52,1126],[0.65,1159],[0.78,1183],[0.91,1260],[1.04,1305],[1.17,1332],[1.3,1391],[1.43,1428],[1.56,1452],[1.69,1479],[1.82,1552],[1.95,1620],[2.08,1672],[2.21,1703],[2.34,1708],[2.47,1721],[2.6,1743],[2.73,1779],[2.86,1817],[2.99,1881],[3.12,1833],[3.25,1802],[3.38,1783],[3.51,1762],[3.64,1736],[3.77,1714],[3.9,1708],[4.03,1683],[4.16,1675],[4.29,1659],[4.42,1643],[4.55,1638],[4.68,1616],[4.81,1585],[4.94,1589],[5.07,1571],[5.2,1511],[5.33,1473],[5.46,1440],[5.59,1401],[5.72,1345],[5.85,1283],[5.98,1239],[6.1,1180],[6.23,1148],[6.36,1106],[6.49,1069],[6.62,1039],[6.75,1031],[6.88,1015],[7.01,1018]];

  /* ---------- Marken: Untertitel und Links je Sprache ---------- */
  const BRANDS = {
    sb: {
      sub: 'Shuttleberg Flachauwinkl – Kleinarl',
      links: {
        de: [['Geöffnete Pisten & Lifte', 'https://www.shuttleberg.com/de/info-service/geoeffnete-pisten-lifte/'], ['Webcams', 'https://www.shuttleberg.com/de/info-service/webcams/']],
        en: [['Open slopes & lifts', 'https://www.shuttleberg.com/en/info-service/open-slopes-lifts/'], ['Webcams', 'https://www.shuttleberg.com/en/info-service/webcams/']]
      }
    },
    ap: {
      sub: 'AbsolutPark · Flachauwinkl',
      links: {
        de: [['Snowpark-Status', 'https://www.absolutpark.com/de/park/snowpark-status/'], ['Lifte & Pisten', 'https://www.absolutpark.com/de/park/geoeffnete-lifte-pisten/'], ['Webcams', 'https://www.absolutpark.com/de/park/webcams/']],
        en: [['Snowpark status', 'https://www.absolutpark.com/en/park/snowpark-status/'], ['Lifts & slopes', 'https://www.absolutpark.com/en/park/open-slopes-lifts/'], ['Webcams', 'https://www.absolutpark.com/en/park/webcams/']]
      }
    }
  };

  /* ---------- Texte ---------- */
  const STR = {
    de: {
      title: 'Wetter & Schnee', updated: 'Aktualisiert', dataFrom: 'Daten von', oclock: ' Uhr', loading: 'Wetter wird geladen',
      nowMtn: 'Jetzt am Berg', todayCond: t => `Heute ${t}`, mtn: 'Berg', valley: 'Tal', mtnShort: 'Berg', inValley: 'Im Tal', windMtn: 'Wind Berg', snowLine: 'Schneefall&shy;grenze',
      report: 'Schneebericht', depthMtn: 'Schneehöhe Berg', depthValley: 'Schneehöhe Tal', newSnow: 'Neuschnee', newSnow24: 'Neuschnee 24&nbsp;h',
      perReport: 'laut Schneebericht', onMtn: 'am Berg', lastSnow: 'Letzter Schneefall', inRegion: 'in der Region', asOf: 'Stand', snowCond: 'Schnee',
      noReport: 'Aktuell liegt kein offizieller Schneebericht vor.',
      snowSight: 'Neuschnee in Sicht', powder: 'Powder-Alarm', amount: (w, n) => `${w}: rund ${n} cm`, total7: n => `In den nächsten 7 Tagen insgesamt rund ${n} cm.`,
      fullDay: 'Am Berg, Prognose für den ganzen Tag.', outlook: 'Schneeausblick', noBig: 'Kein größerer Neuschnee in Sicht',
      flakes: n => `Nur ein paar Flocken, in 7 Tagen zusammen rund ${n} cm.`, dry: 'Die nächsten Tage bleibt es weitgehend trocken.',
      forecast: 'Vorhersage', period: 'Zeitraum', days: k => `${k} Tage`, noSnow: 'kein Neuschnee', snowFrom: 'Schnee ab',
      parts: ['Vorm.', 'Nachm.', 'Nacht'], partsLong: ['Vormittag', 'Nachmittag', 'Nacht'], compass: ['N', 'NO', 'O', 'SO', 'S', 'SW', 'W', 'NW'],
      slTitle: 'Schneefallgrenze', windTitle: 'Wind am Berg, Mittel tagsüber', gust: 'Böen', powderShort: 'Powder',
      legend: thr => [`Schneefallgrenze`, `Wind am Berg (Richtung, Mittel tagsüber)`, `Powder: Chance auf mind. ${thr} cm Pulverschnee bis Liftstart`],
      aval: 'Lawinenlage', avalCta: 'Ganzer Lawinenlagebericht', avalScope: 'Der Lagebericht gilt für das freie Gelände abseits gesicherter Pisten.',
      avalErr: 'Der Lawinenwarndienst ist gerade nicht erreichbar.',
      avalNone: 'Derzeit gibt es keinen täglichen Lagebericht für unsere Region. Sobald der Lawinenwarndienst Salzburg startet, steht hier die Zusammenfassung.',
      level: m => `Gefahrenstufe ${m} von 5`, validTo: 'Gültig bis', lwd: 'Lawinenwarndienst Salzburg', example: 'Beispiel vom', allElev: 'alle Höhenlagen',
      region: 'Niedere Tauern Nord', data: 'Daten', noWarranty: 'Prognosen ohne Gewähr',
      err: 'Die Wetterdaten sind gerade nicht erreichbar. Bitte später nochmal probieren.', avalShort: 'Lawinenlagebericht',
      rel: ['heute', 'morgen', 'übermorgen'], past: ['heute', 'gestern']
    },
    en: {
      title: 'Weather & Snow', updated: 'Updated', dataFrom: 'Data from', oclock: '', loading: 'Loading weather',
      nowMtn: 'On the mountain now', todayCond: t => `Today: ${t}`, mtn: 'Mountain', valley: 'Valley', mtnShort: 'Mtn', inValley: 'Valley', windMtn: 'Mountain wind', snowLine: 'Snow line',
      report: 'Snow report', depthMtn: 'Snow depth mountain', depthValley: 'Snow depth valley', newSnow: 'New snow', newSnow24: 'New snow 24&nbsp;h',
      perReport: 'per snow report', onMtn: 'on the mountain', lastSnow: 'Last snowfall', inRegion: 'in the region', asOf: 'Updated', snowCond: 'Snow',
      noReport: 'No official snow report available at the moment.',
      snowSight: 'Fresh snow incoming', powder: 'Powder alert', amount: (w, n) => `${w}: approx. ${n} cm`, total7: n => `Around ${n} cm in total over the next 7 days.`,
      fullDay: 'On the mountain, full-day forecast.', outlook: 'Snow outlook', noBig: 'No major snowfall in sight',
      flakes: n => `Just a few flakes, around ${n} cm over 7 days.`, dry: 'Mostly dry for the next few days.',
      forecast: 'Forecast', period: 'Period', days: k => `${k} days`, noSnow: 'no new snow', snowFrom: 'Snow above',
      parts: ['AM', 'PM', 'Night'], partsLong: ['Morning', 'Afternoon', 'Night'], compass: ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'],
      slTitle: 'Snow line', windTitle: 'Mountain wind, daytime average', gust: 'gusts', powderShort: 'Powder',
      legend: thr => [`Snow line`, `Mountain wind (direction, daytime average)`, `Powder: chance of at least ${thr} cm of fresh powder by lift opening`],
      aval: 'Avalanche danger', avalCta: 'Full avalanche bulletin', avalScope: 'The bulletin applies to open terrain away from secured slopes.',
      avalErr: 'The avalanche warning service is currently unavailable.',
      avalNone: 'There is currently no daily bulletin for our region. As soon as the Salzburg avalanche warning service starts, the summary will appear here.',
      level: m => `Danger level ${m} of 5`, validTo: 'Valid until', lwd: 'Avalanche Warning Service Salzburg', example: 'Example from', allElev: 'all elevations',
      region: 'Niedere Tauern North', data: 'Data', noWarranty: 'Forecasts without guarantee',
      err: 'Weather data is currently unavailable. Please try again later.', avalShort: 'Avalanche bulletin',
      rel: ['today', 'tomorrow', null], past: ['today', 'yesterday']
    }
  };
  // Wettertexte kommen auf Deutsch aus der Wetterwarte; für Englisch über das Symbol übersetzen
  const WX_EN = { sun: 'sunny', moon: 'clear', partly: 'partly cloudy', 'partly-night': 'partly cloudy', cloudy: 'mostly cloudy', overcast: 'overcast', snow: 'snowfall', 'snow-heavy': 'heavy snowfall', rain: 'rain', sleet: 'sleet' };
  // Schneezustand kommt auf Deutsch aus dem Schneebericht; Unbekanntes wird auf Englisch weggelassen
  const COND_EN = [[/pulver/i, 'powder'], [/griffig/i, 'grippy'], [/hart|kompakt|gepresst/i, 'hard-packed'], [/eis/i, 'icy'], [/sulz|firn/i, 'spring snow'],
    [/nass/i, 'wet'], [/feucht/i, 'moist'], [/harsch/i, 'crusty'], [/kunst|technisch/i, 'machine-made']];

  const CSS = `
:host{
  --blue:#0f5aa1;--blue-dk:#083158;--blue-lt:#f0f5fc;--blue-md:#d9e6f5;
  --sky:#1ea1d5;--yellow:#fcc40d;--yellow-hv:#ebb707;
  --ink:#232629;--muted:#5d6872;--line:#dae3ed;--text2:#3a4148;--faint:#9aa6b2;
  --sun:#fcc40d;--moon:#b8c6d6;--cloud:#cfdae6;--cloud-dk:#9cb0c5;--snow:#1ea1d5;--rain:#0f5aa1;
  --chip:#1ea1d5;--chip-fg:#fff;--today:#0f5aa1;--accent-tx:#1ea1d5;--mtn:#b9cde3;--mtn-line:#7f9bb8;
  --hero-bg:linear-gradient(165deg,#1468b4 0%,#0f5aa1 40%,#0a4378 78%,#083158 100%);
  --hero-lab:#8fd3f2;--hero-soft:#cfe3f5;--hero-soft2:#d4e6f6;
  --hero-cloud:#eef4fa;--hero-cloud-dk:#b7cbe0;--hero-snow:#fff;--hero-rain:#a9dcf5;--hero-moon:#e3ebf4;
  --out-fg:#083158;--out-t3:#3b3200;--skel2:#e6eef8;
  --font:'Josefin Sans',Helvetica,Arial,sans-serif;
  --title-font:var(--font);--title-color:var(--blue);--title-tt:uppercase;--title-ls:.01em;--sub-color:var(--sky);
  display:block;container-type:inline-size;font-family:var(--font);color:var(--ink);line-height:1.45;font-size:16px;
  -webkit-font-smoothing:antialiased;
}
/* AbsolutPark: Braun #4b310e, Gold #f1be41, PT Sans, Titel in AP21 (wie die h1 auf absolutpark.com) */
:host([data-theme="ap"]){
  --blue:#4b310e;--blue-dk:#2e1d06;--blue-lt:#f6f2ed;--blue-md:#ebe3d8;
  --sky:#4b310e;--yellow:#f1be41;--yellow-hv:#e6ad24;
  --ink:#4b310e;--muted:#87735c;--line:#e8e3dd;--text2:#5a4425;--faint:#b3a38f;
  --sun:#f1be41;--moon:#cbbfae;--cloud:#e2dbd1;--cloud-dk:#b8aa97;--snow:#17a2b8;--rain:#5d7f96;
  --chip:#f1be41;--chip-fg:#4b310e;--today:#f1be41;--accent-tx:#4b310e;--mtn:#d3c6b4;--mtn-line:#9c8a73;
  --hero-bg:linear-gradient(165deg,#5e3f16 0%,#4b310e 42%,#3a2609 78%,#291a05 100%);
  --hero-lab:#f1be41;--hero-soft:#eadfce;--hero-soft2:#e3d6c3;
  --hero-cloud:#f6f1ea;--hero-cloud-dk:#cdbfab;--hero-snow:#fff;--hero-rain:#d9cbb6;--hero-moon:#ece4d8;
  --out-fg:#4b310e;--out-t3:#5a4012;--skel2:#ede6dd;
  --font:'PT Sans',Helvetica,Arial,sans-serif;
  --title-font:'AP21','PT Sans',Helvetica,Arial,sans-serif;--title-color:#f1be41;--title-tt:none;--title-ls:0;--sub-color:#4b310e;
}
*{box-sizing:border-box}
a{color:var(--blue)}
:focus-visible{outline:3px solid var(--yellow);outline-offset:2px}
.w{display:grid;gap:24px}
.head{text-align:center}
h2{font:700 clamp(28px,4.4cqi,42px)/1.1 var(--title-font);text-transform:var(--title-tt);color:var(--title-color);margin:0;letter-spacing:var(--title-ls)}
.sub{color:var(--sub-color);font-weight:700;font-size:clamp(16px,2.2cqi,20px);margin-top:6px}
.stamp{color:var(--muted);font-size:14px;margin-top:6px}
.stamp.old{color:#9a6a00}
.ptitle{font:700 20px/1.15 var(--font);text-transform:uppercase;color:var(--blue);margin:0;letter-spacing:.03em}

/* Kopfzeile: Jetzt + Schneebericht */
.top{display:grid;gap:20px;grid-template-columns:1fr}
@container (min-width:760px){.top{grid-template-columns:7fr 5fr}}

.hero{position:relative;overflow:hidden;color:#fff;padding:24px 26px 0;min-height:320px;display:flex;flex-direction:column;background:var(--hero-bg);
  --cloud:var(--hero-cloud);--cloud-dk:var(--hero-cloud-dk);--snow:var(--hero-snow);--rain:var(--hero-rain);--moon:var(--hero-moon)}
.hero .lab{font-size:14px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:var(--hero-lab);display:flex;justify-content:space-between;gap:8px;position:relative;z-index:1}
.hero .lab span:last-child{color:var(--hero-soft);font-weight:400;letter-spacing:.04em;text-transform:none}
.hero .main{display:flex;align-items:center;gap:6px 20px;margin-top:14px;flex-wrap:wrap;position:relative;z-index:1}
.hero .temp{font-size:clamp(72px,13cqi,112px);font-weight:700;line-height:.85;letter-spacing:-.02em;padding-top:.08em}
.hero .temp sup{font-size:.42em;vertical-align:top;position:relative;top:.12em;margin-left:2px;font-weight:400}
.hero .ico{width:clamp(76px,12cqi,104px);height:clamp(76px,12cqi,104px);flex:none}
.hero .cond{flex-basis:100%;font-size:clamp(20px,3cqi,26px);font-weight:700;margin-top:6px}
.hero .cond small{display:block;font-size:16px;font-weight:400;color:var(--hero-soft2);margin-top:2px}
.hero .stats{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;margin-top:auto;padding:22px 0 24px;position:relative;z-index:1}
.stat .k{font-size:12px;text-transform:uppercase;letter-spacing:.09em;color:var(--hero-lab);font-weight:700;hyphens:manual}
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
.outlook svg{width:46px;height:46px;flex:none;color:var(--out-fg)}
.outlook .t1{font-size:13px;text-transform:uppercase;letter-spacing:.1em;font-weight:700;color:var(--out-fg)}
.outlook .t2{font-size:clamp(20px,3cqi,26px);font-weight:700;color:var(--out-fg);line-height:1.2;margin-top:2px}
.outlook .t3{font-size:15px;color:var(--out-t3);margin-top:2px}
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
.days{display:grid;grid-template-columns:repeat(var(--n),minmax(132px,1fr));gap:10px}
.day{border:1px solid var(--line);background:#fff;padding:16px 12px 14px;text-align:center;display:flex;flex-direction:column;align-items:center;gap:6px;position:relative}
.day.today{border-color:var(--today);box-shadow:inset 0 4px 0 var(--today)}
.day .wd{font-weight:700;text-transform:uppercase;color:var(--blue);font-size:17px;letter-spacing:.05em}
.day .dt{font-size:14px;color:var(--muted)}
.day .ico{width:64px;height:64px}
.day .tx{font-size:15px;line-height:1.25;min-height:2.5em}
.temps{width:100%;display:grid;gap:5px;border-top:1px solid var(--line);padding-top:10px;margin-top:2px}
.trow{display:flex;justify-content:space-between;align-items:baseline;gap:6px;font-size:12.5px;color:var(--muted);text-transform:uppercase;letter-spacing:.06em;font-weight:700}
.trow b{font-size:19px;color:var(--ink);letter-spacing:0;text-transform:none;white-space:nowrap}
.trow .lo{color:var(--muted);font-weight:400;font-size:15px}
.snowc{display:flex;flex-direction:column;align-items:center;gap:4px;min-height:52px;justify-content:flex-start;margin-top:4px}
.chip{display:inline-flex;align-items:center;gap:6px;background:var(--chip);color:var(--chip-fg);font-weight:700;padding:6px 10px 4px;font-size:15px;white-space:nowrap}
.chip svg{width:14px;height:14px}
.chip.lite{background:var(--blue-md);color:var(--blue-dk)}
.nosnow{color:var(--faint);font-size:14px;padding-top:6px}
.sl{font-size:12.5px;color:var(--muted)}
/* Tagesteile: vormittags, nachmittags, nachts */
.parts{display:grid;grid-template-columns:repeat(3,1fr);width:100%;gap:2px;margin-top:2px}
.pt{display:flex;flex-direction:column;align-items:center;gap:0;min-width:0}
.pt .pi{width:28px;height:28px}
.pt span{font-size:10.5px;color:var(--muted);letter-spacing:0;font-weight:700;line-height:1.2;white-space:nowrap}
/* Schneefallgrenze, Wind, Powder */
.facts{width:100%;display:grid;gap:7px;border-top:1px solid var(--line);padding-top:10px;margin-top:2px}
.f{display:flex;align-items:center;justify-content:space-between;gap:6px;font-size:14px;color:var(--ink);min-width:0}
.f b{font-weight:700;white-space:nowrap}
.f small{display:block;font-size:11.5px;color:var(--muted);font-weight:400;text-align:right}
.f .sli{width:34px;height:22px;flex:none}
.f .wdi{width:22px;height:22px;flex:none}
.fk{font-size:12px;color:var(--muted);text-transform:uppercase;letter-spacing:.06em;font-weight:700}
.pw{display:grid;grid-template-columns:auto auto;justify-content:space-between;row-gap:4px}
.bar{grid-column:1/-1;height:5px;background:var(--blue-lt);position:relative;overflow:hidden}
.bar i{position:absolute;left:0;top:0;bottom:0;background:var(--chip)}
.pw.hi b{color:var(--blue)}
.f.sn{display:none}
.f.wr{min-height:34px}
.legend{display:flex;flex-wrap:wrap;gap:6px 18px;font-size:12.5px;color:var(--muted);margin-top:12px;align-items:center}
.legend span{display:inline-flex;align-items:center;gap:6px}
.legend .sli{width:26px;height:17px}.legend .wdi{width:17px;height:17px}

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
.av-reg{color:var(--accent-tx);font-weight:700}
.rates{list-style:none;margin:0;padding:0;display:grid;gap:8px}
.rates li{display:flex;align-items:center;gap:10px;font-size:16px}
.rates .sq{width:26px;height:26px;background:var(--c);display:grid;place-items:center;font:700 15px/1 var(--font);padding-top:3px;flex:none;color:#111}
.probs{display:flex;flex-wrap:wrap;gap:8px;margin-top:14px}
.probs .chip{background:var(--blue-lt);color:var(--blue-dk);font-size:14px}
.av-hl{font-size:19px;font-weight:700;margin:16px 0 4px;line-height:1.3}
.av-tx{margin:0;color:var(--text2);max-width:68ch}
.av-meta{font-size:13.5px;color:var(--muted);margin-top:12px}
.btn{display:inline-block;background:var(--yellow);color:var(--ink);font:700 15px/1 var(--font);padding:13px 18px 10px;text-decoration:none;text-transform:uppercase;letter-spacing:.05em;margin-top:16px}
.btn:hover{background:var(--yellow-hv)}
.demo{display:inline-block;background:#fff4cc;color:#6b5200;border:1px dashed #d9a800;font-size:12.5px;padding:4px 8px 2px;font-weight:700}
.note{font-size:13.5px;color:var(--muted);margin-top:10px}

.foot{display:flex;flex-wrap:wrap;justify-content:space-between;gap:6px 16px;font-size:13px;color:var(--muted);border-top:1px solid var(--line);padding-top:12px}
.foot a{color:var(--muted);text-decoration:underline;text-underline-offset:2px}
.foot a:hover{color:var(--blue)}
.err{background:var(--blue-lt);padding:24px;text-align:center}
.skel{height:320px;background:linear-gradient(90deg,var(--blue-lt),var(--skel2),var(--blue-lt));background-size:200% 100%;animation:sh 1.4s infinite linear}
@keyframes sh{to{background-position:-200% 0}}
@media (prefers-reduced-motion:reduce){.skel{animation:none}}

/* AbsolutPark: PT Sans sitzt anders auf der Grundlinie als Josefin Sans, Buttons wie auf absolutpark.com (Rahmen statt Fläche) */
:host([data-theme="ap"]) .sub{text-transform:uppercase;letter-spacing:.05em;font-size:clamp(15px,2cqi,18px)}
:host([data-theme="ap"]) .btn{background:#fff;color:var(--blue);border:1px solid var(--blue);padding:11px 18px}
:host([data-theme="ap"]) .btn:hover{background:var(--blue);color:#fff}
:host([data-theme="ap"]) .seg button{padding:9px 14px 8px}
:host([data-theme="ap"]) .chip{padding:5px 10px}
:host([data-theme="ap"]) .tag{padding:4px 8px}
:host([data-theme="ap"]) .demo{padding:3px 8px}
:host([data-theme="ap"]) .lv-box{padding-top:0}
:host([data-theme="ap"]) .rates .sq{padding-top:0}
:host([data-theme="ap"]) .outlook{padding:17px 24px}

/* Schmal: Tage als Liste */
@container (max-width:620px){
  .hero{padding:20px 18px 0;min-height:290px}
  .snow,.aval{padding:20px 18px}
  .outlook{padding:16px 18px 14px;gap:14px}
  .outlook svg{width:38px;height:38px}
  .days{grid-template-columns:1fr;gap:0;border-top:1px solid var(--line)}
  .scroll{overflow:visible}
  .day{display:grid;grid-template-columns:62px 46px minmax(0,1fr) auto;grid-template-areas:"when ico tx temps" "parts parts parts parts" "facts facts facts facts";
    text-align:left;align-items:center;border:0;border-bottom:1px solid var(--line);padding:12px 2px;gap:2px 12px;box-shadow:none}
  .day.today{box-shadow:inset 4px 0 0 var(--today);padding-left:12px;border-color:var(--line)}
  .when{grid-area:when}.day .ico{grid-area:ico;width:46px;height:46px}.tx{grid-area:tx;min-height:0!important}
  .temps{grid-area:temps;border:0;padding:0;margin:0;width:auto;min-width:104px}
  .snowc{display:none}
  .parts{grid-area:parts;display:flex;gap:16px;justify-content:flex-start;margin:4px 0 0}
  .pt{flex-direction:row;gap:4px;flex:none}.pt .pi{width:24px;height:24px;flex:none}.pt span{font-size:11.5px;font-weight:400}
  .facts{grid-area:facts;display:flex;flex-wrap:wrap;align-items:center;gap:6px 16px;border:0;padding:6px 0 0;margin:0}
  .f{justify-content:flex-start;font-size:13.5px}.f small{display:inline;margin-left:4px}.f.wr{min-height:0}
  .f .sli{width:28px;height:18px}.f .wdi{width:18px;height:18px}
  .pw{display:flex;align-items:center;gap:6px}.bar{width:44px;height:5px}
  .f.sn{display:flex}.f.sn .chip{margin:0}
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
  :host([data-theme="ap"]) .chip{padding:4px 8px}
}
`;

  /* ---------- Helfer ---------- */
  const ok = v => v != null && isFinite(v);
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const cap = s => s ? s.charAt(0).toUpperCase() + s.slice(1) : '';
  const dayKey = d => new Intl.DateTimeFormat('en-CA', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit' }).format(d);

  // Sprachabhängige Formate und Texte
  function makeL(lang) {
    const en = lang === 'en', S = STR[en ? 'en' : 'de'], loc = en ? 'en-GB' : 'de-AT';
    const NF = new Intl.NumberFormat(en ? 'en-GB' : 'de-DE');
    const fmt = o => new Intl.DateTimeFormat(loc, Object.assign({ timeZone: TZ }, o));
    const fHM = fmt({ hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });
    const fD = en ? fmt({ weekday: 'short', day: 'numeric', month: 'short' }) : fmt({ weekday: 'short', day: '2-digit', month: '2-digit' });
    const fWD = fmt({ weekday: 'long' }), fFull = fmt({ day: en ? 'numeric' : '2-digit', month: en ? 'short' : '2-digit', year: 'numeric' });
    const kd = k => new Date(k + 'T12:00:00Z');
    const shift = n => dayKey(new Date(Date.now() + n * 864e5));
    return {
      lang: en ? 'en' : 'de', S,
      num: v => ok(v) ? NF.format(Math.round(v)) : '–',
      deg: v => { if (!ok(v)) return '–'; const r = Math.round(v); return (r < 0 ? '−' : '') + Math.abs(r) + '°'; },
      m100: v => ok(v) ? NF.format(Math.round(v / 100) * 100) + ' m' : '–',
      clock: d => fHM.format(d) + S.oclock,
      dmy: d => fD.format(d).replace(',', ''),
      full: d => fFull.format(d),
      wdLong: key => fWD.format(kd(key)),
      // heute / morgen / übermorgen (Englisch ohne „übermorgen“, dann Wochentag)
      rel: key => key === shift(0) ? S.rel[0] : key === shift(1) ? S.rel[1] : key === shift(2) ? S.rel[2] : null,
      ago: key => key === shift(0) ? S.past[0] : key === shift(-1) ? S.past[1] : null,
      wx: (icon, de) => en ? (WX_EN[icon] || '') : (de || ''),
      cond: s => { if (!s || !en) return s || ''; const w = COND_EN.filter(([re]) => re.test(s)).map(x => x[1]); return [...new Set(w)].join(' / '); }
    };
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
  const BIG_FLAKE = '<svg viewBox="0 0 48 48" aria-hidden="true"><g stroke="currentColor" stroke-width="3" stroke-linecap="round" fill="none"><line x1="24" y1="4" x2="24" y2="44"/><line x1="6.7" y1="14" x2="41.3" y2="34"/><line x1="6.7" y1="34" x2="41.3" y2="14"/><path d="M19 8l5 5 5-5M19 40l5-5 5 5M8.5 21l6.8-1.8L13.5 12.4M39.5 27l-6.8 1.8 1.8 6.8M8.5 27l6.8 1.8-1.8 6.8M39.5 21l-6.8-1.8 1.8-6.8"/></g></svg>';
  const SUN_BIG = '<svg viewBox="0 0 48 48" aria-hidden="true"><g stroke="var(--blue)" stroke-width="3" stroke-linecap="round"><line x1="24" y1="3" x2="24" y2="9"/><line x1="24" y1="39" x2="24" y2="45"/><line x1="3" y1="24" x2="9" y2="24"/><line x1="39" y1="24" x2="45" y2="24"/><line x1="9.2" y1="9.2" x2="13.4" y2="13.4"/><line x1="34.6" y1="34.6" x2="38.8" y2="38.8"/><line x1="9.2" y1="38.8" x2="13.4" y2="34.6"/><line x1="34.6" y1="13.4" x2="38.8" y2="9.2"/></g><circle cx="24" cy="24" r="9" fill="var(--sun)"/></svg>';

  // Schneefallgrenze: Berg (900–2150 m) mit Schneehaube oberhalb der Grenze und gestrichelter Linie
  let slId = 0;
  function slIcon(sl, title) {
    const lo = 900, hi = 2150, top = 3, base = 23, y = m => P2(base - (Math.min(Math.max(m, lo - 60), hi + 60) - lo) / (hi - lo) * (base - top));
    const id = 'sb-sl' + (++slId), mtn = 'M0 24 L11 8 L16 13 L23 3 L36 24 Z';
    const yl = ok(sl) ? y(sl) : null;
    return `<svg class="sli" viewBox="0 0 36 24" role="img" aria-label="${esc(title)}"><defs><clipPath id="${id}"><path d="${mtn}"/></clipPath></defs>
      <path d="${mtn}" fill="var(--mtn)"/>${yl != null ? `<rect x="0" y="0" width="36" height="${yl}" fill="#fff" clip-path="url(#${id})"/>` : ''}
      <path d="${mtn}" fill="none" stroke="var(--mtn-line)" stroke-width="1" stroke-linejoin="round"/>
      ${yl != null ? `<line x1="0" x2="36" y1="${yl}" y2="${yl}" stroke="var(--blue)" stroke-width="1.6" stroke-dasharray="3 2"/>` : ''}</svg>`;
  }
  // Windpfeil: zeigt, wohin der Wind weht (Richtung „aus NW“ = Pfeil nach SO)
  function windIcon(dir, title) {
    const r = ok(dir) ? (dir + 180) % 360 : 0;
    return `<svg class="wdi" viewBox="0 0 22 22" role="img" aria-label="${esc(title)}"><circle cx="11" cy="11" r="10" fill="var(--blue-lt)"/>
      ${ok(dir) ? `<g transform="rotate(${r} 11 11)"><path d="M11 3.5 L15.5 13 L11 10.8 L6.5 13 Z" fill="var(--blue)"/><line x1="11" y1="10" x2="11" y2="17.5" stroke="var(--blue)" stroke-width="2" stroke-linecap="round"/></g>` : ''}</svg>`;
  }

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
  function hero(D, L) {
    const S = L.S, n = D.now, b = n.berg || {}, t = n.tal || {}, td = n.today || {}, d0 = (D.days || [])[0] || {};
    const when = b.t ? L.clock(new Date(b.t * 1000)) : '';
    const tx = L.wx(td.icon, td.text);
    return `<section class="hero" aria-label="${esc(S.nowMtn)}">
      ${ridgeSVG()}
      <div class="lab"><span>${esc(S.nowMtn)}</span><span>${esc(when)}</span></div>
      <div class="main">
        <div class="temp">${ok(b.T) ? (Math.round(b.T) < 0 ? '−' : '') + Math.abs(Math.round(b.T)) : '–'}<sup>°C</sup></div>
        ${wxIcon(td.icon, tx)}
        <div class="cond">${esc(tx ? S.todayCond(tx) : '')}<small>${S.mtn} ${L.deg(d0.berg && d0.berg.max)} / ${L.deg(d0.berg && d0.berg.min)} · ${S.valley} ${L.deg(d0.tal && d0.tal.max)} / ${L.deg(d0.tal && d0.tal.min)}</small></div>
      </div>
      <div class="stats">
        <div class="stat"><div class="k">${S.inValley}</div><div class="v">${L.deg(t.T)}</div></div>
        <div class="stat"><div class="k">${S.windMtn}</div><div class="v">${ok(b.W) ? L.num(b.W) + ' km/h' : '–'}</div></div>
        <div class="stat"><div class="k">${S.snowLine}</div><div class="v">${L.m100(n.snowLine)}</div></div>
      </div>
    </section>`;
  }

  function snowReport(D, L, brand) {
    // official = offizieller Schneebericht des Skigebiets (status ok/none/error), Neuschnee 24 h sonst aus der Analyse
    const S = L.S, s = D.snow || {}, o = s.official || {}, has = o.status === 'ok';
    const cmv = v => ok(v) ? `${L.num(v)}<small>cm</small>` : '–';
    const day = iso => { const d = new Date(iso.length === 10 ? iso + 'T12:00:00Z' : iso); const r = L.ago(dayKey(d)); return r ? cap(r) : L.dmy(d); };
    const neu = has && ok(o.neu);
    const cond = has ? L.cond(o.zustand) : '';
    const meta = has
      ? [o.updated ? `${S.asOf}: ${day(o.updated)}, ${L.clock(new Date(o.updated))}` : '', cond ? `${S.snowCond}: ${cond}` : ''].filter(Boolean).join(' · ')
      : S.noReport;
    const links = (brand.links[L.lang] || []).map(([t, u]) => `<a href="${esc(u)}">${esc(t)}</a>`).join('');
    return `<section class="snow" aria-label="${esc(S.report)}">
      <h3 class="ptitle">${esc(S.report)}</h3>
      <div class="tiles">
        <div class="tile"><div class="k">${S.depthMtn}</div><div class="v">${has ? cmv(o.berg) : '–'}</div></div>
        <div class="tile"><div class="k">${S.depthValley}</div><div class="v">${has ? cmv(o.tal) : '–'}</div></div>
        <div class="tile"><div class="k">${neu ? S.newSnow : S.newSnow24}</div><div class="v">${neu ? cmv(o.neu) : cmv(s.new24)}</div><div class="n">${neu ? S.perReport : S.onMtn}</div></div>
        <div class="tile"><div class="k">${S.lastSnow}</div><div class="v" style="font-size:22px">${has && o.lastSnowfall ? esc(day(o.lastSnowfall)) : '–'}</div>${has && o.lastSnowfall ? `<div class="n">${S.inRegion}</div>` : ''}</div>
      </div>
      ${meta ? `<div class="meta">${esc(meta)}</div>` : ''}
      <div class="links">${links}</div>
    </section>`;
  }

  function outlook(D, L) {
    const S = L.S, s = D.snow || {}, nx = s.next;
    if (nx) {
      const r = L.rel(nx.key), when = r ? cap(r) : L.wdLong(nx.key);
      const rest = ok(s.sum7) && s.sum7 > nx.cm ? S.total7(L.num(s.sum7)) : S.fullDay;
      return `<section class="outlook" aria-label="${esc(S.outlook)}">${BIG_FLAKE}<div>
        <div class="t1">${esc(S.snowSight)}${nx.powder ? `<span class="tag">${esc(S.powder)}</span>` : ''}</div>
        <div class="t2">${esc(S.amount(when, L.num(nx.cm)))}</div>
        <div class="t3">${esc(rest)}</div></div></section>`;
    }
    const t = ok(s.sum7) && s.sum7 >= 2 ? S.flakes(L.num(s.sum7)) : S.dry;
    return `<section class="outlook dry" aria-label="${esc(S.outlook)}">${SUN_BIG}<div>
      <div class="t1">${esc(S.outlook)}</div><div class="t2">${esc(S.noBig)}</div><div class="t3">${esc(t)}</div></div></section>`;
  }

  function forecast(D, L, n) {
    const S = L.S, today = dayKey(new Date()), thr = (D.snow && D.snow.powderThr) || 15;
    const days = (D.days || []).filter(d => d.key >= today).slice(0, n);
    const pct = v => !ok(v) ? '–' : v < 5 ? '&lt;\u00a05\u00a0%' : Math.round(v / 5) * 5 + '\u00a0%';
    const lg = S.legend(thr);
    const cards = days.map(d => {
      const r = L.rel(d.key), wd = r && r !== S.rel[2] ? cap(r) : L.wdLong(d.key);
      const tx = L.wx(d.icon, d.text);
      const snow = d.snow >= 1
        ? `<span class="chip${d.snow < 5 ? ' lite' : ''}">${FLAKE}${L.num(d.snow)} cm</span>`
        : `<span class="nosnow">${esc(S.noSnow)}</span>`;
      const dt = L.lang === 'en' ? `${d.d}/${d.m}` : `${String(d.d).padStart(2, '0')}.${String(d.m).padStart(2, '0')}.`;
      const w = d.wind || {};
      const parts = (d.parts || []).length ? `<div class="parts">${[0, 1, 2].map(k => {
        const p = (d.parts || [])[k]; if (!p) return '<div class="pt"></div>';
        const t = L.wx(p.icon, p.text);
        return `<div class="pt">${wxIcon(p.icon, S.partsLong[k] + ': ' + t, 'pi')}<span>${esc(S.parts[k])}</span></div>`;
      }).join('')}</div>` : '';
      return `<article class="day${d.key === today ? ' today' : ''}" aria-label="${esc(wd)}">
        <div class="when"><div class="wd">${esc(wd)}</div><div class="dt">${dt}</div></div>
        ${wxIcon(d.icon, tx)}
        <div class="tx">${esc(cap(tx))}</div>
        ${parts}
        <div class="snowc">${snow}</div>
        <div class="facts">
          ${d.snow >= 1 ? `<div class="f sn">${snow}</div>` : ''}
          <div class="f" title="${esc(S.slTitle)}">${slIcon(d.snowLine, S.slTitle)}<b>${L.m100(d.snowLine)}</b></div>
          <div class="f wr" title="${esc(S.windTitle)}">${windIcon(w.dir, S.windTitle)}<b>${ok(w.dir) ? S.compass[Math.round(w.dir / 45) % 8] + ' ' : ''}${ok(w.speed) ? L.num(w.speed) + '\u00a0km/h' : '–'}${ok(d.gust) && d.gust >= 40 ? `<small>${esc(S.gust)} ${L.num(d.gust)}</small>` : ''}</b></div>
          <div class="f pw${ok(d.powder) && d.powder >= 50 ? ' hi' : ''}" title="${esc(S.legend(thr)[2])}"><span class="fk">${esc(S.powderShort)}</span><b>${pct(d.powder)}</b><span class="bar" aria-hidden="true"><i style="width:${ok(d.powder) ? Math.min(100, Math.max(0, d.powder)) : 0}%"></i></span></div>
        </div>
        <div class="temps">
          <div class="trow"><span>${S.mtnShort}</span><b>${L.deg(d.berg.max)}<span class="lo"> / ${L.deg(d.berg.min)}</span></b></div>
          <div class="trow"><span>${S.valley}</span><b>${L.deg(d.tal.max)}<span class="lo"> / ${L.deg(d.tal.min)}</span></b></div>
        </div>
      </article>`;
    }).join('');
    return `<section aria-label="${esc(S.forecast)}">
      <div class="sec"><h3 class="ptitle">${esc(S.forecast)}</h3>
        <div class="seg" role="group" aria-label="${esc(S.period)}">${[3, 5, 7].map(k => `<button type="button" data-n="${k}" aria-pressed="${k === n}">${esc(S.days(k))}</button>`).join('')}</div></div>
      <div class="scroll"><div class="days" style="--n:${days.length}">${cards}</div></div>
      <div class="legend"><span>${slIcon(1500, lg[0])}${esc(lg[0])}</span><span>${windIcon(315, lg[1])}${esc(lg[1])}</span><span>${esc(lg[2])}</span></div>
    </section>`;
  }

  const EAWS = { 1: '#ccff66', 2: '#ffff00', 3: '#ff9900', 4: '#ff0000', 5: '#e30613' };
  function avalanche(D, L) {
    const S = L.S, A0 = D.avalanche || {};
    // Englisch: Stufen/Probleme übersetzt, Text aus dem englischen LWD-Bericht (fehlt er, nur Stufe + Link)
    const A = L.lang === 'en' ? Object.assign({}, A0, { headline: null, text: null }, A0.en || { region: S.region }) : A0;
    const url = A.url || 'https://lawine.salzburg.at/';
    const cta = `<a class="btn" href="${esc(url)}" target="_blank" rel="noopener">${esc(S.avalCta)}</a>`;
    const scope = `<p class="note">${esc(S.avalScope)}</p>`;
    const head = extra => `<div class="av-h"><div><h3 class="ptitle">${esc(S.aval)}</h3>${extra || ''}</div><span class="av-reg">${esc(L.lang === 'en' ? S.region : (A.region || S.region))}</span></div>`;
    if (A.status !== 'ok') {
      const msg = A.status === 'error' ? S.avalErr : S.avalNone;
      const mtn = '<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M3 41 19 13l8 13 5-7 13 22Z" fill="var(--blue)" fill-opacity=".22"/><path d="M19 13l4.6 7.5-2.6-1.2-2.4 2.6-2.4-2.2-2.2 1.4Z" fill="#fff"/></svg>';
      return `<section class="aval" aria-label="${esc(S.aval)}">${head()}<div class="av-g">
        <div class="lv"><div class="lv-box" style="--c:var(--blue-lt)">${mtn}</div></div>
        <div><p class="av-tx">${esc(msg)}</p>${cta}</div></div></section>`;
    }
    const max = A.max || 0, R = A.ratings || [];
    const rates = R.length > 1 || (R[0] && R[0].elev !== S.allElev)
      ? `<ul class="rates">${R.map(r => `<li><span class="sq" style="--c:${EAWS[r.level] || '#ddd'}">${r.level || '–'}</span><span><b>${esc(cap(r.word))}</b> ${esc(r.elev)}${r.period ? ' · ' + esc(r.period) : ''}</span></li>`).join('')}</ul>` : '';
    const probs = (A.problems || []).length ? `<div class="probs">${A.problems.map(p => `<span class="chip">${esc(p.word)}</span>`).join('')}</div>` : '';
    const vt = A.validTo ? new Date(A.validTo) : null;
    const meta = vt ? `${S.validTo} ${L.dmy(vt)}, ${L.clock(vt)}` : '';
    const demo = A.demo ? `<span class="demo">${esc(S.example)} ${esc(L.full(new Date(A.demo + 'T12:00:00Z')))}</span>` : '';
    return `<section class="aval" aria-label="${esc(S.aval)}">${head(demo)}<div class="av-g">
      <div class="lv"><div class="lv-box${max === 5 ? ' l5' : ''}" style="--c:${EAWS[max] || '#ddd'}" aria-hidden="true">${max || '–'}</div>
        <div><div class="lv-word">${esc(A.maxWord || '')}</div><div class="lv-of">${esc(S.level(max))}</div></div></div>
      <div>
        ${rates}${probs}
        ${A.headline ? `<p class="av-hl">${esc(A.headline)}</p>` : ''}
        ${A.text ? `<p class="av-tx">${esc(A.text)}</p>` : ''}
        <div class="av-meta">${esc(meta)}${meta ? ' · ' : ''}${esc(S.lwd)}</div>
        ${scope}${cta}
      </div></div>
    </section>`;
  }

  function credits(c, L) {
    if (!Array.isArray(c)) return esc(c || '');
    const tr = x => L.lang === 'en' && /lawine\.salzburg/.test(x.url || '') ? L.S.lwd : x.text;
    return c.map(x => x.url ? `<a href="${esc(x.url)}" target="_blank" rel="noopener">${esc(tr(x))}</a>` : esc(tr(x))).join(' · ');
  }

  function render(root, D, st, L, brand) {
    const S = L.S, gen = new Date(D.generated), age = (Date.now() - gen) / 36e5;
    const r = L.ago(dayKey(gen));
    const stamp = `${age > 3 ? S.dataFrom : S.updated} ${r || L.dmy(gen)}, ${L.clock(gen)}`;
    root.querySelector('.w').innerHTML = `
      <header class="head"><h2>${esc(S.title)}</h2><div class="sub">${esc(brand.sub)}</div><div class="stamp${age > 3 ? ' old' : ''}">${esc(stamp)}</div></header>
      <div class="top">${hero(D, L)}${snowReport(D, L, brand)}</div>
      ${outlook(D, L)}
      ${forecast(D, L, st.n)}
      ${avalanche(D, L)}
      <footer class="foot"><span>${esc(S.data)}: ${credits(D.credits, L)}</span><span>${esc(S.noWarranty)}</span></footer>`;
    root.querySelectorAll('.seg button').forEach(b => b.addEventListener('click', () => {
      st.n = +b.dataset.n; try { localStorage.setItem('sbw.days', st.n); } catch (e) { }
      render(root, D, st, L, brand);
      const sb = root.querySelector(`.seg button[data-n="${st.n}"]`); if (sb) sb.focus();
    }));
  }

  async function mount(el) {
    if (el.__sbw) return; el.__sbw = true;
    const theme = (el.getAttribute('data-theme') || '').toLowerCase() === 'ap' ? 'ap' : 'sb';
    const lang = (el.getAttribute('data-lang') || document.documentElement.lang || 'de').slice(0, 2).toLowerCase() === 'en' ? 'en' : 'de';
    const L = makeL(lang), brand = BRANDS[theme];
    const root = el.attachShadow({ mode: 'open' });
    root.innerHTML = `<style>${CSS}</style><div class="w"><div class="skel" aria-busy="true" aria-label="${esc(L.S.loading)}"></div></div>`;
    const src = el.getAttribute('data-src') || new URL('public.json', BASE).href;
    let saved = null; try { saved = +localStorage.getItem('sbw.days'); } catch (e) { }
    const st = { n: [3, 5, 7].includes(saved) ? saved : ([3, 5, 7].includes(+el.dataset.days) ? +el.dataset.days : 5) };
    let D = null;
    const load = async () => {
      try {
        const r = await fetch(src, { cache: 'no-cache' });
        if (!r.ok) throw new Error('HTTP ' + r.status);
        D = await r.json(); render(root, D, st, L, brand);
      } catch (e) {
        if (!D) root.querySelector('.w').innerHTML = `<div class="err"><h3 class="ptitle">${esc(L.S.title)}</h3><p>${esc(L.S.err)}</p><a class="btn" href="https://lawine.salzburg.at/" target="_blank" rel="noopener">${esc(L.S.avalShort)}</a></div>`;
      }
    };
    await load();
    setInterval(() => { if (document.visibilityState === 'visible') load(); }, REFRESH_MS);
  }

  function init() { document.querySelectorAll('#sb-wetter,[data-sb-wetter]').forEach(mount); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
