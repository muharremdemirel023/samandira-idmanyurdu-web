import { getActiveCampaign } from "@/lib/content";

import { CampaignPopupView } from "@/components/sections/CampaignPopup.client";

/** Aktif ve tarih aralığı uygun kampanya varsa popup gösterilir; yoksa hiç açılmaz. */
export async function CampaignPopup() {
  const campaign = await getActiveCampaign();

  if (!campaign || !(campaign.desktop_image_url || campaign.mobile_image_url)) {
    return null;
  }

  return (
    <CampaignPopupView
      campaign={{
        id: campaign.id,
        desktopImage: campaign.desktop_image_url || campaign.mobile_image_url || "",
        mobileImage: campaign.mobile_image_url,
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
