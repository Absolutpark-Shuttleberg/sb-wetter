#!/usr/bin/env python3
"""Open-Meteo-Daten ohne API: liest die Wetterwarte-Punkte direkt aus „Open-Meteo on AWS Open Data“
(s3://openmeteo, Lizenz CC BY 4.0, kommerziell nutzbar mit Quellenangabe) und schreibt JSON im Format
der Open-Meteo-API (hourly, timeformat=unixtime). lib/engine.mjs rechnet damit unverändert.

Nachgebaut wird, was die API sonst erledigt:
  - Gitterpunkt: nächster Punkt, aus den 3x3 Nachbarn der mit der passendsten Modellhöhe
  - Höhenkorrektur der Temperatur auf die Zielhöhe (0,65 °C pro 100 m)
  - abgeleitete Größen: Wind aus u/v, Feuchte aus Taupunkt, Einheiten (m/s -> km/h)
  - 3- und 6-stündliche Modelle auf Stunden (Zustand linear, Niederschlag gleichmäßig verteilt)

Aufruf:
  python3 scripts/om_s3.py --out cache/om            # schreibt det.json, tal.json, ens_s.json, ens_l.json, status.json
  python3 scripts/om_s3.py --out cache/om --compare  # zusätzlich Abgleich mit der Open-Meteo-API (nur zum Testen)
Benötigt: pip install omfiles fsspec s3fs numpy
"""
import argparse, json, math, os, re, shutil, sys, tempfile, time, urllib.request, datetime as dt
from concurrent.futures import ThreadPoolExecutor
from zoneinfo import ZoneInfo
import numpy as np
import fsspec
from omfiles import OmFileReader

S3 = "https://openmeteo.s3.amazonaws.com"
TZ = ZoneInfo("Europe/Vienna")
LAPSE = 0.0065
DIST_PENALTY = 50.0   # m Höhenunterschied pro km Entfernung (aus dem Abgleich mit der API abgeleitet)
CACHE = tempfile.mkdtemp(prefix="om_s3_")

# API-Modell -> Ordner im Bucket (in Reihenfolge; je Variable gewinnt der erste Ordner, der sie hat)
DET = {
    "icon_d2": ["dwd_icon_d2"],
    "italia_meteo_arpae_icon_2i": ["italia_meteo_arpae_icon_2i"],
    "meteofrance_arome_france_hd": ["meteofrance_arome_france_hd"],
    "icon_eu": ["dwd_icon_eu"],
    "meteofrance_arpege_europe": ["meteofrance_arpege_europe"],
    "ecmwf_ifs": ["ecmwf_ifs"],
    "ecmwf_aifs025_single": ["ecmwf_aifs025_single"],
    "ukmo_global_deterministic_10km": ["ukmo_global_deterministic_10km"],
    "gfs_seamless": ["ncep_gfs013", "ncep_gfs025"],
    "gem_seamless": ["cmc_gem_gdps_15km"],
}
# Noch nicht umgesetzt (Projektion fehlt bzw. Daten im Bucket veraltet): Hinweis im Status
NOT_YET = {"geosphere_arome_austria": "im Bucket seit 06.11. nicht aktuell (AROME 1 km kommt direkt von GeoSphere)",
           "meteoswiss_icon_ch1": "gedrehtes Gitter, noch nicht umgesetzt",
           "meteoswiss_icon_ch2": "gedrehtes Gitter, noch nicht umgesetzt",
           "dmi_harmonie_arome_europe": "Lambert-Projektion, noch nicht umgesetzt",
           "icon_d2_eps": "Member nur auf nativem ICON-Gitter im Bucket",
           "icon_eu_eps": "Member nur auf nativem ICON-Gitter im Bucket",
           "ecmwf_aifs025": "Member nur auf N320-Gitter im Bucket, noch nicht umgesetzt",
           "gfs025": "GEFS-Member nicht im Bucket"}
TAL_MODELS = ["icon_d2", "icon_eu", "ecmwf_ifs", "gfs_seamless"]
ELEV_FROM = {"ecmwf_aifs025_single": "ecmwf_ifs025"}   # API nutzt für AIFS das Höhenmodell von IFS 0,25°
V_DET = ["temperature_2m", "relative_humidity_2m", "precipitation", "freezing_level_height", "wind_speed_10m", "wind_gusts_10m",
         "cloud_cover", "pressure_msl", "temperature_850hPa", "wind_speed_700hPa", "wind_direction_700hPa"]
V_ENS = ["temperature_2m", "relative_humidity_2m", "precipitation", "wind_speed_10m"]
SUM_VARS = {"precipitation"}
TEMP_VARS = {"temperature_2m", "dew_point_2m"}

LOG = []
def log(msg):
    LOG.append(msg); print(msg, file=sys.stderr)

def get_json(url, timeout=30):
    with urllib.request.urlopen(url, timeout=timeout) as r:
        return json.loads(r.read())

def s3_list(prefix, delimiter="/"):
    out, token = [], None
    while True:
        u = f"{S3}/?list-type=2&prefix={prefix}&delimiter={delimiter}" + (f"&continuation-token={urllib.parse.quote(token)}" if token else "")
        with urllib.request.urlopen(u, timeout=30) as r:
            s = r.read().decode()
        out += re.findall(r"<Prefix>([^<]+)</Prefix>", s) + re.findall(r"<Key>([^<]+)</Key>", s)
        t = re.search(r"<NextContinuationToken>([^<]+)</NextContinuationToken>", s)
        if not t: return out
        token = t.group(1)
import urllib.parse

_FS = None
def om_open(key):
    global _FS
    if _FS is None:
        import s3fs
        _FS = s3fs.S3FileSystem(anon=True, default_block_size=65536, config_kwargs={"max_pool_connections": 96})
    return OmFileReader.from_fsspec(_FS, f"openmeteo/{key}")

# ---------------- Gitter ----------------
def dist_km(a, b, c, d):
    dlon = ((d - b + 180) % 360) - 180
    x = math.radians(dlon) * math.cos(math.radians((a + c) / 2)); y = math.radians(c - a)
    return 6371.0 * math.hypot(x, y)
class Regular:
    def __init__(self, meta, shape):
        bb = [float(v) for v in re.search(r"BBOX\[([^\]]+)\]", meta["crs_wkt"]).group(1).split(",")]
        self.lat0, self.lon0, self.lat1, self.lon1 = bb
        self.ny, self.nx = shape[0], shape[1]
        self.dlat = (self.lat1 - self.lat0) / (self.ny - 1)
        self.dlon = (self.lon1 - self.lon0) / (self.nx - 1)
        self.glob = (self.lon1 - self.lon0) > 350
    def nearest(self, lat, lon):
        y = round((lat - self.lat0) / self.dlat); x = round((lon - self.lon0) / self.dlon)
        if not (0 <= y < self.ny): return None
        if self.glob: x %= self.nx
        elif not (0 <= x < self.nx): return None
        return (y, x)
    def neighbours(self, p):
        y, x = p; out = []
        for dy in (-1, 0, 1):
            for dx in (-1, 0, 1):
                yy, xx = y + dy, x + dx
                if self.glob: xx %= self.nx
                if 0 <= yy < self.ny and 0 <= xx < self.nx: out.append((yy, xx))
        return out
    def latlon(self, p): return self.lat0 + p[0] * self.dlat, self.lon0 + p[1] * self.dlon
    def sel(self, p): return (p[0], p[1])

class Octahedral:
    """ECMWF O-Gitter (z. B. O1280): Reihe i von Nord nach Süd, 4*i+16 Punkte ab 0° Länge."""
    def __init__(self, N):
        self.N = N; self.rows = 2 * N
        k = np.arange(1, self.rows + 1)
        colat = np.pi * (4 * k - 1) / (4 * self.rows + 2)              # Näherung der Gauß-Breiten (Tricomi)
        colat = colat + (1 / (8 * self.rows ** 2)) / np.tan(colat)        # zweite Ordnung
        self.lats = 90 - np.degrees(colat)
        self.nlon = np.array([4 * (i if i <= N else self.rows + 1 - i) + 16 for i in range(1, self.rows + 1)])
        self.offs = np.concatenate([[0], np.cumsum(self.nlon)[:-1]])
        self.total = int(self.nlon.sum())
    def row_of(self, lat): return int(np.argmin(np.abs(self.lats - lat)))
    def nearest(self, lat, lon):
        r = self.row_of(lat); n = self.nlon[r]
        return (r, int(round((lon % 360) / 360 * n)) % n)
    def neighbours(self, p):
        r, j = p; lon = j * 360 / self.nlon[r]; out = []
        for rr in (r - 1, r, r + 1):
            if not (0 <= rr < self.rows): continue
            n = self.nlon[rr]; jj = int(round(lon / 360 * n))
            for d in (-1, 0, 1): out.append((rr, (jj + d) % n))
        return out
    def latlon(self, p): return float(self.lats[p[0]]), p[1] * 360 / self.nlon[p[0]]
    def flat(self, p): return int(self.offs[p[0]] + p[1])
    def sel(self, p): return (0, self.flat(p))

def area_index(grid, p, bbox, west_first=True):
    """Index eines O-Gitter-Punkts in einem Europa-Ausschnitt (Reihen N->S, je Reihe von West nach Ost)."""
    lat0, lon0, lat1, lon1 = bbox; idx = 0; total = 0; found = None
    for r in range(grid.rows):
        if not (lat0 - 1e-3 <= grid.lats[r] <= lat1 + 1e-3): continue
        n = grid.nlon[r]; lons = np.arange(n) * 360 / n
        lw = np.where(lons > 180, lons - 360, lons)
        js = [j for j in range(n) if lon0 - 1e-6 <= lw[j] <= lon1 + 1e-6]
        if west_first: js.sort(key=lambda j: lw[j])
        if r == p[0] and p[1] in js: found = total + js.index(p[1])
        total += len(js)
    return found, total

# ---------------- Modell-Ordner ----------------
import threading
class Folder:
    _cache = {}; _lock = threading.Lock(); _locks = {}
    @classmethod
    def get(cls, name):
        with cls._lock: lk = cls._locks.setdefault(name, threading.Lock())
        with lk:
            if name not in cls._cache: cls._cache[name] = Folder(name)
        return cls._cache[name]
    def __init__(self, name):
        self.name = name
        self.meta = get_json(f"{S3}/data/{name}/static/meta.json")
        self.clen = self.meta["chunk_time_length"]; self.dt = self.meta["temporal_resolution_seconds"]
        self.vars = {p.rstrip("/").split("/")[-1] for p in s3_list(f"data/{name}/")}
        self.hsurf = om_open(f"data/{name}/static/HSURF.om")
        self.hsurf_corr = om_open(f"data/{ELEV_FROM[name]}/static/HSURF.om") if name in ELEV_FROM else None
        shape = self.hsurf.shape
        self.grid = Octahedral(1280) if len(shape) == 2 and shape[0] == 1 and shape[1] == 6599680 else Regular(self.meta, shape)
        self.points = {}
    def elev(self, p):
        v = self.hsurf[self.grid.sel(p)]
        return float(np.asarray(v).reshape(-1)[0])
    def elev_corr(self, p):
        """Höhe für die Temperaturkorrektur (bei AIFS wie in der API aus IFS 0,25°)."""
        if self.hsurf_corr is None: return self.elev(p)
        return float(np.asarray(self.hsurf_corr[self.grid.sel(p)]).reshape(-1)[0])
    def point(self, lat, lon, elev, optimise=True):
        key = (lat, lon, elev, optimise)
        if key in self.points: return self.points[key]
        c = self.grid.nearest(lat, lon)
        if c is None: self.points[key] = None; return None
        if not optimise:
            res = (c, self.elev_corr(c)); self.points[key] = res; return res
        best, bd = c, None
        for q in self.grid.neighbours(c):
            e = self.elev(q)
            if not np.isfinite(e) or e <= -999: continue
            qlat, qlon = self.grid.latlon(q)
            d = abs(e - elev) + DIST_PENALTY * dist_km(lat, lon, qlat, qlon)
            if bd is None or d < bd: best, bd = q, d
        res = (best, self.elev_corr(best))
        self.points[key] = res; return res
    def series(self, var, p, t_from, t_to):
        """Rohwerte (Zeitstempel -> Wert) zwischen t_from und t_to aus den rollierenden Zeitreihen."""
        span = self.clen * self.dt; out = {}
        for c in range(int(t_from // span), int(t_to // span) + 1):
            try: r = om_open(f"data/{self.name}/{var}/chunk_{c}.om")
            except FileNotFoundError: continue
            except Exception as e:
                if "NoSuchKey" in str(e) or "404" in str(e) or "not found" in str(e).lower(): continue
                raise
            sel = self.grid.sel(p)
            vals = np.asarray(r[sel[0], sel[1], :]).reshape(-1)
            t0 = c * span
            for k, v in enumerate(vals):
                t = t0 + k * self.dt
                if t_from <= t <= t_to and np.isfinite(v): out[t] = float(v)
        return out

def to_hourly(raw, ax, dt_s, is_sum):
    """Rohwerte im Modelltakt auf die Stundenachse bringen."""
    if not raw: return [None] * len(ax)
    if dt_s == 3600: return [raw.get(t) for t in ax]
    ts = sorted(raw); out = []
    if is_sum:
        n = dt_s // 3600
        for t in ax:
            end = math.ceil(t / dt_s) * dt_s          # Summe über (end-dt, end] gleichmäßig verteilt
            v = raw.get(end); out.append(None if v is None else v / n)
        return out
    return [hermite(raw, t, dt_s) for t in ax]

def hermite(raw, t, dt_s):
    """Kubische Interpolation (Catmull-Rom) zwischen Modellzeitschritten, an den Rändern linear."""
    t1 = (t // dt_s) * dt_s; t2 = t1 + dt_s
    v1, v2 = raw.get(t1), raw.get(t2)
    if t == t1: return v1
    if v1 is None or v2 is None: return None
    v0, v3 = raw.get(t1 - dt_s, v1), raw.get(t2 + dt_s, v2)
    f = (t - t1) / dt_s
    m1, m2 = (v2 - v0) / 2, (v3 - v1) / 2
    return (2*f**3 - 3*f**2 + 1) * v1 + (f**3 - 2*f**2 + f) * m1 + (-2*f**3 + 3*f**2) * v2 + (f**3 - f**2) * m2

def rh_from(t, td):
    if t is None or td is None: return None
    a, b = 17.625, 243.04
    return max(0.0, min(100.0, 100 * math.exp(a * td / (b + td) - a * t / (b + t))))

def model_series(model, folders, lat, lon, elev, ax, want):
    """Alle gewünschten Variablen eines API-Modells am Punkt, im API-Format (Einheiten wie API-Standard)."""
    fs = [Folder.get(f) for f in folders]
    def src(v):
        for f in fs:
            if v in f.vars: return f
        return None
    t_from, t_to = ax[0] - 6 * 3600, ax[-1] + 6 * 3600
    info = {}
    def read(v):
        f = src(v)
        if f is None: return None
        pt = f.point(lat, lon, elev, optimise=not model.endswith("_seamless"))   # API: bei „seamless“ immer nächste Zelle
        if pt is None: return None
        p, ge = pt
        raw = f.series(v, p, t_from, t_to)
        if v in TEMP_VARS: raw = {t: x + (ge - elev) * LAPSE for t, x in raw.items()}
        if v == "pressure_msl" and raw and np.median(list(raw.values())) > 2000: raw = {t: x / 100 for t, x in raw.items()}   # Pa -> hPa
        info.setdefault("zellen", {})[f.name] = {"hoehe": round(ge), "lat": round(f.grid.latlon(p)[0], 3), "lon": round(f.grid.latlon(p)[1], 3)}
        return to_hourly(raw, ax, f.dt, v in SUM_VARS)
    need = set()
    for v in want:
        if src(v): need.add(v)
        elif v == "relative_humidity_2m": need |= {"temperature_2m", "dew_point_2m"}
        elif v == "wind_speed_10m": need |= {"wind_u_component_10m", "wind_v_component_10m"}
        elif v in ("wind_speed_700hPa", "wind_direction_700hPa"): need |= {"wind_u_component_700hPa", "wind_v_component_700hPa"}
    with ThreadPoolExecutor(12) as ex:
        data = dict(zip(sorted(need), ex.map(read, sorted(need))))
    kmh = lambda a: None if a is None else [None if x is None else x * 3.6 for x in a]
    out = {}
    for v in want:
        a = data.get(v)
        if a is None and v == "relative_humidity_2m" and data.get("dew_point_2m"):
            a = [rh_from(t, d) for t, d in zip(data["temperature_2m"], data["dew_point_2m"])]
        if a is None and v == "wind_speed_10m" and data.get("wind_u_component_10m"):
            a = [None if u is None or w is None else math.hypot(u, w) for u, w in zip(data["wind_u_component_10m"], data["wind_v_component_10m"])]
        if a is None and v in ("wind_speed_700hPa", "wind_direction_700hPa") and data.get("wind_u_component_700hPa"):
            U, V = data["wind_u_component_700hPa"], data["wind_v_component_700hPa"]
            if v == "wind_speed_700hPa": a = [None if u is None or w is None else math.hypot(u, w) for u, w in zip(U, V)]
            else: a = [None if u is None or w is None else (math.degrees(math.atan2(-u, -w)) + 360) % 360 for u, w in zip(U, V)]
        if a is not None and v in ("wind_speed_10m", "wind_gusts_10m", "wind_speed_700hPa"): a = kmh(a)
        if a is not None and any(x is not None for x in a): out[f"{v}_{model}"] = [None if x is None else round(x, 2) for x in a]
    return out, info

# ---------------- ECMWF ENS (Europa-Ausschnitt, O1280) ----------------
def ecmwf_ens(lat, lon, elev, ax):
    model = "ecmwf_ifs_europe_ensemble"; now = dt.datetime.now(dt.timezone.utc); runs = []
    for back in (0, 1):
        d = now - dt.timedelta(days=back)
        runs += [p for p in s3_list(f"data_run/{model}/{d:%Y/%m/%d}/") if re.search(r"/(00|12)00Z/$", p)]
    meta = None
    for run in sorted(runs, reverse=True):          # neuester vollständiger 00/12-UTC-Lauf (15 Tage)
        try: m = get_json(f"{S3}/{run}meta.json")
        except Exception: continue
        vt = [dt.datetime.strptime(v, "%Y-%m-%dT%H:%MZ").replace(tzinfo=dt.timezone.utc) for v in m["valid_times"]]
        ref = dt.datetime.fromisoformat(m["reference_time"].replace("Z", "+00:00"))
        if (vt[-1] - ref).total_seconds() >= 300 * 3600:
            meta, run_dir, times = m, run, [int(v.timestamp()) for v in vt]; break
    if meta is None: log("ECMWF ENS: kein vollständiger Lauf gefunden"); return {}, {}
    bbox = [float(v) for v in re.search(r"BBOX\[([^\]]+)\]", meta["crs_wkt"]).group(1).split(",")]
    hres = Folder.get("ecmwf_ifs")                  # gleiches O1280-Gitter -> Modellhöhe aus HRES
    p, ge = hres.point(lat, lon, elev)
    idx, total = area_index(hres.grid, p, bbox, west_first=True)
    files = {v: om_open(f"{run_dir}{v}.om") for v in ["temperature_2m", "dew_point_2m", "precipitation", "wind_u_component_10m", "wind_v_component_10m"]}
    shape = files["temperature_2m"].shape
    if total != shape[1]: log(f"ECMWF ENS: Ausschnitt-Zählung {total} passt nicht zu {shape[1]}"); return {}, {}
    def rd(v):   # (Member, Zeit) und die Zeitachse der jeweiligen Datei
        r = files[v]
        return np.asarray(r[0, idx, :, :], dtype=float), np.asarray(r.get_child_by_name("time").read_array((slice(None),)), dtype=float)
    with ThreadPoolExecutor(5) as ex:
        arrs = dict(zip(files, ex.map(rd, files)))
    nmem = arrs["temperature_2m"][0].shape[0]
    A = np.array(ax, dtype=float)
    def state(v, shift=0.0):                 # Zustandsgrößen linear auf Stunden, außerhalb NaN
        a, tv = arrs[v]; out = np.full((nmem, len(A)), np.nan); m = (A >= tv[0]) & (A <= tv[-1])
        for k in range(nmem): out[k, m] = np.interp(A[m], tv, a[k]) + shift
        return out
    sh = (ge - elev) * LAPSE
    T, Td, U, V = state("temperature_2m", sh), state("dew_point_2m", sh), state("wind_u_component_10m"), state("wind_v_component_10m")
    pa, ptv = arrs["precipitation"]; P = np.full((nmem, len(A)), np.nan)
    prev = np.concatenate([[ptv[0] - 3600], ptv[:-1]])            # Summe je Schritt über (vorheriger Schritt, Schritt]
    for j, t in enumerate(A):
        i = int(np.searchsorted(ptv, t))
        if i < len(ptv) and t > prev[i]: P[:, j] = pa[:, i] / ((ptv[i] - prev[i]) / 3600)
    RH = 100 * np.exp(17.625 * Td / (243.04 + Td) - 17.625 * T / (243.04 + T)); RH = np.clip(RH, 0, 100)
    W = np.hypot(U, V) * 3.6
    lst = lambda row, nd: [None if not np.isfinite(x) else round(float(x), nd) for x in row]
    out = {}
    for k in range(nmem):
        sfx = ("" if k == 0 else f"_member{k:02d}") + "_ecmwf_ifs025_ensemble"
        out["temperature_2m" + sfx] = lst(T[k], 2); out["relative_humidity_2m" + sfx] = lst(RH[k], 1)
        out["precipitation" + sfx] = lst(P[k], 3); out["wind_speed_10m" + sfx] = lst(W[k], 1)
    return out, {"lauf": meta["reference_time"], "member": nmem, "zelle_hoehe": round(ge), "index": idx}

# ---------------- Ablauf ----------------
def axis(past_days=2, forecast_days=16):
    today = dt.datetime.now(TZ).date()
    start = dt.datetime.combine(today - dt.timedelta(days=past_days), dt.time(0), TZ)
    end = dt.datetime.combine(today + dt.timedelta(days=forecast_days), dt.time(0), TZ)
    s, e = int(start.timestamp()), int(end.timestamp())
    return list(range(s, e, 3600))

def run(points, out_dir):
    t0 = time.time(); ax = axis(); status = {"quelle": "s3://openmeteo (Open-Meteo on AWS Open Data, CC BY 4.0)", "modelle": {}, "fehlend": NOT_YET}
    berg, tal = points["berg"], points["tal"]
    det = {"time": ax}; tl = {"time": ax}
    def one(args):
        model, folders, pt, want = args
        try: return model, pt, model_series(model, folders, *pt, ax, want)
        except Exception as e: log(f"{model}: {type(e).__name__}: {str(e)[:160]}"); return model, pt, ({}, {"fehler": str(e)[:160]})
    jobs = [(m, f, berg, V_DET) for m, f in DET.items()] + [(m, DET[m], tal, V_ENS) for m in TAL_MODELS]
    ens_job = ThreadPoolExecutor(1).submit(lambda: ecmwf_ens(*berg, ax))     # Ensemble parallel zu den Einzelmodellen
    with ThreadPoolExecutor(len(jobs)) as ex:
        for model, pt, (series, info) in ex.map(one, jobs):
            (det if pt is berg else tl).update(series)
            status["modelle"].setdefault(model, {})["berg" if pt is berg else "tal"] = {**info, "variablen": len(series)}
    try:
        ens, einfo = ens_job.result()
    except Exception as e:
        log(f"ECMWF ENS: {type(e).__name__}: {str(e)[:160]}"); ens, einfo = {}, {"fehler": str(e)[:160]}
    status["modelle"]["ecmwf_ifs025_ensemble"] = einfo
    os.makedirs(out_dir, exist_ok=True)
    dump = lambda name, obj: json.dump(obj, open(os.path.join(out_dir, name), "w"), separators=(",", ":"))
    dump("det.json", {"hourly": det}); dump("tal.json", {"hourly": tl})
    dump("ens_s.json", {"hourly": {"time": ax}}); dump("ens_l.json", {"hourly": {"time": ax, **ens}})
    status["dauer_s"] = round(time.time() - t0, 1); status["erzeugt"] = dt.datetime.now(dt.timezone.utc).isoformat(timespec="seconds"); status["log"] = LOG
    dump("status.json", status)
    return det, tl, ens, status

# ---------------- Abgleich mit der API (nur Test) ----------------
def compare(points, det, tl, ens):
    def api(lat, lon, elev, models, hourly, ensemble=False):
        host = "ensemble-api.open-meteo.com/v1/ensemble" if ensemble else "api.open-meteo.com/v1/forecast"
        u = (f"https://{host}?latitude={lat}&longitude={lon}&elevation={elev}&hourly={','.join(hourly)}&models={','.join(models)}"
             f"&past_days=2&forecast_days=16&timeformat=unixtime&timezone=Europe%2FVienna")
        return get_json(u, timeout=90)["hourly"]
    now = time.time()
    def cmp(name, mine, ref):
        rows = []; tt = mine["time"]
        for k, a in mine.items():
            if k == "time" or k not in ref: continue
            b = ref[k]; pairs = [(x, y) for t, x, y in zip(tt, a, b) if t >= now and x is not None and y is not None]
            if not pairs: rows.append((k, 0, None, None)); continue
            d = [abs(x - y) for x, y in pairs]
            if "direction" in k: d = [min(x, 360 - x) for x in d]
            rows.append((k, len(pairs), sum(d) / len(d), max(d)))
        print(f"\n== {name} (nur Prognose ab jetzt): Variable | Stunden | mittl. Abw. | max. Abw.")
        for k, n, mae, mx in sorted(rows):
            print(f"  {k:58s} {n:4d}  " + ("–" if mae is None else f"{mae:7.2f}  {mx:7.2f}"))
    b = points["berg"]; t = points["tal"]
    ref = api(*b, list(DET), V_DET); ref_t = api(*t, TAL_MODELS, V_ENS)
    cmp("Berg, Einzelmodelle", det, ref); cmp("Tal", tl, ref_t)
    if ens:
        r = api(*b, ["ecmwf_ifs025"], V_ENS, ensemble=True)
        def stat(src, var):
            ks = [k for k in src if k == var or k.startswith(var + "_member") or (k.startswith(var) and k.endswith("ecmwf_ifs025_ensemble"))]
            arr = np.array([[np.nan if x is None else x for x in src[k]] for k in ks], dtype=float)
            return arr
        print("\n== ECMWF ENS: Median aller Member, je Tag (S3 | API)")
        for var in ("temperature_2m", "precipitation"):
            A, R = stat(ens, var), stat(r, var)
            ax = det["time"]
            for d0 in range(2, 16, 2):
                sl = slice(d0 * 24, d0 * 24 + 24)
                f = (lambda a: np.nanmedian(np.nansum(a[:, sl], axis=1))) if var == "precipitation" else (lambda a: np.nanmedian(a[:, sl]))
                print(f"  {var:16s} Tag {d0:2d}: S3 {f(A):7.2f} | API {f(R):7.2f}")

if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--out", default="cache/om"); ap.add_argument("--compare", action="store_true")
    ap.add_argument("--config", default=os.path.join(os.path.dirname(__file__), "..", "config.json"))
    a = ap.parse_args()
    cfg = json.load(open(a.config))
    pts = {k: tuple(v) for k, v in cfg["points"].items()}
    try:
        det, tl, ens, status = run(pts, a.out)
        print(f"fertig in {status['dauer_s']} s: {len([k for k in det if k != 'time'])} Reihen Berg, {len([k for k in tl if k != 'time'])} Tal, "
              f"{len(ens)} Ensemble-Reihen", file=sys.stderr)
        if a.compare: compare(pts, det, tl, ens)
    finally:
        shutil.rmtree(CACHE, ignore_errors=True)
