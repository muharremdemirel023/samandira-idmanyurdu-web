"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

function revalidateCampaigns() {
  revalidatePath("/admin/campaigns");
  revalidatePath("/");
}

function readOptionalTimestamp(formData: FormData, name: string) {
  const value = String(formData.get(name) || "").trim();
  return value ? new Date(value).toISOString() : null;
}

function readNumber(formData: FormData, name: string, fallback: number) {
  const value = Number.parseInt(String(formData.get(name) || ""), 10);
  return Number.isNaN(value) ? fallback : value;
}

function readPayload(formData: FormData) {
  const name = String(formData.get("name") || "").trim();

  if (!name) {
    throw new Error("Kampanya adı zorunludur.");
  }

  return {
    name,
    desktop_image_url: String(formData.get("desktop_image_url") || "").trim() || null,
    mobile_image_url: String(formData.get("mobile_image_url") || "").trim() || null,
    title: String(formData.get("title") || "").trim() || null,
    description: String(formData.get("description") || "").trim() || null,
    button_label: String(formData.get("button_label") || "").trim() || null,
    button_href: String(formData.get("button_href") || "").trim() || null,
    is_active: formData.get("is_active") === "on",
    starts_at: readOptionalTimestamp(formData, "starts_at"),
    ends_at: readOptionalTimestamp(formData, "ends_at"),
    open_delay_ms: readNumber(formData, "open_delay_ms", 500),
    auto_close_seconds: readNumber(formData, "auto_close_seconds", 6),
    show_every_reload: formData.get("show_every_reload") === "on",
    show_once_per_user: formData.get("show_once_per_user") === "on",
    updated_at: new Date().toISOString(),
  };
}

export async function createCampaign(formData: FormData) {
  const supabase = await createClient();
  const { error } = await supabase.from("campaigns").insert(readPayload(formData));

  if (error) {
    throw new Error("Kampanya kaydedilemedi.");
  }

  revalidateCampaigns();
}

export async function updateCampaign(id: string, formData: FormData) {
  const supabase = await createClient();
  const { error } = await supabase.from("campaigns").update(readPayload(formData)).eq("id", id);

  if (error) {
    throw new Error("Kampanya güncellenemedi.");
  }

  revalidateCampaigns();
}

export async function deleteCampaign(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("campaigns").delete().eq("id", id);

  if (error) {
    throw new Error("Kampanya silinemedi.");
  }

  revalidateCampaigns();
}
