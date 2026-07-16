"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { mainNavigation, type NavItem } from "@/components/navigation/nav-config";
import { cn } from "@/lib/cn";

type MobileMenuProps = {
  open: boolean;
  onClose: () => void;
  items?: NavItem[];
};

export function MobileMenu({ open, onClose, items }: MobileMenuProps) {
  const pathname = usePathname();
  const navItems = items ?? mainNavigation;

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          key="mobile-sheet"
          className="fixed inset-0 z-40 md:hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.button
            type="button"
            aria-hidden
            tabIndex={-1}
            className="absolute inset-0 bg-maroon-deep/35 backdrop-blur-[2px] motion-reduce:backdrop-blur-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          <motion.nav
            id="mobile-menu"
            aria-label="Mobil navigasyon"
            className={cn(
              "absolute left-[max(0.75rem,var(--gutter))] right-[max(0.75rem,var(--gutter))] z-50",
              "top-[calc(var(--header-height)+0.65rem)]",
              "max-h-[min(28rem,calc(100dvh-var(--header-height)-1.25rem))] min-h-0 overflow-y-auto overscroll-y-contain",
              "rounded-2xl border border-border-subtle bg-surface-elevated p-4 shadow-shell sm:p-5",
            )}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.26, ease: [0.16, 1, 0.3, 1] }}
          >
            <ul className="flex min-h-0 flex-col gap-1">
              {navItems.map((item) => {
                const active = pathname === item.href;
                return (
                  <li key={item.href} className="min-w-0">
                    <Link
                      href={item.href}
                      onClick={onClose}
                      className={cn(
                        "block min-h-[2.75rem] truncate rounded-xl px-3 py-2.5 text-sm font-medium transition-colors duration-150",
                        item.cta
                          ? "mt-2 bg-accent text-center font-bold text-white hover:bg-accent-strong"
                          : active
                            ? "bg-surface-muted font-semibold text-text-primary ring-1 ring-border-subtle"
                            : "text-text-muted hover:bg-surface-muted/70 hover:text-text-primary",
                      )}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </motion.nav>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
