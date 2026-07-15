"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import { useEffect, useState } from "react";

const storageKey = "siy-intro-seen";
const splashDurationMs = 1600;

/**
 * 35. yıl açılış animasyonu — oturum başına bir kez, kısa ve sade.
 * prefers-reduced-motion açıksa hiç gösterilmez.
 */
export function IntroSplash() {
  const reduceMotion = useReducedMotion();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (reduceMotion) return;
    try {
      if (sessionStorage.getItem(storageKey)) return;
      sessionStorage.setItem(storageKey, "1");
    } catch {
      return;
    }
    setShow(true);
    const timer = setTimeout(() => setShow(false), splashDurationMs);
    return () => clearTimeout(timer);
  }, [reduceMotion]);

  return (
    <AnimatePresence>
      {show ? (
        <motion.div
          key="intro-splash"
          aria-hidden
          className="fixed inset-0 z-[90] flex items-center justify-center bg-maroon-deep"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          onClick={() => setShow(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <Image
              src="/images/35-yil-logo.png"
              alt=""
              width={280}
              height={221}
              unoptimized
              priority
              className="h-auto w-[min(56vw,240px)] object-contain"
            />
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
