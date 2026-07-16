import type { MetadataRoute } from "next";

import { createClient } from "@/lib/supabase/server";

const siteUrl = "https://www.samandiraidmanyurdu.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: siteUrl, changeFrequency: "weekly", priority: 1 },
    { url: `${siteUrl}/akademi`, changeFrequency: "monthly", priority: 0.8 },
    {
      url: `${siteUrl}/akademi/teknik-kadro`,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    { url: `${siteUrl}/yas-gruplari`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${siteUrl}/program`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${siteUrl}/sss`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${siteUrl}/iletisim`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${siteUrl}/on-kayit`, changeFrequency: "monthly", priority: 0.9 },
    { url: `${siteUrl}/duyurular`, changeFrequency: "weekly", priority: 0.7 },
  ];

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("news")
      .select("slug,created_at,updated_at")
      .eq("is_active", true);

    if (error) {
      return staticRoutes;
    }

    const newsRoutes: MetadataRoute.Sitemap = (data ?? [])
      .filter(
        (item): item is { slug: string; created_at: string | null; updated_at: string | null } =>
          typeof item.slug === "string" && item.slug.trim().length > 0,
      )
      .map((item) => {
        const lastModifiedSource = item.updated_at ?? item.created_at;
        return {
          url: `${siteUrl}/duyurular/${encodeURIComponent(item.slug.trim())}`,
          lastModified: lastModifiedSource ? new Date(lastModifiedSource) : undefined,
          changeFrequency: "monthly",
          priority: 0.6,
        };
      });

    return [...staticRoutes, ...newsRoutes];
  } catch {
    return staticRoutes;
  }
}
