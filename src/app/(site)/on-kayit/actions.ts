"use server";

import { sendPreRegistrationNotification } from "@/lib/email/pre-registration-notification";
import { createClient } from "@/lib/supabase/server";

import type { PreRegistrationFormState } from "@/app/(site)/on-kayit/form-state";

function readFormValue(formData: FormData, names: string[]) {
  for (const name of names) {
    const value = formData.get(name);

    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return "";
}

async function insertPreRegistration(input: {
  guardianName: string;
  phone: string;
  studentName: string;
  birthYear: string;
  note: string;
}) {
  const supabase = await createClient();
  const birthYearNumber = Number.parseInt(input.birthYear, 10);
  const birthYearValue = Number.isNaN(birthYearNumber) ? input.birthYear : birthYearNumber;

  const payloads: Record<string, string | number>[] = [
    {
      guardian_name: input.guardianName,
      phone: input.phone,
      student_name: input.studentName,
      birth_year: birthYearValue,
      note: input.note,
    },
    {
      parent_name: input.guardianName,
      phone: input.phone,
      player_name: input.studentName,
      birth_year: birthYearValue,
      note: input.note,
    },
    {
      parent_name: input.guardianName,
      phone: input.phone,
      child_name: input.studentName,
      birth_year: birthYearValue,
      notes: input.note,
    },
  ];

  let lastError: unknown = null;

  for (const payload of payloads) {
    const { error } = await supabase.from("pre_registrations").insert(payload);

    if (!error) {
      return;
    }

    lastError = error;
  }

  throw lastError;
}

async function handlePreRegistration(formData: FormData): Promise<PreRegistrationFormState> {
  const guardianName = readFormValue(formData, ["guardian_name", "parent_name", "veli_adi"]);
  const phone = readFormValue(formData, ["phone", "telefon"]);
  const studentName = readFormValue(formData, ["student_name", "player_name", "child_name", "ogrenci_adi"]);
  const birthYear = readFormValue(formData, ["birth_year", "dogum_yili"]);
  const note = readFormValue(formData, ["note", "notes", "message", "not"]);
  const submittedAt = new Date();

  if (!guardianName || !phone || !studentName || !birthYear) {
    return {
      ok: false,
      message: "Lütfen zorunlu alanları eksiksiz doldurun.",
    };
  }

  try {
    await insertPreRegistration({
      guardianName,
      phone,
      studentName,
      birthYear,
      note,
    });
  } catch {
    return {
      ok: false,
      message: "Ön kayıt alınamadı. Lütfen daha sonra tekrar deneyin.",
    };
  }

  try {
    await sendPreRegistrationNotification({
      guardianName,
      phone,
      studentName,
      birthYear,
      note,
      submittedAt,
    });
  } catch (error) {
    console.error("Ön kayıt e-posta bildirimi gönderilemedi.", error);
  }

  return {
    ok: true,
    message: "Ön kaydınız başarıyla alındı. Ekibimiz en kısa sürede sizinle iletişime geçecektir.",
  };
}

export async function submitPreRegistration(
  _prevState: PreRegistrationFormState,
  formData: FormData,
) {
  return handlePreRegistration(formData);
}

export async function createPreRegistration(
  _prevState: PreRegistrationFormState,
  formData: FormData,
) {
  return handlePreRegistration(formData);
}

export async function createPreRegistrationAction(
  _prevState: PreRegistrationFormState,
  formData: FormData,
) {
  return handlePreRegistration(formData);
}

export async function submitPreRegistrationAction(
  _prevState: PreRegistrationFormState,
  formData: FormData,
) {
  return handlePreRegistration(formData);
}

export async function savePreRegistration(
  _prevState: PreRegistrationFormState,
  formData: FormData,
) {
  return handlePreRegistration(formData);
}
