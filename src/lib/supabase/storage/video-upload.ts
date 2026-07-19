import "server-only";

import { createClient } from "@/lib/supabase/server";

export type UploadAdminVideoInput = {
  file: File;
  folder?: string;
};

export type UploadAdminVideoResult = {
  path: string;
  publicUrl: string;
};

const bucket = "videos";
const allowedVideoTypes = ["video/mp4", "video/webm", "video/quicktime", "video/x-m4v"] as const;
const maxVideoSizeBytes = 50 * 1024 * 1024;

function assertValidVideoFile(file: File) {
  if (!file || file.size === 0) {
    throw new Error("Yüklenecek video seçilmedi.");
  }

  if (!allowedVideoTypes.includes(file.type as (typeof allowedVideoTypes)[number])) {
    throw new Error("Yalnızca MP4, WEBM veya MOV formatında video yüklenebilir.");
  }

  if (file.size > maxVideoSizeBytes) {
    throw new Error("Video boyutu en fazla 50 MB olabilir.");
  }
}

function getVideoExtension(file: File) {
  if (file.type === "video/webm") return "webm";
  if (file.type === "video/quicktime") return "mov";
  if (file.type === "video/x-m4v") return "m4v";

  return "mp4";
}

function sanitizeFolder(folder?: string) {
  if (!folder) return "uploads";

  const cleaned = folder
    .split("/")
    .map((part) => part.trim().toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-"))
    .filter(Boolean)
    .join("/");

  return cleaned || "uploads";
}

function createStoragePath(file: File, folder?: string) {
  const safeFolder = sanitizeFolder(folder);
  const extension = getVideoExtension(file);
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, "0");

  return `${safeFolder}/${year}/${month}/${crypto.randomUUID()}.${extension}`;
}

export async function uploadAdminVideo({ file, folder }: UploadAdminVideoInput): Promise<UploadAdminVideoResult> {
  assertValidVideoFile(file);

  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("Video yüklemek için yönetici oturumu gereklidir.");
  }

  const path = createStoragePath(file, folder);
  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    cacheControl: "31536000",
    contentType: file.type,
    upsert: false,
  });

  if (error) {
    console.error("Supabase video yükleme hatası:", error);
    throw new Error(
      error.message === "Bucket not found"
        ? `"${bucket}" adlı depolama alanı (bucket) Supabase projesinde bulunamadı. Supabase panelinden oluşturulması gerekiyor.`
        : `Video yüklenemedi: ${error.message}`,
    );
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(bucket).getPublicUrl(path);

  return {
    path,
    publicUrl,
  };
}
