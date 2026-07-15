"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

const fields = [
  "hero_overline",
  "hero_headline",
  "hero_lead",
  "cta_primary_label",
  "cta_primary_href",
  "cta_secondary_label",
  "cta_secondary_href",
  "fees_title",
  "fees_subtitle",
  "staff_title",
  "staff_subtitle",
  "instagram_title",
  "instagram_subtitle",
  "news_title",
  "news_subtitle",
] as const;

export async function saveHomeContent(formData: FormData) {
  const supabase = await createClient();

  const payload: Record<string, string | number | null> = { id: 1 };
  for (const field of fields) {
    const value = String(formData.get(field) || "").trim();
    payload[field] = value || null;
  }
  payload.updated_at = new Date().toISOString();

  const { error } = await supabase.from("home_content").upsert(payload);

  if (error) {
    throw new Error("Ana sayfa içerikleri kaydedilemedi.");
  }

  revalidatePath("/admin/home-content");
  revalidatePath("/");
  redirect("/admin/home-content?saved=1");
}
