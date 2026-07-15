import {
  AboutAcademySection,
  AgeGroupsPreviewSection,
  FeesSection,
  HeroSection,
  HomeContactSection,
  HomeFaqSection,
  ProgramSection,
  RegistrationCTABand,
  TechnicalStaffSection,
  TrainingModelSection,
  VisionMissionSection,
} from "@/components/sections";
import { CampaignPopup } from "@/components/sections/CampaignPopup";
import { DigitalPartnerSection } from "@/components/sections/DigitalPartnerSection";
import { SponsorsSlider } from "@/components/sections/SponsorsSlider";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <CampaignPopup />
      <HeroSection />
      <AgeGroupsPreviewSection />
      <AboutAcademySection />
      <VisionMissionSection />
      <TrainingModelSection />
      <TechnicalStaffSection />
      <ProgramSection />
      <FeesSection />
      <HomeFaqSection />
      <HomeContactSection />
      <RegistrationCTABand />
      <SponsorsSlider />
      <DigitalPartnerSection />
    </div>
  );
}
