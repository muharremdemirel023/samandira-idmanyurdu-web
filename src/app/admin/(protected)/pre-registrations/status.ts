export const preRegistrationStatusLabels = {
  new: "Yeni Başvuru",
  called: "Arandı",
  trial_training: "Deneme Antrenmanı",
  registered: "Kayıt Oldu",
  closed: "Kapatıldı",
} as const;

export type PreRegistrationStatus = keyof typeof preRegistrationStatusLabels;
