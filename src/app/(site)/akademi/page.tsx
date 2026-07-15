import type { Metadata } from "next";

import {
  AcademyAgeDetailSection,
  AcademyClosingCtaSection,
  AcademyFaqSection,
  AcademyPageHero,
  AcademyParentTrustSection,
  AcademyPhilosophySection,
  AcademyTrainingSection,
} from "@/components/sections/academy";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Akademi",
  description: siteConfig.akademiPage.hero.lead,
};

export default function AkademiPage() {
  return (
    <div className="flex flex-1 flex-col">
      <AcademyPageHero />
      <AcademyPhilosophySection />
      <AcademyAgeDetailSection />
      <AcademyTrainingSection />
      <AcademyParentTrustSection />
      <AcademyFaqSection />
      <AcademyClosingCtaSection />
    </div>
  );
}
