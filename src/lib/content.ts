import { cache } from "react";

import { createClient } from "@/lib/supabase/server";

/**
 * Public sitenin admin panelinden yönetilen içerikleri için okuma yardımcıları.
 * Sorgu hatasında veya boş tabloda null/boş dizi döner; bileşenler kendi
 * sabit içeriklerine (fallback) düşer.
 */

export type SiteSettings = {
  academy_name: string | null;
  academy_short_name: string | null;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  address: string | null;
  maps_url: string | null;
  instagram_url: string | null;
  working_hours: string | null;
  header_logo_url: string | null;
  footer_logo_url: string | null;
  footer_description: string | null;
  seo_title: string | null;
  seo_description: string | null;
  canonical_url: string | null;
};

export const getSiteSettings = cache(async (): Promise<SiteSettings | null> => {
  try {
    const supabase = await createClient();
    const { data } = await supabase.from("site_settings").select("*").eq("id", 1).maybeSingle();
    return (data as SiteSettings | null) ?? null;
  } catch {
    return null;
  }
});

export type HomeContent = {
  hero_overline: string | null;
  hero_headline: string | null;
  hero_lead: string | null;
  cta_primary_label: string | null;
  cta_primary_href: string | null;
  cta_secondary_label: string | null;
  cta_secondary_href: string | null;
  fees_title: string | null;
  fees_subtitle: string | null;
  staff_title: string | null;
  staff_subtitle: string | null;
  instagram_title: string | null;
  instagram_subtitle: string | null;
  news_title: string | null;
  news_subtitle: string | null;
};

export const getHomeContent = cache(async (): Promise<HomeContent | null> => {
  try {
    const supabase = await createClient();
    const { data } = await supabase.from("home_content").select("*").eq("id", 1).maybeSingle();
    return (data as HomeContent | null) ?? null;
  } catch {
    return null;
  }
});

export type InstagramPost = {
  id: string;
  instagram_url: string;
  content_type: "post" | "reel";
  title: string | null;
};

export const getHomeInstagramPosts = cache(async (): Promise<InstagramPost[]> => {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("instagram_posts")
      .select("id,instagram_url,content_type,title")
      .eq("is_active", true)
      .eq("show_on_home", true)
      .order("sort_order", { ascending: true });
    return (data ?? []) as InstagramPost[];
  } catch {
    return [];
  }
});

export type TrainingScheduleRow = {
  id: string;
  age_group: string;
  days: string;
  start_time: string;
  end_time: string;
  location: string | null;
  description: string | null;
};

export const getTrainingSchedules = cache(async (): Promise<TrainingScheduleRow[]> => {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("training_schedules")
      .select("id,age_group,days,start_time,end_time,location,description")
      .eq("is_active", true)
      .order("sort_order", { ascending: true });
    return (data ?? []) as TrainingScheduleRow[];
  } catch {
    return [];
  }
});

export type AgeGroupRow = {
  id: string;
  name: string;
  age_range: string;
  short_description: string | null;
  long_description: string | null;
  image_url: string | null;
  badge: string | null;
};

export const getAgeGroups = cache(async (): Promise<AgeGroupRow[]> => {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("age_groups")
      .select("id,name,age_range,short_description,long_description,image_url,badge")
      .eq("is_active", true)
      .order("sort_order", { ascending: true });
    return (data ?? []) as AgeGroupRow[];
  } catch {
    return [];
  }
});

export type FaqRow = {
  id: string;
  question: string;
  answer: string;
  category: string | null;
};

export const getFaqs = cache(async (limit?: number): Promise<FaqRow[]> => {
  try {
    const supabase = await createClient();
    let query = supabase
      .from("faqs")
      .select("id,question,answer,category")
      .eq("is_active", true)
      .order("sort_order", { ascending: true });
    if (limit) {
      query = query.limit(limit);
    }
    const { data } = await query;
    return (data ?? []) as FaqRow[];
  } catch {
    return [];
  }
});

export type Campaign = {
  id: string;
  name: string;
  desktop_image_url: string | null;
  mobile_image_url: string | null;
  title: string | null;
  description: string | null;
  button_label: string | null;
  button_href: string | null;
  starts_at: string | null;
  ends_at: string | null;
  open_delay_ms: number;
  auto_close_seconds: number;
  show_every_reload: boolean;
  show_once_per_user: boolean;
};

export const getActiveCampaign = cache(async (): Promise<Campaign | null> => {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("campaigns")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    const now = Date.now();
    const campaigns = (data ?? []) as Campaign[];

    return (
      campaigns.find((campaign) => {
        if (campaign.starts_at && new Date(campaign.starts_at).getTime() > now) return false;
        if (campaign.ends_at && new Date(campaign.ends_at).getTime() < now) return false;
        return true;
      }) ?? null
    );
  } catch {
    return null;
  }
});
