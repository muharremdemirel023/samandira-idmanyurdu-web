"use client";

import { useEffect } from "react";

import { useCookieConsent } from "@/components/cookie-consent/CookieConsentProvider";

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    gtag?: (...args: unknown[]) => void;
  }
}

export function LeadConversion({ eventKey }: { eventKey: string }) {
  const { consent } = useCookieConsent();

  useEffect(() => {
    if (!consent || (!consent.analytics && !consent.marketing)) return;

    const storageKey = `lead-conversion:${eventKey}`;

    try {
      if (window.sessionStorage.getItem(storageKey)) return;
      window.sessionStorage.setItem(storageKey, "1");
    } catch {
      // Depolama engelliyse dönüşüm olayı yine bir kez mevcut mount için gönderilir.
    }

    if (consent.marketing) window.fbq?.("track", "Lead");
    if (consent.analytics) window.gtag?.("event", "generate_lead");
  }, [consent, eventKey]);

  return null;
}
