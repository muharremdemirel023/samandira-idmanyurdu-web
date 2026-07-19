"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

import { detectVideoProvider } from "@/app/admin/(protected)/videos/video-provider";
import type { VideoActionState } from "@/app/admin/(protected)/videos/video-action-state";

function readString(formData: FormData, key: string) {
  return String(formData.get(key) || "").trim();
}

function readNumber(formData: FormData, key: string, fallback = 0) {
  const value = Number.parseInt(readString(formData, key), 10);
  return Number.isNaN(value) ? fallback : value;
}

type VideoPayload = {
  title: string;
  description: string | null;
  video_url: string;
  provider: ReturnType<typeof detectVideoProvider>;
  thumbnail_url: string | null;
  sort_order: number;
  is_active: boolean;
};

type ReadVideoPayloadResult =
  | { ok: false; message: string }
  | { ok: true; payload: VideoPayload };

function readVideoPayload(formData: FormData): ReadVideoPayloadResult {
  const title = readString(formData, "title");
  const videoUrl = readString(formData, "video_url");

  if (!title) {
    return { ok: false, message: "Başlık zorunludur." };
  }

  if (!videoUrl) {
    return { ok: false, message: "Video linki veya video dosyası zorunludur." };
  }

  return {
    ok: true,
    payload: {
      title,
      description: readString(formData, "description") || null,
      video_url: videoUrl,
      provider: detectVideoProvider(videoUrl),
      thumbnail_url: readString(formData, "thumbnail_url") || null,
      sort_order: readNumber(formData, "sort_order"),
      is_active: formData.get("is_active") === "on",
    },
  };
}

export async function createVideo(
  _prevState: VideoActionState,
  formData: FormData,
): Promise<VideoActionState> {
  const result = readVideoPayload(formData);

  if (!result.ok) {
    return result;
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.from("videos").insert(result.payload);

    if (error) {
      console.error("Video kaydetme hatası:", error);
      return { ok: false, message: `Video kaydedilemedi: ${error.message}` };
    }
  } catch (error) {
    console.error("Video kaydetme beklenmeyen hata:", error);
    return { ok: false, message: "Video kaydedilemedi. Lütfen tekrar deneyin." };
  }

  revalidatePath("/admin/videos");
  revalidatePath("/videolar");
  return { ok: true, message: "Video kaydedildi." };
}

export async function updateVideo(
  id: string,
  _prevState: VideoActionState,
  formData: FormData,
): Promise<VideoActionState> {
  const result = readVideoPayload(formData);

  if (!result.ok) {
    return result;
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.from("videos").update(result.payload).eq("id", id);

    if (error) {
      console.error("Video güncelleme hatası:", error);
      return { ok: false, message: `Video güncellenemedi: ${error.message}` };
    }
  } catch (error) {
    console.error("Video güncelleme beklenmeyen hata:", error);
    return { ok: false, message: "Video güncellenemedi. Lütfen tekrar deneyin." };
  }

  revalidatePath("/admin/videos");
  revalidatePath("/videolar");
  return { ok: true, message: "Video güncellendi." };
}

export async function deleteVideo(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("videos").delete().eq("id", id);

  if (error) {
    console.error("Video silme hatası:", error);
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
      console.error("Video sıralama hatası:", error);
      return { ok: false, message: "Sıralama güncellenemedi." };
    }
  }

  revalidatePath("/admin/videos");
  revalidatePath("/videolar");
  return { ok: true, message: "Sıralama güncellendi." };
}
