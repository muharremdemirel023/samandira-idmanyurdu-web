import Link from "next/link";

import { cn } from "@/lib/cn";
import type { LeagueSeason } from "@/lib/tff/league-center";

/** Sezon seçimi düz bağlantılarla yapılır; JavaScript gerektirmez ve paylaşılabilir URL üretir. */
export function SeasonSwitcher({ seasons, selectedId }: { seasons: LeagueSeason[]; selectedId: number }) {
  return (
    <nav aria-label="Sezon seçimi" className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
      <p className="type-overline shrink-0">Sezon</p>
      <ul className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
        {seasons.map((season) => {
          const active = season.seasonId === selectedId;
          return (
            <li key={season.seasonId} className="shrink-0">
              <Link
                href={season.isCurrent ? "/lig-merkezi" : `/lig-merkezi?sezon=${encodeURIComponent(season.name)}`}
                aria-current={active ? "page" : undefined}
                scroll={false}
                className={cn(
                  "inline-flex min-h-[2.75rem] items-center gap-2 rounded-full border px-4 text-sm font-semibold transition-colors duration-150 motion-reduce:transition-none",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/70 focus-visible:ring-offset-2",
                  active
                    ? "border-maroon bg-maroon text-white"
                    : "border-border-subtle bg-white text-maroon-deep hover:border-maroon/40 hover:bg-surface-base",
                )}
              >
                {season.name}
                {season.isCurrent ? (
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-[0.625rem] font-bold uppercase tracking-[0.12em]",
                      active ? "bg-white/20 text-white" : "bg-accent-soft text-accent-strong",
                    )}
                  >
                    Güncel
                  </span>
                ) : null}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
