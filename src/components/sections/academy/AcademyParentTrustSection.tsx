import { SectionReveal } from "@/components/motion/SectionReveal";
import { Container } from "@/components/ui/Container";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/cn";

const { parentTrust } = siteConfig.akademiPage;

export function AcademyParentTrustSection({ className }: { className?: string }) {
  return (
    <section
      aria-labelledby="akademi-parent-heading"
      className={cn(
        "club-section bg-[color-mix(in_oklab,var(--surface-card)_18%,transparent)] py-[var(--space-section-y-mobile)] md:py-[var(--space-section-y-desktop)]",
        className,
      )}
    >
      <Container>
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
          <SectionReveal staggerIndex={0} className="stack-section-intro max-w-prose-section">
            <p className="type-overline club-kicker-line text-accent">{parentTrust.overline}</p>
            <h2 id="akademi-parent-heading" className="type-heading-lg text-text-primary">
              {parentTrust.title}
            </h2>
            <p className="type-body-lg max-w-prose-body">{parentTrust.subtitle}</p>
          </SectionReveal>

          <div className="club-soft-panel space-y-8 px-6 py-8 sm:px-8">
            {parentTrust.points.map((point, index) => (
              <SectionReveal key={point.title} staggerIndex={index + 1}>
                <article className="grid gap-4 sm:grid-cols-[4rem_minmax(0,1fr)]">
                  <span className="type-label-caps-accent font-mono text-accent">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h3 className="type-card-title text-text-primary">{point.title}</h3>
                    <p className="type-body-lg mt-3">{point.body}</p>
                  </div>
                </article>
              </SectionReveal>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
