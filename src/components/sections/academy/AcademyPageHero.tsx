import { SectionReveal } from "@/components/motion/SectionReveal";
import { onboardingHref } from "@/components/navigation/nav-config";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/cn";

const { hero } = siteConfig.akademiPage;

export function AcademyPageHero({ className }: { className?: string }) {
  return (
    <section
      aria-labelledby="akademi-hero-heading"
      className={cn(
        "relative isolate overflow-hidden pb-12 pt-[calc(var(--header-height)+0.85rem)] sm:pb-14 sm:pt-[calc(var(--header-height)+1.15rem)] md:pb-16 md:pt-[calc(var(--header-height)+1.5rem)]",
        className,
      )}
    >
      <div
        aria-hidden
        className="absolute inset-0 -z-20 bg-surface-base"
      />
      <div
        aria-hidden
        className="absolute inset-y-0 right-0 -z-10 w-full bg-[radial-gradient(ellipse_at_58%_18%,rgba(234,88,12,0.10),transparent_36%),radial-gradient(ellipse_at_86%_72%,rgba(234,88,12,0.08),transparent_42%)] opacity-80 md:w-[58%]"
      />

      <Container>
        <div className="grid gap-8">
          <SectionReveal staggerIndex={0} className="stack-section-intro max-w-prose-display">
            <p className="type-overline club-kicker-line text-accent">{hero.overline}</p>
            <h1 id="akademi-hero-heading" className="type-display text-text-primary">
              {hero.title}
            </h1>
            <p className="type-lead max-w-prose-lead">{hero.lead}</p>
            <div className="mt-2 flex flex-col gap-2.5 sm:mt-3 sm:flex-row sm:flex-wrap sm:gap-3">
              <Button href={onboardingHref} variant="primary" className="w-full min-h-[2.75rem] px-8 py-2.5 text-sm font-bold sm:w-auto">
                {hero.ctaPrimary}
              </Button>
              <Button href={hero.secondaryHref} variant="outline" className="w-full min-h-[2.75rem] px-8 py-2.5 text-sm font-semibold sm:w-auto">
                {hero.ctaSecondary}
              </Button>
            </div>
          </SectionReveal>

        </div>
      </Container>
    </section>
  );
}
