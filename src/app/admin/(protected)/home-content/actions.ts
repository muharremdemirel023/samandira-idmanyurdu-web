"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import type {
  HeroAlignment,
  HeroButtonStyle,
  HeroCampaignBadgeStyle,
  HeroFeature,
} from "@/lib/hero-content";
import { createClient } from "@/lib/supabase/server";

const contentFields = [
  "fees_title",
  "fees_subtitle",
  "staff_title",
  "staff_subtitle",
  "instagram_title",
  "instagram_subtitle",
  "news_title",
  "news_subtitle",
] as const;

export async function saveHomeContent(formData: FormData) {
  const supabase = await createClient();

  const payload: Record<string, string | number | null> = { id: 1 };
  for (const field of contentFields) {
    const value = String(formData.get(field) || "").trim();
    payload[field] = value || null;
  }
  payload.updated_at = new Date().toISOString();

  const { error } = await supabase.from("home_content").upsert(payload);

  if (error) {
    throw new Error("Ana sayfa içerikleri kaydedilemedi.");
  }

  revalidatePath("/admin/home-content");
  revalidatePath("/");
  redirect("/admin/home-content?saved=1");
}

function readText(formData: FormData, name: string) {
  return String(formData.get(name) || "").trim();
}

function readInteger(formData: FormData, name: string, fallback: number, min: number, max: number) {
  const value = Number.parseInt(readText(formData, name), 10);
  return Math.max(min, Math.min(max, Number.isFinite(value) ? value : fallback));
}

function readChoice<T extends string>(
  formData: FormData,
  name: string,
  choices: readonly T[],
  fallback: T,
) {
  const value = readText(formData, name) as T;
  return choices.includes(value) ? value : fallback;
}

function readFeatures(formData: FormData): HeroFeature[] {
  try {
    const parsed = JSON.parse(readText(formData, "hero_features"));
    if (!Array.isArray(parsed)) return [];

    return parsed
      .slice(0, 20)
      .filter((item): item is Partial<HeroFeature> => Boolean(item) && typeof item === "object")
      .map((item, index) => ({
        id: typeof item.id === "string" && item.id ? item.id : `feature-${index + 1}`,
        text: typeof item.text === "string" ? item.text.trim().slice(0, 180) : "",
        visible: item.visible !== false,
        sortOrder: index,
      }))
      .filter((item) => item.text);
  } catch {
    return [];
  }
}

export async function saveHeroContent(formData: FormData) {
  const supabase = await createClient();
  const alignment = readChoice<HeroAlignment>(
    formData,
    "hero_content_alignment",
    ["left", "center", "right"],
    "center",
  );
  const primaryStyle = readChoice<HeroButtonStyle>(
    formData,
    "cta_primary_style",
    ["primary", "secondary", "outline"],
    "primary",
  );
  const secondaryStyle = readChoice<HeroButtonStyle>(
    formData,
    "cta_secondary_style",
    ["primary", "secondary", "outline"],
    "outline",
  );
  const campaignBadgeStyle = readChoice<HeroCampaignBadgeStyle>(
    formData,
    "hero_campaign_badge_style",
    ["highlight", "accent", "outline"],
    "highlight",
  );

  const payload = {
    id: 1,
    hero_is_visible: formData.get("hero_is_visible") === "on",
    hero_desktop_image_url: readText(formData, "hero_desktop_image_url"),
    hero_mobile_image_url: readText(formData, "hero_mobile_image_url") || null,
    hero_overlay_opacity: readInteger(formData, "hero_overlay_opacity", 88, 0, 100),
    hero_min_height: readInteger(formData, "hero_min_height", 820, 480, 1100),
    hero_content_alignment: alignment,
    hero_overline_visible: formData.get("hero_overline_visible") === "on",
    hero_overline: readText(formData, "hero_overline"),
    hero_headline_visible: formData.get("hero_headline_visible") === "on",
    hero_headline: readText(formData, "hero_headline"),
    hero_lead_visible: formData.get("hero_lead_visible") === "on",
    hero_lead: readText(formData, "hero_lead"),
    cta_primary_visible: formData.get("cta_primary_visible") === "on",
    cta_primary_label: readText(formData, "cta_primary_label"),
    cta_primary_href: readText(formData, "cta_primary_href"),
    cta_primary_style: primaryStyle,
    cta_secondary_visible: formData.get("cta_secondary_visible") === "on",
    cta_secondary_label: readText(formData, "cta_secondary_label"),
    cta_secondary_href: readText(formData, "cta_secondary_href"),
    cta_secondary_style: secondaryStyle,
    hero_badge_primary_visible: formData.get("hero_badge_primary_visible") === "on",
    hero_badge_primary_text: readText(formData, "hero_badge_primary_text"),
    hero_badge_primary_href: readText(formData, "hero_badge_primary_href") || null,
    hero_badge_secondary_visible: formData.get("hero_badge_secondary_visible") === "on",
    hero_badge_secondary_text: readText(formData, "hero_badge_secondary_text"),
    hero_badge_secondary_href: readText(formData, "hero_badge_secondary_href") || null,
    hero_intro_visible: formData.get("hero_intro_visible") === "on",
    hero_intro_text: readText(formData, "hero_intro_text"),
    hero_anniversary_visible: formData.get("hero_anniversary_visible") === "on",
    hero_anniversary_text: readText(formData, "hero_anniversary_text"),
    hero_anniversary_image_url: readText(formData, "hero_anniversary_image_url"),
    hero_media_visible: formData.get("hero_media_visible") === "on",
    hero_media_thumbnail_url: readText(formData, "hero_media_thumbnail_url"),
    hero_media_video_url: readText(formData, "hero_media_video_url"),
    hero_media_alt: readText(formData, "hero_media_alt"),
    hero_media_show_play_button: formData.get("hero_media_show_play_button") === "on",
    hero_features: readFeatures(formData),
    hero_campaign_badge_visible: formData.get("hero_campaign_badge_visible") === "on",
    hero_campaign_badge_text: readText(formData, "hero_campaign_badge_text"),
    hero_campaign_badge_href: readText(formData, "hero_campaign_badge_href"),
    hero_campaign_badge_style: campaignBadgeStyle,
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase.from("home_content").upsert(payload);
  if (error) {
    console.error("[admin/home-content] Hero kaydedilemedi:", error);
    redirect("/admin/home-content?heroError=1");
  }

  revalidatePath("/admin/home-content");
  revalidatePath("/");
  redirect("/admin/home-content?heroSaved=1");
}
