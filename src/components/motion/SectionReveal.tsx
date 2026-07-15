"use client";

import { motion, useInView, useReducedMotion } from "framer-motion";
import type { ComponentPropsWithoutRef } from "react";
import { useRef } from "react";

import { transitions } from "@/components/motion/motion-presets";
import { cn } from "@/lib/cn";

type SectionRevealProps = ComponentPropsWithoutRef<typeof motion.div> & {
  /** Liste/grid içinde sıralı çıkış; her artış küçük gecikme ekler */
  staggerIndex?: number;
};

const staggerGapSec = 0.07;

export function SectionReveal({
  className,
  children,
  staggerIndex = 0,
  ...rest
}: SectionRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-8% 0px" });
  const reduceMotion = useReducedMotion();
  const duration = reduceMotion ? 0.01 : transitions.section.duration;
  const ease = transitions.section.ease;
  const delay = reduceMotion
    ? 0
    : Math.min(staggerIndex, 6) * staggerGapSec;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0.02, y: 16 }}
      animate={
        inView ? { opacity: 1, y: 0 } : { opacity: 0.02, y: 16 }
      }
      transition={{ duration, ease, delay }}
      className={cn(className)}
      {...rest}
    >
      {children}
    </motion.div>
  );
}
