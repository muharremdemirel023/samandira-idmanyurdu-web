"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { mainNavigation } from "@/components/navigation/nav-config";
import { cn } from "@/lib/cn";

export function DesktopNav({ className }: { className?: string }) {
  const pathname = usePathname();

  return (
    <nav aria-label="Birincil" className={cn("hidden md:flex md:items-center md:gap-0.5 lg:gap-1", className)}>
      {mainNavigation
        .filter((item) => !item.cta)
        .map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "relative border-b-2 border-transparent px-2.5 py-2 text-sm font-medium tracking-wide text-text-muted transition-colors duration-200 ease-out lg:px-3",
                "hover:text-maroon-deep",
                active && "border-maroon font-semibold text-maroon-deep",
              )}
            >
              {item.label}
            </Link>
          );
        })}
    </nav>
  );
}
