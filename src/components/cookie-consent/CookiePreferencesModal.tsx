"use client";

import { useEffect, useState } from "react";

import { cookieCategories } from "@/components/cookie-consent/constants";
import { useCookieConsent } from "@/components/cookie-consent/CookieConsentProvider";

export function CookiePreferencesModal() {
  const { consent, closePreferences, savePreferences, acceptAll, rejectAll } = useCookieConsent();
  const [analytics, setAnalytics] = useState(consent?.analytics ?? false);
  const [marketing, setMarketing] = useState(consent?.marketing ?? false);

  useEffect(() => {
    // Modal her açıldığında güncel kaydedilmiş tercihle senkronize edilir.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setAnalytics(consent?.analytics ?? false);
    setMarketing(consent?.marketing ?? false);
  }, [consent]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closePreferences();
    };
    window.addEventListener("keydown", onKeyDown);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [closePreferences]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Çerez tercihleri"
      className="fixed inset-0 z-[110] flex items-center justify-center bg-black/55 p-4"
      onClick={closePreferences}
    >
      <div
        className="club-soft-panel max-h-[90vh] w-full max-w-lg overflow-y-auto bg-white p-6 sm:p-7"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="type-overline text-accent">Gizlilik</p>
            <h2 className="type-heading-md mt-1 text-text-primary">Çerez Tercihleri</h2>
          </div>
          <button
            type="button"
            onClick={closePreferences}
            aria-label="Kapat"
            className="flex size-10 shrink-0 items-center justify-center rounded-full border border-border-subtle text-text-primary transition hover:bg-surface-base"
          >
            ✕
          </button>
        </div>

        <p className="type-body mt-4 text-sm leading-6">
          Sitede kullanılan çerez kategorilerini aşağıdan yönetebilirsiniz. Zorunlu çerezler
          sitenin çalışması için her zaman etkindir.
        </p>

        <div className="mt-5 space-y-4">
          {cookieCategories.map((category) => {
            const checked =
              category.key === "necessary" ? true : category.key === "analytics" ? analytics : marketing;

            return (
              <div
                key={category.key}
                className="rounded-xl border border-border-subtle bg-surface-base p-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-bold text-text-primary">{category.title}</p>
                    <p className="mt-1 text-xs leading-5 text-text-muted">{category.description}</p>
                  </div>
                  <label className="relative inline-flex shrink-0 cursor-pointer items-center">
                    <input
                      type="checkbox"
                      checked={checked}
                      disabled={category.locked}
                      aria-label={`${category.title} çerezleri`}
                      onChange={(event) => {
                        if (category.key === "analytics") setAnalytics(event.target.checked);
                        if (category.key === "marketing") setMarketing(event.target.checked);
                      }}
                      className="peer sr-only"
                    />
                    <span
                      aria-hidden
                      className={`h-6 w-11 rounded-full transition-colors ${
                        checked ? "bg-accent" : "bg-border-subtle"
                      } ${category.locked ? "opacity-60" : ""}`}
                    />
                    <span
                      aria-hidden
                      className={`absolute left-1 top-1 size-4 rounded-full bg-white transition-transform ${
                        checked ? "translate-x-5" : ""
                      }`}
                    />
                  </label>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 flex flex-col gap-2.5 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={rejectAll}
            className="min-h-11 rounded-full border border-border-subtle px-5 text-sm font-bold text-text-primary transition hover:bg-surface-base"
          >
            Tümünü Reddet
          </button>
          <button
            type="button"
            onClick={acceptAll}
            className="min-h-11 rounded-full border border-accent/35 px-5 text-sm font-bold text-accent transition hover:bg-accent/10"
          >
            Tümünü Kabul Et
          </button>
          <button
            type="button"
            onClick={() => savePreferences({ analytics, marketing })}
            className="min-h-11 rounded-full bg-accent px-6 text-sm font-bold text-white transition hover:bg-accent-strong"
          >
            Tercihleri Kaydet
          </button>
        </div>
      </div>
    </div>
  );
}
