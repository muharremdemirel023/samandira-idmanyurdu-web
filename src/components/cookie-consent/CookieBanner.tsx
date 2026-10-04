"use client";

import { useCookieConsent } from "@/components/cookie-consent/CookieConsentProvider";

export function CookieBanner() {
  const { acceptAll, rejectAll, openPreferences } = useCookieConsent();

  return (
    <div
      role="region"
      aria-label="Çerez bildirimi"
      className="fixed inset-x-0 bottom-0 z-[100] border-t border-white/10 bg-maroon-deep px-4 py-5 shadow-[0_-18px_44px_-26px_rgba(0,0,0,0.5)] sm:px-6"
    >
      <div className="mx-auto flex max-w-5xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm leading-6 text-white/85 sm:max-w-xl">
          Deneyiminizi iyileştirmek, siteyi analiz etmek ve kampanyalarımızı ölçmek için çerezler
          kullanıyoruz. Tercihlerinizi istediğiniz zaman{" "}
          <button
            type="button"
            onClick={openPreferences}
            className="font-semibold text-accent-bright underline underline-offset-2"
          >
            Çerez Tercihleri
          </button>{" "}
          üzerinden değiştirebilirsiniz.
        </p>
        <div className="flex flex-col gap-2.5 sm:flex-row sm:shrink-0">
          <button
            type="button"
            onClick={openPreferences}
            className="min-h-11 rounded-full border border-white/25 px-5 text-sm font-bold text-white transition hover:bg-white/10"
          >
            Tercihleri Yönet
          </button>
          <button
            type="button"
            onClick={rejectAll}
            className="min-h-11 rounded-full border border-white/25 px-5 text-sm font-bold text-white transition hover:bg-white/10"
          >
            Tümünü Reddet
          </button>
          <button
            type="button"
            onClick={acceptAll}
            className="min-h-11 rounded-full bg-accent px-5 text-sm font-bold text-white transition hover:bg-accent-strong"
          >
            Tümünü Kabul Et
          </button>
        </div>
      </div>
    </div>
  );
}
