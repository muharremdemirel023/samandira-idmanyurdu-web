"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

import { detectVideoProvider } from "@/app/admin/(protected)/videos/video-provider";

function readString(formData: FormData, key: string) {
  return String(formData.get(key) || "").trim();
}

function readNumber(formData: FormData, key: string, fallback = 0) {
  const value = Number.parseInt(readString(formData, key), 10);
  return Number.isNaN(value) ? fallback : value;
}

function readVideoPayload(formData: FormData) {
  const title = readString(formData, "title");
  const videoUrl = readString(formData, "video_url");

  if (!title) {
    throw new Error("Başlık zorunludur.");
  }

  if (!videoUrl) {
    throw new Error("Video linki zorunludur.");
  }

  return {
    title,
    description: readString(formData, "description") || null,
    video_url: videoUrl,
    provider: detectVideoProvider(videoUrl),
    thumbnail_url: readString(formData, "thumbnail_url") || null,
    sort_order: readNumber(formData, "sort_order"),
    is_active: formData.get("is_active") === "on",
  };
}

export async function createVideo(formData: FormData) {
  const supabase = await createClient();
  const { error } = await supabase.from("videos").insert(readVideoPayload(formData));

  if (error) {
    throw new Error("Video kaydedilemedi.");
  }

  revalidatePath("/admin/videos");
  revalidatePath("/videolar");
}

export async function updateVideo(id: string, formData: FormData) {
  const supabase = await createClient();
  const { error } = await supabase.from("videos").update(readVideoPayload(formData)).eq("id", id);

  if (error) {
    throw new Error("Video güncellenemedi.");
  }

  revalidatePath("/admin/videos");
  revalidatePath("/videolar");
}

export async function deleteVideo(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("videos").delete().eq("id", id);

  if (error) {
    throw new Error("Video silinemedi.");
  }

  revalidatePath("/admin/videos");
  revalidatePath("/videolar");
}

export async function updateVideoOrder(items: Array<{ id: string; sort_order: number }>) {
  const supabase = await createClient();

  for (const item of items) {
    const { error } = await supabase.from("videos").update({ sort_order: item.sort_order }).eq("id", item.id);

    if (error) {
      return { ok: false, message: "Sıralama güncellenemedi." };
    }
  }

  revalidatePath("/admin/videos");
  revalidatePath("/videolar");
  return { ok: true, message: "Sıralama güncellendi." };
}
