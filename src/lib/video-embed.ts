export type VideoProvider = "youtube" | "instagram" | "tiktok" | "other";

function extractYoutubeId(url: string): string | null {
  const shortsMatch = url.match(/youtube\.com\/shorts\/([\w-]+)/);
  if (shortsMatch) return shortsMatch[1];

  const shortLinkMatch = url.match(/youtu\.be\/([\w-]+)/);
  if (shortLinkMatch) return shortLinkMatch[1];

  const watchMatch = url.match(/[?&]v=([\w-]+)/);
  if (watchMatch) return watchMatch[1];

  return null;
}

/** YouTube Shorts/watch linklerini inline oynatılabilir embed adresine çevirir; olmazsa null döner. */
export function getYoutubeEmbedUrl(url: string): string | null {
  const id = extractYoutubeId(url);
  if (!id) return null;

  return `https://www.youtube.com/embed/${id}?autoplay=1&playsinline=1&rel=0`;
}
