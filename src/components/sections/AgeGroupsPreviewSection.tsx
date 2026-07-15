import { SectionReveal } from "@/components/motion/SectionReveal";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/cn";
import { getAgeGroups } from "@/lib/content";

const { ageBands } = siteConfig.home;

export async function AgeGroupsPreviewSection({ className }: { className?: string }) {
  const dbGroups = await getAgeGroups();
  const groups =
    dbGroups.length > 0
      ? dbGroups.map((group) => ({
          rangeLabel: group.age_range.replace(/\s*yaş\s*/i, "").trim() || group.age_range,
          copy: group.short_description || group.name,
        }))
      : ageBands.groups;

  return (
    <section
      aria-labelledby="age-groups-heading"
      className={cn(
        "club-section bg-[color-mix(in_oklab,var(--surface-card)_24%,transparent)] py-[var(--space-section-y-mobile)] md:py-[var(--space-section-y-desktop)]",
        className,
      )}
    >
      <Container>
        <div className="grid gap-10 lg:grid-cols-[0.82fr_1.18fr] lg:gap-16">
          <SectionReveal staggerIndex={0} className="stack-section-intro max-w-prose-section lg:sticky lg:top-[calc(var(--header-height)+2rem)] lg:self-start">
            <p className="type-overline club-kicker-line text-accent">{ageBands.overline}</p>
            <h2 id="age-groups-heading" className="type-heading-lg text-text-primary">
              {ageBands.title}
            </h2>
            <p className="type-body-lg max-w-prose-body">{ageBands.subtitle}</p>
            <div className="mt-2">
              <Button href={ageBands.cta.href} variant="outline" className="min-h-[2.75rem]">
                {ageBands.cta.label}
                <span aria-hidden="true">→</span>
              </Button>
            </div>
          </SectionReveal>

          <div className="space-y-4 sm:space-y-5">
            {groups.map((group, index) => (
              <SectionReveal key={group.rangeLabel} staggerIndex={index + 1}>
                  <article className="group flex items-start gap-4 rounded-2xl border border-border-subtle bg-surface-card p-5 shadow-shell transition-[border-color,transform] duration-200 hover:border-accent/40 motion-reduce:transition-none sm:gap-6 sm:p-6">
                    <div className="flex shrink-0 flex-col items-center gap-2">
                      <span className="inline-flex min-h-[3.25rem] min-w-[3.25rem] items-center justify-center rounded-xl bg-maroon-deep px-3 font-mono text-lg font-bold tabular-nums whitespace-nowrap text-white sm:min-h-[3.75rem] sm:min-w-[4.25rem] sm:text-xl">
                        {group.rangeLabel}
                      </span>
                      <span className="type-meta text-accent">yaş</span>
                    </div>
                    <div className="min-w-0 pt-0.5">
                      <span className="type-label-caps-accent text-accent">
                        Blok {String(index + 1).padStart(2, "0")}
                      </span>
                      <ul className="mt-3 flex flex-wrap gap-2 p-0">
                        {group.copy.split("•").map((item) => (
                          <li
                            key={item.trim()}
                            className="type-body list-none rounded-full border border-border-subtle bg-surface-base px-3 py-1.5 leading-none text-text-primary"
                          >
                            {item.trim()}
                          </li>
                        ))}
                      </ul>
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
