import type { ComponentPropsWithoutRef } from "react";

import { cn } from "@/lib/cn";

type CardProps = ComponentPropsWithoutRef<"article">;

/** Haber/video/kadro kartlarının paylaştığı ortak yüzey: kenarlık, köşe, gölge, hover rengi. */
export function Card({ className, ...rest }: CardProps) {
  return (
    <article
      className={cn(
        "group overflow-hidden rounded-2xl border border-border-subtle bg-surface-card shadow-shell transition-colors duration-200 hover:border-accent/40 motion-reduce:transition-none",
        className,
      )}
      {...rest}
    />
  );
}
