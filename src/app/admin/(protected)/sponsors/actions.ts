"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

type SponsorPayload = {
  name: string;
  website_url: string | null;
  logo_url: string | null;
  sort_order: number;
  is_active: boolean;
};

function readString(formData: FormData, key: string) {
  return String(formData.get(key) || "").trim();
}

function readNumber(formData: FormData, key: string, fallback = 0) {
  const value = Number.parseInt(readString(formData, key), 10);
  return Number.isNaN(value) ? fallback : value;
}

function readSponsorPayload(formData: FormData): SponsorPayload {
  const name = readString(formData, "name");

  if (!name) {
    throw new Error("Firma adı zorunludur.");
  }

  return {
    name,
    website_url: readString(formData, "website_url") || null,
    logo_url: readString(formData, "logo_url") || null,
    sort_order: readNumber(formData, "sort_order"),
    is_active: formData.get("is_active") === "on",
  };
}

export async function createSponsor(formData: FormData) {
  const supabase = await createClient();
  const { error } = await supabase.from("sponsors").insert(readSponsorPayload(formData));

  if (error) {
    throw new Error("Sponsor kaydedilemedi.");
  }

  revalidatePath("/admin/sponsors");
  revalidatePath("/");
}

export async function updateSponsor(id: string, formData: FormData) {
  const supabase = await createClient();
  const { error } = await supabase.from("sponsors").update(readSponsorPayload(formData)).eq("id", id);

  if (error) {
    throw new Error("Sponsor güncellenemedi.");
  }

  revalidatePath("/admin/sponsors");
  revalidatePath("/");
}

export async function deleteSponsor(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("sponsors").delete().eq("id", id);

  if (error) {
    throw new Error("Sponsor silinemedi.");
  }

  revalidatePath("/admin/sponsors");
  revalidatePath("/");
}

export async function updateSponsorOrder(items: Array<{ id: string; sort_order: number }>) {
  const supabase = await createClient();

  for (const item of items) {
    const { error } = await supabase.from("sponsors").update({ sort_order: item.sort_order }).eq("id", item.id);

    if (error) {
      return { ok: false, message: "Sıralama güncellenemedi." };
    }
  }

  revalidatePath("/admin/sponsors");
  revalidatePath("/");
  return { ok: true, message: "Sıralama güncellendi." };
}
