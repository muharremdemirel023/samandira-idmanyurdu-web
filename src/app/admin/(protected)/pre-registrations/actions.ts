"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

import {
  preRegistrationStatusLabels,
  type PreRegistrationStatus,
} from "@/app/admin/(protected)/pre-registrations/status";

export async function updatePreRegistrationStatus(id: string, formData: FormData) {
  const status = String(formData.get("status") || "new") as PreRegistrationStatus;

  if (!(status in preRegistrationStatusLabels)) {
    throw new Error("Geçersiz başvuru durumu.");
  }

  const supabase = await createClient();
  const { error } = await supabase.from("pre_registrations").update({ status }).eq("id", id);

  if (error) {
    throw new Error("Başvuru durumu güncellenemedi.");
  }

  revalidatePath("/admin/pre-registrations");
}
