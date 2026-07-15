import { SectionReveal } from "@/components/motion/SectionReveal";
import { onboardingHref } from "@/components/navigation/nav-config";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/cn";

const { closingCta } = siteConfig.akademiPage;

export function AcademyClosingCtaSection({ className }: { className?: string }) {
  return (
    <section
      aria-labelledby="akademi-closing-cta-heading"
      className={cn("club-section pb-[var(--space-section-y-mobile)] pt-8 md:pb-[var(--space-section-y-desktop)] md:pt-12", className)}
    >
      <Container>
        <SectionReveal staggerIndex={0}>
          <div className="club-soft-panel grid gap-8 px-6 py-10 sm:px-8 md:grid-cols-[1fr_auto] md:items-center md:py-12 lg:px-10">
            <div>
              <h2 id="akademi-closing-cta-heading" className="type-heading-md max-w-prose-section text-text-primary">
                {closingCta.title}
              </h2>
              <p className="type-lead mt-5 max-w-prose-lead">{closingCta.body}</p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row md:w-[20rem] md:flex-col">
              <Button href={onboardingHref} variant="primary" className="w-full min-h-[2.75rem] px-9 text-sm font-bold">
                {closingCta.formCta}
              </Button>
              <Button href={siteConfig.whatsAppHref} variant="outline" target="_blank" rel="noreferrer noopener" className="w-full min-h-[2.75rem] px-9 text-sm font-semibold">
                {closingCta.whatsappCta}
              </Button>
            </div>
          </div>
        </SectionReveal>
      </Container>
    </section>
  );
}
