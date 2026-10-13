#!/usr/bin/env node
/**
 * "Biz neredeyiz?" widget'ı için ulaşım verisini BUILD/BAKIM zamanında çeker ve
 * public/widget/config.json içindeki `transit`, `metro`, `walking` bölümlerine yazar.
 * Sayfa açılışında hiçbir canlı sorgu yapılmaz.
 *
 * Kaynaklar (hepsi açık, anahtarsız):
 *  - İBB Açık Veri / İETT Hat-Durak-Güzergâh web servisi  → hat listesi
 *  - İBB Açık Veri / İETT ibb.asmx DurakDetay_GYY           → hattın durakları + koordinatları
 *  - İBB Açık Veri GTFS stops.csv                           → durak yön bilgisi (opsiyonel)
 *  - OSRM (routing.openstreetmap.de, foot profili)          → gerçek yürüme rotası
 *
 * Kullanım:  node scripts/nasil-gelinir/fetch-transit.mjs
 * Hiçbir değer uydurulmaz; kaynak yanıt vermezse ilgili alan boş bırakılır ve rapora yazılır.
 */
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const CONFIG_PATH = path.join(ROOT, "public", "widget", "config.json");

const UA = "samandira-widget-build/1.0 (+https://www.samandiraidmanyurdu.com)";
const IETT_LINES = "https://api.ibb.gov.tr/iett/UlasimAnaVeri/HatDurakGuzergah.asmx";
const IETT_STOPS = "https://api.ibb.gov.tr/iett/ibb/ibb.asmx";
const GTFS_ROUTES =
  "https://data.ibb.gov.tr/dataset/8540e256-6df5-4719-85bc-e64e91508ede/resource/46dbe388-c8c2-45c4-ac72-c06953de56a2/download/routes.csv";
const GTFS_STOPS =
  "https://data.ibb.gov.tr/dataset/8540e256-6df5-4719-85bc-e64e91508ede/resource/2299bc82-983b-4bdf-8520-5cef8c555e29/download/stops.csv";
const FOOT_ROUTER = "https://routing.openstreetmap.de/routed-foot/route/v1/foot";

const SEARCH_RADIUS_M = 1000; // bu yarıçaptaki duraklar aday
const WALK_CANDIDATES = 8; // kuş uçuşu en yakın N aday için gerçek yürüme rotası hesaplanır
const STOP_COUNT = 3;
/** Kullanıcının bölgede gördüğünü bildirdiği hatlar — yalnızca DOĞRULAMA için. */
const EXPECTED_LINES = ["11ÜS", "14S", "18Ü", "18V", "19V", "131C", "132M", "132S", "522ST", "UM73"];

const config = JSON.parse(await readFile(CONFIG_PATH, "utf8"));
const { lat: LAT, lon: LON } = config.academy;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function haversine(aLat, aLon, bLat, bLon) {
  const R = 6371000;
  const rad = (d) => (d * Math.PI) / 180;
  const h =
    Math.sin(rad(bLat - aLat) / 2) ** 2 +
    Math.cos(rad(aLat)) * Math.cos(rad(bLat)) * Math.sin(rad(bLon - aLon) / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

async function withRetry(label, fn, tries = 4) {
  let last;
  for (let i = 0; i < tries; i++) {
    try {
      return await fn();
    } catch (err) {
      last = err;
      await sleep(600 * (i + 1));
    }
  }
  throw new Error(`${label}: ${last?.message ?? last}`);
}

async function soap(url, action, bodyXml) {
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "text/xml; charset=utf-8",
      SOAPAction: `"http://tempuri.org/${action}"`,
      "User-Agent": UA,
    },
    body: `<?xml version="1.0" encoding="utf-8"?><soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"><soap:Body>${bodyXml}</soap:Body></soap:Envelope>`,
    signal: AbortSignal.timeout(90_000),
  });
  const text = await res.text();
  if (!res.ok || text.includes("<soap:Fault>")) throw new Error(`${action} HTTP ${res.status}`);
  return text;
}

function decodeXml(s) {
  return s
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, "&");
}

async function fetchLineList() {
  const xml = await withRetry("GetHat_json", () =>
    soap(IETT_LINES, "GetHat_json", '<GetHat_json xmlns="http://tempuri.org/"><HatKodu></HatKodu></GetHat_json>'),
  );
  const m = xml.match(/<GetHat_jsonResult>([\s\S]*?)<\/GetHat_jsonResult>/);
  if (!m) throw new Error("GetHat_json: sonuç ayrıştırılamadı");
  return JSON.parse(decodeXml(m[1]));
}

/**
 * GetHat_json listesi eksik hat döndürebiliyor (ör. 18Ü, 18V, 131C listede yok ama durakları var).
 * Bu yüzden GTFS routes.csv hat kodları da birleştirilir. Dosya çift kodlanmış (UTF-8 → cp1252 → UTF-8)
 * geldiği için önce düzeltilir.
 */
function fixDoubleEncoded(text) {
  const dec = new TextDecoder("windows-1252");
  const back = new Map();
  for (let b = 0; b < 256; b++) back.set(dec.decode(Uint8Array.of(b)), b);
  const bytes = [];
  for (const ch of text) {
    if (ch.codePointAt(0) < 128) bytes.push(ch.codePointAt(0));
    else if (back.has(ch)) bytes.push(back.get(ch));
    else if (ch.codePointAt(0) <= 0x9f) bytes.push(ch.codePointAt(0)); // cp1252'de tanımsız C1 baytları
    else return text; // dönüştürülemiyorsa dokunma
  }
  try {
    return new TextDecoder("utf-8", { fatal: true }).decode(Uint8Array.from(bytes));
  } catch {
    return text; // geçerli UTF-8 değilse zaten doğru kodlanmıştır; dokunma
  }
}

async function fetchGtfsRoutes() {
  try {
    const r = await fetch(GTFS_ROUTES, { headers: { "User-Agent": UA }, signal: AbortSignal.timeout(120_000) });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    const rows = (await r.text()).replace(/^\uFEFF/, "").split(/\r?\n/).slice(1);
    const map = new Map();
    for (const row of rows) {
      const [, , shortName, longName] = row.split(";");
      // Düzeltme alan bazında yapılır; dönüştürülemeyen alan olduğu gibi kalır.
      const short = shortName ? fixDoubleEncoded(shortName) : null;
      if (short && !map.has(short)) map.set(short, longName ? fixDoubleEncoded(longName) : null);
    }
    return map;
  } catch (err) {
    console.warn(`! GTFS routes.csv alınamadı (${err.message}); yalnızca GetHat_json listesi kullanılacak.`);
    return new Map();
  }
}

async function fetchLineStops(code) {
  const xml = await withRetry(`DurakDetay_GYY(${code})`, () =>
    soap(
      IETT_STOPS,
      "DurakDetay_GYY",
      `<DurakDetay_GYY xmlns="http://tempuri.org/"><hat_kodu>${code.replace(/&/g, "&amp;")}</hat_kodu></DurakDetay_GYY>`,
    ),
  );
  const out = [];
  for (const t of xml.matchAll(/<Table>([\s\S]*?)<\/Table>/g)) {
    const pick = (tag) => t[1].match(new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`))?.[1];
    const lon = Number(pick("XKOORDINATI"));
    const lat = Number(pick("YKOORDINATI"));
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) continue;
    out.push({
      stopCode: pick("DURAKKODU"),
      stopName: decodeXml(pick("DURAKADI") ?? ""),
      lat,
      lon,
      yon: pick("YON"),
    });
  }
  return out;
}

async function pool(items, size, worker) {
  let i = 0;
  const results = new Array(items.length);
  await Promise.all(
    Array.from({ length: size }, async () => {
      while (i < items.length) {
        const idx = i++;
        results[idx] = await worker(items[idx], idx);
      }
    }),
  );
  return results;
}

async function footRoute(fromLat, fromLon, toLat, toLon) {
  const url = `${FOOT_ROUTER}/${fromLon},${fromLat};${toLon},${toLat}?overview=full&geometries=geojson`;
  const json = await withRetry("OSRM foot", async () => {
    const r = await fetch(url, { headers: { "User-Agent": UA }, signal: AbortSignal.timeout(30_000) });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return r.json();
  });
  const route = json.routes?.[0];
  if (json.code !== "Ok" || !route) throw new Error(`OSRM yanıtı geçersiz: ${json.code}`);
  return {
    meters: Math.round(route.distance),
    minutes: Math.max(1, Math.round(route.duration / 60)),
    /** [lat, lon] çiftleri, 5 hane */
    path: route.geometry.coordinates.map(([x, y]) => [Number(y.toFixed(5)), Number(x.toFixed(5))]),
  };
}

async function fetchGtfsDirections() {
  try {
    const r = await fetch(GTFS_STOPS, { headers: { "User-Agent": UA }, signal: AbortSignal.timeout(120_000) });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    const rows = (await r.text()).replace(/^\uFEFF/, "").split(/\r?\n/).slice(1);
    const map = new Map();
    for (const row of rows) {
      const [, code, , desc] = row.split(";");
      if (code && desc) map.set(code, desc.replace(/^direction:\s*/i, "").trim());
    }
    return map;
  } catch (err) {
    console.warn(`! GTFS yön bilgisi alınamadı (${err.message}); yön alanı boş kalacak.`);
    return new Map();
  }
}

// ---------------------------------------------------------------- ana akış
console.log("1/4 Hat listesi alınıyor…");
const listed = await fetchLineList();
const lineNames = new Map(listed.map((l) => [l.SHATKODU, l.SHATADI]));
const gtfsRoutes = await fetchGtfsRoutes();
for (const [code, longName] of gtfsRoutes) if (!lineNames.has(code)) lineNames.set(code, longName);
// Doğrulama listesindeki kodlar da taranır: bazı hatlar yalnızca durak servisinde kayıtlı (hat listelerinde yok).
for (const code of EXPECTED_LINES) if (!lineNames.has(code)) lineNames.set(code, null);
const lines = [...lineNames.keys()].map((SHATKODU) => ({ SHATKODU }));
console.log(`    ${listed.length} hat (GetHat_json) + GTFS → toplam ${lines.length} benzersiz hat kodu`);

console.log("2/4 Hat durakları taranıyor (uzun sürebilir)…");
const nearby = new Map(); // stopCode -> { ..., lines:Set }
const failed = [];
let done = 0;
await pool(lines, 8, async (line) => {
  try {
    const stops = await fetchLineStops(line.SHATKODU);
    for (const s of stops) {
      const d = haversine(LAT, LON, s.lat, s.lon);
      if (d > SEARCH_RADIUS_M) continue;
      const cur = nearby.get(s.stopCode) ?? { ...s, crowFlyMeters: Math.round(d), lines: new Set() };
      cur.lines.add(line.SHATKODU);
      nearby.set(s.stopCode, cur);
    }
  } catch (err) {
    failed.push(`${line.SHATKODU}: ${err.message}`);
  }
  if (++done % 100 === 0) console.log(`    ${done}/${lines.length}`);
});
if (failed.length) console.warn(`! ${failed.length} hat taranamadı: ${failed.slice(0, 15).join(" | ")}`);

const candidates = [...nearby.values()].sort((a, b) => a.crowFlyMeters - b.crowFlyMeters).slice(0, WALK_CANDIDATES);
console.log(`3/4 ${candidates.length} aday durak için gerçek yürüme rotası (OSRM foot)…`);
const directions = await fetchGtfsDirections();
for (const c of candidates) {
  c.walk = await footRoute(c.lat, c.lon, LAT, LON);
  await sleep(300);
}
const top = candidates.sort((a, b) => a.walk.meters - b.walk.meters).slice(0, STOP_COUNT);

const stops = top.map((s) => ({
  code: s.stopCode,
  name: s.stopName,
  direction: directions.get(s.stopCode) ?? null,
  lat: s.lat,
  lon: s.lon,
  walkMeters: s.walk.meters,
  walkMinutes: s.walk.minutes,
  walkPath: s.walk.path,
  lines: [...s.lines]
    .sort((a, b) => a.localeCompare(b, "tr", { numeric: true }))
    .map((code) => ({ code, name: lineNames.get(code) ?? null })),
}));

// Doğrulama: kullanıcının bildirdiği hatlar, taranan 1 km içinde görüldü mü?
const seenWithinRadius = new Set();
for (const s of nearby.values()) for (const l of s.lines) seenWithinRadius.add(l);
const seenOnTop = new Set(stops.flatMap((s) => s.lines.map((l) => l.code)));
const verification = {
  expected: EXPECTED_LINES,
  foundInTop3Stops: EXPECTED_LINES.filter((l) => seenOnTop.has(l)),
  foundWithin1km: EXPECTED_LINES.filter((l) => seenWithinRadius.has(l) && !seenOnTop.has(l)),
  notFoundWithin1km: EXPECTED_LINES.filter((l) => !seenWithinRadius.has(l)),
  notInExpectedButFoundOnTop3: [...seenOnTop].filter((l) => !EXPECTED_LINES.includes(l)).sort(),
};

console.log("4/4 Metro (M5) yürüme rotası…");
let metro = config.metro ?? {};
if (metro.station?.lat && metro.station?.lon) {
  const w = await footRoute(metro.station.lat, metro.station.lon, LAT, LON);
  metro = { ...metro, walkMeters: w.meters, walkMinutes: w.minutes, walkPath: w.path };
}

let walking = config.walking ?? {};
if (walking.origin?.lat && walking.origin?.lon) {
  const w = await footRoute(walking.origin.lat, walking.origin.lon, LAT, LON);
  walking = { ...walking, meters: w.meters, minutes: w.minutes, path: w.path };
} else {
  console.warn("! walking.origin tanımlı değil — yürüme paneli 'yakında' gösterecek.");
}

config.transit = {
  ...(config.transit ?? {}),
  stops,
};
config.metro = metro;
config.walking = walking;
config._build = {
  generatedAt: new Date().toISOString(),
  searchRadiusMeters: SEARCH_RADIUS_M,
  linesScanned: lines.length,
  linesInGetHatJson: listed.length,
  linesFailed: failed.length,
  sources: [
    "İBB Açık Veri — İETT Hat-Durak-Güzergâh ve ibb.asmx web servisleri (data.ibb.gov.tr)",
    "İBB Açık Veri — İETT GTFS stops.csv (yön bilgisi)",
    "OSRM foot profili — routing.openstreetmap.de (OpenStreetMap verisi)",
  ],
  verification,
};

await writeFile(CONFIG_PATH, JSON.stringify(config, null, 2) + "\n", "utf8");

console.log("\n=== SONUÇ ===");
for (const s of stops) {
  console.log(`${s.name} (${s.code}) ${s.direction ?? ""} — ${s.walkMeters} m / ${s.walkMinutes} dk — ${s.lines.map((l) => l.code).join(", ")}`);
}
if (metro.walkMeters) console.log(`M5 ${metro.station.name}: ${metro.walkMeters} m / ${metro.walkMinutes} dk`);
console.log("\nDoğrulama:", JSON.stringify(verification, null, 2));
