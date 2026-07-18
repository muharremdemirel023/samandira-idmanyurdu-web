import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/seo";

import { Container } from "@/components/ui/Container";

export const metadata: Metadata = createPageMetadata({ title: "Antrenman Modeli ve Haftalık Program | Samandıra İY Akademi", description: "6–13 yaş futbolcular için teknik, koordinasyon, oyun zekâsı ve karakter gelişimi odaklı antrenman modelimizi inceleyin.", path: "/akademi/antrenman-modeli" });

const trainingBlocks = [
  {
    title: "Teknik Temel",
    body: "Pas, kontrol, top sürme, ilk temas ve bire bir beceriler yaş grubuna göre sadeleştirilmiş tekrarlarla geliştirilir.",
  },
  {
    title: "Koordinasyon",
    body: "Denge, çeviklik, yön değiştirme ve hareket kalitesi çocukların fiziksel gelişimine uygun şekilde çalışılır.",
  },
  {
    title: "Oyun Zekası",
    body: "Alan farkındalığı, takım arkadaşını görme, doğru zamanda pas verme ve basit taktik kararlar küçük oyunlarla pekiştirilir.",
  },
  {
    title: "Disiplin ve Karakter",
    body: "Zamanında sahada olma, ekip arkadaşına saygı, sorumluluk alma ve antrenman alışkanlığı akademi kültürünün temelidir.",
  },
];

export default function AntrenmanModeliPage() {
  return (
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
            <p className="type-overline club-kicker-line text-accent">Saha içi gelişim</p>
            <h1 className="type-display text-text-primary">Antrenman Modeli</h1>
            <p className="type-lead mt-5 max-w-prose-lead">
              Antrenmanlarımız çocukların futbolu severek öğrenmesini, düzenli gelişmesini ve sahada doğru alışkanlıklar kazanmasını hedefler.
            </p>
          </div>

          <div className="mt-8 grid gap-8 md:mt-10 md:grid-cols-2">
            {trainingBlocks.map((block) => (
              <section key={block.title} className="border-l border-accent/45 pl-6">
                <h2 className="type-heading-md text-text-primary">{block.title}</h2>
                <p className="type-body-lg mt-4 max-w-prose-body">{block.body}</p>
              </section>
            ))}
          </div>
        </Container>
      </section>
    </main>
  );
}
