"use client";

import { motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import { useCallback, useState } from "react";

import { clubLogoPublicPath, clubMonogram } from "@/components/navigation/nav-config";
import { cn } from "@/lib/cn";

type ClubLogoProps = {
  alt: string;
  className?: string;
};

const introDurationSec = 0.4;

/**
 * Kulüp logosu: `public/Samandiralogo.png`. Yüklenemezse SİY monogramı gösterilir.
 * Logo dosyasının kendi zemini korunur; wrapper arka plan/kutu/frame vermez.
 */
export function ClubLogo({ alt, className }: ClubLogoProps) {
  const [useFallback, setUseFallback] = useState(false);
  const reduceMotion = useReducedMotion() ?? false;

  const onError = useCallback(() => {
    setUseFallback(true);
  }, []);

  return (
    <motion.span
      className={cn(
        "relative flex size-11 shrink-0 items-center justify-center sm:size-14",
        "transition-transform duration-[380ms] ease-out motion-reduce:transition-none",
        className,
      )}
      initial={reduceMotion ? false : { opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={
        reduceMotion
          ? { duration: 0 }
          : { duration: introDurationSec, ease: "easeOut" }
      }
      whileHover={reduceMotion ? undefined : { scale: 1.012 }}
    >
      {!useFallback ? (
        <Image
          src={clubLogoPublicPath}
          alt={alt}
          fill
          sizes="(max-width: 640px) 44px, 56px"
          preload
          unoptimized
          onError={onError}
          className="object-contain object-center"
        />
      ) : (
        <span
          role="img"
          aria-label={alt}
          className="flex size-full items-center justify-center font-mono text-[0.65rem] font-bold leading-none tracking-[-0.05em] text-accent sm:text-[0.7rem] md:text-[0.72rem]"
        >
          {clubMonogram}
        </span>
      )}
    </motion.span>
  );
}
