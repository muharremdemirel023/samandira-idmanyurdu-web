import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/seo";

import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { siteConfig } from "@/config/site";
import { PreRegistrationForm } from "@/app/(site)/on-kayit/PreRegistrationForm";

export const metadata: Metadata = createPageMetadata({ title: "Futbol Akademisi Ön Kayıt — %15 Online İndirim | Samandıra İY Akademi", description: "Samandıra İdman Yurdu Akademi ön kayıt formu. Online kayıtlara özel %15 indirim. 1 iş günü içinde dönüş, ücretsiz deneme antrenmanı imkânı.", path: "/on-kayit" });

const applicationSteps = [
  {
    title: "Formu doldurun",
    body: "Veli ve oyuncu bilgileriyle başvurunuzu 2 dakikada iletin.",
  },
  {
    title: "Sizi arayalım",
    body: "Akademi ekibimiz yaş grubuna uygun seçenekler için size dönüş yapar.",
  },
  {
    title: "Deneme antrenmanı",
    body: "Oyuncumuzu sahada görelim; uygun grup ve program birlikte netleşsin.",
  },
];

export default function OnKayitPage() {
  return (
    <div className="flex flex-1 flex-col">
      <section className="relative isolate overflow-hidden pb-12 pt-[calc(var(--header-height)+2rem)] md:pb-16 md:pt-[calc(var(--header-height)+3.5rem)]">
        <div aria-hidden className="absolute inset-0 -z-20 bg-surface-base" />
        <div
          aria-hidden
          className="absolute inset-y-0 right-0 -z-10 w-full bg-[radial-gradient(ellipse_at_58%_18%,rgba(234,88,12,0.10),transparent_36%),radial-gradient(ellipse_at_86%_72%,rgba(234,88,12,0.08),transparent_42%)] opacity-80 md:w-[58%]"
        />

        <Container>
          <div className="mb-8 rounded-2xl bg-yellow-300 px-5 py-4 text-center font-bold text-maroon-deep shadow-shell">🎉 Online Kayıtlara Özel %15 İndirim — Bu form üzerinden yapılan kayıtlarda geçerlidir.</div>
          <div className="stack-section-intro mx-auto max-w-prose-display text-center">
            <p className="type-overline club-kicker-line justify-center text-accent">
              Akademi başvuru
            </p>
            <h1 className="type-display text-text-primary">Akademi Ön Kayıt</h1>
            <p className="type-lead mx-auto max-w-prose-lead">
              Oyuncunun yaş grubu ve iletişim bilgileriyle ilk değerlendirme
              sürecini başlatın. Başvurunuza en geç bir iş günü içinde dönüş
              yapıyoruz; acil sorularınız için WhatsApp hattımız her zaman açık.
            </p>
            <div className="mx-auto mt-2 flex flex-wrap justify-center gap-2">
              {["Ücretsiz değerlendirme", "1 iş günü içinde dönüş", "6–15+ yaş grupları"].map(
                (item) => (
                  <span
                    key={item}
                    className="type-meta rounded-full border border-border-subtle bg-white px-3.5 py-2 text-text-primary"
                  >
                    {item}
                  </span>
                ),
              )}
            </div>
          </div>
        </Container>
      </section>

      <section className="club-section pb-[var(--space-section-y-mobile)] md:pb-[var(--space-section-y-desktop)]">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[0.75fr_1.25fr] lg:items-start lg:gap-16">
            <div className="flex flex-col gap-8 lg:sticky lg:top-[calc(var(--header-height)+2rem)]">
              <div className="stack-section-intro max-w-prose-section">
                <p className="type-overline club-kicker-line text-accent">Süreç</p>
                <h2 className="type-heading-lg text-text-primary">
                  Başvurunuz nasıl ilerler?
                </h2>
              </div>

              <ol className="m-0 flex list-none flex-col gap-5 p-0">
                {applicationSteps.map((step, index) => (
                  <li key={step.title} className="flex items-start gap-4">
                    <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-maroon-deep font-mono text-sm font-bold text-white">
                      {index + 1}
                    </span>
                    <div className="min-w-0">
                      <h3 className="type-card-title text-text-primary">{step.title}</h3>
                      <p className="type-body mt-1">{step.body}</p>
                    </div>
                  </li>
                ))}
              </ol>

              <div className="rounded-2xl border border-border-subtle bg-white p-5 shadow-shell sm:p-6">
                <p className="type-label-caps-accent text-accent">Hızlı iletişim</p>
                <p className="type-body mt-2">
                  Formu beklemeden bilgi almak isterseniz bize doğrudan ulaşın.
                </p>
                <div className="mt-4 flex flex-col gap-3">
                  <Button
                    href={siteConfig.whatsAppHref}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="min-h-[2.75rem] w-full"
                  >
                    WhatsApp ile yaz
                  </Button>
                  <Button
                    href={`tel:${siteConfig.phoneTel}`}
                    variant="outline"
                    className="min-h-[2.75rem] w-full"
                  >
                    {siteConfig.phoneDisplay}
                  </Button>
                </div>
              </div>
            </div>

            <PreRegistrationForm />
          </div>
        </Container>
      </section>
    </div>
  );
}

