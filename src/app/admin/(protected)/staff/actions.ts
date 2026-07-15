"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

type StaffPayload = {
  name: string;
  title: string;
  short_summary: string;
  biography: string;
  highlights: string[];
  photo_url: string | null;
  sort_order: number;
  is_active: boolean;
};

function readStaffPayload(formData: FormData): StaffPayload {
  const name = String(formData.get("name") || "").trim();
  const title = String(formData.get("title") || "").trim();
  const shortSummary = String(formData.get("short_summary") || "").trim();
  const biography = String(formData.get("biography") || "").trim();
  const highlights = String(formData.get("highlights") || "")
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
  const photoUrl = String(formData.get("photo_url") || "").trim();
  const sortOrder = Number.parseInt(String(formData.get("sort_order") || "0"), 10);

  if (!name || !title) {
    throw new Error("Ad soyad ve görev zorunludur.");
  }

  return {
    name,
    title,
    short_summary: shortSummary,
    biography,
    highlights,
    photo_url: photoUrl || null,
    sort_order: Number.isNaN(sortOrder) ? 0 : sortOrder,
    is_active: formData.get("is_active") === "on",
  };
}

export async function createStaff(formData: FormData) {
  const supabase = await createClient();
  const payload = readStaffPayload(formData);
  const { error } = await supabase.from("staff").insert(payload);

  if (error) {
    throw new Error("Teknik kadro üyesi kaydedilemedi.");
  }

  revalidatePath("/admin/staff");
  redirect("/admin/staff");
}

export async function updateStaff(id: string, formData: FormData) {
  const supabase = await createClient();
  const payload = readStaffPayload(formData);
  const { error } = await supabase.from("staff").update(payload).eq("id", id);

  if (error) {
    throw new Error("Teknik kadro üyesi güncellenemedi.");
  }

  revalidatePath("/admin/staff");
  revalidatePath(`/admin/staff/${id}`);
  redirect("/admin/staff");
}

export async function deleteStaff(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("staff").delete().eq("id", id);

  if (error) {
    throw new Error("Teknik kadro üyesi silinemedi.");
  }

  revalidatePath("/admin/staff");
}
