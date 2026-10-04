export type CookieConsentRecord = {
  version: string;
  analytics: boolean;
  marketing: boolean;
  decidedAt: string;
};

export const COOKIE_CONSENT_STORAGE_KEY = "siy_cookie_consent";
export const COOKIE_CONSENT_COOKIE_NAME = "cc_consent";
export const COOKIE_CONSENT_VERSION = "2026-01";
export const COOKIE_CONSENT_MAX_AGE_SECONDS = 60 * 60 * 24 * 180;

export type CookieCategoryKey = "necessary" | "analytics" | "marketing";

export const cookieCategories: Array<{
  key: CookieCategoryKey;
  title: string;
  description: string;
  locked: boolean;
}> = [
  {
    key: "necessary",
    title: "Zorunlu",
    description:
      "Sitenin çalışması, admin oturumu ve ön kayıt formunun güvenliği için gereklidir. Kapatılamaz.",
    locked: true,
  },
  {
    key: "analytics",
    title: "Analitik",
    description: "Google Analytics ile ziyaret istatistiklerini ölçmemizi sağlar.",
    locked: false,
  },
  {
    key: "marketing",
    title: "Pazarlama",
    description:
      "Meta Pixel, Instagram ve YouTube içeriklerini ve kampanya ölçümlerini etkinleştirir.",
    locked: false,
  },
];
