"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

const fields = [
  "academy_name",
  "academy_short_name",
  "phone",
  "whatsapp",
  "email",
  "address",
  "maps_url",
  "instagram_url",
  "working_hours",
  "header_logo_url",
  "footer_logo_url",
  "footer_description",
  "seo_title",
  "seo_description",
  "canonical_url",
] as const;

export async function saveSiteSettings(formData: FormData) {
  const supabase = await createClient();

  const payload: Record<string, string | number | null> = { id: 1 };
  for (const field of fields) {
    const value = String(formData.get(field) || "").trim();
    payload[field] = value || null;
  }
  payload.updated_at = new Date().toISOString();

  const { error } = await supabase.from("site_settings").upsert(payload);

  if (error) {
    throw new Error("Site ayarları kaydedilemedi.");
  }

  revalidatePath("/admin/settings");
  revalidatePath("/", "layout");
  redirect("/admin/settings?saved=1");
}
