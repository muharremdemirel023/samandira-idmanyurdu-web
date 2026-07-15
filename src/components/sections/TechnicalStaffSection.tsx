import { SectionReveal } from "@/components/motion/SectionReveal";
import { Container } from "@/components/ui/Container";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/cn";

const { technicalStaff } = siteConfig.home;

export function TechnicalStaffSection({ className }: { className?: string }) {
  return (
    <section
      aria-labelledby="technical-staff-heading"
      className={cn(
        "club-section py-[var(--space-section-y-mobile)] md:py-[var(--space-section-y-desktop)]",
        className,
      )}
    >
      <Container>
        <div className="grid gap-10 lg:grid-cols-[0.72fr_1.28fr] lg:gap-16">
          <SectionReveal staggerIndex={0} className="stack-section-intro max-w-prose-section">
            <p className="type-overline club-kicker-line text-accent">{technicalStaff.overline}</p>
            <h2 id="technical-staff-heading" className="type-heading-lg text-text-primary">
              {technicalStaff.title}
            </h2>
            <p className="type-body-lg max-w-prose-body">{technicalStaff.subtitle}</p>
          </SectionReveal>

          <div className="space-y-7">
            {technicalStaff.coaches.map((coach, index) => (
              <SectionReveal key={`${coach.role}-${index}`} staggerIndex={index + 1}>
                <article className="club-soft-panel grid gap-5 p-5 sm:grid-cols-[7.5rem_minmax(0,1fr)] sm:p-6 md:grid-cols-[9rem_minmax(0,1fr)]">
                  <div
                    aria-hidden
                    className="aspect-[4/5] min-h-28 rounded-2xl bg-[linear-gradient(160deg,color-mix(in_oklab,var(--accent-strong)_18%,transparent),var(--surface-muted)_42%,var(--surface-deep))]"
                  />
                  <div className="grid gap-4 md:grid-cols-[minmax(0,0.8fr)_minmax(0,1fr)] md:items-start">
                    <div>
                      <h3 className="type-card-title text-text-primary">{coach.name}</h3>
                      <p className="type-body mt-2 font-semibold text-accent">{coach.role}</p>
                      <p className="type-meta mt-4">{coach.badge}</p>
                    </div>
                    <p className="type-body-lg">{coach.expertise}</p>
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
