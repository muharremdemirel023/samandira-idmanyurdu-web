import type { Metadata } from "next";
import { createPageMetadata, sportsActivityLocationJsonLd } from "@/lib/seo";

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
import { DigitalPartnerSection } from "@/components/sections/DigitalPartnerSection";
import { getHomeContent } from "@/lib/content";
import { InstagramFeedSection } from "@/components/sections/InstagramFeedSection";
import { SponsorsSlider } from "@/components/sections/SponsorsSlider";

export const metadata: Metadata = createPageMetadata({ title: "Samandıra İdman Yurdu S.K. Akademi | Sancaktepe Futbol Akademisi", description: "Samandıra İdman Yurdu S.K. Akademi; 6–13 yaş için Sancaktepe Samandıra’da futbol eğitimi ve ücretsiz deneme antrenmanı sunar.", path: "/" });

export default async function Home() {
  const homeContent = await getHomeContent();

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(sportsActivityLocationJsonLd).replace(/</g, "\\u003c") }} />
      <div className="flex flex-1 flex-col">
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
    </>
  );
}
