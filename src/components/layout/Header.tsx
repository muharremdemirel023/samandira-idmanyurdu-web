"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { ClubLogo } from "@/components/navigation/ClubLogo";
import { DesktopNav } from "@/components/navigation/DesktopNav";
import { headerBrand, onboardingHref } from "@/components/navigation/nav-config";
import { MobileMenu } from "@/components/navigation/MobileMenu";
import { Button } from "@/components/ui/Button";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/cn";

const scrollThresholdPx = 20;

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

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
          "fixed top-0 z-[60] w-full border-b transition-colors duration-300 motion-reduce:transition-none",
          headerSurface,
        )}
      >
        <div className="mx-auto flex min-h-[var(--header-height)] max-[var(--container-ultra-cap)] items-center justify-between gap-2.5 px-[var(--gutter)] py-0 md:gap-4">
          <Link
            href="/"
            className="flex min-w-0 flex-1 items-center gap-2.5 pr-1 sm:gap-3 md:min-w-0 md:flex-initial md:pr-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/70 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
          >
            <ClubLogo alt={`${siteConfig.name} amblemi`} />
            <span className="flex min-w-0 flex-col justify-center">
              <span className="text-[0.72rem] font-bold leading-tight tracking-[-0.015em] text-maroon-deep sm:text-sm md:text-[0.9375rem] md:leading-snug lg:text-base">
                {headerBrand.primaryLine}
              </span>
              <span className="mt-0.5 text-[0.5625rem] font-semibold uppercase leading-none tracking-[0.14em] text-maroon/80 sm:mt-1 sm:text-[0.625rem]">
                {headerBrand.metaLine}
              </span>
            </span>
          </Link>

          <div className="hidden shrink-0 items-center gap-4 md:flex lg:gap-6">
            <DesktopNav />
            <Button href={onboardingHref} variant="primary" className="header-cta-breathe shrink-0 px-5 py-2.5 text-sm font-bold lg:px-6">
              Ön Kayıt
            </Button>
          </div>

          <button
            type="button"
            className={cn(
              "flex size-10 shrink-0 items-center justify-center rounded-full border border-border-subtle text-text-primary motion-safe:transition motion-safe:duration-200 md:hidden",
              menuOpen && "border-maroon/40 bg-surface-muted text-maroon-deep",
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

      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </header>
  );
}
