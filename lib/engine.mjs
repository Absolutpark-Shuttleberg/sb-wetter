// AUTOMATISCH ERZEUGT von scripts/extract-engine.mjs – nicht von Hand ändern.
// Quelle: Shuttleberg Wetterwarte/Shuttleberg-Wetterwarte.html · erzeugt 2026-11-18T06:35:24.750Z
/* eslint-disable */
const document = globalThis.document || { getElementById: () => null };

/* ======================= Konfiguration ======================= */
const DEFAULTS={bergLat:47.300,bergLon:13.345,bergElev:1950,talLat:47.3007,talLon:13.3966,talElev:1000,thr:15,omKey:'',snProp:-2.5,snLance:-3,snWind:30};
const store={get(k,d){try{const v=localStorage.getItem(k);return v==null?d:JSON.parse(v);}catch(e){return d;}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v));}catch(e){}}};
let S=Object.assign({},DEFAULTS,store.get('swx.settings',{}));
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
const META_PATH={geosphere_arome_austria:'geosphere_arome_austria',icon_d2:'dwd_icon_d2',meteoswiss_icon_ch1:'meteoswiss_icon_ch1',meteoswiss_icon_ch2:'meteoswiss_icon_ch2',italia_meteo_arpae_icon_2i:'italia_meteo_arpae_icon_2i',dmi_harmonie_arome_europe:'dmi_harmonie_arome_europe',meteofrance_arome_france_hd:'meteofrance_arome_france_hd',icon_eu:'dwd_icon_eu',meteofrance_arpege_europe:'meteofrance_arpege_europe',ecmwf_ifs:'ecmwf_ifs',ecmwf_aifs025_single:'ecmwf_aifs025_single',ukmo_global_deterministic_10km:'ukmo_global_deterministic_10km',gfs_seamless:'ncep_gfs013',icon_d2_eps:'dwd_icon_d2_eps',ecmwf_ifs025:'ecmwf_ifs025_ensemble',ecmwf_aifs025:'ecmwf_aifs025_ensemble',gfs025:'ncep_gefs025'};
const STATIONS=[{id:'11149',name:'Obertauern',elev:1772},{id:'11208',name:'Radstadt',elev:835},{id:'11179',name:'Großarltal',elev:882},{id:'11267',name:'Dachstein-Hunerkogel',elev:2700}];
// Geländeschnitt Kleinarl – Grat – Flachauwinkl (Copernicus-DEM), km / m
const PROFILE=[[0,1003],[0.13,1004],[0.26,1010],[0.39,1089],[0.52,1126],[0.65,1159],[0.78,1183],[0.91,1260],[1.04,1305],[1.17,1332],[1.3,1391],[1.43,1428],[1.56,1452],[1.69,1479],[1.82,1552],[1.95,1620],[2.08,1672],[2.21,1703],[2.34,1708],[2.47,1721],[2.6,1743],[2.73,1779],[2.86,1817],[2.99,1881],[3.12,1833],[3.25,1802],[3.38,1783],[3.51,1762],[3.64,1736],[3.77,1714],[3.9,1708],[4.03,1683],[4.16,1675],[4.29,1659],[4.42,1643],[4.55,1638],[4.68,1616],[4.81,1585],[4.94,1589],[5.07,1571],[5.2,1511],[5.33,1473],[5.46,1440],[5.59,1401],[5.72,1345],[5.85,1283],[5.98,1239],[6.1,1180],[6.23,1148],[6.36,1106],[6.49,1069],[6.62,1039],[6.75,1031],[6.88,1015],[7.01,1018]];

/* ======================= Helfer ======================= */
const $=id=>document.getElementById(id);
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
    const r=await fetch(url,{signal:ctl.signal});
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
const loadDet=()=>getJSON(om('fc',{latitude:S.bergLat,longitude:S.bergLon,elevation:S.bergElev,hourly:V_DET,models:DET_MODELS.map(m=>m.id).join(','),past_days:2,forecast_days:16,timeformat:'unixtime',timezone:TZ}),'om-det','Open-Meteo · 14 Einzelmodelle (Berg)',{ttl:TTL});
const loadTal=()=>getJSON(om('fc',{latitude:S.talLat,longitude:S.talLon,elevation:S.talElev,hourly:V_ENS,models:TAL_MODELS.join(','),past_days:2,forecast_days:16,timeformat:'unixtime',timezone:TZ}),'om-tal','Open-Meteo · Modelle Tal',{ttl:TTL});
const loadEnsS=()=>getJSON(om('ens',{latitude:S.bergLat,longitude:S.bergLon,elevation:S.bergElev,hourly:V_ENS,models:'icon_d2_eps,icon_eu_eps',past_days:2,forecast_days:6,timeformat:'unixtime',timezone:TZ}),'om-ens-s','Open-Meteo · ICON-D2-EPS, ICON-EU-EPS',{ttl:TTL});
const loadEnsL=()=>getJSON(om('ens',{latitude:S.bergLat,longitude:S.bergLon,elevation:S.bergElev,hourly:V_ENS+',temperature_850hPa',models:'ecmwf_ifs025,ecmwf_aifs025,gfs025',past_days:2,forecast_days:16,timeformat:'unixtime',timezone:TZ}),'om-ens-l','Open-Meteo · ECMWF ENS, AIFS-ENS, GEFS',{ttl:TTL});
const loadSeas=()=>getJSON(om('seas',{latitude:S.bergLat,longitude:S.bergLon,models:'ecmwf_seas5',monthly:'temperature_2m_anomaly,precipitation_anomaly,snowfall_anomaly'}),'om-seas','Open-Meteo · ECMWF SEAS5',{ttl:12*3600});
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
async function loadMeta(){
  const ids=Object.keys(META_PATH);
  await Promise.all(ids.map(async id=>{const j=await getJSON(`https://api.open-meteo.com/data/${META_PATH[id]}/static/meta.json`,null,null,{timeout:15000});
    if(j&&ok(j.last_run_initialisation_time)&&Date.now()/1000-j.last_run_initialisation_time<2.5*86400)META[id]=j.last_run_initialisation_time;}));
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


const PROB={new_snow:'Neuschnee',wind_slab:'Triebschnee',persistent_weak_layers:'Altschnee',wet_snow:'Nassschnee',gliding_snow:'Gleitschnee',favourable_situation:'Günstige Situation',cornices:'Wechten',no_distinct_avalanche_problem:'kein ausgeprägtes Problem'};
const LVL={low:[1,'gering'],moderate:[2,'mäßig'],considerable:[3,'erheblich'],high:[4,'groß'],very_high:[5,'sehr groß'],no_snow:[0,'kein Schnee'],no_rating:[0,'keine Einstufung']};
const elevTxt=e=>{if(!e)return 'alle Höhenlagen';const f=v=>v==='treeline'?'Waldgrenze':f0(+v)+' m';if(e.lowerBound&&e.upperBound)return `${f(e.lowerBound)} – ${f(e.upperBound)}`;if(e.lowerBound)return `oberhalb ${f(e.lowerBound)}`;return `unterhalb ${f(e.upperBound)}`;};
const strip=s=>String(s||'').replace(/<br\s*\/?>/gi,'\n').replace(/<[^>]+>/g,'').trim();
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
