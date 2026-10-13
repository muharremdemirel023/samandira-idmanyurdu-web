#!/usr/bin/env node
/**
 * config.json → toplutasima.yurume için OSRM foot rotasını (OpenStreetMap verisi) çeker ve YALNIZCA
 * haritadaki noktalı çizgi için `yol` alanına yazar. Ekranda gösterilen mesafeMetre / sureDakika / kaynak
 * alanlarına DOKUNMAZ (onlar elle, doğrulanmış değerlerdir).
 *
 * Güvenlik kontrolü: OSRM uzunluğu config'teki mesafeMetre'den %20'den fazla sapıyorsa hiçbir şey
 * yazılmaz, fark raporlanır (çıkış kodu 2).
 * OSRM mesafe/süresi denetim için yolOsrmMetre / yolOsrmDakika olarak saklanır; arayüz bunları göstermez.
 *
 * Kullanım: node scripts/nasil-gelinir/compute-yurume.mjs
 */
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const CONFIG_PATH = path.join(ROOT, "public", "widget", "config.json");
const ROUTER = "https://routing.openstreetmap.de/routed-foot/route/v1/foot";
const TOLERANCE = 0.2;

const cfg = JSON.parse(await readFile(CONFIG_PATH, "utf8"));
const y = cfg.toplutasima?.yurume;
if (!y?.baslangicKoordinat || !y?.hedefKoordinat) throw new Error("toplutasima.yurume koordinatları eksik");

const [aLat, aLon] = y.baslangicKoordinat;
const [bLat, bLon] = y.hedefKoordinat;
const url = `${ROUTER}/${aLon},${aLat};${bLon},${bLat}?overview=full&geometries=geojson`;

let json;
for (let i = 0; i < 4; i++) {
  try {
    const r = await fetch(url, { headers: { "User-Agent": "samandira-widget-build/1.0" }, signal: AbortSignal.timeout(30_000) });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    json = await r.json();
    break;
  } catch (e) {
    if (i === 3) throw e;
    await new Promise((res) => setTimeout(res, 1000 * (i + 1)));
  }
}
const route = json?.routes?.[0];
if (json?.code !== "Ok" || !route) throw new Error(`OSRM yanıtı geçersiz: ${json?.code}`);

const osrmM = Math.round(route.distance);
const osrmMin = Math.max(1, Math.round(route.duration / 60));
if (y.mesafeMetre != null) {
  const dev = Math.abs(osrmM - y.mesafeMetre) / y.mesafeMetre;
  if (dev > TOLERANCE) {
    console.error(`OSRM ${osrmM} m, config ${y.mesafeMetre} m → sapma %${(dev * 100).toFixed(1)} (> %${TOLERANCE * 100}). Hiçbir şey yazılmadı.`);
    process.exit(2);
  }
  console.log(`Sapma: %${(dev * 100).toFixed(1)} (OSRM ${osrmM} m / ${osrmMin} dk, config ${y.mesafeMetre} m / ${y.sureDakika} dk) — tolerans içinde.`);
}

/** [lat, lon] çiftleri; yalnızca çizgi çizimi için */
y.yol = route.geometry.coordinates.map(([x, yy]) => [Number(yy.toFixed(5)), Number(x.toFixed(5))]);
y.yolOsrmMetre = osrmM;
y.yolOsrmDakika = osrmMin;
y.yolKaynak = `OSRM foot profili (routing.openstreetmap.de, OpenStreetMap verisi), ${new Date().toISOString().slice(0, 10)} — yalnızca çizgi için`;

await writeFile(CONFIG_PATH, JSON.stringify(cfg, null, 2) + "\n", "utf8");
console.log(`yol yazıldı (${y.yol.length} nokta). Ekranda gösterilen değerler değişmedi: ${y.mesafeMetre} m / ${y.sureDakika} dk.`);
