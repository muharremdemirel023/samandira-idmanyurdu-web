export type HeroAlignment = "left" | "center" | "right";
export type HeroButtonStyle = "primary" | "secondary" | "outline";
export type HeroCampaignBadgeStyle = "highlight" | "accent" | "outline";

export type HeroFeature = {
  id: string;
  text: string;
  visible: boolean;
  sortOrder: number;
};

export type HeroContentRecord = {
  hero_is_visible: boolean | null;
  hero_desktop_image_url: string | null;
  hero_mobile_image_url: string | null;
  hero_overlay_opacity: number | null;
  hero_min_height: number | null;
  hero_content_alignment: string | null;
  hero_overline_visible: boolean | null;
  hero_overline: string | null;
  hero_headline_visible: boolean | null;
  hero_headline: string | null;
  hero_lead_visible: boolean | null;
  hero_lead: string | null;
  cta_primary_visible: boolean | null;
  cta_primary_label: string | null;
  cta_primary_href: string | null;
  cta_primary_style: string | null;
  cta_secondary_visible: boolean | null;
  cta_secondary_label: string | null;
  cta_secondary_href: string | null;
  cta_secondary_style: string | null;
  hero_badge_primary_visible: boolean | null;
  hero_badge_primary_text: string | null;
  hero_badge_primary_href: string | null;
  hero_badge_secondary_visible: boolean | null;
  hero_badge_secondary_text: string | null;
  hero_badge_secondary_href: string | null;
  hero_intro_visible: boolean | null;
  hero_intro_text: string | null;
  hero_anniversary_visible: boolean | null;
  hero_anniversary_text: string | null;
  hero_anniversary_image_url: string | null;
  hero_media_visible: boolean | null;
  hero_media_thumbnail_url: string | null;
  hero_media_video_url: string | null;
  hero_media_alt: string | null;
  hero_media_show_play_button: boolean | null;
  hero_features: HeroFeature[] | null;
  hero_campaign_badge_visible: boolean | null;
  hero_campaign_badge_text: string | null;
  hero_campaign_badge_href: string | null;
  hero_campaign_badge_style: string | null;
};

export type ResolvedHeroContent = {
  isVisible: boolean;
  desktopImageUrl: string;
  mobileImageUrl: string;
  overlayOpacity: number;
  minHeight: number;
  alignment: HeroAlignment;
  overlineVisible: boolean;
  overline: string;
  headlineVisible: boolean;
  headline: string;
  leadVisible: boolean;
  lead: string;
  primaryCta: { visible: boolean; label: string; href: string; style: HeroButtonStyle };
  secondaryCta: { visible: boolean; label: string; href: string; style: HeroButtonStyle };
  primaryBadge: { visible: boolean; text: string; href: string };
  secondaryBadge: { visible: boolean; text: string; href: string };
  introVisible: boolean;
  introText: string;
  anniversaryVisible: boolean;
  anniversaryText: string;
  anniversaryImageUrl: string;
  mediaVisible: boolean;
  mediaThumbnailUrl: string;
  mediaVideoUrl: string;
  mediaAlt: string;
  mediaShowPlayButton: boolean;
  features: HeroFeature[];
  campaignBadge: {
    visible: boolean;
    text: string;
    href: string;
    style: HeroCampaignBadgeStyle;
  };
};

export const defaultHeroFeatures: HeroFeature[] = [
  { id: "age-groups", text: "Yaş Gruplarına Uygun Eğitim", visible: true, sortOrder: 0 },
  { id: "expert-team", text: "Deneyimli Antrenör Kadrosu", visible: true, sortOrder: 1 },
  { id: "weekend-program", text: "Düzenli Hafta Sonu Programı", visible: true, sortOrder: 2 },
];

export const heroFallbacks: ResolvedHeroContent = {
  isVisible: true,
  desktopImageUrl: "/images/hero/academy-training.JPG",
  mobileImageUrl: "/images/hero/academy-training.JPG",
  overlayOpacity: 88,
  minHeight: 820,
  alignment: "center",
  overlineVisible: true,
  overline: "35 Yıllık Gelenek • Güçlü Gelecek",
  headlineVisible: true,
  headline: "Futbolu Sev\nSahada Geliş\nGeleceğini Kur",
  leadVisible: true,
  lead: "Samandıra İdman Yurdu olarak 35 yıllık spor kültürümüzü yeni nesillere aktarmaya devam ediyoruz.",
  primaryCta: {
    visible: true,
    label: "Ücretsiz Deneme Antrenmanı",
    href: "/on-kayit",
    style: "primary",
  },
  secondaryCta: {
    visible: true,
    label: "Programı İncele",
    href: "/akademi/antrenman-modeli",
    style: "outline",
  },
  primaryBadge: {
    visible: true,
    text: "Ücretsiz Deneme Antrenmanı",
    href: "/on-kayit",
  },
  secondaryBadge: {
    visible: true,
    text: "6–13 Yaş Grupları",
    href: "",
  },
  introVisible: true,
  introText:
    "Samandıra'da çocuklara yaş gruplarına uygun, gelişim odaklı futbol eğitimi sunuyoruz.",
  anniversaryVisible: true,
  anniversaryText: "",
  anniversaryImageUrl: "/images/35-yil-logo.png",
  mediaVisible: true,
  mediaThumbnailUrl: "/images/hero/academy-training.JPG",
  mediaVideoUrl: "/videos/hero/academy-huddle.mp4",
  mediaAlt: "Samandıra İdman Yurdu Akademi antrenman anı",
  mediaShowPlayButton: true,
  features: defaultHeroFeatures,
  campaignBadge: {
    visible: true,
    text: "🎉 Online Kayıtlara Özel %15 İndirim",
    href: "/on-kayit",
    style: "highlight",
  },
};

function text(value: string | null | undefined, fallback: string) {
  return value === null || value === undefined ? fallback : value;
}

function isAlignment(value: string | null | undefined): value is HeroAlignment {
  return value === "left" || value === "center" || value === "right";
}

function isButtonStyle(value: string | null | undefined): value is HeroButtonStyle {
  return value === "primary" || value === "secondary" || value === "outline";
}

function isCampaignBadgeStyle(value: string | null | undefined): value is HeroCampaignBadgeStyle {
  return value === "highlight" || value === "accent" || value === "outline";
}

function normalizeFeatures(value: HeroFeature[] | null | undefined) {
  if (!Array.isArray(value)) return defaultHeroFeatures.map((feature) => ({ ...feature }));

  return value
    .filter((feature) => feature && typeof feature.text === "string")
    .map((feature, index) => ({
      id: feature.id || `feature-${index + 1}`,
      text: feature.text,
      visible: feature.visible !== false,
      sortOrder: Number.isFinite(feature.sortOrder) ? feature.sortOrder : index,
    }))
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

export function resolveHeroContent(
  content?: Partial<HeroContentRecord> | null,
): ResolvedHeroContent {
  return {
    isVisible: content?.hero_is_visible ?? heroFallbacks.isVisible,
    desktopImageUrl: text(content?.hero_desktop_image_url, heroFallbacks.desktopImageUrl),
    mobileImageUrl: text(
      content?.hero_mobile_image_url,
      text(content?.hero_desktop_image_url, heroFallbacks.mobileImageUrl),
    ),
    overlayOpacity: Math.max(
      0,
      Math.min(100, content?.hero_overlay_opacity ?? heroFallbacks.overlayOpacity),
    ),
    minHeight: Math.max(480, Math.min(1100, content?.hero_min_height ?? heroFallbacks.minHeight)),
    alignment: isAlignment(content?.hero_content_alignment)
      ? content.hero_content_alignment
      : heroFallbacks.alignment,
    overlineVisible: content?.hero_overline_visible ?? heroFallbacks.overlineVisible,
    overline: text(content?.hero_overline, heroFallbacks.overline),
    headlineVisible: content?.hero_headline_visible ?? heroFallbacks.headlineVisible,
    headline: text(content?.hero_headline, heroFallbacks.headline),
    leadVisible: content?.hero_lead_visible ?? heroFallbacks.leadVisible,
    lead: text(content?.hero_lead, heroFallbacks.lead),
    primaryCta: {
      visible: content?.cta_primary_visible ?? heroFallbacks.primaryCta.visible,
      label: text(content?.cta_primary_label, heroFallbacks.primaryCta.label),
      href: text(content?.cta_primary_href, heroFallbacks.primaryCta.href),
      style: isButtonStyle(content?.cta_primary_style)
        ? content.cta_primary_style
        : heroFallbacks.primaryCta.style,
    },
    secondaryCta: {
      visible: content?.cta_secondary_visible ?? heroFallbacks.secondaryCta.visible,
      label: text(content?.cta_secondary_label, heroFallbacks.secondaryCta.label),
      href: text(content?.cta_secondary_href, heroFallbacks.secondaryCta.href),
      style: isButtonStyle(content?.cta_secondary_style)
        ? content.cta_secondary_style
        : heroFallbacks.secondaryCta.style,
    },
    primaryBadge: {
      visible: content?.hero_badge_primary_visible ?? heroFallbacks.primaryBadge.visible,
      text: text(content?.hero_badge_primary_text, heroFallbacks.primaryBadge.text),
      href: text(content?.hero_badge_primary_href, heroFallbacks.primaryBadge.href),
    },
    secondaryBadge: {
      visible: content?.hero_badge_secondary_visible ?? heroFallbacks.secondaryBadge.visible,
      text: text(content?.hero_badge_secondary_text, heroFallbacks.secondaryBadge.text),
      href: text(content?.hero_badge_secondary_href, heroFallbacks.secondaryBadge.href),
    },
    introVisible: content?.hero_intro_visible ?? heroFallbacks.introVisible,
    introText: text(content?.hero_intro_text, heroFallbacks.introText),
    anniversaryVisible:
      content?.hero_anniversary_visible ?? heroFallbacks.anniversaryVisible,
    anniversaryText: text(content?.hero_anniversary_text, heroFallbacks.anniversaryText),
    anniversaryImageUrl: text(
      content?.hero_anniversary_image_url,
      heroFallbacks.anniversaryImageUrl,
    ),
    mediaVisible: content?.hero_media_visible ?? heroFallbacks.mediaVisible,
    mediaThumbnailUrl: text(
      content?.hero_media_thumbnail_url,
      heroFallbacks.mediaThumbnailUrl,
    ),
    mediaVideoUrl: text(content?.hero_media_video_url, heroFallbacks.mediaVideoUrl),
    mediaAlt: text(content?.hero_media_alt, heroFallbacks.mediaAlt),
    mediaShowPlayButton:
      content?.hero_media_show_play_button ?? heroFallbacks.mediaShowPlayButton,
    features: normalizeFeatures(content?.hero_features),
    campaignBadge: {
      visible:
        content?.hero_campaign_badge_visible ?? heroFallbacks.campaignBadge.visible,
      text: text(content?.hero_campaign_badge_text, heroFallbacks.campaignBadge.text),
      href: text(content?.hero_campaign_badge_href, heroFallbacks.campaignBadge.href),
      style: isCampaignBadgeStyle(content?.hero_campaign_badge_style)
        ? content.hero_campaign_badge_style
        : heroFallbacks.campaignBadge.style,
    },
  };
}
