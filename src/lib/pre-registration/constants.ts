export const PRE_REGISTRATION_PRIVACY_VERSION = "2026-07-19";
export const PRE_REGISTRATION_NOTE_MAX_LENGTH = 1000;
export const PRE_REGISTRATION_EMAIL_MAX_LENGTH = 254;
export const PRE_REGISTRATION_MIN_AGE = 5;
export const PRE_REGISTRATION_MAX_AGE = 20;

export const preRegistrationCampaignLabels = {
  online_15: "%15 Online Kayıt İndirimi",
  friend_20: "%20 Arkadaşını Getir Kampanyası",
} as const;

export type PreRegistrationCampaignType = keyof typeof preRegistrationCampaignLabels;
