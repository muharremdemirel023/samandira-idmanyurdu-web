"use client";

import { motion, useReducedMotion } from "framer-motion";
import Image from "next/image";

import { transitions } from "@/components/motion/motion-presets";
import { Container } from "@/components/ui/Container";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/cn";

const { hero: heroDefaults } = siteConfig.home;

export type HeroContent = {
  overline?: string | null;
  headline?: string | null;
  lead?: string | null;
};

export function HeroSection({
  className,
  content,
}: {
  className?: string;
  content?: HeroContent | null;
}) {
  const hero = {
    overline: content?.overline || heroDefaults.overline,
    headline: content?.headline || heroDefaults.headline,
    lead: content?.lead || heroDefaults.lead,
  };
  const reduceMotion = useReducedMotion();
  const t = reduceMotion ? { duration: 0, ease: "linear" as const } : transitions.section;
  const step = reduceMotion ? 0 : 0.1;

  return (
    <section
      aria-labelledby="hero-heading"
      className={cn(
        "relative isolate flex w-full min-h-0 flex-col overflow-hidden bg-surface-base",
        "pt-[calc(var(--header-height)+2rem)] pb-12 sm:pt-[calc(var(--header-height)+2.5rem)] sm:pb-14 md:pt-[calc(var(--header-height)+3.25rem)] md:pb-20",
        className,
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-24 bg-gradient-to-t from-white to-transparent"
      />

      <Container variant="hero" className="relative z-10">
        <div className="grid w-full gap-10 md:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] md:items-center md:gap-12">
          <div className="flex min-w-0 flex-col">
            <motion.span
              className="type-label-caps-accent mb-4 inline-flex w-max max-w-full text-accent sm:mb-5"
              initial={{ opacity: reduceMotion ? 1 : 0, y: reduceMotion ? 0 : 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...t, delay: 0 }}
            >
              <span className="truncate">{hero.overline}</span>
            </motion.span>

            <motion.h1
              id="hero-heading"
              className="type-display max-w-prose-display"
              initial={{ opacity: reduceMotion ? 1 : 0, y: reduceMotion ? 0 : 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...t, delay: step }}
            >
              {hero.headline.split("\n").map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </motion.h1>

            <motion.p
              className="type-lead mt-4 max-w-prose-lead"
              initial={{ opacity: reduceMotion ? 1 : 0, y: reduceMotion ? 0 : 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...t, delay: step * 2 }}
            >
              {hero.lead}
            </motion.p>

          </div>

          <motion.div
            className="flex w-full min-w-0 items-center justify-center md:justify-end"
            initial={reduceMotion ? false : { opacity: 0, scale: 0.97, y: 14 }}
            animate={reduceMotion ? undefined : { opacity: 1, scale: 1, y: 0 }}
            transition={
              reduceMotion
                ? { duration: 0 }
                : { delay: 0.45, duration: 0.85, ease: [0.22, 1, 0.36, 1] }
            }
          >
            <div className="relative w-[min(78vw,300px)] max-w-full sm:w-[320px] lg:w-[400px]">
              <Image
                src="/images/35-yil-logo.png"
                alt="Samandıra İdman Yurdu 35. yıl logosu"
                width={420}
                height={331}
                sizes="(max-width: 767px) min(78vw, 300px), (max-width: 1023px) 320px, 400px"
                loading="eager"
                fetchPriority="high"
                unoptimized
                className="h-auto w-full object-contain"
              />
              {!reduceMotion && (
                <motion.div
                  aria-hidden
                  className="pointer-events-none absolute inset-0 overflow-hidden [mask-image:url('/images/35-yil-logo.png')] [mask-position:center] [mask-repeat:no-repeat] [mask-size:contain]"
                >
                  <motion.div
                    className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/45 to-transparent"
                    initial={{ x: "-130%" }}
                    animate={{ x: "430%" }}
                    transition={{ delay: 1.35, duration: 1.1, ease: "easeInOut" }}
                  />
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      </Container>
    </section>
  );
}
