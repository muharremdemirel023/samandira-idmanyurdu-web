"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { transitions } from "@/components/motion/motion-presets";

export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();
  const t = reduceMotion ? { duration: 0.01 } : transitions.page;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        layout={false}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -12 }}
        transition={t}
        className="w-full"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
