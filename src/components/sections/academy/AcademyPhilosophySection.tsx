import { SectionReveal } from "@/components/motion/SectionReveal";
import { Container } from "@/components/ui/Container";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/cn";

const { philosophy } = siteConfig.akademiPage;

export function AcademyPhilosophySection({ className }: { className?: string }) {
  return (
    <section
      aria-labelledby="akademi-philosophy-heading"
      className={cn("club-section py-[var(--space-section-y-mobile)] md:py-[var(--space-section-y-desktop)]", className)}
    >
      <Container>
        <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
          <SectionReveal staggerIndex={0} className="stack-section-intro max-w-prose-section">
            <p className="type-overline club-kicker-line text-accent">{philosophy.overline}</p>
            <h2 id="akademi-philosophy-heading" className="type-heading-lg text-text-primary">
              {philosophy.title}
            </h2>
            <p className="type-body-lg max-w-prose-body">{philosophy.intro}</p>
          </SectionReveal>

          <div className="grid gap-7 md:grid-cols-2">
            {philosophy.pillars.map((pillar, index) => (
              <SectionReveal key={pillar.key} staggerIndex={index + 1}>
                <article className="club-soft-panel h-full px-6 py-7 sm:px-7">
                  <span className="type-label-caps-accent text-accent">{String(index + 1).padStart(2, "0")}</span>
                  <h3 className="type-card-title mt-4 text-text-primary">{pillar.title}</h3>
                  <p className="type-body-lg mt-3">{pillar.body}</p>
                </article>
              </SectionReveal>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
