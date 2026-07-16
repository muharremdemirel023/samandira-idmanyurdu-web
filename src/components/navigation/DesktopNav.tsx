"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { mainNavigation, type NavItem } from "@/components/navigation/nav-config";
import { cn } from "@/lib/cn";

function NavLink({
  item,
  active,
  variant,
  hasChildren,
}: {
  item: NavItem;
  active: boolean;
  variant: "solid" | "floating";
  hasChildren: boolean;
}) {
  return (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "relative flex items-center gap-1 border-b-2 border-transparent px-2.5 py-2 text-sm font-medium tracking-wide transition-colors duration-200 ease-out lg:px-3",
        variant === "floating"
          ? cn("text-white/80 hover:text-white", active && "border-accent font-semibold text-white")
          : cn("text-text-muted hover:text-maroon-deep", active && "border-maroon font-semibold text-maroon-deep"),
      )}
    >
      {item.label}
      {hasChildren ? (
        <svg
          aria-hidden
          viewBox="0 0 24 24"
          className="size-3.5 shrink-0 transition-transform duration-200 group-hover:rotate-180"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      ) : null}
    </Link>
  );
}

export function DesktopNav({
  className,
  items,
  variant = "solid",
}: {
  className?: string;
  items?: NavItem[];
  /** "floating": hero üzerindeki cam yüzeyli header için beyaz metin varyantı */
  variant?: "solid" | "floating";
}) {
  const pathname = usePathname();
  const navItems = items ?? mainNavigation;

  return (
    <nav aria-label="Birincil" className={cn("hidden md:flex md:items-center md:gap-0.5 lg:gap-1", className)}>
      {navItems
        .filter((item) => !item.cta)
        .map((item) => {
          const active =
            pathname === item.href || (item.children?.some((child) => pathname === child.href) ?? false);

          if (!item.children?.length) {
            return (
              <NavLink key={item.href} item={item} active={active} variant={variant} hasChildren={false} />
            );
          }

          return (
            <div key={item.href} className="group relative">
              <NavLink item={item} active={active} variant={variant} hasChildren />

              <div className="invisible absolute left-0 top-full z-10 min-w-[10rem] pt-2 opacity-0 transition-[opacity,visibility] duration-150 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
                <div
                  className={cn(
                    "overflow-hidden rounded-2xl border shadow-[0_16px_34px_-18px_rgba(74,18,32,0.45)] backdrop-blur-[14px]",
                    variant === "floating"
                      ? "border-white/20 bg-maroon-deep/85"
                      : "border-border-subtle bg-white/95",
                  )}
                >
                  {item.children.map((child) => {
                    const childActive = pathname === child.href;
                    return (
                      <Link
                        key={child.href}
                        href={child.href}
                        aria-current={childActive ? "page" : undefined}
                        className={cn(
                          "block px-4 py-2.5 text-sm font-medium transition-colors duration-150",
                          variant === "floating"
                            ? cn(
                                "text-white/85 hover:bg-white/10 hover:text-white",
                                childActive && "bg-white/10 font-semibold text-white",
                              )
                            : cn(
                                "text-text-muted hover:bg-surface-muted hover:text-maroon-deep",
                                childActive && "bg-surface-muted font-semibold text-maroon-deep",
                              ),
                        )}
                      >
                        {child.label}
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
    </nav>
  );
}
