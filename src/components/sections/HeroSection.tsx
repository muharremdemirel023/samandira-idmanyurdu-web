"use client";

import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";

import { transitions } from "@/components/motion/motion-presets";
import { Container } from "@/components/ui/Container";
import { cn } from "@/lib/cn";
import {
  resolveHeroContent,
  type HeroButtonStyle,
  type HeroCampaignBadgeStyle,
  type HeroContentRecord,
  type ResolvedHeroContent,
} from "@/lib/hero-content";

export type HeroContent = Partial<HeroContentRecord>;
export type HeroPreviewMode = "desktop" | "mobile";

function OptionalLink({ href, className, children }: { href: string; className: string; children: ReactNode }) {
  return href ? (
    <Link href={href} className={className}>
      {children}
    </Link>
  ) : (
    <span className={className}>{children}</span>
  );
}

function heroButtonClass(style: HeroButtonStyle) {
  const base =
    "inline-flex min-h-[2.75rem] w-full items-center justify-center rounded-full border px-7 py-2.5 text-sm font-bold transition-[background-color,border-color,transform] duration-200 motion-safe:hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/70 sm:w-auto";

  if (style === "secondary") {
    return cn(base, "border-white bg-white text-maroon-deep hover:bg-white/90");
  }
  if (style === "outline") {
    return cn(base, "border-white/35 bg-white/10 text-white backdrop-blur-[10px] hover:bg-white/20");
  }
  return cn(base, "border-accent bg-accent text-white hover:border-accent-strong hover:bg-accent-strong");
}

function campaignBadgeClass(style: HeroCampaignBadgeStyle) {
  const base = "inline-flex w-fit rounded-full px-4 py-2 text-xs font-bold transition-colors";
  if (style === "accent") return cn(base, "bg-accent text-white hover:bg-accent-strong");
  if (style === "outline") {
    return cn(base, "border border-white/35 bg-white/10 text-white backdrop-blur-[8px] hover:bg-white/20");
  }
  return cn(base, "bg-yellow-300 text-maroon-deep hover:bg-yellow-200");
}

export function HeroSection({
  className,
  content,
  resolvedContent,
  previewMode,
}: {
  className?: string;
  content?: HeroContent | null;
  resolvedContent?: ResolvedHeroContent;
  previewMode?: HeroPreviewMode;
}) {
  const hero = resolvedContent ?? resolveHeroContent(content);
  const reduceMotion = useReducedMotion();
  const t = reduceMotion ? { duration: 0, ease: "linear" as const } : transitions.section;
  const step = reduceMotion ? 0 : 0.09;
  const isPreview = Boolean(previewMode);
  const previewDesktop = previewMode === "desktop";
  const previewMobile = previewMode === "mobile";

  if (!hero.isVisible) return null;

  const minHeightStyle = (isPreview
    ? {
        minHeight: previewMobile
          ? `${Math.min(hero.minHeight, 620)}px`
          : `${Math.min(hero.minHeight, 680)}px`,
      }
    : { "--managed-hero-min-height": `${hero.minHeight}px` }) as CSSProperties;
  const overlay = hero.overlayOpacity / 100;
  const headlineAlignment = {
    left: "mr-auto text-left",
    center: "mx-auto text-center",
    right: "ml-auto text-right",
  }[hero.alignment];
  const leadAlignment = {
    left: "mr-auto text-left",
    center: "mx-auto text-center",
    right: "ml-auto text-right",
  }[hero.alignment];
  const visibleFeatures = hero.features.filter((feature) => feature.visible && feature.text.trim());

  return (
    <section
      aria-labelledby={hero.headlineVisible && hero.headline ? "hero-heading" : undefined}
      aria-label={!hero.headlineVisible || !hero.headline ? "Ana sayfa tanıtım alanı" : undefined}
      className={cn(
        "relative w-full bg-surface-base",
        isPreview ? "py-0" : "pb-14 pt-5 sm:pb-16 sm:pt-6 md:pb-20 md:pt-7",
        className,
      )}
    >
      <Container variant={isPreview ? "fluid" : "hero"}>
        <div
          className={cn(
            "relative isolate overflow-hidden shadow-[0_30px_70px_-32px_rgba(74,18,32,0.45)]",
            isPreview ? "rounded-xl" : "rounded-[1.75rem] sm:rounded-[2.25rem]",
            !isPreview &&
              "min-h-[min(600px,var(--managed-hero-min-height))] sm:min-h-[min(660px,var(--managed-hero-min-height))] md:min-h-[min(780px,var(--managed-hero-min-height))] lg:min-h-[var(--managed-hero-min-height)]",
          )}
          style={minHeightStyle}
        >
          <picture>
            {!previewMode && hero.mobileImageUrl ? (
              <source media="(max-width: 639px)" srcSet={hero.mobileImageUrl} />
            ) : null}
            {/* Hero URL'si yerel asset veya Supabase public URL olabilir. */}
            <img
              src={previewMobile ? hero.mobileImageUrl : hero.desktopImageUrl}
              alt=""
              fetchPriority={isPreview ? "auto" : "high"}
              className="absolute inset-0 size-full object-cover object-[55%_32%] sm:object-[52%_36%] md:object-[50%_42%]"
            />
          </picture>

          <div
            aria-hidden="true"
            className="absolute inset-0"
            style={{
              background: `linear-gradient(to bottom, rgba(74,18,32,${overlay}), rgba(74,18,32,${overlay * 0.45}), rgba(0,0,0,${overlay * 0.625}))`,
            }}
          />
          <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-accent/14 via-transparent to-transparent" />

          {hero.anniversaryVisible && (hero.anniversaryImageUrl || hero.anniversaryText) ? (
            <motion.div
              aria-label={hero.anniversaryText || "Yıl dönümü rozeti"}
              className={cn(
                "absolute z-10 flex flex-col items-center justify-center rounded-2xl border border-white/25 bg-white/12 p-2 text-center text-[0.55rem] font-bold uppercase tracking-wider text-white shadow-[0_8px_22px_-12px_rgba(0,0,0,0.5)] backdrop-blur-[14px]",
                isPreview
                  ? previewDesktop
                    ? "right-4 top-4 size-16"
                    : "hidden"
                  : "right-4 top-[calc(var(--header-height)+0.85rem)] hidden size-16 sm:right-6 sm:flex sm:size-20 md:right-8",
              )}
              initial={{ opacity: reduceMotion ? 1 : 0, scale: reduceMotion ? 1 : 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ ...t, delay: step }}
            >
              {hero.anniversaryImageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={hero.anniversaryImageUrl} alt="" className="min-h-0 w-full flex-1 object-contain" />
              ) : null}
              {hero.anniversaryText ? <span className="mt-1">{hero.anniversaryText}</span> : null}
            </motion.div>
          ) : null}

          <div
            className={cn(
              "relative z-10 flex h-full min-h-[inherit] flex-col",
              isPreview
                ? previewDesktop
                  ? "px-7 pb-7 pt-7"
                  : "px-5 pb-6 pt-6"
                : "px-5 pb-7 pt-[calc(var(--header-height)+1.6rem)] sm:px-8 sm:pb-9 sm:pt-[calc(var(--header-height)+1.9rem)] md:px-10 md:pb-11 lg:px-12",
            )}
          >
            <div
              className={cn(
                "flex gap-5",
                isPreview
                  ? previewDesktop
                    ? "flex-row items-start justify-between gap-8"
                    : "flex-col"
                  : "flex-col sm:flex-row sm:items-start sm:justify-between sm:gap-8",
              )}
            >
              {hero.mediaVisible ? (
                <motion.div
                  className={cn(
                    "relative aspect-[220/150] w-full shrink-0 overflow-hidden rounded-2xl border border-white/25 bg-white/10 shadow-[0_14px_30px_-16px_rgba(0,0,0,0.55)] backdrop-blur-[6px]",
                    isPreview
                      ? previewDesktop
                        ? "w-[180px]"
                        : "max-w-[210px]"
                      : "max-w-[260px] sm:w-[220px]",
                  )}
                  initial={{ opacity: reduceMotion ? 1 : 0, x: reduceMotion ? 0 : -18 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ ...t, delay: step * 2 }}
                >
                  {hero.mediaVideoUrl ? (
                    <video
                      src={hero.mediaVideoUrl}
                      poster={hero.mediaThumbnailUrl || hero.desktopImageUrl}
                      autoPlay
                      muted
                      loop
                      playsInline
                      preload="metadata"
                      aria-label={hero.mediaAlt}
                      className="absolute inset-0 size-full object-cover object-[48%_30%]"
                    />
                  ) : hero.mediaThumbnailUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={hero.mediaThumbnailUrl}
                      alt={hero.mediaAlt}
                      className="absolute inset-0 size-full object-cover object-[48%_30%]"
                    />
                  ) : null}
                  {hero.mediaShowPlayButton ? (
                    <span aria-hidden="true" className="absolute inset-0 flex items-center justify-center">
                      <span className="flex size-11 items-center justify-center rounded-full bg-accent/95 shadow-[0_8px_18px_-8px_rgba(0,0,0,0.6)]">
                        <svg viewBox="0 0 24 24" className="ml-0.5 size-4 fill-white">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </span>
                    </span>
                  ) : null}
                </motion.div>
              ) : null}

              {hero.introVisible || hero.primaryBadge.visible || hero.secondaryBadge.visible ? (
                <motion.div
                  className={cn(
                    "max-w-sm",
                    isPreview
                      ? previewDesktop
                        ? "pr-20 text-right"
                        : "text-left"
                      : "sm:pr-24 sm:text-right md:pr-28 lg:pr-32",
                  )}
                  initial={{ opacity: reduceMotion ? 1 : 0, x: reduceMotion ? 0 : 18 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ ...t, delay: step * 2 }}
                >
                  {hero.introVisible && hero.introText ? (
                    <p className="type-body text-sm leading-relaxed !text-white [text-shadow:0_1px_6px_rgba(0,0,0,0.45)] sm:text-[0.95rem]">
                      {hero.introText}
                    </p>
                  ) : null}
                  {hero.primaryBadge.visible || hero.secondaryBadge.visible ? (
                    <div className={cn("mt-3 flex flex-wrap items-center gap-2.5", !previewMobile && "sm:justify-end")}>
                      {hero.primaryBadge.visible && hero.primaryBadge.text ? (
                        <OptionalLink
                          href={hero.primaryBadge.href}
                          className="inline-flex min-h-[2.5rem] items-center rounded-full bg-white px-4 text-xs font-bold text-maroon-deep transition-colors duration-200 hover:bg-white/90"
                        >
                          {hero.primaryBadge.text}
                        </OptionalLink>
                      ) : null}
                      {hero.secondaryBadge.visible && hero.secondaryBadge.text ? (
                        <OptionalLink
                          href={hero.secondaryBadge.href}
                          className="inline-flex min-h-[2.5rem] items-center rounded-full border border-white/25 bg-white/10 px-3.5 text-xs font-semibold text-white/90 backdrop-blur-[6px] hover:bg-white/20"
                        >
                          {hero.secondaryBadge.text}
                        </OptionalLink>
                      ) : null}
                    </div>
                  ) : null}
                </motion.div>
              ) : null}
            </div>

            <div className="flex-1" />

            {hero.headlineVisible && hero.headline ? (
              <motion.h1
                id="hero-heading"
                className={cn(
                  "max-w-3xl font-bold leading-[1.08] tracking-[-0.02em] text-white",
                  isPreview
                    ? previewDesktop
                      ? "text-[2.35rem]"
                      : "text-[1.85rem]"
                    : "text-[2rem] sm:text-[2.75rem] md:text-[3.4rem] lg:text-[3.75rem]",
                  headlineAlignment,
                )}
                initial={{ opacity: reduceMotion ? 1 : 0, y: reduceMotion ? 0 : 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ...t, delay: step * 3 }}
              >
                {hero.headline.split("\n").map((line, index) => (
                  <span key={`${line}-${index}`} className="block">
                    {line}
                  </span>
                ))}
              </motion.h1>
            ) : null}

            {hero.overlineVisible && hero.overline ? (
              <p
                className={cn(
                  "type-label-caps-accent mt-3 max-w-xl text-[0.65rem] text-white/70 sm:mt-4",
                  headlineAlignment,
                )}
              >
                {hero.overline}
              </p>
            ) : null}

            <div
              className={cn(
                "mt-8 flex gap-7",
                isPreview
                  ? previewDesktop
                    ? "flex-row items-end justify-between gap-5"
                    : "flex-col-reverse"
                  : "flex-col-reverse sm:mt-10 sm:flex-row sm:items-end sm:justify-between sm:gap-6",
              )}
            >
              {visibleFeatures.length ? (
                <motion.ul
                  className="flex flex-col gap-2.5"
                  initial={{ opacity: reduceMotion ? 1 : 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ ...t, delay: step * 4 }}
                >
                  {visibleFeatures.map((feature, index) => (
                    <motion.li
                      key={feature.id}
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
                      <span className="text-sm font-medium text-white sm:text-[0.9rem]">{feature.text}</span>
                    </motion.li>
                  ))}
                </motion.ul>
              ) : (
                <span />
              )}

              {hero.campaignBadge.visible && hero.campaignBadge.text ? (
                <OptionalLink
                  href={hero.campaignBadge.href}
                  className={campaignBadgeClass(hero.campaignBadge.style)}
                >
                  {hero.campaignBadge.text}
                </OptionalLink>
              ) : null}

              {hero.primaryCta.visible || hero.secondaryCta.visible ? (
                <motion.div
                  className={cn(
                    "flex flex-col gap-3",
                    !previewMobile && "sm:flex-row sm:items-center",
                  )}
                  initial={{ opacity: reduceMotion ? 1 : 0, y: reduceMotion ? 0 : 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ ...t, delay: step * 5 }}
                >
                  {hero.primaryCta.visible && hero.primaryCta.label ? (
                    <OptionalLink href={hero.primaryCta.href} className={heroButtonClass(hero.primaryCta.style)}>
                      {hero.primaryCta.label}
                    </OptionalLink>
                  ) : null}
                  {hero.secondaryCta.visible && hero.secondaryCta.label ? (
                    <OptionalLink href={hero.secondaryCta.href} className={heroButtonClass(hero.secondaryCta.style)}>
                      {hero.secondaryCta.label}
                    </OptionalLink>
                  ) : null}
                </motion.div>
              ) : null}
            </div>
          </div>
        </div>
      </Container>

      {hero.leadVisible && hero.lead ? (
        <Container variant={isPreview ? "fluid" : "hero"}>
          <p
            className={cn(
              "type-lead max-w-prose-lead",
              isPreview ? "mt-3 px-2 text-xs" : "mt-5 sm:mt-6",
              leadAlignment,
            )}
          >
            {hero.lead}
          </p>
        </Container>
      ) : null}
    </section>
  );
}
