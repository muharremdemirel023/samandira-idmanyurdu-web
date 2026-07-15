import type { ReactNode } from "react";

import { AcademyAssistant } from "@/components/chatbot/AcademyAssistant";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { IntroSplash } from "@/components/layout/IntroSplash";
import { PageTransition } from "@/components/motion/PageTransition";

export default function SiteLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <>
      <IntroSplash />
      <Header />
      <main className="flex min-h-[calc(100vh-var(--header-height))] flex-1 flex-col">
        <PageTransition>{children}</PageTransition>
      </main>
      <Footer />
      <AcademyAssistant />
    </>
  );
}
