"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

const STORAGE_KEY = "samandira_campaign_slidein_closed_at";
const SHOW_DELAY_MS = 1000;
const SCROLL_TRIGGER_RATIO = 0.25;
const CAMPAIGN_HREF = "/on-kayit";
const CAMPAIGN_IMAGE = "/images/campaigns/slide-in-kart.png";
const CAMPAIGN_ALT =
  "Samandıra İdman Yurdu Akademi online kayıtlara özel yüzde 15 indirim kampanyası";

export function CampaignSlideIn() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const triggeredRef = useRef(false);
  const prefersReducedMotion = useReducedMotion();

  const close = useCallback(() => {
    setOpen(false);
    try {
      window.localStorage.setItem(STORAGE_KEY, String(Date.now()));
    } catch {
      // localStorage erişilemiyorsa yoksay
    }
  }, []);

  useEffect(() => {
    if (pathname === CAMPAIGN_HREF) return;

    const trigger = () => {
      if (triggeredRef.current) return;
      triggeredRef.current = true;
      setOpen(true);
    };

    const timer = window.setTimeout(trigger, SHOW_DELAY_MS);

    const onScroll = () => {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollable <= 0) return;
      if (window.scrollY / scrollable >= SCROLL_TRIGGER_RATIO) {
        trigger();
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("scroll", onScroll);
    };
  }, [pathname]);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, close]);

  if (pathname === CAMPAIGN_HREF) {
    return null;
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="campaign-slide-in"
          initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, x: 60 }}
          animate={{ opacity: 1, x: 0 }}
          exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, x: 60 }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.35, ease: "easeOut" }}
          className="fixed right-4 bottom-4 z-[70] w-[calc(100%-2rem)] max-w-[380px] md:right-6 md:bottom-6 md:w-[380px]"
          role="dialog"
          aria-label={CAMPAIGN_ALT}
        >
          <div className="group relative">
            <Link
              href={CAMPAIGN_HREF}
              onClick={close}
              className="block overflow-hidden rounded-2xl shadow-[0_16px_40px_-12px_rgba(74,18,32,0.45)] transition-transform duration-200 ease-out group-hover:-translate-y-1"
            >
              <Image
                src={CAMPAIGN_IMAGE}
                alt={CAMPAIGN_ALT}
                width={380}
                height={480}
                className="h-auto w-full rounded-2xl object-contain"
                priority
              />
            </Link>

            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                event.preventDefault();
                close();
              }}
              aria-label="Kampanya kartını kapat"
              className="absolute top-2 right-2 flex size-9 min-h-9 min-w-9 items-center justify-center rounded-full bg-surface-card text-maroon-deep shadow-[0_2px_10px_-4px_rgba(74,18,32,0.4)] transition hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/70"
            >
              <svg
                aria-hidden
                viewBox="0 0 24 24"
                className="size-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
              >
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
