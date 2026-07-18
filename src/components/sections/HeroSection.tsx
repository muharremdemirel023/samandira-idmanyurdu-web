"use client";

import { motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

import { transitions } from "@/components/motion/motion-presets";
import { onboardingHref } from "@/components/navigation/nav-config";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/cn";

const { hero: heroDefaults } = siteConfig.home;

/**
 * Admin panelde alanı olmayan, yalnızca bu hero'ya özel sabit yardımcı metinler.
 * home_content şemasında karşılığı olmadığı için doğrudan fallback olarak kullanılır.
 */
const heroExtras = {
  headlineFallback: "Futbolu Sev\nSahada Gelış\nGeleceğini Kur",
  introText:
    "Samandıra'da çocuklara yaş gruplarına uygun, gelişim odaklı futbol eğitimi sunuyoruz.",
  ageTag: "6–11 Yaş Grupları",
  mediaAlt: "Samandıra İdman Yurdu Akademi antrenman anı",
  advantages: [
    "Yaş Gruplarına Uygun Eğitim",
    "Deneyimli Antrenör Kadrosu",
    "Düzenli Hafta Sonu Programı",
  ],
  secondaryCtaLabel: "Programı İncele",
  secondaryCtaHref: "/akademi/antrenman-modeli",
} as const;

const heroPhotoSrc = "/images/hero/academy-training.JPG";
const heroClipSrc = "/videos/hero/academy-huddle.mp4";

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
    headline: content?.headline || heroExtras.headlineFallback,
    lead: content?.lead || heroDefaults.lead,
  };
  const reduceMotion = useReducedMotion();
  const t = reduceMotion ? { duration: 0, ease: "linear" as const } : transitions.section;
  const step = reduceMotion ? 0 : 0.09;

  return (
    <section
      aria-labelledby="hero-heading"
      className={cn("relative w-full bg-surface-base pb-14 pt-5 sm:pb-16 sm:pt-6 md:pb-20 md:pt-7", className)}
    >
      <Container variant="hero">
        <div className="relative isolate min-h-[600px] overflow-hidden rounded-[1.75rem] shadow-[0_30px_70px_-32px_rgba(74,18,32,0.45)] sm:min-h-[660px] sm:rounded-[2.25rem] md:min-h-[780px] lg:min-h-[820px]">
          {/* Arka plan fotoğrafı — gerçek saha/antrenman görseli buraya eklenmeli */}
          <Image
            src={heroPhotoSrc}
            alt={heroExtras.mediaAlt}
            fill
            priority
            fetchPriority="high"
            sizes="100vw"
            className="object-cover object-[55%_32%] sm:object-[52%_36%] md:object-[50%_42%]"
          />

          {/* Okunabilirlik overlay'i */}
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-b from-maroon-deep/88 via-maroon-deep/40 to-black/55"
          />
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-t from-accent/14 via-transparent to-transparent"
          />

          {/* 35. yıl rozeti */}
          <motion.div
            aria-hidden
            className="absolute right-4 top-[calc(var(--header-height)+0.85rem)] z-10 hidden size-16 items-center justify-center rounded-2xl border border-white/25 bg-white/12 p-2 shadow-[0_8px_22px_-12px_rgba(0,0,0,0.5)] backdrop-blur-[14px] sm:right-6 sm:flex sm:size-20 md:right-8"
            initial={{ opacity: reduceMotion ? 1 : 0, scale: reduceMotion ? 1 : 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ ...t, delay: step }}
          >
            <Image
              src="/images/35-yil-logo.png"
              alt="35. yıl rozeti"
              width={80}
              height={63}
              unoptimized
              className="h-auto w-full object-contain"
            />
          </motion.div>

          <div className="relative z-10 flex h-full min-h-[inherit] flex-col px-5 pb-7 pt-[calc(var(--header-height)+1.6rem)] sm:px-8 sm:pb-9 sm:pt-[calc(var(--header-height)+1.9rem)] md:px-10 md:pb-11 lg:px-12">
            {/* Üst blok: medya önizleme kartı + kısa tanıtım */}
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between sm:gap-8">
              <motion.div
                className="relative aspect-[220/150] w-full max-w-[260px] shrink-0 overflow-hidden rounded-2xl border border-white/25 bg-white/10 shadow-[0_14px_30px_-16px_rgba(0,0,0,0.55)] backdrop-blur-[6px] sm:w-[220px]"
                initial={{ opacity: reduceMotion ? 1 : 0, x: reduceMotion ? 0 : -18 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ ...t, delay: step * 2 }}
              >
                <video
                  src={heroClipSrc}
                  poster={heroPhotoSrc}
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="metadata"
                  aria-label={heroExtras.mediaAlt}
                  className="absolute inset-0 h-full w-full object-cover object-[48%_30%]"
                />
                <span
                  aria-hidden
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <span className="flex size-11 items-center justify-center rounded-full bg-accent/95 shadow-[0_8px_18px_-8px_rgba(0,0,0,0.6)]">
                    <svg viewBox="0 0 24 24" className="ml-0.5 size-4 fill-white">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </span>
                </span>
              </motion.div>

              <motion.div
                className="max-w-sm sm:text-right sm:pr-24 md:pr-28 lg:pr-32"
                initial={{ opacity: reduceMotion ? 1 : 0, x: reduceMotion ? 0 : 18 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ ...t, delay: step * 2 }}
              >
                <p className="type-body text-sm leading-relaxed !text-white [text-shadow:0_1px_6px_rgba(0,0,0,0.45)] sm:text-[0.95rem]">
                  {heroExtras.introText}
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-2.5 sm:justify-end">
                  <Link
                    href={onboardingHref}
                    className="inline-flex min-h-[2.5rem] items-center rounded-full bg-white px-4 text-xs font-bold text-maroon-deep transition-colors duration-200 hover:bg-white/90"
                  >
                    Ücretsiz Deneme Antrenmanı
                  </Link>
                  <span className="inline-flex min-h-[2.5rem] items-center rounded-full border border-white/25 bg-white/10 px-3.5 text-xs font-semibold text-white/90 backdrop-blur-[6px]">
                    {heroExtras.ageTag}
                  </span>
                </div>
              </motion.div>
            </div>

            <div className="flex-1" />

            {/* Ana başlık */}
            <motion.h1
              id="hero-heading"
              className="mx-auto max-w-3xl text-center text-[2rem] font-bold leading-[1.08] tracking-[-0.02em] text-white sm:text-[2.75rem] md:text-[3.4rem] lg:text-[3.75rem]"
              initial={{ opacity: reduceMotion ? 1 : 0, y: reduceMotion ? 0 : 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...t, delay: step * 3 }}
            >
              {hero.headline.split("\n").map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </motion.h1>

            <p className="type-label-caps-accent mx-auto mt-3 max-w-xl text-center text-[0.65rem] text-white/70 sm:mt-4">
              {hero.overline}
            </p>

            <div className="mt-8 flex flex-col-reverse gap-7 sm:mt-10 sm:flex-row sm:items-end sm:justify-between sm:gap-6">
              {/* Sol alt avantaj listesi */}
              <motion.ul
                className="flex flex-col gap-2.5"
                initial={{ opacity: reduceMotion ? 1 : 0 }}
                animate={{ opacity: 1 }}
                transition={{ ...t, delay: step * 4 }}
              >
                {heroExtras.advantages.map((label, index) => (
                  <motion.li
                    key={label}
                    className="flex items-center gap-2.5"
                    initial={{ opacity: reduceMotion ? 1 : 0, y: reduceMotion ? 0 : 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ ...t, delay: step * 4 + index * (reduceMotion ? 0 : 0.08) }}
                  >
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-accent">
                      <svg
                        viewBox="0 0 24 24"
                        className="size-3.5"
                        fill="none"
                        stroke="white"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                    <span className="text-sm font-medium text-white sm:text-[0.9rem]">{label}</span>
                  </motion.li>
                ))}
              </motion.ul>

              <Link href="/on-kayit" className="inline-flex w-fit rounded-full bg-yellow-300 px-4 py-2 text-xs font-bold text-maroon-deep">🎉 Online Kayıtlara Özel %15 İndirim</Link>

              {/* CTA'lar */}
              <motion.div
                className="flex flex-col gap-3 sm:flex-row sm:items-center"
                initial={{ opacity: reduceMotion ? 1 : 0, y: reduceMotion ? 0 : 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ...t, delay: step * 5 }}
              >
                <Button
                  href={onboardingHref}
                  variant="primary"
                  className="min-h-[2.75rem] w-full px-7 py-2.5 text-sm font-bold motion-safe:hover:-translate-y-0.5 sm:w-auto"
                >
                  Ücretsiz Deneme Antrenmanı
                </Button>
                <Link
                  href={heroExtras.secondaryCtaHref}
                  className="inline-flex min-h-[2.75rem] w-full items-center justify-center rounded-full border border-white/35 bg-white/10 px-7 text-sm font-semibold text-white backdrop-blur-[10px] transition-[background-color,transform] duration-200 motion-safe:hover:-translate-y-0.5 hover:bg-white/20 sm:w-auto"
                >
                  {heroExtras.secondaryCtaLabel}
                </Link>
              </motion.div>
            </div>
          </div>
        </div>
      </Container>

      {hero.lead ? (
        <Container variant="hero">
          <p className="type-lead mt-5 max-w-prose-lead text-center sm:mt-6 sm:text-left">{hero.lead}</p>
        </Container>
      ) : null}
    </section>
  );
}
