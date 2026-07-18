"use server";

import "server-only";

import { revalidatePath } from "next/cache";

import {
  preRegistrationStatusLabels,
  type PreRegistrationStatus,
} from "@/app/admin/(protected)/pre-registrations/status";
import { requireAdmin } from "@/lib/auth/admin";
import { sendPreRegistrationNotification } from "@/lib/email/pre-registration-notification";

function assertUuid(value: string) {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)) {
    throw new Error("Geçersiz başvuru kimliği.");
  }
}

export async function updatePreRegistrationStatus(id: string, formData: FormData) {
  assertUuid(id);
  const status = String(formData.get("status") || "new") as PreRegistrationStatus;
  if (!(status in preRegistrationStatusLabels)) throw new Error("Geçersiz başvuru durumu.");

  const { supabase } = await requireAdmin();
  const { error } = await supabase
    .from("pre_registrations")
    .update({ status })
    .eq("id", id)
    .select("id")
    .single();

  if (error) throw new Error("Başvuru durumu güncellenemedi.");
  revalidatePath("/admin");
  revalidatePath("/admin/pre-registrations");
}

export async function resendPreRegistrationNotification(id: string) {
  assertUuid(id);
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase
    .from("pre_registrations")
    .select("guardian_name,phone_e164,student_name,birth_year,note,created_at")
    .eq("id", id)
    .single();

  if (error || !data) throw new Error("Başvuru bulunamadı.");

  const result = await sendPreRegistrationNotification({
    guardianName: data.guardian_name,
    phone: data.phone_e164,
    studentName: data.student_name,
    birthYear: String(data.birth_year),
    note: data.note ?? "",
    submittedAt: new Date(data.created_at),
  });

  const { error: updateError } = await supabase
    .from("pre_registrations")
    .update({
      notification_status: result.status,
      notification_attempts: result.attempts,
      notification_last_error: result.error ?? null,
      notification_sent_at: result.status === "sent" ? new Date().toISOString() : null,
    })
    .eq("id", id)
    .select("id")
    .single();

  if (updateError) throw new Error("Bildirim sonucu kaydedilemedi.");
  revalidatePath("/admin/pre-registrations");
}
