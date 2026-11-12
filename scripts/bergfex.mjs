// Liest den offiziellen Schneebericht (Schneehöhe Berg/Tal, Neuschnee, Schneezustand, letzter Schneefall)
// von der bergfex-Seite des Skigebiets. Die Werte pflegt Shuttleberg selbst bei bergfex ein.
// Ein Abruf pro Build (stündlich). Ergebnis: { status: 'ok'|'none'|'error', berg, tal, neu, zustand, lastSnowfall, updated, info }
//   ok    = Schneebericht gefunden
//   none  = bergfex meldet „kein aktueller Schneebericht“ (z. B. vor Saisonbeginn)
//   error = Seite nicht erreichbar oder Aufbau geändert (dann bleibt der letzte gute Stand, siehe build-public.mjs)
// Test mit gespeicherter Seite: node scripts/bergfex.mjs datei.html
import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

const TZ = 'Europe/Vienna';
const UA = 'Mozilla/5.0 (compatible)';

const clean = s => s.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&#0?39;|&apos;/g, "'")
  .replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/\s+/g, ' ').trim();
const cm = s => { const m = /(\d+)\s*cm/.exec(s || ''); return m ? +m[1] : null; };

// heutiges Datum in Wien als [y, m, d]
function viennaToday(now = new Date()) {
  const p = new Intl.DateTimeFormat('en-CA', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit' }).format(now);
  return p.split('-').map(Number);
}
// Wiener Ortszeit → ISO mit Offset (+01:00 / +02:00)
function viennaIso(y, mo, d, h = 0, mi = 0) {
  const guess = Date.UTC(y, mo - 1, d, h, mi);
  const off = n => {
    const t = new Intl.DateTimeFormat('en-US', { timeZone: TZ, timeZoneName: 'longOffset' }).formatToParts(new Date(n))
      .find(x => x.type === 'timeZoneName').value;           // z. B. "GMT+01:00"
    const m = /([+-])(\d\d):(\d\d)/.exec(t); return m ? (m[1] === '-' ? -1 : 1) * (+m[2] * 60 + +m[3]) : 0;
  };
  const o = off(guess - off(guess) * 60000);
  const pad = n => String(n).padStart(2, '0');
  return `${y}-${pad(mo)}-${pad(d)}T${pad(h)}:${pad(mi)}:00${o < 0 ? '-' : '+'}${pad(Math.floor(Math.abs(o) / 60))}:${pad(Math.abs(o) % 60)}`;
}
// "Heute, 16:31" · "Gestern, 20:34" · "Di, 10.11." · "10.11.2026, 08:00" → { y, m, d, h, mi } (ohne Jahr: letztes passendes)
function parseWhen(s, now = new Date()) {
  if (!s || s === '-') return null;
  const [ty, tm, td] = viennaToday(now);
  const tm_ = /(\d{1,2}):(\d{2})/.exec(s);
  const h = tm_ ? +tm_[1] : null, mi = tm_ ? +tm_[2] : null;
  let y, m, d;
  if (/^heute/i.test(s) || /^gestern/i.test(s)) {
    const base = new Date(Date.UTC(ty, tm - 1, td) - (/^gestern/i.test(s) ? 864e5 : 0));
    y = base.getUTCFullYear(); m = base.getUTCMonth() + 1; d = base.getUTCDate();
  } else {
    const dm = /(\d{1,2})\.(\d{1,2})\.(\d{4})?/.exec(s);
    if (!dm) return null;
    d = +dm[1]; m = +dm[2]; y = dm[3] ? +dm[3] : ty;
    if (!dm[3] && Date.UTC(y, m - 1, d) > Date.UTC(ty, tm - 1, td) + 864e5) y -= 1;   // Datum aus dem Vorjahr
  }
  return { y, m, d, h, mi };
}

export function parseBergfex(html, now = new Date()) {
  const dl = /<dl class="dl-horizontal dt-large">([\s\S]*?)<\/dl>/.exec(html);
  if (!dl) {
    if (/kein aktueller Schneebericht/i.test(html)) return { status: 'none', info: 'bergfex: derzeit kein Schneebericht' };
    return { status: 'error', info: 'bergfex: Seitenaufbau unbekannt (kein Schneebericht-Block gefunden)' };
  }
  const rows = {};
  for (const [, dt, dd] of dl[1].matchAll(/<dt[^>]*>([\s\S]*?)<\/dt>\s*<dd[^>]*>([\s\S]*?)<\/dd>/g)) {
    const key = clean(dt).replace(/\s*\(.*$/, '');                 // "Berg (Piste, 3.000m)" → "Berg"
    rows[key] = { raw: dd, text: clean(dd) };
  }
  const berg = rows.Berg ? cm(rows.Berg.text.replace(/neu:.*$/i, '')) : null;
  const tal = rows.Tal ? cm(rows.Tal.text.replace(/neu:.*$/i, '')) : null;
  const neuM = /neu:\s*(\d+)\s*cm/i.exec((rows.Berg || {}).text || '');
  const when = parseWhen((rows.Schneebericht || {}).text, now);
  const last = parseWhen((rows['Letzter Schneefall Region'] || rows['Letzter Schneefall'] || {}).text, now);
  const zustand = rows.Schneezustand && !/keine Meldung|^-$/i.test(rows.Schneezustand.text) ? rows.Schneezustand.text : null;
  if (berg == null && tal == null) return { status: 'none', info: 'bergfex: Schneebericht ohne Schneehöhen' };
  return {
    status: 'ok',
    berg, tal,
    neu: neuM ? +neuM[1] : null,
    zustand,
    lastSnowfall: last ? viennaIso(last.y, last.m, last.d).slice(0, 10) : null,
    updated: when ? viennaIso(when.y, when.m, when.d, when.h ?? 0, when.mi ?? 0) : null,
    info: 'bergfex'
  };
}

// Bei „429 zu viele Anfragen“ einmal nachfassen, nach der Wartezeit, die bergfex nennt (höchstens 60 s, sonst 20 s).
export async function loadBergfex(url, { timeoutMs = 15000 } = {}) {
  try {
    const get = async () => {
      const ctl = new AbortController(); const t = setTimeout(() => ctl.abort(), timeoutMs);
      try { return await fetch(url, { headers: { 'User-Agent': UA, 'Accept-Language': 'de-AT,de;q=0.9' }, signal: ctl.signal }); }
      finally { clearTimeout(t); }
    };
    let r = await get(), note = '';
    if (r.status === 429) {
      const ra = +r.headers.get('retry-after');
      const wait = ra > 0 && ra <= 60 ? ra : 20;
      note = ` (nach 429, ${wait} s gewartet${r.headers.get('retry-after') ? ', Retry-After ' + r.headers.get('retry-after') : ''})`;
      await new Promise(res => setTimeout(res, wait * 1000));
      r = await get();
    }
    if (!r.ok) return { status: 'error', info: `bergfex: HTTP ${r.status}${note}` };
    const res = parseBergfex(await r.text());
    return note ? { ...res, info: res.info + note } : res;
  } catch (e) {
    return { status: 'error', info: 'bergfex: ' + (e.name === 'AbortError' ? 'Zeitüberschreitung' : e.message) };
  }
}

// Direktaufruf zum Testen: node scripts/bergfex.mjs [datei.html | url]
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const a = process.argv[2];
  const res = !a || /^https?:/.test(a) ? await loadBergfex(a || 'https://www.bergfex.at/kleinarl-flachauwinkl/schneebericht/') : parseBergfex(readFileSync(a, 'utf8'));
  console.log(JSON.stringify(res, null, 1));
}
