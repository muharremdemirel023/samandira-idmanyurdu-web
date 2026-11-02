import { cn } from "@/lib/cn";
import type { LeagueStanding } from "@/lib/tff/league-center";

type StatKey = Exclude<keyof LeagueStanding, "clubId" | "teamName" | "displayOrder">;

const COLUMNS: Array<{ key: StatKey; short: string; title: string }> = [
  { key: "played", short: "O", title: "Oynanan" },
  { key: "won", short: "G", title: "Galibiyet" },
  { key: "drawn", short: "B", title: "Beraberlik" },
  { key: "lost", short: "M", title: "Mağlubiyet" },
  { key: "goalsFor", short: "A", title: "Atılan gol" },
  { key: "goalsAgainst", short: "Y", title: "Yenilen gol" },
  { key: "goalDifference", short: "AV", title: "Averaj" },
  { key: "points", short: "P", title: "Puan" },
];

/** Yalnızca TFF'nin değer yayımladığı sütunlar gösterilir; sıra TFF'nin sırasıdır. */
export function StandingsTable({ rows, clubId }: { rows: LeagueStanding[]; clubId: number }) {
  const columns = COLUMNS.filter((column) => rows.some((row) => row[column.key] !== null));

  return (
    <div className="overflow-x-auto rounded-2xl border border-border-subtle bg-surface-card shadow-shell">
      <table className="w-full min-w-[20rem] border-collapse text-left text-[0.8125rem]">
        <caption className="sr-only">Grup puan durumu</caption>
        <thead>
          <tr className="border-b border-border-subtle bg-surface-base text-[0.6875rem] font-bold uppercase tracking-[0.12em] text-text-muted">
            <th scope="col" className="w-10 px-3 py-3 text-center">
              #
            </th>
            <th scope="col" className="px-2 py-3">
              Takım
            </th>
            {columns.map((column) => (
              <th key={column.key} scope="col" className="px-2 py-3 text-center sm:px-3">
                <abbr title={column.title} className="no-underline">
                  {column.short}
                </abbr>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const isClub = row.clubId === clubId;
            return (
              <tr
                key={row.clubId}
                aria-current={isClub ? "true" : undefined}
                className={cn(
                  "border-b border-border-subtle last:border-b-0",
                  isClub ? "bg-maroon/[0.07] text-maroon" : "text-text-primary",
                )}
              >
                <td
                  className={cn(
                    "px-3 py-3 text-center font-bold tabular-nums",
                    isClub ? "border-l-4 border-l-maroon" : "border-l-4 border-l-transparent text-text-muted",
                  )}
                >
                  {row.displayOrder}
                </td>
                <th scope="row" className={cn("px-2 py-3 text-left leading-snug", isClub ? "font-bold" : "font-semibold")}>
                  {row.teamName}
                </th>
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={cn(
                      "px-2 py-3 text-center tabular-nums sm:px-3",
                      column.key === "points" && "font-bold",
                    )}
                  >
                    {row[column.key] ?? "–"}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
