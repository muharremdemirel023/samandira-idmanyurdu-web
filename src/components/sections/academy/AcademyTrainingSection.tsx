import { SectionReveal } from "@/components/motion/SectionReveal";
import { Container } from "@/components/ui/Container";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/cn";

const { training } = siteConfig.akademiPage;

export function AcademyTrainingSection({ className }: { className?: string }) {
  return (
    <section
      aria-labelledby="akademi-training-heading"
      className={cn("club-section py-[var(--space-section-y-mobile)] md:py-[var(--space-section-y-desktop)]", className)}
    >
      <Container>
        <SectionReveal staggerIndex={0} className="stack-section-intro max-w-prose-section">
          <p className="type-overline club-kicker-line text-accent">{training.overline}</p>
          <h2 id="akademi-training-heading" className="type-heading-lg text-text-primary">
            {training.title}
          </h2>
          <p className="type-body-lg max-w-prose-body">{training.subtitle}</p>
        </SectionReveal>

        <div className="mt-14 grid gap-8 lg:grid-cols-[1fr_1fr]">
          {training.pillars.map((pillar, index) => (
            <SectionReveal key={pillar.key} staggerIndex={index + 1}>
              <article className="grid gap-4 lg:grid-cols-[4rem_minmax(0,1fr)]">
                <span className="type-label-caps-accent font-mono text-accent">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div>
                  <h3 className="type-card-title text-text-primary">{pillar.title}</h3>
                  <p className="type-body-lg mt-3">{pillar.body}</p>
                </div>
              </article>
            </SectionReveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
