import type { MetadataRoute } from "next";

import { createClient } from "@/lib/supabase/server";

const siteUrl = "https://www.samandiraidmanyurdu.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const lastModified = new Date();
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: siteUrl, lastModified, changeFrequency: "weekly", priority: 1 },
    { url: `${siteUrl}/akademi`, lastModified, changeFrequency: "monthly", priority: 0.8 },
    {
      url: `${siteUrl}/akademi/teknik-kadro`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    { url: `${siteUrl}/yas-gruplari`, lastModified, changeFrequency: "monthly", priority: 0.8 },
    { url: `${siteUrl}/program`, lastModified, changeFrequency: "weekly", priority: 0.8 },
    { url: `${siteUrl}/sss`, lastModified, changeFrequency: "monthly", priority: 0.6 },
    { url: `${siteUrl}/iletisim`, lastModified, changeFrequency: "monthly", priority: 0.6 },
    { url: `${siteUrl}/on-kayit`, lastModified, changeFrequency: "monthly", priority: 0.9 },
    { url: `${siteUrl}/duyurular`, lastModified, changeFrequency: "weekly", priority: 0.7 },
  ];

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("news")
      .select("slug,created_at")
      .eq("is_active", true);

    if (error) {
      return staticRoutes;
    }

    const newsRoutes: MetadataRoute.Sitemap = (data ?? [])
      .filter((item): item is { slug: string; created_at: string | null } =>
        typeof item.slug === "string" && item.slug.trim().length > 0,
      )
      .map((item) => ({
        url: `${siteUrl}/duyurular/${encodeURIComponent(item.slug.trim())}`,
        lastModified: item.created_at ? new Date(item.created_at) : lastModified,
        changeFrequency: "monthly",
        priority: 0.6,
      }));

    return [...staticRoutes, ...newsRoutes];
  } catch {
    return staticRoutes;
  }
}
