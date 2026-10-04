"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";

import { ImageCropUploadField } from "@/components/admin/ImageCropUploadField";
import {
  campaignAnimationDefaults,
  campaignAnimationOptions,
  getCampaignMotionConfig,
  isCampaignAnimationType,
  type CampaignAnimationType,
} from "@/lib/campaign-animation";
import { cn } from "@/lib/cn";

const inputClass =
  "w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-base text-white outline-none transition placeholder:text-slate-500 focus:border-orange-400 focus:ring-2 focus:ring-orange-400/30 sm:text-sm";
const labelClass = "block text-sm font-semibold text-slate-200";
const previewFallbackImage = "/images/campaigns/slide-in-kart.png";

type CampaignAnimationEditorProps = {
  desktopImageUrl?: string | null;
  mobileImageUrl?: string | null;
  animationType?: string | null;
  animationDurationMs?: number | null;
  animationDelayMs?: number | null;
  popupDelayMs?: number | null;
};

function PreviewStage({
  replayKey,
  imageUrl,
  mode,
  animationType,
  animationDurationMs,
  animationDelayMs,
  popupDelayMs,
}: {
  replayKey: number;
  imageUrl: string;
  mode: "desktop" | "mobile";
  animationType: CampaignAnimationType;
  animationDurationMs: number;
  animationDelayMs: number;
  popupDelayMs: number;
}) {
  const [popupReady, setPopupReady] = useState(popupDelayMs === 0);
  const reduceMotion = Boolean(useReducedMotion());
  const motionConfig = getCampaignMotionConfig({
    type: animationType,
    durationMs: animationDurationMs,
    delayMs: animationDelayMs,
    reduceMotion,
  });

  useEffect(() => {
    if (popupDelayMs === 0) return;
    const timer = window.setTimeout(() => setPopupReady(true), popupDelayMs);
    return () => window.clearTimeout(timer);
  }, [popupDelayMs, replayKey]);

  return (
    <div
      className={cn(
        "relative mx-auto flex min-h-72 items-center justify-center overflow-hidden rounded-2xl border border-slate-700 bg-slate-950/80 p-5 transition-[max-width] duration-200 motion-reduce:transition-none",
        mode === "desktop" ? "max-w-xl" : "max-w-[22rem]",
      )}
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[linear-gradient(145deg,rgba(15,23,42,0.2),rgba(30,41,59,0.55))]"
      />
      {popupReady ? (
        <motion.div
          initial={motionConfig.initial}
          animate={motionConfig.animate}
          transition={motionConfig.transition}
          className={cn(
            "relative overflow-hidden rounded-2xl border border-white/10 bg-slate-900 shadow-2xl",
            mode === "desktop" ? "w-52" : "w-40",
          )}
        >
          {/* Supabase public URL'leri ve yerel placeholder aynı önizlemede gösterilebildiği için img kullanılır. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt="Kampanya animasyon önizlemesi"
            className="aspect-[2/3] h-auto w-full object-cover"
          />
          <div className="border-t border-white/10 bg-slate-900 px-3 py-2.5 text-center">
            <span className="text-[0.65rem] font-bold uppercase tracking-[0.14em] text-orange-400">
              Kampanya Önizlemesi
            </span>
          </div>
        </motion.div>
      ) : (
        <div className="relative flex flex-col items-center gap-3 text-center text-slate-400">
          <span className="size-6 animate-spin rounded-full border-2 border-slate-700 border-t-orange-400 motion-reduce:animate-none" />
          <span className="text-xs font-semibold">Popup açılma gecikmesi bekleniyor…</span>
        </div>
      )}
    </div>
  );
}

export function CampaignAnimationEditor({
  desktopImageUrl: initialDesktopImageUrl = "",
  mobileImageUrl: initialMobileImageUrl = "",
  animationType: initialAnimationType,
  animationDurationMs: initialAnimationDurationMs,
  animationDelayMs: initialAnimationDelayMs,
  popupDelayMs: initialPopupDelayMs,
}: CampaignAnimationEditorProps) {
  const [desktopImageUrl, setDesktopImageUrl] = useState(initialDesktopImageUrl || "");
  const [mobileImageUrl, setMobileImageUrl] = useState(initialMobileImageUrl || "");
  const [animationType, setAnimationType] = useState<CampaignAnimationType>(
    initialAnimationType && isCampaignAnimationType(initialAnimationType)
      ? initialAnimationType
      : campaignAnimationDefaults.type,
  );
  const [animationDurationMs, setAnimationDurationMs] = useState(
    String(initialAnimationDurationMs ?? campaignAnimationDefaults.durationMs),
  );
  const [animationDelayMs, setAnimationDelayMs] = useState(
    String(initialAnimationDelayMs ?? campaignAnimationDefaults.delayMs),
  );
  const [popupDelayMs, setPopupDelayMs] = useState(
    String(initialPopupDelayMs ?? campaignAnimationDefaults.popupDelayMs),
  );
  const [previewMode, setPreviewMode] = useState<"desktop" | "mobile">("desktop");
  const [replayKey, setReplayKey] = useState(0);

  const previewImage =
    (previewMode === "mobile" ? mobileImageUrl || desktopImageUrl : desktopImageUrl || mobileImageUrl) ||
    previewFallbackImage;
  const previewIdentity = [
    replayKey,
    previewMode,
    previewImage,
    animationType,
    animationDurationMs,
    animationDelayMs,
    popupDelayMs,
  ].join(":");

  return (
    <div className="space-y-5">
      <div className="grid gap-6 sm:grid-cols-2">
        <ImageCropUploadField
          bucket="site-images"
          folder="campaigns/desktop"
          inputName="desktop_image_url"
          label="Masaüstü Görseli"
          value={desktopImageUrl}
          preset="campaign-poster"
          mode="contain"
          onUploaded={setDesktopImageUrl}
        />
        <ImageCropUploadField
          bucket="site-images"
          folder="campaigns/mobile"
          inputName="mobile_image_url"
          label="Mobil Görseli"
          value={mobileImageUrl}
          preset="campaign-poster"
          mode="contain"
          description="Boşsa masaüstü görseli kullanılır. Görsel seçip kırparak yükleyin."
          onUploaded={setMobileImageUrl}
        />
      </div>

      <section className="rounded-2xl border border-slate-700 bg-slate-950/45 p-4 sm:p-5">
        <div className="border-b border-slate-800 pb-4">
          <h2 className="text-base font-bold text-white">Animasyon Ayarları</h2>
          <p className="mt-1 text-sm leading-6 text-slate-400">
            Popup giriş hareketini ve kullanıcıya ne zaman gösterileceğini ayarlayın.
          </p>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <label className="space-y-2">
            <span className={labelClass}>Animasyon Tipi</span>
            <select
              name="animation_type"
              value={animationType}
              onChange={(event) => setAnimationType(event.target.value as CampaignAnimationType)}
              className={inputClass}
            >
              {campaignAnimationOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-2">
            <span className={labelClass}>Animasyon Süresi (ms)</span>
            <input
              name="animation_duration_ms"
              type="number"
              min={300}
              max={3000}
              step={100}
              value={animationDurationMs}
              onChange={(event) => setAnimationDurationMs(event.target.value)}
              className={inputClass}
            />
          </label>

          <label className="space-y-2">
            <span className={labelClass}>Animasyon Gecikmesi (ms)</span>
            <input
              name="animation_delay_ms"
              type="number"
              min={0}
              max={3000}
              step={100}
              value={animationDelayMs}
              onChange={(event) => setAnimationDelayMs(event.target.value)}
              className={inputClass}
            />
          </label>

          <label className="space-y-2">
            <span className={labelClass}>Popup Açılma Gecikmesi (ms)</span>
            <input
              name="open_delay_ms"
              type="number"
              min={0}
              max={10000}
              step={100}
              value={popupDelayMs}
              onChange={(event) => setPopupDelayMs(event.target.value)}
              className={inputClass}
            />
          </label>
        </div>

        <section className="mt-6 border-t border-slate-800 pt-5" aria-labelledby="campaign-preview-heading">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 id="campaign-preview-heading" className="text-base font-bold text-white">
                Animasyon Önizleme
              </h3>
              <p className="mt-1 text-sm text-slate-400">Değişiklikler kaydetmeden burada uygulanır.</p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex rounded-full border border-slate-700 bg-slate-950 p-1">
                {(["desktop", "mobile"] as const).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setPreviewMode(mode)}
                    className={cn(
                      "rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
                      previewMode === mode
                        ? "bg-orange-500 text-white"
                        : "text-slate-400 hover:text-white",
                    )}
                  >
                    {mode === "desktop" ? "Masaüstü" : "Mobil"}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setReplayKey((value) => value + 1)}
                className="min-h-10 rounded-full border border-orange-500/60 px-4 py-2 text-xs font-bold text-orange-300 transition hover:bg-orange-500/10"
              >
                {replayKey === 0 ? "Animasyonu Oynat" : "Tekrar Oynat"}
              </button>
            </div>
          </div>

          <div className="mt-4">
            <PreviewStage
              key={previewIdentity}
              replayKey={replayKey}
              imageUrl={previewImage}
              mode={previewMode}
              animationType={animationType}
              animationDurationMs={Number(animationDurationMs) || campaignAnimationDefaults.durationMs}
              animationDelayMs={Number(animationDelayMs) || 0}
              popupDelayMs={Number(popupDelayMs) || 0}
            />
          </div>
        </section>
      </section>
    </div>
  );
}
