import { SectionReveal } from "@/components/motion/SectionReveal";
import { Container } from "@/components/ui/Container";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/cn";

const { ageDetail } = siteConfig.akademiPage;

export function AcademyAgeDetailSection({ className }: { className?: string }) {
  return (
    <section
      id="yas-gruplari-detay"
      aria-labelledby="akademi-age-heading"
      className={cn(
        "club-section bg-[color-mix(in_oklab,var(--surface-card)_24%,transparent)] py-[var(--space-section-y-mobile)] md:py-[var(--space-section-y-desktop)]",
        className,
      )}
    >
      <Container>
        <div className="grid gap-10 lg:grid-cols-[0.82fr_1.18fr] lg:gap-16">
          <SectionReveal staggerIndex={0} className="stack-section-intro max-w-prose-section">
            <p className="type-overline club-kicker-line text-accent">{ageDetail.overline}</p>
            <h2 id="akademi-age-heading" className="type-heading-lg text-text-primary">
              {ageDetail.title}
            </h2>
            <p className="type-body-lg max-w-prose-body">{ageDetail.subtitle}</p>
          </SectionReveal>

          <div className="space-y-7">
            {ageDetail.groups.map((group, index) => (
              <SectionReveal key={group.range} staggerIndex={index + 1}>
                <article className="club-soft-panel grid gap-5 px-6 py-7 sm:grid-cols-[6rem_minmax(0,1fr)] sm:px-8">
                  <h3 className="type-stat font-mono text-accent">{group.range}</h3>
                  <p className="type-body-lg">{group.focus}</p>
                </article>
              </SectionReveal>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
