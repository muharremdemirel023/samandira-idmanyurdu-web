import "server-only";

import { createClient } from "@/lib/supabase/server";

export const imageStorageBuckets = [
  "site-images",
  "news",
  "gallery",
  "sponsors",
  "videos",
] as const;

export type ImageStorageBucket = (typeof imageStorageBuckets)[number];

export type UploadAdminImageInput = {
  bucket: ImageStorageBucket;
  file: File;
  folder?: string;
};

export type UploadAdminImageResult = {
  bucket: ImageStorageBucket;
  path: string;
  publicUrl: string;
};

const allowedImageTypes = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"] as const;
const maxImageSizeBytes = 5 * 1024 * 1024;

function assertAllowedBucket(bucket: string): asserts bucket is ImageStorageBucket {
  if (!imageStorageBuckets.includes(bucket as ImageStorageBucket)) {
    throw new Error("Geçersiz görsel yükleme alanı.");
  }
}

function assertValidImageFile(file: File) {
  if (!file || file.size === 0) {
    throw new Error("Yüklenecek görsel seçilmedi.");
  }

  if (!allowedImageTypes.includes(file.type as (typeof allowedImageTypes)[number])) {
    throw new Error("Yalnızca JPG, PNG, WEBP, HEIC veya HEIF görseller yüklenebilir.");
  }

  if (file.size > maxImageSizeBytes) {
    throw new Error("Görsel boyutu en fazla 5 MB olabilir.");
  }
}

function getImageExtension(file: File) {
  if (file.type === "image/png") return "png";
  if (file.type === "image/webp") return "webp";

  return "jpg";
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
  const extension = getImageExtension(file);
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, "0");

  return `${safeFolder}/${year}/${month}/${crypto.randomUUID()}.${extension}`;
}

export async function uploadAdminImage({
  bucket,
  file,
  folder,
}: UploadAdminImageInput): Promise<UploadAdminImageResult> {
  assertAllowedBucket(bucket);
  assertValidImageFile(file);

  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("Görsel yüklemek için yönetici oturumu gereklidir.");
  }

  const path = createStoragePath(file, folder);
  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    cacheControl: "31536000",
    contentType: file.type,
    upsert: false,
  });

  if (error) {
    console.error("Supabase görsel yükleme hatası:", error);
    throw new Error(
      error.message === "Bucket not found"
        ? `"${bucket}" adlı depolama alanı (bucket) Supabase projesinde bulunamadı. Supabase panelinden oluşturulması gerekiyor.`
        : `Görsel yüklenemedi: ${error.message}`,
    );
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(bucket).getPublicUrl(path);

  return {
    bucket,
    path,
    publicUrl,
  };
}
