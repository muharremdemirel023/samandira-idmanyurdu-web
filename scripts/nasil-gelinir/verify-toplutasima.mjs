#!/usr/bin/env node
/**
 * Toplu taşıma panelindeki (config.json → toplutasima) hat/başlangıç verisini İETT ve Metro İstanbul
 * verisiyle KARŞILAŞTIRIR ve rapor üretir. config.json'a dokunmaz, listeyi değiştirmez.
 *
 * Kontroller (her başlangıç × her hat için):
 *  - Hat, başlangıç durağından (adı + 120 m çevresindeki karşı-yön durağı) sonra, AYNI YÖNDE,
 *    Samandıra Metro çevresindeki (M5 koordinatına ≤ 200 m) bir durağa uğruyor mu?
 *  - Kullanıcı listesindeki hat adı, İETT hat adıyla uyuşuyor mu?
 *  - M5: istasyon sırası, yön ve ara istasyonlar (Metro İstanbul API).
 *
 * Kullanım:
 *   node scripts/nasil-gelinir/verify-toplutasima.mjs          # yalnızca config'teki hatlar
 *   node scripts/nasil-gelinir/verify-toplutasima.mjs --full   # tüm İETT hatları (≈8 dk): listede olmayan eşleşmeleri de bulur
 * Çıktı: scripts/nasil-gelinir/dogrulama-raporu.json (+ konsol özeti)
 */
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const CONFIG_PATH = path.join(ROOT, "public", "widget", "config.json");
const REPORT_PATH = path.join(path.dirname(fileURLToPath(import.meta.url)), "dogrulama-raporu.json");
const FULL = process.argv.includes("--full");

const UA = "samandira-widget-build/1.0 (+https://www.samandiraidmanyurdu.com)";
const IETT_LINES = "https://api.ibb.gov.tr/iett/UlasimAnaVeri/HatDurakGuzergah.asmx";
const IETT_STOPS = "https://api.ibb.gov.tr/iett/ibb/ibb.asmx";
const GTFS_ROUTES =
  "https://data.ibb.gov.tr/dataset/8540e256-6df5-4719-85bc-e64e91508ede/resource/46dbe388-c8c2-45c4-ac72-c06953de56a2/download/routes.csv";
const METRO_API = "https://api.ibb.gov.tr/MetroIstanbul/api/MetroMobile/V2/";

const ARRIVAL_RADIUS_M = 200; // M5 Samandıra Merkez koordinatına bu kadar yakın duraklar "metro durağı" sayılır
const CLUSTER_M = 120; // başlangıç durağının karşı-yön eşi bu mesafede aranır
/** Başlangıç adı → İETT durak adında aranacak (aksan/büyük-küçük harf normalize) ifade. */
const ORIGIN_SEEDS = { sultanbeyli: "sultanbeyli merkez", sarigazi: "sarigazi merkez", yenidogan: "yenidogan merkez" };
/** Başlangıç adı → M5 istasyon adı (Metro İstanbul "Description"). Yalnızca doğrulama için. */
const ORIGIN_METRO = { sultanbeyli: "Sultanbeyli", sarigazi: "Sarıgazi", yenidogan: null };

const cfg = JSON.parse(await readFile(CONFIG_PATH, "utf8"));
const tp = cfg.toplutasima;
if (!tp) throw new Error("config.json içinde toplutasima bölümü yok");
const [M5_LAT, M5_LON] = tp.yurume.baslangicKoordinat;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const norm = (s) =>
  (s ?? "")
    .toLocaleLowerCase("tr-TR")
    .replace(/ı/g, "i")
    .replace(/ş/g, "s")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/[^a-z0-9 ]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
const hav = (aLat, aLon, bLat, bLon) => {
  const r = (x) => (x * Math.PI) / 180;
  const h = Math.sin(r(bLat - aLat) / 2) ** 2 + Math.cos(r(aLat)) * Math.cos(r(bLat)) * Math.sin(r(bLon - aLon) / 2) ** 2;
  return 2 * 6371000 * Math.asin(Math.sqrt(h));
};
async function withRetry(fn, tries = 4) {
  let last;
  for (let i = 0; i < tries; i++) {
    try {
      return await fn();
    } catch (e) {
      last = e;
      await sleep(700 * (i + 1));
    }
  }
  throw last;
}
const decodeXml = (s) => (s ?? "").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&amp;/g, "&");

async function soap(url, action, body) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "text/xml; charset=utf-8", SOAPAction: `"http://tempuri.org/${action}"`, "User-Agent": UA },
    body: `<?xml version="1.0" encoding="utf-8"?><soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"><soap:Body>${body}</soap:Body></soap:Envelope>`,
    signal: AbortSignal.timeout(90_000),
  });
  const text = await res.text();
  if (!res.ok || text.includes("<soap:Fault>")) throw new Error(`${action} HTTP ${res.status}`);
  return text;
}

async function lineStops(code) {
  const xml = await withRetry(() =>
    soap(IETT_STOPS, "DurakDetay_GYY", `<DurakDetay_GYY xmlns="http://tempuri.org/"><hat_kodu>${code.replace(/&/g, "&amp;")}</hat_kodu></DurakDetay_GYY>`),
  );
  const out = [];
  for (const t of xml.matchAll(/<Table>([\s\S]*?)<\/Table>/g)) {
    const p = (k) => t[1].match(new RegExp(`<${k}>([\\s\\S]*?)</${k}>`))?.[1];
    const lat = Number(p("YKOORDINATI"));
    const lon = Number(p("XKOORDINATI"));
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) continue;
    out.push({ yon: p("YON"), sira: Number(p("SIRANO")), kod: p("DURAKKODU"), ad: decodeXml(p("DURAKADI")), lat, lon });
  }
  return out;
}

async function lineNames() {
  const xml = await withRetry(() => soap(IETT_LINES, "GetHat_json", '<GetHat_json xmlns="http://tempuri.org/"><HatKodu></HatKodu></GetHat_json>'));
  const list = JSON.parse(decodeXml(xml.match(/<GetHat_jsonResult>([\s\S]*?)<\/GetHat_jsonResult>/)[1]));
  return new Map(list.map((l) => [l.SHATKODU, l.SHATADI]));
}

/** GTFS routes.csv çift kodlanmış (UTF-8→cp1252→UTF-8) gelir; alan bazında düzeltilir. */
function fixDouble(text) {
  const dec = new TextDecoder("windows-1252");
  const back = new Map();
  for (let b = 0; b < 256; b++) back.set(dec.decode(Uint8Array.of(b)), b);
  const bytes = [];
  for (const ch of text) {
    const cp = ch.codePointAt(0);
    if (cp < 128) bytes.push(cp);
    else if (back.has(ch)) bytes.push(back.get(ch));
    else if (cp <= 0x9f) bytes.push(cp);
    else return text;
  }
  try {
    return new TextDecoder("utf-8", { fatal: true }).decode(Uint8Array.from(bytes));
  } catch {
    return text;
  }
}
async function gtfsNames() {
  try {
    const r = await fetch(GTFS_ROUTES, { headers: { "User-Agent": UA }, signal: AbortSignal.timeout(120_000) });
    const rows = (await r.text()).replace(/^﻿/, "").split(/\r?\n/).slice(1);
    const m = new Map();
    for (const row of rows) {
      const [, , s, l] = row.split(";");
      if (s && !m.has(fixDouble(s))) m.set(fixDouble(s), l ? fixDouble(l) : null);
    }
    return m;
  } catch {
    return new Map();
  }
}

async function pool(items, size, worker) {
  let i = 0;
  await Promise.all(
    Array.from({ length: size }, async () => {
      while (i < items.length) await worker(items[i++]);
    }),
  );
}

// ------------------------------------------------------------------ veri toplama
const configCodes = new Set();
for (const b of tp.baslangiclar) for (const l of [...(b.otobus ?? []), ...(b.otobusDiger ?? [])]) configCodes.add(l.hat);

console.log("Hat adları alınıyor…");
const names = await lineNames();
const gtfs = await gtfsNames();
const nameOf = (code) => names.get(code) ?? gtfs.get(code) ?? null;

const codes = FULL ? new Set([...names.keys(), ...gtfs.keys(), ...configCodes]) : new Set(configCodes);
console.log(`${codes.size} hattın durakları taranıyor${FULL ? " (tam tarama, birkaç dakika)" : ""}…`);
const data = new Map();
let n = 0;
await pool([...codes], 8, async (code) => {
  try {
    data.set(code, await lineStops(code));
  } catch {
    data.set(code, null);
  }
  if (FULL && ++n % 200 === 0) console.log(`  ${n}/${codes.size}`);
});

const stopIndex = new Map();
for (const s of [...data.values()].flat().filter(Boolean)) if (!stopIndex.has(s.kod)) stopIndex.set(s.kod, s);
const allStops = [...stopIndex.values()];
const arrivalCluster = new Set(allStops.filter((s) => hav(M5_LAT, M5_LON, s.lat, s.lon) <= ARRIVAL_RADIUS_M).map((s) => s.kod));

function originCluster(id) {
  const seed = ORIGIN_SEEDS[id];
  const seeds = allStops.filter((s) => norm(s.ad).includes(seed));
  const cluster = new Set(seeds.map((s) => s.kod));
  for (const s of allStops) if (seeds.some((x) => hav(x.lat, x.lon, s.lat, s.lon) <= CLUSTER_M)) cluster.add(s.kod);
  return { seeds: seeds.map((s) => s.kod), cluster };
}

function classify(stops, origin) {
  if (!stops) return { durum: "servis-hatasi" };
  if (!stops.length) return { durum: "hat-bulunamadi", aciklama: "Durak servisinde bu hat kodu için kayıt yok" };
  const os = stops.filter((s) => origin.has(s.kod));
  const as = stops.filter((s) => arrivalCluster.has(s.kod));
  let best = null;
  for (const o of os) for (const a of as) if (o.yon === a.yon && o.sira < a.sira && (!best || a.sira - o.sira < best.durakSayisi)) best = { o, a, durakSayisi: a.sira - o.sira };
  if (best) {
    // Başlangıçtan SONRA, aynı yönde uğranan tüm metro-çevresi duraklar (her başlangıç durağı için en yakın sıradaki)
    const reach = new Map();
    for (const o of os) for (const a of as) if (o.yon === a.yon && o.sira < a.sira && !reach.has(a.kod)) reach.set(a.kod, { kod: a.kod, ad: a.ad, yon: a.yon, binisKod: o.kod, durakSayisi: a.sira - o.sira, metroKoordinatinaMetre: Math.round(hav(M5_LAT, M5_LON, a.lat, a.lon)) });
    return {
      durum: "dogrulandi",
      inisDuraklari: [...reach.values()],
      yon: best.o.yon === "G" ? "Gidiş" : "Dönüş",
      binis: { kod: best.o.kod, ad: best.o.ad },
      inis: { kod: best.a.kod, ad: best.a.ad, metroKoordinatinaMetre: Math.round(hav(M5_LAT, M5_LON, best.a.lat, best.a.lon)) },
      durakSayisi: best.durakSayisi,
    };
  }
  if (os.length && as.length) {
    return {
      durum: "yon-celiskisi",
      aciklama: "Hat hem başlangıç hem metro durağına uğruyor ama hiçbir yönde başlangıçtan SONRA metro durağı gelmiyor (ters yön).",
      baslangicDuraklari: os.map((s) => `${s.yon}#${s.sira} ${s.kod} ${s.ad}`),
      metroDuraklari: as.map((s) => `${s.yon}#${s.sira} ${s.kod} ${s.ad}`),
    };
  }
  if (os.length) return { durum: "metro-duragi-yok", aciklama: "Başlangıç durağına uğruyor, Samandıra Metro çevresinde durak yok", baslangicDuraklari: os.map((s) => `${s.yon}#${s.sira} ${s.kod} ${s.ad}`) };
  if (as.length) return { durum: "baslangic-duragi-yok", aciklama: "Samandıra Metro çevresine uğruyor, başlangıç durağı hattın güzergâhında yok", metroDuraklari: as.map((s) => `${s.yon}#${s.sira} ${s.kod} ${s.ad}`) };
  return { durum: "ikisi-de-yok", aciklama: "Ne başlangıç durağı ne metro durağı hat güzergâhında" };
}

const nameCompat = (mine, iett) => {
  if (!iett) return null;
  const a = new Set(norm(mine).split(" ").filter((t) => t.length > 2));
  const b = new Set(norm(iett).split(" ").filter((t) => t.length > 2));
  const common = [...a].filter((t) => b.has(t)).length;
  return common >= Math.min(2, a.size, b.size);
};

// ------------------------------------------------------------------ otobüs doğrulama
const report = { olusturma: new Date().toISOString(), tamTarama: FULL, hatSayisi: codes.size, arisKumesi: [...arrivalCluster].map((k) => ({ kod: k, ad: stopIndex.get(k).ad, metroKoordinatinaMetre: Math.round(hav(M5_LAT, M5_LON, stopIndex.get(k).lat, stopIndex.get(k).lon)) })), baslangiclar: {}, metro: {} };

for (const b of tp.baslangiclar) {
  const { seeds, cluster } = originCluster(b.id);
  const rows = [];
  for (const l of [...(b.otobus ?? []), ...(b.otobusDiger ?? [])]) {
    const c = classify(data.get(l.hat), cluster);
    const iettAdi = nameOf(l.hat);
    rows.push({ hat: l.hat, grup: l.grup, kullaniciAdi: l.ad, iettAdi, adUyumu: nameCompat(l.ad, iettAdi), ...c });
  }
  const listed = new Set(rows.map((r) => r.hat));
  const listedeOlmayan = FULL
    ? [...data.entries()]
        .filter(([code]) => !listed.has(code))
        .map(([code, stops]) => [code, classify(stops, cluster)])
        .filter(([, c]) => c.durum === "dogrulandi")
        .map(([code, c]) => ({ hat: code, iettAdi: nameOf(code), binis: c.binis.ad, inis: c.inis.ad, durakSayisi: c.durakSayisi }))
    : null;
  report.baslangiclar[b.id] = {
    ad: b.ad,
    baslangicDurakKumesi: [...cluster].map((k) => `${k} ${stopIndex.get(k)?.ad} (${stopIndex.get(k)?.lat}, ${stopIndex.get(k)?.lon})`),
    seedDuraklar: seeds,
    hatlar: rows,
    listedeOlmayanAmaDogrulananHatlar: listedeOlmayan,
  };
}

// ------------------------------------------------------------------ M5 doğrulama (Metro İstanbul API)
async function metroJson(op) {
  return withRetry(async () => {
    const t = await (await fetch(METRO_API + op, { headers: { "User-Agent": UA } })).text();
    if (!t) throw new Error("boş yanıt");
    return JSON.parse(t).Data;
  }, 6);
}
try {
  const stations = await metroJson("GetStations");
  const m5 = stations.filter((s) => s.LineName === "M5").sort((a, b) => a.Order - b.Order);
  report.metro.m5Istasyonlar = m5.map((s) => ({ sira: s.Order, ad: s.Description, lat: s.DetailInfo?.Latitude ?? null, lon: s.DetailInfo?.Longitude ?? null, aktif: s.IsActive }));
  const hedef = m5.find((s) => norm(s.Description) === "samandira merkez");
  report.metro.hedefIstasyon = hedef ? { sira: hedef.Order, ad: hedef.Description, lat: Number(hedef.DetailInfo.Latitude), lon: Number(hedef.DetailInfo.Longitude) } : null;
  if (hedef) {
    report.metro.kullaniciKoordinatiIleFarkMetre = Math.round(hav(M5_LAT, M5_LON, Number(hedef.DetailInfo.Latitude), Number(hedef.DetailInfo.Longitude)));
    report.metro.kullaniciKoordinatiIleAkademiKusUcusuMetre = Math.round(hav(M5_LAT, M5_LON, tp.yurume.hedefKoordinat[0], tp.yurume.hedefKoordinat[1]));
  }
  report.metro.hatAdi = (await metroJson("GetLines")).find((l) => l.Name === "M5")?.LongDescription ?? null;
  report.metro.baslangiclar = {};
  for (const b of tp.baslangiclar) {
    const station = ORIGIN_METRO[b.id];
    if (!station) continue;
    const from = m5.find((s) => norm(s.Description) === norm(station));
    if (!from || !hedef) {
      report.metro.baslangiclar[b.id] = { durum: "istasyon-bulunamadi", aranan: station };
      continue;
    }
    const dir = hedef.Order > from.Order ? "increasing" : "decreasing";
    const between = m5.filter((s) => s.Order > Math.min(from.Order, hedef.Order) && s.Order < Math.max(from.Order, hedef.Order)).sort((a, b) => (dir === "increasing" ? a.Order - b.Order : b.Order - a.Order));
    const terminalName = (dir === "increasing" ? m5[m5.length - 1] : m5[0]).Description;
    report.metro.baslangiclar[b.id] = {
      kalkis: from.Description,
      varis: hedef.Description,
      yon: `${terminalName} yönü`,
      istasyonAraligi: Math.abs(hedef.Order - from.Order),
      araIstasyonlar: between.map((s) => s.Description),
      kullaniciNotu: b.metro?.kullaniciYonNotu ?? null,
    };
  }
  // Metro hattı olmayan başlangıçlar için en yakın istasyonlar (kuş uçuşu; yalnızca bilgi)
  report.metro.enYakinIstasyonlar = {};
  for (const b of tp.baslangiclar.filter((x) => !ORIGIN_METRO[x.id])) {
    const seed = originCluster(b.id).seeds[0];
    const o = stopIndex.get(seed);
    if (!o) continue;
    report.metro.enYakinIstasyonlar[b.id] = stations
      .filter((s) => s.DetailInfo?.Latitude && s.IsActive !== false)
      .map((s) => ({ hat: s.LineName, ad: s.Description, kusUcusuMetre: Math.round(hav(o.lat, o.lon, Number(s.DetailInfo.Latitude), Number(s.DetailInfo.Longitude))) }))
      .sort((a, b) => a.kusUcusuMetre - b.kusUcusuMetre)
      .slice(0, 3);
  }
} catch (e) {
  report.metro.hata = `Metro İstanbul API'sine ulaşılamadı: ${e.message}`;
}

// ------------------------------------------------------------------ iniş durakları → akademi yürüme (OSRM foot, YALNIZCA rapor)
async function osrmFoot(from, to) {
  const url = `https://routing.openstreetmap.de/routed-foot/route/v1/foot/${from[1]},${from[0]};${to[1]},${to[0]}?overview=false`;
  const j = await withRetry(async () => (await fetch(url, { headers: { "User-Agent": UA } })).json());
  const r = j?.routes?.[0];
  return r ? { metre: Math.round(r.distance), dakika: Number((r.duration / 60).toFixed(1)) } : null;
}
report.inisDuraklariYurume = { not: "OSRM foot; yalnızca karşılaştırma. config'teki gösterilen yürüme değerleri DEĞİŞTİRİLMEDİ.", hedef: tp.yurume.hedefKoordinat, duraklar: [] };
const compare = [{ ad: "yurume.baslangic (config)", kod: null, lat: tp.yurume.baslangicKoordinat[0], lon: tp.yurume.baslangicKoordinat[1] }];
for (const k of arrivalCluster) compare.push({ ad: stopIndex.get(k).ad, kod: k, lat: stopIndex.get(k).lat, lon: stopIndex.get(k).lon });
for (const c of compare) {
  report.inisDuraklariYurume.duraklar.push({ kod: c.kod, ad: c.ad, osrm: await osrmFoot([c.lat, c.lon], tp.yurume.hedefKoordinat) });
  await sleep(300);
}

await writeFile(REPORT_PATH, JSON.stringify(report, null, 2) + "\n", "utf8");

// ------------------------------------------------------------------ konsol özeti
console.log("\n=== OTOBÜS ===");
for (const [id, b] of Object.entries(report.baslangiclar)) {
  console.log(`\n# ${b.ad}  (başlangıç durakları: ${b.baslangicDurakKumesi.join(" | ")})`);
  for (const r of b.hatlar) {
    const tail = r.durum === "dogrulandi" ? `${r.yon}: ${r.binis.kod} → ${r.inis.kod} ${r.inis.ad} (${r.durakSayisi} durak)` : `${r.aciklama ?? ""}`;
    console.log(`  ${r.durum.padEnd(20)} ${r.hat.padEnd(6)} [${r.grup}] ${tail}${r.adUyumu === false ? `   ⚠ ad farkı: "${r.kullaniciAdi}" ≠ İETT "${r.iettAdi}"` : ""}`);
  }
  if (b.listedeOlmayanAmaDogrulananHatlar) console.log("  listede olmayan ama güzergâhta doğrulananlar:", b.listedeOlmayanAmaDogrulananHatlar.map((x) => x.hat).join(", ") || "-");
}
console.log("\n=== METRO ===");
console.log(JSON.stringify(report.metro, null, 1).slice(0, 3500));
console.log(`\nRapor: ${REPORT_PATH}`);
