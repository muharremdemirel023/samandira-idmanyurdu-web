import "server-only";

import { z } from "zod";

import {
  PRE_REGISTRATION_EMAIL_MAX_LENGTH,
  PRE_REGISTRATION_MAX_AGE,
  PRE_REGISTRATION_MIN_AGE,
  PRE_REGISTRATION_NOTE_MAX_LENGTH,
  preRegistrationCampaignLabels,
} from "@/lib/pre-registration/constants";

const currentYear = new Date().getUTCFullYear();
const minimumBirthYear = currentYear - PRE_REGISTRATION_MAX_AGE;
const maximumBirthYear = currentYear - PRE_REGISTRATION_MIN_AGE;

// Basit ve yanlis negatif uretmeyen bicim kontrolu; sunucu ve istemci ayni kurali kullanir.
const emailPattern = /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/;

const birthYearField = (label: string) =>
  z.string().trim().regex(/^\d{4}$/, `${label} dört haneli olarak girin.`).transform(Number).refine(
    (year) => year >= minimumBirthYear && year <= maximumBirthYear,
    `${label} ${minimumBirthYear}–${maximumBirthYear} aralığında olmalıdır.`,
  );

const preRegistrationSchema = z
  .object({
    campaignType: z.enum(
      Object.keys(preRegistrationCampaignLabels) as [
        keyof typeof preRegistrationCampaignLabels,
        ...Array<keyof typeof preRegistrationCampaignLabels>,
      ],
      { message: "Lütfen bir kampanya seçin." },
    ),
    guardianName: z.string().trim().min(2, "Veli adı en az 2 karakter olmalıdır.").max(100, "Veli adı en fazla 100 karakter olabilir."),
    phoneE164: z.string().regex(/^\+905\d{9}$/, "Geçerli bir Türkiye cep telefonu numarası girin."),
    email: z
      .string()
      .trim()
      .toLowerCase()
      .min(1, "E-posta adresi zorunludur.")
      .max(PRE_REGISTRATION_EMAIL_MAX_LENGTH, `E-posta adresi en fazla ${PRE_REGISTRATION_EMAIL_MAX_LENGTH} karakter olabilir.`)
      .regex(emailPattern, "Geçerli bir e-posta adresi girin."),
    studentName: z.string().trim().min(2, "Oyuncu adı en az 2 karakter olmalıdır.").max(100, "Oyuncu adı en fazla 100 karakter olabilir."),
    birthYear: birthYearField("Doğum yılını"),
    student2Name: z.string().trim().max(100, "Oyuncu adı en fazla 100 karakter olabilir.").optional().default(""),
    student2BirthYear: z.string().trim().optional().default(""),
    note: z.string().trim().max(PRE_REGISTRATION_NOTE_MAX_LENGTH, `Not en fazla ${PRE_REGISTRATION_NOTE_MAX_LENGTH} karakter olabilir.`),
    consent: z.string().refine((value) => value === "on", { message: "KVKK Aydınlatma Metni'ni okuyup onaylamalısınız." }),
  })
  .superRefine((value, ctx) => {
    if (value.campaignType !== "friend_20") return;

    if (value.student2Name.trim().length < 2) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["student2Name"],
        message: "2. Öğrenci adı en az 2 karakter olmalıdır.",
      });
    }

    if (!/^\d{4}$/.test(value.student2BirthYear.trim())) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["student2BirthYear"],
        message: "2. Öğrenci doğum yılını dört haneli olarak girin.",
      });
      return;
    }

    const year = Number(value.student2BirthYear.trim());
    if (year < minimumBirthYear || year > maximumBirthYear) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["student2BirthYear"],
        message: `2. Öğrenci doğum yılı ${minimumBirthYear}–${maximumBirthYear} aralığında olmalıdır.`,
      });
    }
  })
  .transform((value) => ({
    ...value,
    student2Name: value.campaignType === "friend_20" ? value.student2Name.trim() : "",
    student2BirthYear:
      value.campaignType === "friend_20" && /^\d{4}$/.test(value.student2BirthYear.trim())
        ? Number(value.student2BirthYear.trim())
        : null,
  }));

export type PreRegistrationInput = z.infer<typeof preRegistrationSchema>;

function formString(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

export function normalizeTurkishMobilePhone(value: string) {
  let digits = value.replace(/\D/g, "");
  if (digits.startsWith("0090")) digits = digits.slice(2);
  if (digits.startsWith("90") && digits.length === 12) return `+${digits}`;
  if (digits.startsWith("0") && digits.length === 11) digits = digits.slice(1);
  if (digits.length === 10 && digits.startsWith("5")) return `+90${digits}`;
  return value.trim();
}

export function validatePreRegistrationForm(formData: FormData) {
  return preRegistrationSchema.safeParse({
    campaignType: formString(formData, "campaign_type"),
    guardianName: formString(formData, "guardian_name"),
    phoneE164: normalizeTurkishMobilePhone(formString(formData, "phone")),
    email: formString(formData, "email"),
    studentName: formString(formData, "student_name"),
    birthYear: formString(formData, "birth_year"),
    student2Name: formString(formData, "student2_name"),
    student2BirthYear: formString(formData, "student2_birth_year"),
    note: formString(formData, "note"),
    consent: formString(formData, "privacy_consent"),
  });
}

export function readHoneypot(formData: FormData) {
  return formString(formData, "website").trim();
}

export function readTurnstileToken(formData: FormData) {
  return formString(formData, "cf-turnstile-response").trim();
}
