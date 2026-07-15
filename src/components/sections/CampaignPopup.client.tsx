"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

export type CampaignPopupData = {
  id: string;
  desktopImage: string;
  mobileImage: string | null;
  title: string | null;
  description: string | null;
  buttonLabel: string | null;
  buttonHref: string | null;
  openDelayMs: number;
  autoCloseSeconds: number;
  showOncePerUser: boolean;
  /** Görsel ile mesaj kartı arası dikey boşluk (px); negatif değer kartı görsele yaklaştırır */
  contentGapPx: number;
};

export function CampaignPopupView({ campaign }: { campaign: CampaignPopupData }) {
  const [open, setOpen] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    const storageKey = `campaign-seen-${campaign.id}`;

    if (campaign.showOncePerUser) {
      try {
        if (window.localStorage.getItem(storageKey)) {
          return;
        }
      } catch {
        // localStorage erişilemiyorsa popup normal davranır
      }
    }

    const timer = window.setTimeout(() => {
      setOpen(true);
      if (campaign.showOncePerUser) {
        try {
          window.localStorage.setItem(storageKey, "1");
        } catch {
          // yoksay
        }
      }
    }, campaign.openDelayMs);

    return () => window.clearTimeout(timer);
  }, [campaign.id, campaign.openDelayMs, campaign.showOncePerUser]);

  useEffect(() => {
    if (!open) return;

    const autoClose = window.setTimeout(close, campaign.autoCloseSeconds * 1000);
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    window.addEventListener("keydown", onKeyDown);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.clearTimeout(autoClose);
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, close, campaign.autoCloseSeconds]);

  // Mobil görsel yüklenemezse masaüstü görseline düşülür
  const [mobileFailed, setMobileFailed] = useState(false);
  const mobileImage =
    (!mobileFailed && campaign.mobileImage) || campaign.desktopImage;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="campaign-popup"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.25 }}
          className="fixed inset-0 z-[80] flex items-center justify-center overflow-hidden bg-black/45 p-4"
          onClick={close}
          role="dialog"
          aria-modal="true"
          aria-label={campaign.title || "Kampanya duyurusu"}
        >
          <motion.div
            style={{ originX: 0.5, originY: 1 }}
            initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 1, x: "100vw", rotate: 0 }}
            animate={
              prefersReducedMotion
                ? { opacity: 1 }
                : { x: 0, rotate: [0, 0, -2, 2, -1, 1, 0] }
            }
            exit={{ opacity: 0 }}
            transition={
              prefersReducedMotion
                ? { duration: 0 }
                : {
                    x: { type: "spring", stiffness: 260, damping: 24, mass: 0.9 },
                    rotate: {
                      duration: 0.75,
                      delay: 0.4,
                      times: [0, 0.05, 0.25, 0.5, 0.7, 0.88, 1],
                      ease: "easeInOut",
                    },
                    opacity: { duration: 0.25 },
                  }
            }
            className="relative flex max-h-[calc(100svh-2.5rem)] w-[92vw] max-w-[720px] flex-col"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={close}
              aria-label="Duyuruyu kapat"
              className="absolute -top-3 -right-3 z-10 flex size-11 items-center justify-center rounded-full bg-surface-card text-maroon-deep shadow-[0_2px_10px_-4px_rgba(74,18,32,0.4)] transition hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/70"
            >
              <svg
                aria-hidden
                viewBox="0 0 24 24"
                className="size-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
              >
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>

            <Image
              src={campaign.desktopImage}
              alt={campaign.title || "Kampanya görseli"}
              width={1024}
              height={1536}
              priority
              unoptimized={campaign.desktopImage.startsWith("http")}
              className="hidden h-auto max-h-[66svh] w-full rounded-2xl object-contain sm:block"
            />
            <Image
              src={mobileImage}
              alt={campaign.title || "Kampanya görseli"}
              width={1024}
              height={1536}
              priority
              unoptimized={mobileImage.startsWith("http")}
              onError={() => setMobileFailed(true)}
              className="h-auto max-h-[66svh] w-full rounded-2xl object-contain sm:hidden"
            />

            {(campaign.title || campaign.description || (campaign.buttonLabel && campaign.buttonHref)) && (
              <div
                className="relative shrink-0 rounded-2xl bg-surface-card px-4 py-3 text-center sm:px-5 sm:py-4"
                style={{ marginTop: campaign.contentGapPx }}
              >
                {campaign.title ? (
                  <p className="type-heading-md text-maroon-deep">{campaign.title}</p>
                ) : null}
                {campaign.description ? (
                  <p className="type-body mt-1 text-text-muted">{campaign.description}</p>
                ) : null}
                {campaign.buttonLabel && campaign.buttonHref ? (
                  <Link
                    href={campaign.buttonHref}
                    onClick={close}
                    className="mt-3 inline-flex min-h-[2.75rem] items-center justify-center rounded-full bg-accent px-7 text-sm font-bold text-white transition hover:bg-accent-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/70"
                  >
                    {campaign.buttonLabel}
                  </Link>
                ) : null}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
