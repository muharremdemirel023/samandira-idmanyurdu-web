import { getActiveCampaign } from "@/lib/content";

import { CampaignPopupView } from "@/components/sections/CampaignPopup.client";

/**
 * next/image yalnızca "/" ile başlayan yerel yollar veya geçerli http(s) URL'lerini kabul eder.
 * Eski metin kutusu döneminden kalma bozuk/yer tutucu değerler (örn. "/images/campaigns/...")
 * next/image içinde `new URL()` çağrısını patlatıp popup'ı tamamen kırdığından, burada elenir.
 */
function isUsableImageSrc(value: string | null | undefined): value is string {
  if (!value) return false;
  if (value.startsWith("/") && !value.startsWith("//")) return true;

  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

/** Aktif ve tarih aralığı uygun kampanya varsa popup gösterilir; yoksa hiç açılmaz. */
export async function CampaignPopup() {
  const campaign = await getActiveCampaign();

  if (!campaign) {
    return null;
  }

  const desktopImage = isUsableImageSrc(campaign.desktop_image_url)
    ? campaign.desktop_image_url
    : isUsableImageSrc(campaign.mobile_image_url)
      ? campaign.mobile_image_url
      : null;
  const mobileImage = isUsableImageSrc(campaign.mobile_image_url) ? campaign.mobile_image_url : null;

  if (!desktopImage) {
    return null;
  }

  return (
    <CampaignPopupView
      campaign={{
        id: campaign.id,
        desktopImage,
        mobileImage,
        title: campaign.title,
        description: campaign.description,
        buttonLabel: campaign.button_label,
        buttonHref: campaign.button_href,
        openDelayMs: campaign.open_delay_ms ?? 500,
        autoCloseSeconds: campaign.auto_close_seconds ?? 6,
        showOncePerUser: campaign.show_once_per_user ?? false,
        contentGapPx: campaign.content_gap_px ?? 12,
      }}
    />
  );
}
