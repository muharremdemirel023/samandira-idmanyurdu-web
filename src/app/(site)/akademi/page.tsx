import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/seo";

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

export const metadata: Metadata = createPageMetadata({ title: "Akademi Hakkında | Samandıra İdman Yurdu S.K. Akademi", description: "Samandıra’da 6–13 yaş çocuklara disiplin, özgüven ve takım ruhunu odağa alan, yaşa uygun futbol gelişim programımızı keşfedin.", path: "/akademi" });

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
