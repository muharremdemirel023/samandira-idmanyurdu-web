/**
 * Merkezi motion ayarları. prefers-reduced-motion tüketen bileşenlerde süre sıfıra yakın alınır.
 */
export const easeOutPremium = [0.16, 1, 0.3, 1] as const;

export const motionDurations = {
  pageMs: 0.52,
  sectionMs: 0.45,
  microMs: 0.22,
} as const;

export const transitions = {
  page: {
    duration: motionDurations.pageMs,
    ease: easeOutPremium,
  },
  section: {
    duration: motionDurations.sectionMs,
    ease: easeOutPremium,
  },
  micro: {
    duration: motionDurations.microMs,
    ease: easeOutPremium,
  },
} as const;
