export type VideoProvider = "youtube" | "instagram" | "tiktok" | "upload" | "other";

const uploadedVideoExtensionPattern = /\.(mp4|webm|mov|m4v)(\?.*)?$/;

export function detectVideoProvider(videoUrl: string): VideoProvider {
  const value = videoUrl.toLowerCase();

  if (value.includes("youtube.com/shorts/") || value.includes("youtu.be/") || value.includes("youtube.com/watch")) {
    return "youtube";
  }

  if (value.includes("instagram.com/reel/")) {
    return "instagram";
  }

  if (value.includes("tiktok.com/")) {
    return "tiktok";
  }

  if (value.includes("/storage/v1/object/public/videos/") || uploadedVideoExtensionPattern.test(value)) {
    return "upload";
  }

  return "other";
}
