import { SectionReveal } from "@/components/motion/SectionReveal";
import { Container } from "@/components/ui/Container";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/cn";

const { trust } = siteConfig.home;

export function TrustMetricsSection({ className }: { className?: string }) {
  return (
    <section
      aria-labelledby="trust-heading"
      className={cn(
        "club-section bg-[color-mix(in_oklab,var(--surface-card)_20%,transparent)] py-[var(--space-section-y-mobile)] md:py-[var(--space-section-y-desktop)]",
        className,
      )}
    >
      <Container>
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
          <SectionReveal staggerIndex={0} className="stack-section-intro max-w-prose-section">
            <p className="type-overline club-kicker-line text-accent">{trust.overline}</p>
            <h2 id="trust-heading" className="type-heading-lg text-text-primary">
              {trust.title}
            </h2>
            <p className="type-body-lg max-w-prose-body">{trust.subtitle}</p>
          </SectionReveal>

          <ul className="grid list-none gap-x-12 gap-y-10 md:grid-cols-2">
            {trust.metrics.map((metric, index) => (
              <li key={metric.label}>
                <SectionReveal staggerIndex={index + 1}>
                  <span className="type-label-caps-accent font-mono text-accent">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <h3 className="type-card-title mt-4 text-text-primary">{metric.label}</h3>
                  <p className="type-body-lg mt-3">{metric.detail}</p>
                </SectionReveal>
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </section>
  );
}
