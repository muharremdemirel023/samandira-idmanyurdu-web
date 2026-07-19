export const videoStorageBucket = "videos";

export const allowedVideoMimeTypes = [
  "video/mp4",
  "video/webm",
  "video/quicktime",
  "video/x-m4v",
] as const;

export const maxVideoSizeBytes = 50 * 1024 * 1024;

export function assertValidVideoFile(file: File) {
  if (!file || file.size === 0) {
    throw new Error("Yüklenecek video seçilmedi.");
  }

  if (!allowedVideoMimeTypes.includes(file.type as (typeof allowedVideoMimeTypes)[number])) {
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

export function createVideoStoragePath(file: File, folder?: string) {
  const safeFolder = sanitizeFolder(folder);
  const extension = getVideoExtension(file);
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, "0");

  return `${safeFolder}/${year}/${month}/${crypto.randomUUID()}.${extension}`;
}
