"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

import { Carousel } from "@/components/ui/Carousel";
import { Container } from "@/components/ui/Container";
import { useCookieConsent } from "@/components/cookie-consent/CookieConsentProvider";
import { getYoutubeEmbedUrl } from "@/lib/video-embed";
import type { VideoRow } from "@/lib/content";

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

type TrainingVideosSectionViewProps = {
  videos: VideoRow[];
};

export function TrainingVideosSectionView({ videos }: TrainingVideosSectionViewProps) {
  const [activeVideo, setActiveVideo] = useState<VideoRow | null>(null);
  const prefersReducedMotion = useReducedMotion();
  const { consent, openPreferences } = useCookieConsent();
  const marketingAllowed = consent?.marketing === true;

  const closeModal = useCallback(() => setActiveVideo(null), []);

  useEffect(() => {
    if (!activeVideo) return;

    if (activeVideo.provider === "instagram" && marketingAllowed) {
      loadInstagramEmbedScript();
      window.instgrm?.Embeds.process();
    }

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
  }, [activeVideo, closeModal, marketingAllowed]);

  function handleCardClick(video: VideoRow) {
    if (video.provider === "youtube" || video.provider === "instagram" || video.provider === "upload") {
      setActiveVideo(video);
      return;
    }

    window.open(video.video_url, "_blank", "noopener,noreferrer");
  }

  return (
    <>
      <Carousel
        className="mt-8 md:mt-10"
        ariaLabel="Antrenman videoları"
        items={videos.map((video) => (
          <button
            key={video.id}
            type="button"
            onClick={() => handleCardClick(video)}
            className="group relative aspect-[9/16] w-full overflow-hidden rounded-2xl border border-border-subtle bg-surface-deep shadow-shell transition-colors duration-200 hover:border-accent/40 motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/70"
          >
            {video.thumbnail_url ? (
              <img
                src={video.thumbnail_url}
                alt={video.title || "Antrenman videosu"}
                className="absolute inset-0 h-full w-full object-cover transition duration-300 group-hover:scale-105"
              />
            ) : (
              <div
                aria-hidden
                className="absolute inset-0 bg-[linear-gradient(145deg,#42101c,#26060d)]"
              />
            )}

            <div
              aria-hidden
              className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent"
            />

            <span
              aria-hidden
              className="absolute inset-0 flex items-center justify-center"
            >
              <span className="flex size-11 items-center justify-center rounded-full bg-accent/95 shadow-[0_8px_18px_-8px_rgba(0,0,0,0.6)] transition group-hover:scale-105">
                <svg viewBox="0 0 24 24" className="ml-0.5 size-4 fill-white">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </span>
            </span>

            {video.title ? (
              <span className="absolute inset-x-0 bottom-0 px-3 pb-3 text-left text-sm font-semibold leading-snug text-white">
                {video.title}
              </span>
            ) : null}
          </button>
        ))}
        itemClassName="w-[46%] sm:w-[31%] md:w-[23%]"
      />

      <AnimatePresence>
        {activeVideo && (
          <motion.div
            key="training-video-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.2 }}
            className="fixed inset-0 z-[90] flex items-center justify-center overflow-hidden bg-black/70 p-3"
            onClick={closeModal}
            role="dialog"
            aria-modal="true"
            aria-label={activeVideo.title || "Antrenman videosu"}
          >
            <motion.div
              initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: prefersReducedMotion ? 0 : 0.2 }}
              className="relative aspect-[9/16] max-h-[90svh] overflow-hidden rounded-2xl bg-black"
              style={{ width: "min(94vw, 480px, calc(90svh * 9 / 16))" }}
              onClick={(event) => event.stopPropagation()}
            >
              <button
                type="button"
                onClick={closeModal}
                aria-label="Videoyu kapat"
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

              {activeVideo.provider === "youtube" && getYoutubeEmbedUrl(activeVideo.video_url) ? (
                marketingAllowed ? (
                  <iframe
                    src={getYoutubeEmbedUrl(activeVideo.video_url) ?? undefined}
                    title={activeVideo.title || "Antrenman videosu"}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="h-full w-full"
                  />
                ) : (
                  <div className="flex h-full w-full flex-col items-center justify-center gap-3 p-8 text-center">
                    <p className="text-sm leading-6 text-white/80">
                      Bu içeriği görüntülemek için pazarlama çerezlerini kabul edin.
                    </p>
                    <button
                      type="button"
                      onClick={openPreferences}
                      className="rounded-full border border-white/35 px-4 py-2 text-sm font-bold text-white transition hover:bg-white/10"
                    >
                      Çerez Tercihleri
                    </button>
                    <a
                      href={activeVideo.video_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-semibold text-white underline underline-offset-2"
                    >
                      YouTube&apos;da izle
                    </a>
                  </div>
                )
              ) : activeVideo.provider === "upload" ? (
                <video
                  src={activeVideo.video_url}
                  controls
                  autoPlay
                  playsInline
                  controlsList="nodownload noremoteplayback"
                  disablePictureInPicture
                  onContextMenu={(event) => event.preventDefault()}
                  className="h-full w-full object-contain"
                />
              ) : marketingAllowed ? (
                <div className="flex h-full w-full items-center justify-center overflow-y-auto">
                  <blockquote
                    className="instagram-media !m-0 !min-w-0 !max-w-full !border-0"
                    data-instgrm-permalink={activeVideo.video_url}
                    data-instgrm-version="14"
                    style={{ width: "100%" }}
                  >
                    <a href={activeVideo.video_url} target="_blank" rel="noopener noreferrer">
                      Videoyu görüntüle
                    </a>
                  </blockquote>
                </div>
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center gap-3 p-8 text-center">
                  <p className="text-sm leading-6 text-white/80">
                    Bu içeriği görüntülemek için pazarlama çerezlerini kabul edin.
                  </p>
                  <button
                    type="button"
                    onClick={openPreferences}
                    className="rounded-full border border-white/35 px-4 py-2 text-sm font-bold text-white transition hover:bg-white/10"
                  >
                    Çerez Tercihleri
                  </button>
                  <a
                    href={activeVideo.video_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-semibold text-white underline underline-offset-2"
                  >
                    Instagram&apos;da izle
                  </a>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export function TrainingVideosSectionWrapper({
  videos,
  title,
  subtitle,
}: {
  videos: VideoRow[];
  title: string;
  subtitle: string;
}) {
  if (videos.length === 0) return null;

  return (
    <section className="py-14 md:py-20" aria-label={title}>
      <Container>
        <div className="text-center">
          <p className="type-overline text-accent">Antrenman Görüntüleri</p>
          <h2 className="type-heading-lg mt-2 text-maroon-deep">{title}</h2>
          <p className="type-body-lg mx-auto mt-3 max-w-prose-body">{subtitle}</p>
        </div>

        <TrainingVideosSectionView videos={videos} />
      </Container>
    </section>
  );
}
