# "Biz Neredeyiz?" widget'ı

Dosyalar (hepsi bu klasörde): `nasil-gelinir.js`, `nasil-gelinir.css`, `config.json`, `vendor/` (Leaflet 1.9.4, yerel).
Betikler: `scripts/nasil-gelinir/` (`fetch-transit.mjs`, `verify-toplutasima.mjs`, `compute-yurume.mjs`).

## Ekleme / kaldırma
`src/app/(site)/layout.tsx` içinde tek satır:
`<Script src="/widget/nasil-gelinir.js" strategy="lazyOnload" />` (+ `import Script from "next/script"`).
Kaldırmak için o satırı silin; başka hiçbir dosya widget'a bağlı değildir.

## İçerik
Adres, telefon, saatler, koordinat: `config.json` → `academy`.
Açılma gecikmesi: `behavior.openDelayMs`. Rota önizlemeyi kapatmak: `routing.carPreview.enabled=false`.

## Toplu taşıma paneli (`config.json` → `toplutasima`)
- `varis`: ortak iniş bilgisi (panelde "… durağında inin" metnini besler).
- `baslangiclar[]`: `id`, `ad`, `koordinat` (Google Haritalar bağlantısının başlangıcı), `otobus[]`, `otobusDiger[]`
  ("Diğer hatlar" altında, varsayılan kapalı), `metro` (yoksa `null` → metro sekmesi çıkmaz).
- Hat kaydı: `hat`, `ad`, `grup` (`ana|yan|besleme|ikincil`), `not`, `dogrulandi` (arayüzde GÖSTERİLMEZ).
  Bir hattı panelden gizlemek için kayda `"gizle": true` ekleyin (silmeden).
- `yurume`: `mesafeMetre` / `sureDakika` dolu ise gösterilir; `null` ise "Yürüme süresi için Google Haritalar'da aç" düğmesi çıkar.
  Gerçek yürüme rotasıyla doldurmak: `node scripts/nasil-gelinir/compute-yurume.mjs`.
- Hat/sefer saati veya süre arayüzde yalnızca config'teki veriden gelir; uydurma yoktur.

## Doğrulama ve veri yenileme
- `node scripts/nasil-gelinir/verify-toplutasima.mjs [--full]` → `scripts/nasil-gelinir/dogrulama-raporu.json`
  (İETT yön/durak kontrolü, M5 istasyon sırası). config.json'u DEĞİŞTİRMEZ.
- `node scripts/nasil-gelinir/fetch-transit.mjs` → `transit`, `metro`, `walking`, `_build` alanlarını yeniler
  (eski "akademiye en yakın duraklar" verisi; şu an arayüzde kullanılmıyor).
Sayfa açılışında canlı sorgu yoktur.
