import type { Metadata } from "next";

import {
  AboutAcademySection,
  AgeGroupsPreviewSection,
  FeesSection,
  HeroSection,
  HomeContactSection,
  HomeFaqSection,
  LatestNewsSection,
  ProgramSection,
  RegistrationCTABand,
  TechnicalStaffSection,
  TrainingModelSection,
  TrainingVideosSection,
  VisionMissionSection,
} from "@/components/sections";
import { CampaignPopup } from "@/components/sections/CampaignPopup";
import { DigitalPartnerSection } from "@/components/sections/DigitalPartnerSection";
import { getHomeContent } from "@/lib/content";
import { InstagramFeedSection } from "@/components/sections/InstagramFeedSection";
import { SponsorsSlider } from "@/components/sections/SponsorsSlider";

export const metadata: Metadata = {
  alternates: {
    canonical: "https://www.samandiraidmanyurdu.com",
  },
};

export default async function Home() {
  const homeContent = await getHomeContent();

  return (
    <div className="flex flex-1 flex-col">
      <CampaignPopup />
      <HeroSection
        content={{
          overline: homeContent?.hero_overline,
          headline: homeContent?.hero_headline,
          lead: homeContent?.hero_lead,
        }}
      />
      <AgeGroupsPreviewSection />
      <AboutAcademySection />
      <VisionMissionSection />
      <TrainingModelSection />
      <TechnicalStaffSection />
      <ProgramSection />
      <TrainingVideosSection />
      <InstagramFeedSection />
      <FeesSection />
      <LatestNewsSection />
      <HomeFaqSection />
      <HomeContactSection />
      <RegistrationCTABand />
      <SponsorsSlider />
      <DigitalPartnerSection />
    </div>
  );
}
