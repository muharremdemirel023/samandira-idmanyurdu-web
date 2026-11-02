/**
 * TFF İstanbul İl Temsilciliği resmî veri kaynağı.
 * Yalnızca kulüp ve lig kimliği (slug) sabittir; sezon, lig id'si ve grup
 * her senkronizasyonda TFF sayfasından okunur.
 */
export const tffSourceConfig = {
  sourceLabel: "TFF İstanbul İl Temsilciliği",
  origin: "https://tffistanbul.org",
  clubPath: "/kulup/samandira-idmanyurdu-spor-kulubu/2143",
  leagueSlug: "u11-ligi",
  /** robots.txt eşleşmesi için de kullanılan, kendini açıkça tanıtan istemci kimliği. */
  userAgentToken: "SamandiraIdmanyurduWeb",
  userAgent:
    "SamandiraIdmanyurduWeb/1.0 (+https://www.samandiraidmanyurdu.com; gunluk fikstur senkronizasyonu)",
  requestTimeoutMs: 15_000,
  maxResponseBytes: 2_000_000,
  /** Aynı senkronizasyondaki ardışık istekler arasındaki bekleme. */
  politeDelayMs: 1_500,
  /** Bu süre içinde başarılı senkronizasyon varsa TFF'ye yeniden istek atılmaz. */
  minSuccessIntervalHours: 12,
  /** Bu süreden eski "running" kaydı yarıda kalmış sayılır ve kilidi bırakılır (maxDuration 60 sn'den uzun). */
  runningLockMinutes: 10,
} as const;
