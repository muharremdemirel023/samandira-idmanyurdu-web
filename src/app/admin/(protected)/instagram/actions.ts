"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

function revalidateInstagram() {
  revalidatePath("/admin/instagram");
  revalidatePath("/");
}

function readPayload(formData: FormData) {
  const instagramUrl = String(formData.get("instagram_url") || "").trim();
  const contentType = String(formData.get("content_type") || "post");
  const title = String(formData.get("title") || "").trim();
  const sortOrder = Number.parseInt(String(formData.get("sort_order") || "0"), 10);

  if (!instagramUrl) {
    throw new Error("Instagram bağlantısı zorunludur.");
  }

  return {
    instagram_url: instagramUrl,
    content_type: contentType === "reel" ? "reel" : "post",
    title: title || null,
    sort_order: Number.isNaN(sortOrder) ? 0 : sortOrder,
    is_active: formData.get("is_active") === "on",
    show_on_home: formData.get("show_on_home") === "on",
    updated_at: new Date().toISOString(),
  };
}

export async function createInstagramPost(formData: FormData) {
  const supabase = await createClient();
  const { error } = await supabase.from("instagram_posts").insert(readPayload(formData));

  if (error) {
    throw new Error("Instagram paylaşımı kaydedilemedi.");
  }

  revalidateInstagram();
}

export async function updateInstagramPost(id: string, formData: FormData) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("instagram_posts")
    .update(readPayload(formData))
    .eq("id", id);

  if (error) {
    throw new Error("Instagram paylaşımı güncellenemedi.");
  }

  revalidateInstagram();
}

export async function deleteInstagramPost(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("instagram_posts").delete().eq("id", id);

  if (error) {
    throw new Error("Instagram paylaşımı silinemedi.");
  }

  revalidateInstagram();
}
