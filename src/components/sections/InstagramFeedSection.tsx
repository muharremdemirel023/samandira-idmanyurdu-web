"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

import { Container } from "@/components/ui/Container";
import { siteConfig } from "@/config/site";

const posts = [
  "https://www.instagram.com/p/Dar6jqeCDr8/",
  "https://www.instagram.com/reel/Dar8KC0oZHz/",
  "https://www.instagram.com/reel/DapZW0ZI5MT/",
];

const EMBED_SCRIPT_SRC = "https://www.instagram.com/embed.js";

declare global {
  interface Window {
    instgrm?: { Embeds: { process: () => void } };
  }
}

function loadInstagramEmbedScript() {
  if (window.instgrm) {
    window.instgrm.Embeds.process();
    return;
  }
  const existing = document.querySelector(`script[src="${EMBED_SCRIPT_SRC}"]`);
  if (existing) return;

  const script = document.createElement("script");
  script.src = EMBED_SCRIPT_SRC;
  script.async = true;
  document.body.appendChild(script);
}

const instagramHref =
  siteConfig.social.find((item) => item.label === "Instagram")?.href ??
  "https://www.instagram.com/";

const isReel = (url: string) => url.includes("/reel/");

export function InstagramFeedSection() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);
  const [activePost, setActivePost] = useState<string | null>(null);
  const prefersReducedMotion = useReducedMotion();

  const closeModal = useCallback(() => setActivePost(null), []);

  useEffect(() => {
    const node = sectionRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "600px 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (visible) loadInstagramEmbedScript();
  }, [visible]);

  useEffect(() => {
    if (!activePost) return;

    loadInstagramEmbedScript();
    window.instgrm?.Embeds.process();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeModal();
    };
    window.addEventListener("keydown", onKeyDown);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [activePost, closeModal]);

  return (
    <section
      ref={sectionRef}
      className="bg-surface-base py-14 md:py-20"
      aria-label="Akademiden son paylaşımlar"
    >
      <Container>
        <div className="text-center">
          <p className="type-overline text-accent">Sosyal medya</p>
          <h2 className="type-heading-lg mt-2 text-maroon-deep">Akademiden Son Paylaşımlar</h2>
          <p className="type-body-lg mx-auto mt-3 max-w-prose-body">
            Antrenmanlardan, etkinliklerden ve akademi hayatından son paylaşımlar.
          </p>
        </div>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 md:mt-10 lg:grid-cols-3">
          {posts.map((url) => (
            <div
              key={url}
              className="relative flex min-h-[24rem] justify-center overflow-hidden rounded-2xl border border-maroon/12 bg-surface-card p-2 shadow-[0_2px_10px_-6px_rgba(74,18,32,0.18)]"
            >
              {visible ? (
                <>
                  <blockquote
                    className="instagram-media !m-0 !min-w-0 !max-w-full !border-0"
                    data-instgrm-permalink={url}
                    data-instgrm-version="14"
                    style={{ width: "100%" }}
                  >
                    <a href={url} target="_blank" rel="noopener noreferrer">
                      Instagram paylaşımını görüntüle
                    </a>
                  </blockquote>
                  <button
                    type="button"
                    onClick={() => setActivePost(url)}
                    aria-label="Paylaşımı büyüt"
                    className="absolute inset-0 z-10 cursor-pointer bg-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent/70"
                  />
                </>
              ) : (
                <div
                  aria-hidden
                  className="h-full w-full animate-pulse rounded-xl bg-surface-muted motion-reduce:animate-none"
                />
              )}
            </div>
          ))}
        </div>

        <div className="mt-8 flex justify-center md:mt-10">
          <a
            href={instagramHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-[2.75rem] items-center justify-center rounded-full bg-accent px-7 text-sm font-bold text-white transition hover:bg-accent-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/70 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-base"
          >
            Instagram&apos;da Takip Et
          </a>
        </div>
      </Container>

      <AnimatePresence>
        {activePost && (
          <motion.div
            key="instagram-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.2 }}
            className="fixed inset-0 z-[90] flex items-center justify-center overflow-hidden bg-black/55 p-3"
            onClick={closeModal}
            role="dialog"
            aria-modal="true"
            aria-label="Instagram paylaşımı"
          >
            <motion.div
              initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: prefersReducedMotion ? 0 : 0.2 }}
              className={
                isReel(activePost)
                  ? "relative aspect-[9/16] max-h-[90svh] overflow-hidden rounded-2xl bg-surface-card"
                  : "relative max-h-[90svh] w-[94vw] max-w-[480px] overflow-hidden rounded-2xl bg-surface-card"
              }
              style={
                isReel(activePost)
                  ? { width: "min(94vw, 480px, calc(90svh * 9 / 16))" }
                  : undefined
              }
              onClick={(event) => event.stopPropagation()}
            >
              <button
                type="button"
                onClick={closeModal}
                aria-label="Paylaşımı kapat"
                className="absolute right-2 top-2 z-20 flex size-11 items-center justify-center rounded-full bg-surface-card/95 text-maroon-deep shadow-[0_2px_8px_-4px_rgba(74,18,32,0.45)] transition hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/70"
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

              <div
                className={
                  isReel(activePost)
                    ? "flex h-full w-full items-center justify-center overflow-y-auto"
                    : "flex max-h-[90svh] w-full items-center justify-center overflow-y-auto"
                }
              >
                <blockquote
                  className="instagram-media !m-0 !min-w-0 !max-w-full !border-0"
                  data-instgrm-permalink={activePost}
                  data-instgrm-version="14"
                  style={{ width: "100%" }}
                >
                  <a href={activePost} target="_blank" rel="noopener noreferrer">
                    Instagram paylaşımını görüntüle
                  </a>
                </blockquote>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
