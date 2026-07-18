import "server-only";

import { z } from "zod";

import {
  PRE_REGISTRATION_MAX_AGE,
  PRE_REGISTRATION_MIN_AGE,
  PRE_REGISTRATION_NOTE_MAX_LENGTH,
} from "@/lib/pre-registration/constants";

const currentYear = new Date().getUTCFullYear();
const minimumBirthYear = currentYear - PRE_REGISTRATION_MAX_AGE;
const maximumBirthYear = currentYear - PRE_REGISTRATION_MIN_AGE;

const preRegistrationSchema = z.object({
  guardianName: z.string().trim().min(2, "Veli adı en az 2 karakter olmalıdır.").max(100, "Veli adı en fazla 100 karakter olabilir."),
  phoneE164: z.string().regex(/^\+905\d{9}$/, "Geçerli bir Türkiye cep telefonu numarası girin."),
  studentName: z.string().trim().min(2, "Oyuncu adı en az 2 karakter olmalıdır.").max(100, "Oyuncu adı en fazla 100 karakter olabilir."),
  birthYear: z.string().trim().regex(/^\d{4}$/, "Doğum yılını dört haneli olarak girin.").transform(Number).refine(
    (year) => year >= minimumBirthYear && year <= maximumBirthYear,
    `Doğum yılı ${minimumBirthYear}–${maximumBirthYear} aralığında olmalıdır.`,
  ),
  note: z.string().trim().max(PRE_REGISTRATION_NOTE_MAX_LENGTH, `Not en fazla ${PRE_REGISTRATION_NOTE_MAX_LENGTH} karakter olabilir.`),
  consent: z.string().refine((value) => value === "on", { message: "KVKK Aydınlatma Metni'ni okuyup onaylamalısınız." }),
});

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
    guardianName: formString(formData, "guardian_name"),
    phoneE164: normalizeTurkishMobilePhone(formString(formData, "phone")),
    studentName: formString(formData, "student_name"),
    birthYear: formString(formData, "birth_year"),
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
