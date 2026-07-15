import Link from "next/link";

import { SectionReveal } from "@/components/motion/SectionReveal";
import { Container } from "@/components/ui/Container";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/cn";

const { pillars } = siteConfig.home;

export function ClubAcademySplitSection({ className }: { className?: string }) {
  return (
    <section
      id="club-academy-split"
      aria-labelledby="club-academy-heading"
      className={cn(
        "club-section py-[var(--space-section-y-mobile)] md:py-[var(--space-section-y-desktop)]",
        className,
      )}
    >
      <Container>
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
          <SectionReveal staggerIndex={0} className="stack-section-intro max-w-prose-section">
            <p className="type-overline club-kicker-line text-accent">{pillars.overline}</p>
            <h2 id="club-academy-heading" className="type-heading-lg text-text-primary">
              {pillars.title}
            </h2>
            <p className="type-body-lg max-w-prose-body">{pillars.subtitle}</p>
          </SectionReveal>

          <div className="space-y-8">
            {(
              [
                { key: "club", accent: pillars.club },
                { key: "academy", accent: pillars.academy },
              ] as const
            ).map(({ key, accent }, index) => (
              <SectionReveal key={key} staggerIndex={index + 1}>
                <article className="group grid gap-6 md:grid-cols-[8rem_minmax(0,1fr)]">
                  <div>
                    <span className="type-label-caps-accent text-accent">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <div className="club-soft-panel px-6 py-7 sm:px-8 sm:py-8">
                    <h3 className="type-heading-md text-text-primary">{accent.title}</h3>
                    <p className="type-body-lg mt-4 max-w-prose-body">{accent.body}</p>
                    <Link
                      href={accent.href}
                      className="mt-6 inline-flex text-sm font-bold text-accent underline-offset-[0.45rem] hover:text-text-primary hover:underline"
                    >
                      {accent.linkLabel}
                      <span className="ml-1 opacity-85 motion-safe:transition-transform motion-safe:group-hover:translate-x-0.5" aria-hidden>
                        →
                      </span>
                    </Link>
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
