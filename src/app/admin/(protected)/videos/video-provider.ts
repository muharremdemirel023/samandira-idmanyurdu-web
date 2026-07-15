export type VideoProvider = "youtube" | "instagram" | "tiktok" | "other";

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

  return "other";
}
