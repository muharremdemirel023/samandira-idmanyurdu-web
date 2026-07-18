import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/seo";

import { Container } from "@/components/ui/Container";
import { getFaqs } from "@/lib/content";

export const metadata: Metadata = createPageMetadata({ title: "Sık Sorulan Sorular | Samandıra İdman Yurdu Akademi", description: "Akademi kayıtları, 6–13 yaş grupları, deneme antrenmanı ve gerekli ekipmanlar hakkında sık sorulan soruların yanıtları.", path: "/akademi/sik-sorulan-sorular" });

const faqItems = [
  {
    question: "Deneme antrenmanı yapılabiliyor mu?",
    answer: "Yaş grubu, kontenjan ve saha planına göre deneme antrenmanı planlanabilir. Ön kayıt sonrası akademi ekibi aileyle iletişime geçer.",
  },
  {
    question: "Hangi yaş aralığı kabul ediliyor?",
    answer: "Akademide 6?13 yaş aralığındaki çocuklar için gelişim grupları planlanır. Gruplar çocuğun yaşı ve mevcut futbol deneyimi dikkate alınarak belirlenir.",
  },
  {
    question: "Kayıt süreci nasıl ilerliyor?",
    answer: "Akademi ön kayıt formu doldurulduktan sonra başvuru değerlendirilir ve aileye uygun grup, program ve görüşme bilgisi aktarılır.",
  },
  {
    question: "Hangi ekipmanlar gerekiyor?",
    answer: "İlk aşamada uygun spor kıyafeti, futbol ayakkabısı, tekmelik ve su matarası yeterlidir. Grup ve dönem ihtiyaçları kayıt sürecinde ayrıca paylaşılır.",
  },
  {
    question: "Antrenmanlar nerede yapılıyor?",
    answer: "Antrenman yeri ve saatleri yaş grubu planına göre ailelerle paylaşılır. Güncel tesis ve ulaşım bilgisi kayıt görüşmesinde aktarılır.",
  },
];

export default async function SikSorulanSorularPage() {
  const faqs = await getFaqs();
  const items =
    faqs.length > 0
      ? faqs.map((faq) => ({ question: faq.question, answer: faq.answer }))
      : faqItems;

  const faqJsonLd = { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: items.map((item) => ({ "@type": "Question", name: item.question, acceptedAnswer: { "@type": "Answer", text: item.answer } })) };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd).replace(/</g, "\u003c") }} />
      <main className="flex flex-1 flex-col">
      <section className="relative isolate overflow-hidden pb-12 pt-[calc(var(--header-height)+0.75rem)] md:pb-16 md:pt-[calc(var(--header-height)+1rem)]">
        <div
          aria-hidden
          className="absolute inset-0 -z-20 bg-surface-base"
        />
        <div
          aria-hidden
          className="absolute right-0 top-0 -z-10 h-80 w-80 bg-[radial-gradient(circle,rgba(234,88,12,0.10),transparent_68%)] blur-2xl"
        />

        <Container>
          <div className="max-w-prose-section">
            <p className="type-overline club-kicker-line text-accent">Akademi rehberi</p>
            <h1 className="type-display text-text-primary">Sık Sorulan Sorular</h1>
            <p className="type-lead mt-5 max-w-prose-lead">
              Akademiye başvuru, deneme antrenmanı, yaş grupları ve hazırlık süreciyle ilgili temel bilgileri burada bulabilirsiniz.
            </p>
          </div>

          <div className="mt-8 grid gap-8 md:mt-10">
            {items.map((item) => (
              <section key={item.question} className="max-w-4xl border-l border-accent/45 pl-6">
                <h2 className="type-heading-md text-text-primary">{item.question}</h2>
                <p className="type-body-lg mt-4 max-w-prose-body">{item.answer}</p>
              </section>
            ))}
          </div>
        </Container>
      </section>
    </main>
    </>
  );
}
