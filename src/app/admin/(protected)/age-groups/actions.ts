"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

function revalidateAgeGroups() {
  revalidatePath("/admin/age-groups");
  revalidatePath("/akademi/yas-gruplari");
  revalidatePath("/");
}

function readPayload(formData: FormData) {
  const name = String(formData.get("name") || "").trim();
  const ageRange = String(formData.get("age_range") || "").trim();
  const shortDescription = String(formData.get("short_description") || "").trim();
  const longDescription = String(formData.get("long_description") || "").trim();
  const imageUrl = String(formData.get("image_url") || "").trim();
  const badge = String(formData.get("badge") || "").trim();
  const sortOrder = Number.parseInt(String(formData.get("sort_order") || "0"), 10);

  if (!name || !ageRange) {
    throw new Error("Grup adı ve yaş aralığı zorunludur.");
  }

  return {
    name,
    age_range: ageRange,
    short_description: shortDescription || null,
    long_description: longDescription || null,
    image_url: imageUrl || null,
    badge: badge || null,
    sort_order: Number.isNaN(sortOrder) ? 0 : sortOrder,
    is_active: formData.get("is_active") === "on",
    updated_at: new Date().toISOString(),
  };
}

export async function createAgeGroup(formData: FormData) {
  const supabase = await createClient();
  const { error } = await supabase.from("age_groups").insert(readPayload(formData));

  if (error) {
    throw new Error("Yaş grubu kaydedilemedi.");
  }

  revalidateAgeGroups();
}

export async function updateAgeGroup(id: string, formData: FormData) {
  const supabase = await createClient();
  const { error } = await supabase.from("age_groups").update(readPayload(formData)).eq("id", id);

  if (error) {
    throw new Error("Yaş grubu güncellenemedi.");
  }

  revalidateAgeGroups();
}

export async function deleteAgeGroup(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("age_groups").delete().eq("id", id);

  if (error) {
    throw new Error("Yaş grubu silinemedi.");
  }

  revalidateAgeGroups();
}
