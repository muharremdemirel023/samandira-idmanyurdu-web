"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import {
  campaignAnimationDefaults,
  clampCampaignAnimationDelay,
  clampCampaignAnimationDuration,
  clampCampaignPopupDelay,
  getCampaignMotionConfig,
  isCampaignAnimationType,
} from "@/lib/campaign-animation";
import type { Campaign } from "@/lib/content";

function storageKey(campaignId: string, scope: "once" | "session") {
  return `samandira_campaign_${campaignId}_${scope}`;
}

export function CampaignSlideIn({ campaign }: { campaign: Campaign | null }) {
  const pathname = usePathname();
  const reduceMotion = Boolean(useReducedMotion());
  const [open, setOpen] = useState(false);
  const href = campaign?.button_href || "/on-kayit";

  const animationType =
    campaign?.animation_type && isCampaignAnimationType(campaign.animation_type)
      ? campaign.animation_type
      : campaignAnimationDefaults.type;
  const animationDurationMs =
    campaign?.animation_duration_ms ?? campaignAnimationDefaults.durationMs;
  const animationDelayMs = campaign?.animation_delay_ms ?? campaignAnimationDefaults.delayMs;
  const popupDelayMs = clampCampaignPopupDelay(
    campaign?.open_delay_ms ?? campaignAnimationDefaults.popupDelayMs,
  );
  const motionConfig = useMemo(
    () =>
      getCampaignMotionConfig({
        type: animationType,
        durationMs: animationDurationMs,
        delayMs: animationDelayMs,
        reduceMotion,
      }),
    [animationDelayMs, animationDurationMs, animationType, reduceMotion],
  );

  const rememberDismissal = useCallback(() => {
    if (!campaign) return;
    try {
      if (campaign.show_once_per_user) {
        window.localStorage.setItem(storageKey(campaign.id, "once"), "1");
      }
      if (!campaign.show_every_reload) {
        window.sessionStorage.setItem(storageKey(campaign.id, "session"), "1");
      }
    } catch {
      // Depolama kullanılamıyorsa popup davranışı çalışmaya devam eder.
    }
  }, [campaign]);

  const close = useCallback(() => {
    setOpen(false);
    rememberDismissal();
  }, [rememberDismissal]);

  useEffect(() => {
    if (!campaign || pathname === href) return;

    try {
      if (
        campaign.show_once_per_user &&
        window.localStorage.getItem(storageKey(campaign.id, "once"))
      ) {
        return;
      }
      if (
        !campaign.show_every_reload &&
        window.sessionStorage.getItem(storageKey(campaign.id, "session"))
      ) {
        return;
      }
    } catch {
      // Depolama kullanılamıyorsa zamanlayıcı normal şekilde devam eder.
    }

    const timer = window.setTimeout(() => {
      setOpen(true);
      if (campaign.show_once_per_user) {
        try {
          window.localStorage.setItem(storageKey(campaign.id, "once"), "1");
        } catch {
          // Depolama kullanılamıyorsa yoksay.
        }
      }
    }, popupDelayMs);

    return () => window.clearTimeout(timer);
  }, [campaign, href, pathname, popupDelayMs]);

  useEffect(() => {
    if (!open || !campaign?.auto_close_seconds || campaign.auto_close_seconds <= 0) return;

    const entryTimeMs =
      reduceMotion || animationType === "none"
        ? 0
        : clampCampaignAnimationDelay(animationDelayMs) +
          clampCampaignAnimationDuration(animationDurationMs);
    const timer = window.setTimeout(
      close,
      entryTimeMs + campaign.auto_close_seconds * 1000,
    );
    return () => window.clearTimeout(timer);
  }, [animationDelayMs, animationDurationMs, animationType, campaign, close, open, reduceMotion]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [close, open]);

  if (!campaign || pathname === href) return null;

  const desktopImage = campaign.desktop_image_url || campaign.mobile_image_url;
  const mobileImage = campaign.mobile_image_url || desktopImage;
  const title = campaign.title || (!desktopImage ? campaign.name : null);
  const hasMessage = Boolean(title || campaign.description || campaign.button_label);
  const image = desktopImage ? (
    <picture>
      {mobileImage ? <source media="(max-width: 639px)" srcSet={mobileImage} /> : null}
      {/* Kampanya görselleri Supabase public URL veya yerel asset olabilir. */}
      <img
        src={desktopImage}
        alt={campaign.name}
        className="h-auto max-h-[min(62vh,34rem)] w-full object-contain"
      />
    </picture>
  ) : null;

  return (
    <AnimatePresence>
      {open ? (
        <motion.aside
          key={campaign.id}
          initial={motionConfig.initial}
          animate={motionConfig.animate}
          exit={{
            opacity: 0,
            y: reduceMotion ? 0 : 12,
            scale: reduceMotion ? 1 : 0.98,
            transition: { duration: reduceMotion ? 0 : 0.2, delay: 0 },
          }}
          transition={motionConfig.transition}
          className="fixed right-4 bottom-4 z-[70] w-[calc(100%-2rem)] max-w-[380px] origin-bottom-right md:right-6 md:bottom-6 md:w-[380px]"
          role="dialog"
          aria-label={campaign.name}
        >
          <div className="relative overflow-hidden rounded-2xl border border-maroon/15 bg-surface-card shadow-[0_18px_44px_-22px_rgba(74,18,32,0.48)]">
            {image && href && !hasMessage ? (
              <Link href={href} onClick={close} className="block">
                {image}
              </Link>
            ) : (
              image
            )}

            {hasMessage ? (
              <div
                className="border-t border-border-subtle bg-surface-card px-5 py-4"
                style={{ marginTop: campaign.content_gap_px ?? 0 }}
              >
                {title ? <h2 className="text-lg font-bold text-maroon-deep">{title}</h2> : null}
                {campaign.description ? (
                  <p className="mt-1.5 text-sm leading-6 text-text-muted">{campaign.description}</p>
                ) : null}
                {campaign.button_label && href ? (
                  <Link
                    href={href}
                    onClick={close}
                    className="mt-4 inline-flex min-h-10 items-center justify-center rounded-full bg-accent px-5 py-2 text-sm font-bold text-white transition hover:bg-accent-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/70"
                  >
                    {campaign.button_label}
                  </Link>
                ) : null}
              </div>
            ) : null}

            <button
              type="button"
              onClick={close}
              aria-label="Kampanya kartını kapat"
              className="absolute top-2 right-2 flex size-9 items-center justify-center rounded-full border border-border-subtle bg-surface-card/95 text-maroon-deep shadow-shell transition hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/70"
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="size-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
              >
                <path d="M6 6l12 12M18 6 6 18" />
              </svg>
            </button>
          </div>
        </motion.aside>
      ) : null}
    </AnimatePresence>
  );
}
