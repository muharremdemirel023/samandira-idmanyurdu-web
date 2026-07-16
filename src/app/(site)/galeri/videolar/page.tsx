import type { Metadata } from "next";

import { TrainingVideosSectionView } from "@/components/sections/TrainingVideosSection.client";
import { Container } from "@/components/ui/Container";
import { getActiveVideos } from "@/lib/content";

export const metadata: Metadata = {
  title: "Video Galerisi",
  description: "Samandıra İdman Yurdu Akademi antrenman videoları.",
};

export default async function GaleriVideolarPage() {
  const videos = await getActiveVideos();

  return (
    <main className="flex flex-1 flex-col">
      <section className="relative isolate overflow-hidden pb-14 pt-[calc(var(--header-height)+0.75rem)] md:pb-20 md:pt-[calc(var(--header-height)+1rem)]">
        <div aria-hidden className="absolute inset-0 -z-20 bg-surface-base" />
        <div
          aria-hidden
          className="absolute right-0 top-0 -z-10 h-72 w-72 bg-[radial-gradient(circle,rgba(234,88,12,0.10),transparent_68%)] blur-2xl"
        />

        <Container>
          <div className="max-w-prose-section">
            <p className="type-overline club-kicker-line text-accent">Galeri</p>
            <h1 className="type-display text-text-primary">Videolar</h1>
            <p className="type-lead mt-5 max-w-prose-lead">
              Sahadaki enerjimizi ve gelişim odaklı antrenman anlarımızı videolarla keşfedin.
            </p>
          </div>

          {videos.length > 0 ? (
            <TrainingVideosSectionView videos={videos} />
          ) : (
            <section className="mt-10 max-w-3xl border-l border-accent/45 pl-6">
              <h2 className="type-heading-md text-text-primary">Henüz video eklenmedi.</h2>
              <p className="type-body-lg mt-4 max-w-prose-body">
                Yeni videolar eklendiğinde bu sayfada görüntülenecektir.
              </p>
            </section>
          )}
        </Container>
      </section>
    </main>
  );
}
