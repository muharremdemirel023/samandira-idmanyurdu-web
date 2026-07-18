import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { AnalyticsScripts } from "@/components/analytics/AnalyticsScripts";

import { siteConfig } from "@/config/site";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteTitle = "Samandıra İdman Yurdu S.K. Akademi | Futbol Eğitimi";
const siteDescription =
  "Samandıra İdman Yurdu S.K. Akademi; yaş gruplarına uygun futbol eğitimi, deneyimli antrenör kadrosu, düzenli antrenman programı ve online ön kayıt imkânı sunar.";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.samandiraidmanyurdu.com"),
  title: {
    default: siteTitle,
    template: `%s • ${siteConfig.shortName}`,
  },
  description: siteDescription,
  openGraph: {
    type: "website",
    url: "https://www.samandiraidmanyurdu.com",
    siteName: "Samandıra İdman Yurdu S.K. Akademi",
    title: siteTitle,
    description: siteDescription,
    locale: "tr_TR",
  },
  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description: siteDescription,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="tr"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-surface-deep font-sans text-text-primary motion-reduce:scroll-auto">
        {children}
        <AnalyticsScripts />
      </body>
    </html>
  );
}
