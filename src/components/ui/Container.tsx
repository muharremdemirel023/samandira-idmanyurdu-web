import type { ComponentPropsWithoutRef } from "react";

import { cn } from "@/lib/cn";

type ContainerProps = ComponentPropsWithoutRef<"div"> & {
  /**
   * default: içerik genişliği (çoğu sayfa)
   * prose: daha dar okuma kolonu (metin yoğun)
   * hero: gelecekte tam genişlik hero çerçevesi için placeholder
   * fluid: yan boşluksuz, yalnızca max-ultra freni
   */
  variant?: "default" | "prose" | "hero" | "fluid";
};

const variantClasses: Record<NonNullable<ContainerProps["variant"]>, string> = {
  default: "max-[var(--container-max)]",
  prose: "max-[var(--container-prose-max)]",
  hero: "max-[var(--container-hero-max)]",
  fluid: "max-[var(--container-ultra-cap)] px-0 sm:px-0 lg:px-0 xl:px-0 2xl:px-0",
};

export function Container({
  className,
  variant = "default",
  ...rest
}: ContainerProps) {
  return (
    <div
      className={cn(
        "mx-auto w-full",
        variant !== "fluid" && "px-[var(--gutter)]",
        variantClasses[variant],
        className,
      )}
      {...rest}
    />
  );
}
