"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

export type FeaturedCoach = {
  name: string;
  title: string;
  photo: string | null;
  summary: string;
  biography: string[];
};

export function FeaturedCoachProfile({ coach }: { coach: FeaturedCoach }) {
  const [detailOpen, setDetailOpen] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  const close = useCallback(() => setDetailOpen(false), []);

  useEffect(() => {
    if (!detailOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    window.addEventListener("keydown", onKeyDown);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [detailOpen, close]);

  return (
    <article className="grid gap-7 border-t border-border-subtle pt-10 first:border-t-0 first:pt-0 md:grid-cols-[15rem_minmax(0,1fr)] md:gap-10 lg:grid-cols-[17rem_minmax(0,1fr)]">
      <div className="relative aspect-[4/5] w-full max-w-[16rem] overflow-hidden bg-[#42101c] shadow-[0_24px_70px_-48px_rgba(0,0,0,0.95)] md:max-w-none">
        {coach.photo ? (
          <Image
            src={coach.photo}
            alt={coach.name}
            fill
            sizes="(min-width: 1024px) 17rem, (min-width: 768px) 15rem, 16rem"
            className="object-cover"
            unoptimized={coach.photo.startsWith("http")}
          />
        ) : (
          <div className="flex h-full items-end p-5">
            <p className="type-label-caps-accent text-accent">Profil fotoğrafı</p>
          </div>
        )}
      </div>

      <div className="max-w-4xl">
        <p className="type-overline club-kicker-line text-accent">{coach.title}</p>
        <h2 className="mt-3 text-[clamp(2rem,4vw,3.25rem)] font-black uppercase leading-none tracking-normal text-text-primary">
          {coach.name}
        </h2>
        <p className="type-body-lg mt-5 max-w-prose-lead font-medium text-text-muted">
          {coach.summary}
        </p>

        {coach.biography.length > 0 && (
        <button
          type="button"
          onClick={() => setDetailOpen(true)}
          className="mt-7 inline-flex min-h-[2.75rem] items-center justify-center rounded-full bg-accent px-7 text-sm font-bold text-white transition hover:bg-accent-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/70 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-base"
        >
          Detayları Gör
        </button>
        )}
      </div>

      <AnimatePresence>
        {detailOpen && (
          <motion.div
            key="coach-detail"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.2 }}
            className="fixed inset-0 z-[80] flex items-end justify-center bg-black/45 sm:items-center sm:p-4"
            onClick={close}
            role="dialog"
            aria-modal="true"
            aria-label={`${coach.name} biyografisi`}
          >
            <motion.div
              initial={
                prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 24 }
              }
              animate={{ opacity: 1, y: 0 }}
              exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 16 }}
              transition={{ duration: prefersReducedMotion ? 0 : 0.22 }}
              className="relative flex max-h-[85svh] w-full flex-col overflow-hidden rounded-t-2xl bg-surface-card sm:max-w-2xl sm:rounded-2xl"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex items-start justify-between gap-4 border-b border-maroon/12 px-6 py-5 sm:px-8">
                <div>
                  <p className="type-label-caps-accent text-accent">{coach.title}</p>
                  <h3 className="type-heading-md mt-1 text-maroon-deep">{coach.name}</h3>
                </div>
                <button
                  type="button"
                  onClick={close}
                  aria-label="Biyografiyi kapat"
                  className="flex size-11 shrink-0 items-center justify-center rounded-full text-maroon-deep transition hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/70"
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
              </div>

              <div className="space-y-4 overflow-y-auto px-6 py-6 sm:px-8">
                {coach.biography.map((paragraph) => (
                  <p key={paragraph} className="type-body text-text-muted">
                    {paragraph}
                  </p>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </article>
  );
}
