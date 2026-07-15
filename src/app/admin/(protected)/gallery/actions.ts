"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export type GalleryAspectRatio = "4:5" | "1:1";

function readString(formData: FormData, key: string) {
  return String(formData.get(key) || "").trim();
}

function readNumber(formData: FormData, key: string, fallback = 0) {
  const value = Number.parseInt(readString(formData, key), 10);
  return Number.isNaN(value) ? fallback : value;
}

function getDimensions(aspectRatio: GalleryAspectRatio) {
  if (aspectRatio === "1:1") {
    return { width: 1080, height: 1080 };
  }

  return { width: 1080, height: 1350 };
}

function readAlbumPayload(formData: FormData) {
  const title = readString(formData, "title");

  if (!title) {
    throw new Error("Albüm başlığı zorunludur.");
  }

  return {
    title,
    description: readString(formData, "description") || null,
    cover_image_url: readString(formData, "cover_image_url") || null,
    sort_order: readNumber(formData, "sort_order"),
    is_active: formData.get("is_active") === "on",
  };
}

function readImagePayload(formData: FormData) {
  const imageUrl = readString(formData, "image_url");
  const aspectRatio = (readString(formData, "aspect_ratio") || "4:5") as GalleryAspectRatio;
  const dimensions = getDimensions(aspectRatio);

  if (!imageUrl) {
    throw new Error("Görsel yüklemek zorunludur.");
  }

  return {
    album_id: readString(formData, "album_id") || null,
    image_url: imageUrl,
    alt_text: readString(formData, "alt_text") || null,
    caption: readString(formData, "caption") || null,
    aspect_ratio: aspectRatio,
    width: dimensions.width,
    height: dimensions.height,
    sort_order: readNumber(formData, "sort_order"),
    is_active: formData.get("is_active") === "on",
  };
}

export async function createGalleryAlbum(formData: FormData) {
  const supabase = await createClient();
  const { error } = await supabase.from("gallery_albums").insert(readAlbumPayload(formData));

  if (error) {
    throw new Error("Albüm oluşturulamadı.");
  }

  revalidatePath("/admin/gallery");
  redirect("/admin/gallery");
}

export async function updateGalleryAlbum(id: string, formData: FormData) {
  const supabase = await createClient();
  const { error } = await supabase.from("gallery_albums").update(readAlbumPayload(formData)).eq("id", id);

  if (error) {
    throw new Error("Albüm güncellenemedi.");
  }

  revalidatePath("/admin/gallery");
  redirect("/admin/gallery");
}

export async function deleteGalleryAlbum(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("gallery_albums").delete().eq("id", id);

  if (error) {
    throw new Error("Albüm silinemedi.");
  }

  revalidatePath("/admin/gallery");
}

export async function createGalleryImage(formData: FormData) {
  const supabase = await createClient();
  const { error } = await supabase.from("gallery_images").insert(readImagePayload(formData));

  if (error) {
    throw new Error("Fotoğraf kaydedilemedi.");
  }

  revalidatePath("/admin/gallery");
  redirect("/admin/gallery");
}

export async function updateGalleryImage(id: string, formData: FormData) {
  const supabase = await createClient();
  const { error } = await supabase.from("gallery_images").update(readImagePayload(formData)).eq("id", id);

  if (error) {
    throw new Error("Fotoğraf güncellenemedi.");
  }

  revalidatePath("/admin/gallery");
  redirect("/admin/gallery");
}

export async function deleteGalleryImage(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("gallery_images").delete().eq("id", id);

  if (error) {
    throw new Error("Fotoğraf silinemedi.");
  }

  revalidatePath("/admin/gallery");
}

export async function createGalleryImagesBulk(items: Array<{
  album_id?: string | null;
  image_url: string;
  alt_text?: string | null;
  caption?: string | null;
  aspect_ratio: GalleryAspectRatio;
  sort_order?: number;
}>) {
  const supabase = await createClient();
  const payload = items.map((item, index) => {
    const dimensions = getDimensions(item.aspect_ratio);

    return {
      album_id: item.album_id || null,
      image_url: item.image_url,
      alt_text: item.alt_text || null,
      caption: item.caption || null,
      aspect_ratio: item.aspect_ratio,
      width: dimensions.width,
      height: dimensions.height,
      sort_order: item.sort_order ?? index,
      is_active: true,
    };
  });
  const { error } = await supabase.from("gallery_images").insert(payload);

  if (error) {
    return { ok: false, message: "Toplu fotoğraf kaydı tamamlanamadı." };
  }

  revalidatePath("/admin/gallery");
  return { ok: true, message: "Fotoğraflar başarıyla yüklendi." };
}

export async function updateGalleryOrder(
  table: "gallery_albums" | "gallery_images",
  items: Array<{ id: string; sort_order: number }>,
) {
  const supabase = await createClient();

  for (const item of items) {
    const { error } = await supabase.from(table).update({ sort_order: item.sort_order }).eq("id", item.id);

    if (error) {
      return { ok: false, message: "Sıralama güncellenemedi." };
    }
  }

  revalidatePath("/admin/gallery");
  return { ok: true, message: "Sıralama güncellendi." };
}
