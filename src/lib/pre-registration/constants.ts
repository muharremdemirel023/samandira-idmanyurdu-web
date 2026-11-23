export const PRE_REGISTRATION_PRIVACY_VERSION = "2026-07-19";
export const PRE_REGISTRATION_NOTE_MAX_LENGTH = 1000;
export const PRE_REGISTRATION_EMAIL_MAX_LENGTH = 254;
export const PRE_REGISTRATION_MIN_AGE = 5;
export const PRE_REGISTRATION_MAX_AGE = 20;

/**
 * Tüm kampanya türlerinin etiket sözlüğü.
 * online_15 yalnızca geçmiş kayıtların görüntülenmesi için korunmuştur;
 * yeni başvurularda kabul edilmez (bkz. ACCEPTED_NEW_CAMPAIGN_TYPES).
 */
export const preRegistrationCampaignLabels = {
  online_15: "%15 Online Kayıt İndirimi",
  friend_20: "%20 Arkadaşını Getir Kampanyası",
  winter_monthly: "Kış Kampanyası · Aylık Paket",
  winter_biannual: "Kış Kampanyası · 6 Aylık Peşin Paket",
  winter_annual: "Kış Kampanyası · 12 Aylık Peşin Paket",
} as const;

export type PreRegistrationCampaignType = keyof typeof preRegistrationCampaignLabels;

/** Yeni başvurularda geçerli kampanya tipleri — online_15 dahil değildir. */
export const ACCEPTED_NEW_CAMPAIGN_TYPES = [
  "friend_20",
  "winter_monthly",
  "winter_biannual",
  "winter_annual",
] as const satisfies ReadonlyArray<PreRegistrationCampaignType>;

export type NewCampaignType = (typeof ACCEPTED_NEW_CAMPAIGN_TYPES)[number];

export type WinterPackageId = "winter_monthly" | "winter_biannual" | "winter_annual";

export type WinterPackage = {
  id: WinterPackageId;
  /** Kısa paket adı (kart başlığı ve form özeti). */
  name: string;
  /** Kart üst etiketi. */
  badge: string;
  /** Kayıt gününde ödenen toplam tutar (TL). */
  registrationDayTotal: number;
  /** Antrenman bedeli: aylıkta ilk ay, diğerlerinde tüm dönem (TL). */
  trainingFee: number;
  /** İkinci aydan itibaren aylık aidat; yalnızca aylık paket için dolu. */
  monthlyFeeAfter: number | null;
  /** Form header'ında gösterilen ödeme koşulu. */
  paymentCondition: string;
  /** E-posta şablonunda kullanılan ödeme koşulu. */
  emailPaymentCondition: string;
  /** Altı aylık kart için kulüp turuncusu vurgusu. */
  highlighted: boolean;
};

export const WINTER_PACKAGES: Record<WinterPackageId, WinterPackage> = {
  winter_monthly: {
    id: "winter_monthly",
    name: "Aylık Paket",
    badge: "İlk aya özel",
    registrationDayTotal: 12_000,
    trainingFee: 3_000,
    monthlyFeeAfter: 4_500,
    paymentCondition: "Tek ödeme · ikinci aydan 4.500 TL/ay",
    emailPaymentCondition: "Tek ödeme",
    highlighted: false,
  },
  winter_biannual: {
    id: "winter_biannual",
    name: "6 Aylık Peşin Paket",
    badge: "Bir ay bizden",
    registrationDayTotal: 31_500,
    trainingFee: 22_500,
    monthlyFeeAfter: null,
    paymentCondition: "Tek ödeme",
    emailPaymentCondition: "Tek ödeme",
    highlighted: true,
  },
  winter_annual: {
    id: "winter_annual",
    name: "12 Aylık Peşin Paket",
    badge: "En düşük aylık aidat",
    registrationDayTotal: 51_000,
    trainingFee: 42_000,
    monthlyFeeAfter: null,
    paymentCondition: "Tek ödeme",
    emailPaymentCondition: "Tek ödeme",
    highlighted: false,
  },
};

/**
 * Bildirim e-postalarında kullanılan kampanya etiketi.
 * Kış paketleri için "<ad> · X TL · Tek ödeme"
 * biçiminde döner; diğer tipler için standart etiketi kullanır.
 */
export function resolveCampaignEmailLabel(campaignType: PreRegistrationCampaignType): string {
  if (
    campaignType === "winter_monthly" ||
    campaignType === "winter_biannual" ||
    campaignType === "winter_annual"
  ) {
    const pkg = WINTER_PACKAGES[campaignType];
    return `${pkg.name} · ${pkg.registrationDayTotal.toLocaleString("tr-TR")} TL · ${pkg.emailPaymentCondition}`;
  }
  return preRegistrationCampaignLabels[campaignType] ?? campaignType;
}
