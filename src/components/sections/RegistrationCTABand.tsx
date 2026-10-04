import Link from "next/link";

import { SectionReveal } from "@/components/motion/SectionReveal";
import { onboardingHref } from "@/components/navigation/nav-config";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/cn";

const { preBand } = siteConfig.home;

export function RegistrationCTABand({ className }: { className?: string }) {
  return (
    <section
      aria-labelledby="pre-band-heading"
      className={cn(
        "club-section pb-[var(--space-section-y-mobile)] pt-8 md:pb-[var(--space-section-y-desktop)] md:pt-12",
        className,
      )}
    >
      <Container>
        <SectionReveal staggerIndex={0}>
          <div className="club-panel-accent-dark grid gap-8 px-6 py-10 sm:px-8 md:grid-cols-[1fr_auto] md:items-center md:py-12 lg:px-10">
            <div>
              <span className="type-label-caps-accent text-accent-bright">{preBand.eyebrow}</span>
              <h2 id="pre-band-heading" className="type-heading-md mt-4 max-w-prose-section !text-white">
                {preBand.title}
              </h2>
              <p className="type-lead mt-5 max-w-prose-lead font-medium !text-white/75">{preBand.body}</p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row md:w-[20rem] md:flex-col">
              <Button variant="primary" href={siteConfig.whatsAppHref} target="_blank" rel="noreferrer noopener" className="w-full min-h-[2.875rem] font-bold">
                {preBand.whatsappLabel}
              </Button>
              <Button href={onboardingHref} variant="outline" className="w-full min-h-[2.875rem] !border-white/35 !bg-white/10 font-semibold !text-white hover:!bg-white/20">
                {preBand.formLabel}
              </Button>
              <Link className="type-label-caps text-center text-white/60 underline-offset-[0.35rem] hover:text-white hover:underline" href="/iletisim">
                Ofis iletişim
              </Link>
            </div>
          </div>
        </SectionReveal>
      </Container>
    </section>
  );
}
