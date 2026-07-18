"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    gtag?: (...args: unknown[]) => void;
  }
}

export function LeadConversion({ eventKey }: { eventKey: string }) {
  useEffect(() => {
    const storageKey = `lead-conversion:${eventKey}`;

    try {
      if (window.sessionStorage.getItem(storageKey)) return;
      window.sessionStorage.setItem(storageKey, "1");
    } catch {
      // Depolama engelliyse dönüşüm olayı yine bir kez mevcut mount için gönderilir.
    }

    window.fbq?.("track", "Lead");
    window.gtag?.("event", "generate_lead");
  }, [eventKey]);

  return null;
}
