"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

import type { GalleryImageRow } from "@/lib/content";

type GalleryPhotosViewProps = {
  images: GalleryImageRow[];
};

function aspectClass(aspectRatio: string | null) {
  return aspectRatio === "1:1" ? "aspect-square" : "aspect-[4/5]";
}

export function GalleryPhotosView({ images }: GalleryPhotosViewProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const prefersReducedMotion = useReducedMotion();

  const activeImage = useMemo(
    () => (activeIndex !== null ? images[activeIndex] : null),
    [activeIndex, images],
  );

  const close = useCallback(() => setActiveIndex(null), []);
  const showPrev = useCallback(
    () => setActiveIndex((index) => (index === null ? null : (index - 1 + images.length) % images.length)),
    [images.length],
  );
  const showNext = useCallback(
    () => setActiveIndex((index) => (index === null ? null : (index + 1) % images.length)),
    [images.length],
  );

  useEffect(() => {
    if (activeIndex === null) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
      if (event.key === "ArrowLeft") showPrev();
      if (event.key === "ArrowRight") showNext();
    };
    window.addEventListener("keydown", onKeyDown);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [activeIndex, close, showPrev, showNext]);

  return (
    <>
      <div className="mt-8 columns-2 gap-4 sm:columns-3 md:mt-10 lg:columns-4">
        {images.map((image, index) => (
          <button
            key={image.id}
            type="button"
            onClick={() => setActiveIndex(index)}
            className={`mb-4 block w-full overflow-hidden rounded-2xl border border-maroon/12 bg-surface-deep shadow-[0_2px_10px_-6px_rgba(74,18,32,0.18)] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/70 ${aspectClass(image.aspect_ratio)}`}
          >
            <img
              src={image.image_url}
              alt={image.alt_text || "Akademi fotoğrafı"}
              className="h-full w-full object-cover transition duration-300 hover:scale-105"
              loading="lazy"
            />
          </button>
        ))}
      </div>

      <AnimatePresence>
        {activeImage && (
          <motion.div
            key="gallery-photo-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.2 }}
            className="fixed inset-0 z-[90] flex items-center justify-center overflow-hidden bg-black/80 p-3"
            onClick={close}
            role="dialog"
            aria-modal="true"
            aria-label={activeImage.caption || "Akademi fotoğrafı"}
          >
            <button
              type="button"
              onClick={close}
              aria-label="Kapat"
              className="absolute right-3 top-3 z-20 flex size-11 items-center justify-center rounded-full bg-surface-card/95 text-maroon-deep shadow-[0_2px_8px_-4px_rgba(74,18,32,0.45)] transition hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/70"
            >
              <svg aria-hidden viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>

            {images.length > 1 ? (
              <>
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    showPrev();
                  }}
                  aria-label="Önceki fotoğraf"
                  className="absolute left-2 top-1/2 z-20 flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-surface-card/90 text-maroon-deep shadow-[0_2px_8px_-4px_rgba(74,18,32,0.45)] transition hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/70 sm:left-4"
                >
                  <svg aria-hidden viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M15 18l-6-6 6-6" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    showNext();
                  }}
                  aria-label="Sonraki fotoğraf"
                  className="absolute right-2 top-1/2 z-20 flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-surface-card/90 text-maroon-deep shadow-[0_2px_8px_-4px_rgba(74,18,32,0.45)] transition hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/70 sm:right-4"
                >
                  <svg aria-hidden viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 6l6 6-6 6" />
                  </svg>
                </button>
              </>
            ) : null}

            <motion.div
              initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: prefersReducedMotion ? 0 : 0.2 }}
              className="relative max-h-[90svh] max-w-[92vw] overflow-hidden rounded-2xl bg-black"
              onClick={(event) => event.stopPropagation()}
            >
              <img
                src={activeImage.image_url}
                alt={activeImage.alt_text || "Akademi fotoğrafı"}
                className="max-h-[90svh] max-w-[92vw] object-contain"
              />
              {activeImage.caption ? (
                <p className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-4 py-3 text-sm text-white">
                  {activeImage.caption}
                </p>
              ) : null}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
