import Image from "next/image";

import { Container } from "@/components/ui/Container";

export function DigitalPartnerSection() {
  return (
    <section className="bg-surface-base pb-14 pt-4 md:pb-20 md:pt-6" aria-label="Dijital çözüm ortağımız">
      <Container>
        <div className="flex flex-col items-center gap-8 rounded-2xl border border-maroon/12 bg-surface-card px-6 py-8 shadow-[0_2px_10px_-6px_rgba(74,18,32,0.18)] md:flex-row md:gap-12 md:px-10 md:py-10">
          <div className="flex w-full max-w-[16rem] shrink-0 items-center justify-center md:max-w-[18rem]">
            <Image
              src="/images/partners/sportiq-logo.png"
              alt="SportiQ logosu"
              width={1757}
              height={819}
              className="h-auto w-full object-contain"
            />
          </div>

          <div className="flex w-full flex-col items-center text-center md:items-start md:text-left">
            <p className="type-overline text-accent">Teknoloji iş birliği</p>
            <h2 className="type-heading-lg mt-2 text-maroon-deep">Dijital Çözüm Ortağımız</h2>
            <p className="type-body-lg mt-3 max-w-prose-body">
              Akademi yönetimi, öğrenci takibi, yoklama, aidat ve performans süreçlerinde SportiQ
              dijital altyapısı kullanılmaktadır.
            </p>
            <a
              href="https://playsportiq.com"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex min-h-[2.75rem] w-full items-center justify-center rounded-full bg-accent px-7 text-sm font-bold text-white transition hover:bg-accent-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/70 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-card sm:w-auto"
            >
              SportiQ&apos;yu İncele
            </a>
          </div>
        </div>
      </Container>
    </section>
  );
}
