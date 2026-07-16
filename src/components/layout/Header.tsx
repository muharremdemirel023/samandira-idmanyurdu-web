"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { ClubLogo } from "@/components/navigation/ClubLogo";
import { DesktopNav } from "@/components/navigation/DesktopNav";
import { headerBrand, mainNavigation, onboardingHref, type NavItem } from "@/components/navigation/nav-config";
import { MobileMenu } from "@/components/navigation/MobileMenu";
import { Button } from "@/components/ui/Button";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/cn";
import type { CustomPageNavItem } from "@/lib/content";

const scrollThresholdPx = 20;

type HeaderProps = {
  customPages?: CustomPageNavItem[];
};

export function Header({ customPages = [] }: HeaderProps) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const isHome = pathname === "/";
  /** Ana sayfada, sayfa henüz kaydırılmadan önce hero fotoğrafı üzerinde yüzen cam header. */
  const floating = isHome && !scrolled;

  const staticItems = mainNavigation.filter((item) => !item.cta);
  const ctaItem = mainNavigation.find((item) => item.cta);
  const dynamicMenuItems: NavItem[] = customPages
    .filter((page) => page.show_in_menu)
    .map((page) => ({ label: page.title, href: `/sayfa/${page.slug}` as const }));
  const navItems: NavItem[] = [...staticItems, ...dynamicMenuItems, ...(ctaItem ? [ctaItem] : [])];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > scrollThresholdPx);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;

    document.body.dataset.menuOpen = "true";

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onEscape);

    return () => {
      delete document.body.dataset.menuOpen;
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onEscape);
    };
  }, [menuOpen]);

  const headerSurface = scrolled
    ? "border-border-subtle bg-white/92 shadow-shell backdrop-blur-[14px]"
    : "border-transparent bg-white/70 backdrop-blur-[6px]";

  return (
    <header>
      <div
        className={cn(
          "fixed top-0 z-[60] w-full transition-[padding] duration-300 motion-reduce:transition-none",
          floating ? "px-3 pt-3 sm:px-5 sm:pt-4" : "",
        )}
      >
        <div
          className={cn(
            "mx-auto flex min-h-[var(--header-height)] max-[var(--container-ultra-cap)] items-center justify-between gap-2.5 px-[var(--gutter)] py-0 transition-[background-color,border-color,border-radius,box-shadow] duration-300 motion-reduce:transition-none md:gap-4",
            floating
              ? "rounded-full border border-white/20 bg-maroon-deep/55 shadow-[0_10px_34px_-16px_rgba(0,0,0,0.55)] backdrop-blur-[20px]"
              : cn("border-b", headerSurface),
          )}
        >
          <Link
            href="/"
            className="flex min-w-0 flex-1 items-center gap-2.5 pr-1 sm:gap-3 md:min-w-0 md:flex-initial md:pr-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/70 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
          >
            <ClubLogo alt={`${siteConfig.name} amblemi`} />
            <span className="flex min-w-0 flex-col justify-center">
              <span
                className={cn(
                  "text-[0.72rem] font-bold leading-tight tracking-[-0.015em] sm:text-sm md:text-[0.9375rem] md:leading-snug lg:text-base",
                  floating ? "text-white" : "text-maroon-deep",
                )}
              >
                {floating ? siteConfig.shortName + " Akademi" : headerBrand.primaryLine}
              </span>
              <span
                className={cn(
                  "mt-0.5 text-[0.5625rem] font-semibold uppercase leading-none tracking-[0.14em] sm:mt-1 sm:text-[0.625rem]",
                  floating ? "text-white/70" : "text-maroon/80",
                )}
              >
                {headerBrand.metaLine}
              </span>
            </span>
          </Link>

          <div className="hidden shrink-0 items-center gap-4 md:flex lg:gap-6">
            <DesktopNav items={navItems} variant={floating ? "floating" : "solid"} />
            <Button href={onboardingHref} variant="primary" className="header-cta-breathe shrink-0 px-5 py-2.5 text-sm font-bold lg:px-6">
              Ön Kayıt
            </Button>
          </div>

          <button
            type="button"
            className={cn(
              "flex size-10 shrink-0 items-center justify-center rounded-full border motion-safe:transition motion-safe:duration-200 md:hidden",
              floating
                ? cn("border-white/30 text-white", menuOpen && "bg-white/15")
                : cn(
                    "border-border-subtle text-text-primary",
                    menuOpen && "border-maroon/40 bg-surface-muted text-maroon-deep",
                  ),
            )}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            aria-label={menuOpen ? "Menüyü kapat" : "Menüyü aç"}
            onClick={() => setMenuOpen((prev) => !prev)}
          >
            <svg
              className="block size-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              {menuOpen ? (
                <>
                  <path d="M6 18L18 6" />
                  <path d="M6 6l12 12" />
                </>
              ) : (
                <>
                  <path d="M4 7h16" />
                  <path d="M4 12h16" />
                  <path d="M4 17h16" />
                </>
              )}
            </svg>
          </button>
        </div>
      </div>

      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} items={navItems} />
    </header>
  );
}
