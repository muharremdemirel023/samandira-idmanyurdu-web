"use server";

import { uploadAdminVideo } from "@/lib/supabase/storage/video-upload";
import type { AdminVideoUploadState } from "@/app/admin/(protected)/video-upload/video-upload-state";

function readString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

export async function uploadAdminVideoAction(
  _prevState: AdminVideoUploadState,
  formData: FormData,
): Promise<AdminVideoUploadState> {
  try {
    const folder = readString(formData, "folder");
    const file = formData.get("video");

    if (!(file instanceof File)) {
      return {
        ok: false,
        message: "Lütfen bir video seçin.",
      };
    }

    const result = await uploadAdminVideo({ file, folder });

    return {
      ok: true,
      message: "Video başarıyla yüklendi.",
      ...result,
    };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Video yüklenemedi.",
    };
  }
}
