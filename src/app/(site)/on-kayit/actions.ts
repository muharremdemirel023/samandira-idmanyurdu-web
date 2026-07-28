"use server";

import "server-only";

import { createHash, randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { cookies, headers } from "next/headers";
import { after } from "next/server";

import type { PreRegistrationFormState } from "@/app/(site)/on-kayit/form-state";
import { sendPreRegistrationNotification } from "@/lib/email/pre-registration-notification";
import { PRE_REGISTRATION_PRIVACY_VERSION } from "@/lib/pre-registration/constants";
import {
  readHoneypot,
  readTurnstileToken,
  validatePreRegistrationForm,
} from "@/lib/pre-registration/validation";
import { verifyTurnstile } from "@/lib/pre-registration/turnstile";
import { createServiceRoleClient } from "@/lib/supabase/service-role";

const successMessage =
  "Ön kaydınız başarıyla alındı. Ekibimiz en kısa sürede sizinle iletişime geçecektir.";

function sha256(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

function getClientIp(requestHeaders: Headers) {
  return (
    requestHeaders.get("cf-connecting-ip") ??
    requestHeaders.get("x-real-ip") ??
    requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    ""
  );
}

// Rate limit / dedupe pencereleri (saniye).
const PHONE_RATE_WINDOW_SECONDS = 600; // 10 dk
const PHONE_RATE_MAX_ATTEMPTS = 2;
const IP_RATE_WINDOW_SECONDS = 600; // 10 dk
const IP_RATE_MAX_ATTEMPTS = 5;
const DUPLICATE_WINDOW_SECONDS = 1800; // 30 dk: aynı telefon + aynı öğrenci

const duplicateMessage = "Bu öğrenci için başvurunuz kısa süre önce alınmıştır.";
const rateLimitMessage =
  "Kısa sürede çok fazla başvuru gönderildi. Lütfen birkaç dakika sonra tekrar deneyin.";

function duplicateBucket(date: Date) {
  return Math.floor(date.getTime() / (DUPLICATE_WINDOW_SECONDS * 1000));
}

async function consumeRateLimit(keyHash: string, windowSeconds: number, maxAttempts: number) {
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase.rpc("consume_pre_registration_rate_limit", {
    p_key_hash: keyHash,
    p_window_seconds: windowSeconds,
    p_max_attempts: maxAttempts,
  });

  if (error) throw error;
  return data === true;
}

async function updateNotificationResult(
  id: string,
  input: Parameters<typeof sendPreRegistrationNotification>[0],
) {
  const result = await sendPreRegistrationNotification(input);
  const supabase = createServiceRoleClient();
  const { error } = await supabase
    .from("pre_registrations")
    .update({
      notification_status: result.status,
      notification_attempts: result.attempts,
      notification_last_error: result.error ?? null,
      notification_sent_at: result.status === "sent" ? new Date().toISOString() : null,
    })
    .eq("id", id);

  if (error) console.error("Ön kayıt bildirim durumu güncellenemedi.", error);
}

export async function submitPreRegistration(
  _prevState: PreRegistrationFormState,
  formData: FormData,
): Promise<PreRegistrationFormState> {
  // Honeypot'u dolduran otomasyonlara veri yazmadan başarılı cevap verilir.
  if (readHoneypot(formData)) {
    return { ok: true, message: successMessage, fieldErrors: {} };
  }

  const validation = validatePreRegistrationForm(formData);

  if (!validation.success) {
    return {
      ok: false,
      message: "Lütfen işaretli alanları kontrol edin.",
      fieldErrors: validation.error.flatten().fieldErrors,
    };
  }

  const input = validation.data;
  const submittedAt = new Date();
  const requestHeaders = await headers();
  const clientIp = getClientIp(requestHeaders);
  const turnstile = await verifyTurnstile(readTurnstileToken(formData), clientIp || undefined);

  if (!turnstile.success) {
    return {
      ok: false,
      message: turnstile.reason ?? "Güvenlik doğrulaması başarısız oldu.",
      fieldErrors: {},
    };
  }

  // Aynı telefon + aynı öğrenci adı: 30 dk pencerede tek kayıt.
  const studentKey = input.studentName.toLocaleLowerCase("tr-TR").trim();
  const dedupeHash = sha256(
    `${duplicateBucket(submittedAt)}|${input.phoneE164}|${studentKey}`,
  );

  try {
    const supabase = createServiceRoleClient();
    const { data: existing, error: existingError } = await supabase
      .from("pre_registrations")
      .select("id")
      .eq("dedupe_hash", dedupeHash)
      .maybeSingle();

    if (existingError) throw existingError;
    if (existing) {
      return { ok: false, message: duplicateMessage, fieldErrors: {} };
    }

    // Aynı veli telefonu farklı kardeşler için kullanılabilir: 10 dk'da 2 başvuru.
    const phoneAllowed = await consumeRateLimit(
      sha256(`phone:${input.phoneE164}`),
      PHONE_RATE_WINDOW_SECONDS,
      PHONE_RATE_MAX_ATTEMPTS,
    );
    // Aynı IP'den farklı veliler başvurabilir: 10 dk'da 5 başvuru.
    const ipAllowed = clientIp
      ? await consumeRateLimit(sha256(`ip:${clientIp}`), IP_RATE_WINDOW_SECONDS, IP_RATE_MAX_ATTEMPTS)
      : true;

    if (!phoneAllowed || !ipAllowed) {
      return { ok: false, message: rateLimitMessage, fieldErrors: {} };
    }

    // Kayan 30 dk pencerede aynı telefon + aynı öğrenci tekrarını yakala
    // (bucket sınırını aşan tekrar denemeler için ek güvence).
    const duplicateAllowed = await consumeRateLimit(
      sha256(`dup:${input.phoneE164}|${studentKey}`),
      DUPLICATE_WINDOW_SECONDS,
      1,
    );

    if (!duplicateAllowed) {
      return { ok: false, message: duplicateMessage, fieldErrors: {} };
    }

    const insertPayload = {
      guardian_name: input.guardianName,
      phone_e164: input.phoneE164,
      student_name: input.studentName,
      birth_year: input.birthYear,
      note: input.note || null,
      consent_at: submittedAt.toISOString(),
      privacy_version: PRE_REGISTRATION_PRIVACY_VERSION,
      source: "web",
      dedupe_hash: dedupeHash,
      notification_status: "pending",
    };

    const { data: registration, error } = await supabase
      .from("pre_registrations")
      .insert(insertPayload)
      .select("id")
      .single();

    if (error) {
      if (error.code === "23505") {
        return { ok: false, message: duplicateMessage, fieldErrors: {} };
      }
      throw error;
    }

    const notificationInput = {
      guardianName: input.guardianName,
      phone: input.phoneE164,
      studentName: input.studentName,
      birthYear: String(input.birthYear),
      note: input.note,
      submittedAt,
    };

    after(() => updateNotificationResult(registration.id, notificationInput));

    const cookieStore = await cookies();
    cookieStore.set("pre_registration_conversion", randomUUID(), {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 10 * 60,
      path: "/tesekkurler",
    });

    revalidatePath("/admin");
    revalidatePath("/admin/pre-registrations");

    return { ok: true, message: successMessage, fieldErrors: {} };
  } catch (error) {
    console.error("Ön kayıt oluşturulamadı.", error);
    return {
      ok: false,
      message: "Ön kayıt şu anda alınamıyor. Lütfen daha sonra tekrar deneyin.",
      fieldErrors: {},
    };
  }
}
