import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

import { cn } from "@/lib/cn";

type Variant = "primary" | "ghost" | "outline";

const variantClass: Record<Variant, string> = {
  primary:
    "border border-accent bg-accent text-white hover:border-accent-strong hover:bg-accent-strong " +
    "shadow-[0_10px_24px_-14px_rgba(194,65,12,0.55)] active:translate-y-[0.5px] active:scale-[0.99]",
  ghost:
    "border border-transparent bg-transparent text-text-primary hover:bg-surface-muted/80 hover:border-border-subtle",
  outline:
    "border border-maroon/25 bg-white text-maroon-deep hover:border-maroon/50 hover:bg-surface-base",
};

const baseClass =
  "inline-flex cursor-pointer items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold " +
  "transition-[transform,box-shadow,border-color,background-color,color,filter] duration-200 " +
  "motion-reduce:transform-none motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 " +
  "focus-visible:ring-accent/70 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-deep";

type Common = {
  variant?: Variant;
  className?: string;
  children: ReactNode;
};

type NativeButtonProps = Common &
  Omit<ComponentProps<"button">, "className" | "children"> & {
    href?: undefined;
  };

type LinkButtonProps = Common &
  Omit<ComponentProps<typeof Link>, "href" | "className" | "children"> & {
    href: ComponentProps<typeof Link>["href"];
  };

export type ButtonProps = NativeButtonProps | LinkButtonProps;

export function Button(props: ButtonProps) {
  if ("href" in props && props.href !== undefined) {
    const { href, variant = "primary", className, children, ...linkProps } = props as LinkButtonProps &
      Common;

    const styles = cn(baseClass, variantClass[variant], className);

    return (
      <Link href={href} className={styles} {...linkProps}>
        {children}
      </Link>
    );
  }

  const {
    variant = "primary",
    type = "button",
    className,
    children,
    ...spread
  } = props as NativeButtonProps;

  const styles = cn(baseClass, variantClass[variant], className);
  const { href: sentinel, ...btnProps } = spread as typeof spread & { href?: unknown };
  void sentinel;

  return (
    <button type={type} className={styles} {...btnProps}>
      {children}
    </button>
  );
}
