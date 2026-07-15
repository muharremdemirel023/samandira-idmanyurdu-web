"use server";

import {
  imageStorageBuckets,
  type ImageStorageBucket,
  uploadAdminImage,
} from "@/lib/supabase/storage/image-upload";

export type AdminImageUploadState = {
  ok: boolean;
  message: string;
  publicUrl?: string;
  path?: string;
  bucket?: ImageStorageBucket;
};

export const initialAdminImageUploadState: AdminImageUploadState = {
  ok: false,
  message: "",
};

function readString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

function readBucket(formData: FormData) {
  const bucket = readString(formData, "bucket");

  if (!imageStorageBuckets.includes(bucket as ImageStorageBucket)) {
    throw new Error("Geçersiz görsel yükleme alanı.");
  }

  return bucket as ImageStorageBucket;
}

export async function uploadAdminImageAction(
  _prevState: AdminImageUploadState,
  formData: FormData,
): Promise<AdminImageUploadState> {
  try {
    const bucket = readBucket(formData);
    const folder = readString(formData, "folder");
    const file = formData.get("image");

    if (!(file instanceof File)) {
      return {
        ok: false,
        message: "Lütfen bir görsel seçin.",
      };
    }

    const result = await uploadAdminImage({
      bucket,
      file,
      folder,
    });

    return {
      ok: true,
      message: "Görsel başarıyla yüklendi.",
      ...result,
    };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Görsel yüklenemedi.",
    };
  }
}
