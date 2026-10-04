import type { MetadataRoute } from "next";

import { SITE_URL } from "@/lib/seo";
import { createClient } from "@/lib/supabase/server";

const siteUrl = SITE_URL;

// noIndex işaretli sayfalar (kvkk-aydinlatma-metni, tesekkurler) sitemap'e girmez.
const NO_INDEX_SLUGS = new Set(["kvkk-aydinlatma-metni", "tesekkurler"]);

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: siteUrl, changeFrequency: "weekly", priority: 1 },
    { url: `${siteUrl}/akademi`, changeFrequency: "monthly", priority: 0.8 },
    {
      url: `${siteUrl}/akademi/teknik-kadro`,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    { url: `${siteUrl}/akademi/yas-gruplari`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${siteUrl}/akademi/antrenman-modeli`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${siteUrl}/akademi/sik-sorulan-sorular`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${siteUrl}/iletisim`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${siteUrl}/on-kayit`, changeFrequency: "monthly", priority: 0.9 },
    { url: `${siteUrl}/duyurular`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${siteUrl}/galeri/fotograflar`, changeFrequency: "weekly", priority: 0.6 },
    { url: `${siteUrl}/galeri/videolar`, changeFrequency: "weekly", priority: 0.6 },
  ];

  try {
    const supabase = await createClient();
    const [newsResult, customPagesResult] = await Promise.all([
      supabase.from("news").select("slug,created_at,updated_at").eq("is_active", true),
      supabase.from("custom_pages").select("slug,created_at,updated_at").eq("is_active", true),
    ]);

    const newsRoutes: MetadataRoute.Sitemap = newsResult.error
      ? []
      : toRoutes(newsResult.data, "duyurular", 0.6);

    const customPageRoutes: MetadataRoute.Sitemap = customPagesResult.error
      ? []
      : toRoutes(customPagesResult.data, "sayfa", 0.5);

    return [...staticRoutes, ...newsRoutes, ...customPageRoutes];
  } catch {
    return staticRoutes;
  }
}

type SlugRow = { slug: string | null; created_at: string | null; updated_at: string | null };

function toRoutes(
  rows: SlugRow[] | null,
  segment: string,
  priority: number,
): MetadataRoute.Sitemap {
  return (rows ?? [])
    .filter((item): item is SlugRow & { slug: string } => {
      if (typeof item.slug !== "string") return false;
      const slug = item.slug.trim();
      // noIndex statik sayfalarla çakışan slug'lar sitemap dışında kalır.
      return slug.length > 0 && !NO_INDEX_SLUGS.has(slug);
    })
    .map((item) => {
      const lastModifiedSource = item.updated_at ?? item.created_at;
      return {
        url: `${siteUrl}/${segment}/${encodeURIComponent(item.slug.trim())}`,
        lastModified: lastModifiedSource ? new Date(lastModifiedSource) : undefined,
        changeFrequency: "monthly",
        priority,
      };
    });
}
