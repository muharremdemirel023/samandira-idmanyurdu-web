"use client";

import { useCookieConsent } from "@/components/cookie-consent/CookieConsentProvider";

export function CookiePreferencesLink({ className }: { className?: string }) {
  const { openPreferences } = useCookieConsent();

  return (
    <button type="button" onClick={openPreferences} className={className}>
      Çerez Tercihleri
    </button>
  );
}
