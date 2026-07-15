import { SectionReveal } from "@/components/motion/SectionReveal";
import { Container } from "@/components/ui/Container";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/cn";

const { faq } = siteConfig.akademiPage;

export function AcademyFaqSection({ className }: { className?: string }) {
  return (
    <section
      aria-labelledby="akademi-faq-heading"
      className={cn("club-section py-[var(--space-section-y-mobile)] md:py-[var(--space-section-y-desktop)]", className)}
    >
      <Container>
        <div className="grid gap-10 lg:grid-cols-[0.72fr_1.28fr] lg:gap-16">
          <SectionReveal staggerIndex={0} className="stack-section-intro max-w-prose-section">
            <p className="type-overline club-kicker-line text-accent">{faq.overline}</p>
            <h2 id="akademi-faq-heading" className="type-heading-lg text-text-primary">
              {faq.title}
            </h2>
          </SectionReveal>

          <div className="club-soft-panel px-6 py-4 sm:px-8">
            {faq.items.map((item, index) => (
              <SectionReveal key={item.q} staggerIndex={index + 1}>
                <details className="group py-5">
                  <summary className="cursor-pointer list-none pr-2 font-semibold text-text-primary marker:content-none [&::-webkit-details-marker]:hidden">
                    <span className="flex items-start justify-between gap-4">
                      <span className="type-card-title pr-2 leading-snug">{item.q}</span>
                      <span aria-hidden className="text-2xl font-light text-accent transition-transform duration-200 group-open:rotate-45">
                        +
                      </span>
                    </span>
                  </summary>
                  <p className="type-body mt-4 max-w-prose-body">{item.a}</p>
                </details>
              </SectionReveal>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
