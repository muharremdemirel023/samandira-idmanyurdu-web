import { SectionReveal } from "@/components/motion/SectionReveal";
import { Container } from "@/components/ui/Container";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/cn";

const { clubValues } = siteConfig.home;

export function ClubValuesSection({ className }: { className?: string }) {
  return (
    <section
      aria-labelledby="club-values-heading"
      className={cn(
        "club-section py-[var(--space-section-y-mobile)] md:py-[var(--space-section-y-desktop)]",
        className,
      )}
    >
      <Container>
        <SectionReveal staggerIndex={0} className="stack-section-intro max-w-prose-section">
          <p className="type-overline club-kicker-line text-accent">{clubValues.overline}</p>
          <h2 id="club-values-heading" className="type-heading-lg text-text-primary">
            {clubValues.title}
          </h2>
          <p className="type-body-lg max-w-prose-body">{clubValues.subtitle}</p>
        </SectionReveal>

        <div className="mt-14 grid gap-7 md:grid-cols-2 lg:grid-cols-4">
          {clubValues.values.map((value, index) => (
            <SectionReveal key={value.key} staggerIndex={index + 1}>
              <article className="h-full">
                <span className="type-label-caps-accent text-accent">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="type-card-title mt-5 text-text-primary">{value.title}</h3>
                <p className="type-body-lg mt-4">{value.body}</p>
              </article>
            </SectionReveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
