import Image from "next/image";
import Link from "next/link";

import { SectionReveal } from "@/components/motion/SectionReveal";
import { Container } from "@/components/ui/Container";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/cn";
import { getHomeContent } from "@/lib/content";
import { getActiveStaffCoaches } from "@/lib/staff";

const { technicalStaff } = siteConfig.home;

export async function TechnicalStaffSection({ className }: { className?: string }) {
  const [featuredCoaches, homeContent] = await Promise.all([
    getActiveStaffCoaches(3),
    getHomeContent(),
  ]);
  const title = homeContent?.staff_title || technicalStaff.title;
  const subtitle = homeContent?.staff_subtitle || technicalStaff.subtitle;

  return (
    <section
      aria-labelledby="technical-staff-heading"
      className={cn(
        "club-section py-[var(--space-section-y-mobile)] md:py-[var(--space-section-y-desktop)]",
        className,
      )}
    >
      <Container>
        <SectionReveal staggerIndex={0} className="stack-section-intro max-w-prose-section">
          <p className="type-overline club-kicker-line text-accent">{technicalStaff.overline}</p>
          <h2 id="technical-staff-heading" className="type-heading-lg text-text-primary">
            {title}
          </h2>
          <p className="type-body-lg max-w-prose-body">{subtitle}</p>
        </SectionReveal>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 md:mt-12">
          {featuredCoaches.map((coach, index) => (
            <SectionReveal key={coach.name} staggerIndex={index + 1}>
              <article className="club-soft-panel flex h-full flex-col overflow-hidden p-5 sm:p-6">
                <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl bg-maroon-deep">
                  {coach.photo && (
                    <Image
                      src={coach.photo}
                      alt={coach.name}
                      fill
                      sizes="(min-width: 1024px) 22rem, (min-width: 640px) 45vw, 92vw"
                      className="object-cover"
                      unoptimized={coach.photo.startsWith("http")}
                    />
                  )}
                </div>
                <h3 className="type-card-title mt-5 text-text-primary">{coach.name}</h3>
                <p className="type-body mt-1 font-semibold text-accent">{coach.title}</p>
                <p className="type-body mt-3 text-text-muted">{coach.summary}</p>
              </article>
            </SectionReveal>
          ))}
        </div>

        <div className="mt-10 flex justify-center">
          <Link
            href="/akademi/teknik-kadro"
            className="inline-flex min-h-[2.75rem] items-center justify-center rounded-full bg-accent px-7 text-sm font-bold text-white transition hover:bg-accent-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/70 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-base"
          >
            Tüm Teknik Kadroyu Gör
          </Link>
        </div>
      </Container>
    </section>
  );
}
