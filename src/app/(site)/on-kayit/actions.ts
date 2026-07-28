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

function logSupabaseError(step: string, error: unknown) {
  const err = error as {
    message?: string;
    code?: string;
    details?: string;
    hint?: string;
    stack?: string;
  };
  console.error(`[on-kayit] ${step} error.message:`, err?.message);
  console.error(`[on-kayit] ${step} error.code:`, err?.code);
  console.error(`[on-kayit] ${step} error.details:`, err?.details);
  console.error(`[on-kayit] ${step} error.hint:`, err?.hint);
  console.error(`[on-kayit] ${step} error.stack:`, err?.stack);
}

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

function istanbulDayBucket(date: Date) {
  return new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: "Europe/Istanbul",
  }).format(date);
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

  if (error) {
    console.error("Ön kayıt bildirim durumu güncellenemedi.");
    logSupabaseError("updateNotificationResult", error);
  }
}

export async function submitPreRegistration(
  _prevState: PreRegistrationFormState,
  formData: FormData,
): Promise<PreRegistrationFormState> {
  console.log("[on-kayit] 1. Server Action başladı.");
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
  console.log("[on-kayit] 3. Turnstile doğrulandı:", turnstile.success, turnstile.reason ?? "");

  if (!turnstile.success) {
    return {
      ok: false,
      message: turnstile.reason ?? "Güvenlik doğrulaması başarısız oldu.",
      fieldErrors: {},
    };
  }

  const dayBucket = istanbulDayBucket(submittedAt);
  const dedupeHash = sha256(
    `${dayBucket}|${input.phoneE164}|${input.studentName.toLocaleLowerCase("tr-TR")}|${input.birthYear}`,
  );

  try {
    const supabase = createServiceRoleClient();
    console.log("[on-kayit] 2. createServiceRoleClient başarılı.");
    const { data: existing, error: existingError } = await supabase
      .from("pre_registrations")
      .select("id")
      .eq("dedupe_hash", dedupeHash)
      .maybeSingle();

    console.log("[on-kayit] 5. Dedupe kontrolü:", { existing: Boolean(existing), existingError: existingError?.message ?? null });
    if (existingError) throw existingError;
    if (existing) {
      return {
        ok: true,
        message: "Bu başvuru bugün daha önce alınmış. Ekibimiz sizinle iletişime geçecektir.",
        fieldErrors: {},
      };
    }

    const phoneAllowed = await consumeRateLimit(sha256(`phone:${input.phoneE164}`), 86_400, 3);
    const ipAllowed = clientIp
      ? await consumeRateLimit(sha256(`ip:${clientIp}`), 900, 8)
      : true;

    console.log("[on-kayit] 4. Rate limit kontrolü:", { phoneAllowed, ipAllowed });

    if (!phoneAllowed || !ipAllowed) {
      return {
        ok: false,
        message: "Çok kısa sürede fazla başvuru gönderildi. Lütfen daha sonra tekrar deneyin.",
        fieldErrors: {},
      };
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
    console.log("[on-kayit] 6. INSERT payload:", insertPayload);

    const { data: registration, error } = await supabase
      .from("pre_registrations")
      .insert(insertPayload)
      .select("id")
      .single();

    console.log("[on-kayit] 7. INSERT sonucu:", {
      id: registration?.id ?? null,
      error: error?.message ?? null,
      code: error?.code ?? null,
    });

    if (error) {
      if (error.code === "23505") {
        return { ok: true, message: successMessage, fieldErrors: {} };
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

    console.log("[on-kayit] 8. Bildirim fonksiyonu after() ile kuyruğa alındı.");
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

    console.log("[on-kayit] 9. Return: başarılı.");
    return { ok: true, message: successMessage, fieldErrors: {} };
  } catch (error) {
    console.error("Ön kayıt oluşturulamadı.");
    logSupabaseError("submitPreRegistration", error);
    console.log("[on-kayit] 9. Return: hata.");
    return {
      ok: false,
      message: "Ön kayıt şu anda alınamıyor. Lütfen daha sonra tekrar deneyin.",
      fieldErrors: {},
    };
  }
}
