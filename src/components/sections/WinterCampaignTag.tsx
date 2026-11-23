"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState, type CSSProperties } from "react";

import styles from "./WinterCampaignTag.module.css";

type Scene = "intro" | "breaking" | "offer";
const dismissedInTab = new Set<string>();

const snowChunks = [
  {
    outline: "M2 32Q1 22 12 18Q15 10 29 12Q39 2 54 7Q71 0 85 8L94 10L90 18L95 24L88 33Q81 44 72 35Q66 32 60 36Q51 43 45 35Q38 29 32 35Q26 45 18 39Q13 34 9 37Q2 39 2 32Z",
    crest: "M14 22Q19 14 29 16Q40 7 53 11M60 10Q72 5 81 10",
  },
  {
    outline: "M86 10Q97 5 107 8Q122 -1 137 6Q151 1 161 9Q169 6 178 12L174 18L181 24L173 33Q166 42 159 34Q152 28 146 38Q139 49 132 39Q127 31 120 35Q108 43 100 34Q94 30 89 35L92 25L87 20L91 14Z",
    crest: "M98 13Q104 10 108 12Q122 4 136 10M143 9Q153 6 160 13",
  },
  {
    outline: "M174 12Q184 5 196 10Q209 3 221 11Q238 7 245 17Q258 16 259 29Q262 37 254 38Q248 35 243 40Q235 47 228 36Q223 31 216 36Q203 46 197 35Q191 30 184 35Q179 40 172 35L177 25L171 20L177 15Z",
    crest: "M184 15Q191 11 197 15Q208 8 220 15M229 14Q238 13 243 20",
  },
];

function SnowCap() {
  const ice = useId();
  return (
    <svg className={styles.snow} viewBox="0 0 262 50" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id={ice} x1="0" x2="0.08" y1="0" y2="1">
          <stop stopColor="#fff" />
          <stop offset=".48" stopColor="#f7fcff" />
          <stop offset=".77" stopColor="#deecf5" />
          <stop offset="1" stopColor="#9cb8cb" />
        </linearGradient>
      </defs>
      {snowChunks.map(({ outline, crest }) => (
        <g key={crest} className={styles.chunk}>
          <path fill={`url(#${ice})`} d={outline} />
          <path d={crest} fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" />
        </g>
      ))}
    </svg>
  );
}

const scatter = [-26, 9, -16, -30, 12, -8, 22, -14, 8, 25, -10, 31];

function SnowCrumbs() {
  return (
    <div className={styles.crumbs} aria-hidden="true">
      {scatter.map((drift, i) => (
        <i
          key={`crumb-${i}`}
          style={{ left: `${4 + i * 8}%`, "--drift": `${drift}px` } as CSSProperties}
        />
      ))}
    </div>
  );
}

function Hanger() {
  return (
    <div className={styles.hanger} aria-hidden="true">
      <svg className={styles.cord} viewBox="0 0 24 84" preserveAspectRatio="none" fill="none">
        <path d="M12 1C11 23 6 53 7 72Q7 82 12 82Q18 82 17 72C16 52 13 22 12 1Z"
          stroke="#503221" strokeWidth="3.2" />
        <path d="M12 1C11 23 6 53 7 72Q7 82 12 82Q18 82 17 72C16 52 13 22 12 1Z"
          stroke="#f1cf97" strokeWidth="1.8" strokeDasharray="2.8 1.6" />
      </svg>
      <span className={styles.pin} />
    </div>
  );
}

export function WinterCampaignTag({ dismissalKey }: { dismissalKey: string }) {
  const [visible, setVisible] = useState(false);
  const [closing, setClosing] = useState(false);
  const [scene, setScene] = useState<Scene>("intro");
  const [isHovered, setIsHovered] = useState(false);
  const tagRef = useRef<HTMLElement>(null);
  const revealRef = useRef<HTMLButtonElement>(null);
  const offerHeading = useRef<HTMLHeadingElement>(null);
  const focusOffer = useRef(false);
  const previousFocus = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (dismissedInTab.has(dismissalKey)) return;
    try {
      if (window.sessionStorage.getItem(dismissalKey)) return;
    } catch {
      // The in-memory set still covers client navigation when storage is unavailable.
    }
    const timer = window.setTimeout(() => setVisible(true), 1000);
    return () => window.clearTimeout(timer);
  }, [dismissalKey]);

  useEffect(() => {
    if (scene === "offer" && focusOffer.current) {
      offerHeading.current?.focus({ preventScroll: true });
      focusOffer.current = false;
    }
  }, [scene]);

  function rememberDismissal() {
    dismissedInTab.add(dismissalKey);
    try {
      window.sessionStorage.setItem(dismissalKey, "1");
    } catch {
      // The dismissal has already been remembered for this document.
    }
  }

  function dismiss() {
    rememberDismissal();
    if (tagRef.current?.contains(document.activeElement) && previousFocus.current?.isConnected) {
      previousFocus.current.focus({ preventScroll: true });
    }
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setVisible(false);
    } else {
      setClosing(true);
      window.setTimeout(() => setVisible(false), 500);
    }
  }

  function showOffer() {
    focusOffer.current = document.activeElement === revealRef.current;
    setScene("offer");
  }

  function reveal() {
    if (scene !== "intro") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      showOffer();
    } else {
      setScene("breaking");
      window.setTimeout(() => {
        showOffer();
      }, 860);
    }
  }

  if (!visible) return null;

  return (
    <aside
      ref={tagRef}
      aria-label="Kış kampanyası"
      className={styles.rail}
      inert={closing}
      onFocusCapture={(event) => {
        const from = event.relatedTarget;
        if (from instanceof HTMLElement && !event.currentTarget.contains(from)) {
          previousFocus.current = from;
        }
      }}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          event.stopPropagation();
          dismiss();
        }
      }}
    >
      <div
        className={styles.reel}
        data-closing={closing || undefined}
        onAnimationEnd={(event) => {
          if (closing && event.target === event.currentTarget) setVisible(false);
        }}
      >
        <div className={styles.drop}>
          <div
            className={styles.pendulum}
            data-paused={isHovered || undefined}
            style={isHovered ? { animationPlayState: "paused" } : undefined}
          >
            <div className={styles.assembly} data-scene={scene}>
              <Hanger />
              <div
                className={styles.tag}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
              >
                <div className={styles.face}>
                  <svg className={styles.stitch} viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
                    <path d="M13 2.5H87L97.5 10V95L95.5 97.5H4.5L2.5 95V10Z"
                      fill="none" stroke="currentColor" strokeDasharray="3 4" vectorEffect="non-scaling-stroke" />
                  </svg>
                  <div className={styles.copy}>
                    <div
                      className={styles.intro}
                      inert={scene === "offer"}
                      onAnimationEnd={(event) => {
                        if (!closing && scene === "breaking" && event.target === event.currentTarget) showOffer();
                      }}
                    >
                      <p className={styles.kicker}>KIŞ KAMPANYASI</p>
                      <h2 className={styles.question}>Avantajı yakalamak ister misiniz?</h2>
                      <button ref={revealRef} type="button" className={styles.cta} onClick={reveal}
                        aria-disabled={scene === "breaking"}>
                        Avantajı Gör <span aria-hidden="true">→</span>
                      </button>
                    </div>
                    <div className={styles.offer} inert={scene !== "offer"}>
                      <p className={styles.badge}>BİR AY BİZDEN</p>
                      <h2 ref={offerHeading} tabIndex={-1} className={styles.title}>6 AYLIK PAKET</h2>
                      <p className={styles.description}>Beş aylık aidatla altı ay antrenman</p>
                      <p className={styles.note}>Kıyafet dahil</p>
                      <Link
                        href="/kis-kampanyasi"
                        className={styles.cta}
                        onClick={rememberDismissal}
                      >
                        Hemen Kayıt Ol <span aria-hidden="true">→</span>
                      </Link>
                      <Link
                        href="/kis-kampanyasi#tum-paketler"
                        className={styles.secondary}
                        onClick={rememberDismissal}
                      >
                        Diğer Paketleri Gör
                      </Link>
                    </div>
                  </div>
                </div>
                {scene !== "offer" && <SnowCap />}
                {scene === "breaking" && <SnowCrumbs />}
                <span className={styles.eyelet} aria-hidden="true" />
                <button type="button" className={styles.close} onClick={dismiss} aria-label="Kampanya etiketini kapat">
                  <svg viewBox="0 0 20 20" width="14" height="14" fill="none" stroke="currentColor"
                    strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                    <path d="m5 5 10 10M15 5 5 15" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
