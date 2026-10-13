"use client";

import Script from "next/script";
import { useEffect, useRef } from "react";

type NasilGelinirApi = { mount: (host: HTMLElement) => () => void };

declare global {
  interface Window {
    NasilGelinir?: NasilGelinirApi;
  }
}

/**
 * "Biz Neredeyiz?" widget'ının sayfaya gömülü, hep açık kopyası (public/widget/nasil-gelinir.js).
 * Bu bileşen ekrandayken sağ üstteki yüzen widget gizlenir.
 */
export function NasilGelinirInline() {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    let unmount: (() => void) | undefined;

    const tryMount = () => {
      if (unmount || !window.NasilGelinir) return;
      unmount = window.NasilGelinir.mount(host);
    };

    tryMount();
    window.addEventListener("nasil-gelinir:ready", tryMount);
    return () => {
      window.removeEventListener("nasil-gelinir:ready", tryMount);
      unmount?.();
    };
  }, []);

  return (
    <>
      {/* Yüzen widget ile aynı betik; Next.js tek sefer yükler */}
      <Script src="/widget/nasil-gelinir.js" strategy="afterInteractive" />
      <div ref={hostRef} className="min-h-[24rem]" />
    </>
  );
}
