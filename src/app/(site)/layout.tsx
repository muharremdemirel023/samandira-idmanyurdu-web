import type { ReactNode } from "react";

import { AcademyAssistant } from "@/components/chatbot/AcademyAssistant";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { IntroSplash } from "@/components/layout/IntroSplash";
import { PageTransition } from "@/components/motion/PageTransition";
import { CampaignSlideIn } from "@/components/sections/CampaignSlideIn";
import { getCustomPageNavItems } from "@/lib/content";

export default async function SiteLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const customPages = await getCustomPageNavItems();

  return (
    <>
      <IntroSplash />
      <Header customPages={customPages} />
      <main className="flex min-h-[calc(100vh-var(--header-height))] flex-1 flex-col">
        <PageTransition>{children}</PageTransition>
      </main>
      <Footer />
      <AcademyAssistant />
      <CampaignSlideIn />
    </>
  );
}
