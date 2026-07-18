import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/seo";
import Link from "next/link";

import { Container } from "@/components/ui/Container";
import { siteConfig } from "@/config/site";
import { getAgeGroups } from "@/lib/content";

export const metadata: Metadata = createPageMetadata({ title: "Yaş Grupları ve Futbol Eğitim Programı | Samandıra İY Akademi", description: "6–13 yaş arası çocuklar için yaşa ve seviyeye uygun teknik, koordinasyon ve takım oyunu odaklı futbol eğitim gruplarını inceleyin.", path: "/akademi/yas-gruplari" });

const ageGroups = [
  {
    range: "6–8 Yaş",
    name: "Başlangıç Grubu",
    summary: "Çocuğunuzun futbolu oyunla, eğlenerek ve güvenli bir ortamda tanıdığı ilk adım.",
    features: [
      "Futbolla ilk tanışma",
      "Temel hareket ve koordinasyon",
      "Oyunla öğrenme",
      "Takım arkadaşlığı",
    ],
  },
  {
    range: "9–11 Yaş",
    name: "Temel Gelişim Grubu",
    summary: "Temel futbol becerilerinin oturduğu, takım oyununun ve özgüvenin geliştiği dönem.",
    features: [
      "Top kontrolü ve pas",
      "Koordinasyon gelişimi",
      "Takım oyunu",
      "Özgüven kazanımı",
    ],
  },
  {
    range: "12–14 Yaş",
    name: "Teknik Gelişim Grubu",
    summary: "Teknik becerilerin derinleştiği, oyun bilgisinin ve fiziksel kapasitenin arttığı dönem.",
    features: [
      "Teknik beceri gelişimi",
      "Oyun bilgisi",
      "Hız ve dayanıklılık",
      "Pozisyon eğitimi",
    ],
  },
  {
    range: "15+ Yaş",
    name: "Performans Grubu",
    summary: "Rekabete hazır sporcular için ileri düzey teknik ve fiziksel çalışma dönemi.",
    features: [
      "İleri teknik çalışma",
      "Fiziksel gelişim",
      "Maç ve performans hazırlığı",
      "Rekabetçi futbol eğitimi",
    ],
  },
];

export default async function YasGruplariPage() {
  const dbGroups = await getAgeGroups();
  const groups =
    dbGroups.length > 0
      ? dbGroups.map((group) => ({
          range: group.age_range,
          name: group.name,
          summary: group.short_description ?? "",
          features: (group.long_description ?? "")
            .split("\n")
            .map((line) => line.trim())
            .filter(Boolean),
        }))
      : ageGroups;

  return (
    <main className="flex flex-1 flex-col bg-surface-base">
      <section className="pb-14 pt-[calc(var(--header-height)+1.5rem)] md:pb-20 md:pt-[calc(var(--header-height)+2.5rem)]">
        <Container>
          <div className="mx-auto max-w-prose-section text-center">
            <p className="type-overline text-accent">Akademi yaş grupları</p>
            <h1 className="type-display mt-3 text-maroon-deep">
              Çocuğunuza Uygun Yaş Grubunu Bulun
            </h1>
            <p className="type-lead mx-auto mt-5 max-w-prose-lead">
              Her yaş grubuna özel, çocukların fiziksel, teknik ve sosyal gelişimini destekleyen
              futbol eğitim programları.
            </p>
          </div>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 md:mt-14 lg:grid-cols-4 lg:gap-6">
            {groups.map((group) => (
              <article
                key={group.range}
                className="flex flex-col rounded-2xl border border-maroon/12 bg-surface-card p-6 shadow-[0_2px_10px_-6px_rgba(74,18,32,0.18)]"
              >
                <p className="type-label-caps-accent text-accent">{group.range}</p>
                <h2 className="type-heading-md mt-2 text-maroon-deep">{group.name}</h2>
                <p className="mt-3 text-sm leading-relaxed text-text-muted">{group.summary}</p>

                <ul className="mt-5 flex flex-col gap-2.5">
                  {group.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5 text-sm text-text-primary">
                      <span
                        aria-hidden
                        className="mt-[0.45rem] size-1.5 shrink-0 rounded-full bg-accent"
                      />
                      {feature}
                    </li>
                  ))}
                </ul>

                <Link
                  href="/on-kayit"
                  className="mt-6 inline-flex min-h-[2.75rem] w-full items-center justify-center rounded-full bg-accent px-5 text-sm font-bold text-white transition hover:bg-accent-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/70 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-card"
                >
                  Bu Grup İçin Ön Kayıt
                </Link>
              </article>
            ))}
          </div>

          <div className="mt-12 rounded-2xl border border-maroon/12 bg-surface-muted px-6 py-8 text-center md:mt-16 md:px-10 md:py-10">
            <h2 className="type-heading-lg text-maroon-deep">
              Hangi Grubun Uygun Olduğundan Emin Değil misiniz?
            </h2>
            <p className="type-body-lg mx-auto mt-3 max-w-prose-body">
              Bize ulaşın; çocuğunuzun yaşına ve seviyesine en uygun grubu birlikte belirleyelim.
            </p>
            <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
              <a
                href={siteConfig.whatsAppHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-[2.75rem] items-center justify-center rounded-full border border-maroon/25 bg-surface-card px-7 text-sm font-bold text-maroon-deep transition hover:bg-surface-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-maroon/50 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-muted"
              >
                WhatsApp&apos;tan Bilgi Al
              </a>
              <Link
                href="/on-kayit"
                className="inline-flex min-h-[2.75rem] items-center justify-center rounded-full bg-accent px-7 text-sm font-bold text-white transition hover:bg-accent-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/70 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-muted"
              >
                Ön Kayıt Yap
              </Link>
            </div>
          </div>
        </Container>
      </section>
    </main>
  );
}
