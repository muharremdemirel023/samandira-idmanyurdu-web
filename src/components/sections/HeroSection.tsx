"use client";

import { motion, useReducedMotion } from "framer-motion";
import Image from "next/image";

import { transitions } from "@/components/motion/motion-presets";
import { Container } from "@/components/ui/Container";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/cn";

const { hero } = siteConfig.home;

export function HeroSection({ className }: { className?: string }) {
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
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={reduceMotion ? undefined : { opacity: 1 }}
            transition={reduceMotion ? { duration: 0 } : { duration: 0.5, delay: 0.15 }}
          >
            <Image
              src="/images/35-yil-logo.png"
              alt="Samandıra İdman Yurdu 35. yıl logosu"
              width={420}
              height={331}
              sizes="(max-width: 767px) min(78vw, 300px), (max-width: 1023px) 320px, 400px"
              loading="eager"
              fetchPriority="high"
              unoptimized
              className="h-auto w-[min(78vw,300px)] max-w-full object-contain sm:w-[320px] lg:w-[400px]"
            />
          </motion.div>
        </div>
      </Container>
    </section>
  );
}
