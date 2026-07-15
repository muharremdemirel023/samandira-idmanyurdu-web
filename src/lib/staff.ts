import { createClient } from "@/lib/supabase/server";

import type { FeaturedCoach } from "@/app/(site)/akademi/teknik-kadro/FeaturedCoachProfile";

type StaffRow = {
  id: string;
  name: string | null;
  title: string | null;
  short_summary: string | null;
  biography: string | null;
  photo_url: string | null;
};

/** Aktif teknik kadroyu sort_order sırasıyla döner; kart bileşeninin beklediği şekle çevirir. */
export async function getActiveStaffCoaches(limit?: number): Promise<FeaturedCoach[]> {
  const supabase = await createClient();

  let query = supabase
    .from("staff")
    .select("id,name,title,short_summary,biography,photo_url")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (limit) {
    query = query.limit(limit);
  }

  const { data } = await query;

  return ((data ?? []) as StaffRow[]).map((row) => ({
    name: row.name ?? "",
    title: row.title ?? "",
    photo: row.photo_url,
    summary: row.short_summary ?? "",
    biography: (row.biography ?? "")
      .split("\n")
      .map((paragraph) => paragraph.trim())
      .filter(Boolean),
  }));
}
