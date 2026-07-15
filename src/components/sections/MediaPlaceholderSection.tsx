import { SectionReveal } from "@/components/motion/SectionReveal";
import { Container } from "@/components/ui/Container";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/cn";

const { media } = siteConfig.home;

export function MediaPlaceholderSection({ className }: { className?: string }) {
  return (
    <section
      aria-labelledby="media-zone-heading"
      className={cn(
        "club-section py-[var(--space-section-y-mobile)] md:py-[var(--space-section-y-desktop)]",
        className,
      )}
    >
      <Container>
        <SectionReveal staggerIndex={0} className="stack-section-intro max-w-prose-section">
          <p className="type-overline club-kicker-line text-accent">{media.overline}</p>
          <h2 id="media-zone-heading" className="type-heading-lg text-text-primary">
            {media.title}
          </h2>
          <p className="type-body-lg max-w-prose-body">{media.subtitle}</p>
        </SectionReveal>

        <div className="mt-14 grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
          <SectionReveal staggerIndex={1}>
            <div className="club-image-band relative overflow-hidden">
              <div
                aria-hidden
                className="absolute inset-8 rounded-[2rem] bg-[radial-gradient(ellipse_at_50%_20%,rgba(255,255,255,0.12),transparent_36%),linear-gradient(180deg,rgba(251,146,60,0.08),transparent_72%)]"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-surface-deep via-surface-deep/62 to-transparent px-7 pb-7 pt-24 sm:px-10 sm:pb-10">
                <span className="type-label-caps text-accent">{siteConfig.shortName} Galeri</span>
                  <p className="type-body-lg mt-3 max-w-prose-body">{media.galleryLabel}</p>
              </div>
            </div>
          </SectionReveal>

          <SectionReveal staggerIndex={2}>
            <div className="py-8">
              <span className="type-label-caps-accent text-accent">Öne çıkan içerik</span>
              <div className="club-soft-panel mt-5 aspect-video overflow-hidden">
                <div className="flex size-full items-center justify-center bg-[linear-gradient(145deg,#42101c,#26060d)] px-6">
                  <p className="type-body max-w-prose-body text-center font-medium">{media.videoLabel}</p>
                </div>
              </div>
            </div>
          </SectionReveal>
        </div>
      </Container>
    </section>
  );
}
