import { getHomeContent, getHomeInstagramPosts, getSiteSettings } from "@/lib/content";
import { siteConfig } from "@/config/site";

import {
  InstagramFeedSectionView,
  type InstagramFeedItem,
} from "@/components/sections/InstagramFeedSection.client";

/** Tablo boşken kullanılan mevcut sabit paylaşımlar. */
const fallbackPosts: InstagramFeedItem[] = [
  { url: "https://www.instagram.com/p/Dar6jqeCDr8/", isReel: false },
  { url: "https://www.instagram.com/reel/Dar8KC0oZHz/", isReel: true },
  { url: "https://www.instagram.com/reel/DapZW0ZI5MT/", isReel: true },
];

const fallbackInstagramHref =
  siteConfig.social.find((item) => item.label === "Instagram")?.href ??
  "https://www.instagram.com/";

export async function InstagramFeedSection() {
  const [posts, homeContent, settings] = await Promise.all([
    getHomeInstagramPosts(),
    getHomeContent(),
    getSiteSettings(),
  ]);

  const items: InstagramFeedItem[] =
    posts.length > 0
      ? posts.map((post) => ({
          url: post.instagram_url,
          isReel: post.content_type === "reel" || post.instagram_url.includes("/reel/"),
        }))
      : fallbackPosts;

  return (
    <InstagramFeedSectionView
      posts={items}
      title={homeContent?.instagram_title || "Akademiden Son Paylaşımlar"}
      subtitle={
        homeContent?.instagram_subtitle ||
        "Antrenmanlardan, etkinliklerden ve akademi hayatından son paylaşımlar."
      }
      instagramHref={settings?.instagram_url || fallbackInstagramHref}
    />
  );
}
