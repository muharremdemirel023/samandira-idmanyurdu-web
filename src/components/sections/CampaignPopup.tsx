"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

const OPEN_DELAY_MS = 500;
const AUTO_CLOSE_MS = 6000;

export function CampaignPopup() {
  const [open, setOpen] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    const timer = window.setTimeout(() => setOpen(true), OPEN_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!open) return;

    const autoClose = window.setTimeout(close, AUTO_CLOSE_MS);
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
  }, [open, close]);

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
          aria-label="Yaz dönemi kayıt duyurusu"
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
            className="relative w-[92vw] max-w-[720px]"
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
              src="/images/campaigns/yaz-kayit-baslik.png"
              alt="Yaz dönemi akademi kayıtları duyurusu"
              width={1024}
              height={1536}
              priority
              className="h-auto max-h-[82svh] w-full rounded-2xl object-contain"
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
