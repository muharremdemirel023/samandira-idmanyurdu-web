export const campaignAnimationTypes = [
  "none",
  "fade",
  "slide-up",
  "zoom",
  "scale-fade",
] as const;

export type CampaignAnimationType = (typeof campaignAnimationTypes)[number];

export const campaignAnimationDefaults = {
  type: "scale-fade" as CampaignAnimationType,
  durationMs: 1200,
  delayMs: 0,
  popupDelayMs: 1000,
} as const;

export const campaignAnimationOptions: ReadonlyArray<{
  value: CampaignAnimationType;
  label: string;
}> = [
  { value: "none", label: "Animasyon Yok" },
  { value: "fade", label: "Fade In" },
  { value: "slide-up", label: "Aşağıdan Yukarı" },
  { value: "zoom", label: "Zoom In" },
  { value: "scale-fade", label: "Scale + Fade" },
];

export function isCampaignAnimationType(value: string): value is CampaignAnimationType {
  return campaignAnimationTypes.includes(value as CampaignAnimationType);
}

export function clampCampaignAnimationDuration(value: number) {
  return Math.max(300, Math.min(3000, value));
}

export function clampCampaignAnimationDelay(value: number) {
  return Math.max(0, Math.min(3000, value));
}

export function clampCampaignPopupDelay(value: number) {
  return Math.max(0, Math.min(10000, value));
}

type CampaignMotionOptions = {
  type: CampaignAnimationType;
  durationMs: number;
  delayMs: number;
  reduceMotion: boolean;
};

const visibleState = { opacity: 1, y: 0, scale: 1 } as const;
const premiumEase = [0.16, 1, 0.3, 1] as const;

export function getCampaignMotionConfig({
  type,
  durationMs,
  delayMs,
  reduceMotion,
}: CampaignMotionOptions) {
  if (reduceMotion || type === "none") {
    return {
      initial: false as const,
      animate: visibleState,
      transition: { duration: 0, delay: 0 },
    };
  }

  const initialStates = {
    fade: { opacity: 0, y: 0, scale: 1 },
    "slide-up": { opacity: 0, y: 36, scale: 1 },
    zoom: { opacity: 1, y: 0, scale: 0.82 },
    "scale-fade": { opacity: 0, y: 0, scale: 0.92 },
  } as const;

  return {
    initial: initialStates[type],
    animate: visibleState,
    transition: {
      duration: clampCampaignAnimationDuration(durationMs) / 1000,
      delay: clampCampaignAnimationDelay(delayMs) / 1000,
      ease: premiumEase,
    },
  };
}
