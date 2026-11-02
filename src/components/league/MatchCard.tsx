import { CalendarIcon, ClockIcon, PinIcon } from "@/components/league/LeagueIcons";
import { TeamBadge } from "@/components/league/TeamBadge";
import { cn } from "@/lib/cn";
import { formatMatchDate, type LeagueMatch, type MatchTiming } from "@/lib/tff/league-center";

const timingLabel: Record<MatchTiming, string> = {
  upcoming: "Yaklaşan",
  today: "Bugün",
  past: "Tarihi geçti",
  undated: "Tarih bekleniyor",
};

const timingClass: Record<MatchTiming, string> = {
  upcoming: "bg-accent-soft text-accent-strong",
  today: "bg-accent text-white",
  past: "bg-surface-muted text-text-muted",
  undated: "bg-surface-muted text-maroon-deep",
};

function TeamRow({
  name,
  isClub,
  side,
  score,
}: {
  name: string;
  isClub: boolean;
  side: "Ev sahibi" | "Deplasman";
  score: number | null;
}) {
  return (
    <div
      className={cn(
        "flex min-h-[3.25rem] items-center gap-3 rounded-xl px-2.5 py-2",
        isClub && "bg-maroon/[0.06] ring-1 ring-maroon/15",
      )}
    >
      <TeamBadge name={name} isClub={isClub} />
      <div className="min-w-0 flex-1">
        <p
          className={cn(
            "text-[0.8125rem] leading-snug break-words",
            isClub ? "font-bold text-maroon" : "font-semibold text-text-primary",
          )}
        >
          {name}
        </p>
        <p className="mt-0.5 text-[0.6875rem] font-medium text-text-muted">{side}</p>
      </div>
      {score !== null ? (
        <span className="shrink-0 text-xl font-bold tabular-nums text-maroon-deep">{score}</span>
      ) : null}
    </div>
  );
}

export function MatchMeta({ match, tone = "light" }: { match: LeagueMatch; tone?: "light" | "dark" }) {
  const muted = tone === "dark" ? "text-white/80" : "text-text-muted";
  const iconClass = cn("size-4 shrink-0", tone === "dark" ? "text-accent-bright" : "text-maroon/70");

  if (!match.matchDate) {
    return (
      <p className={cn("flex items-start gap-2 text-[0.8125rem] leading-snug", muted)}>
        <CalendarIcon className={cn(iconClass, "mt-0.5")} />
        Tarih, saat ve saha TFF tarafından henüz açıklanmadı.
      </p>
    );
  }

  return (
    <ul className={cn("flex flex-col gap-1.5 text-[0.8125rem] leading-snug", muted)}>
      <li className="flex items-start gap-2">
        <CalendarIcon className={cn(iconClass, "mt-0.5")} />
        <span>{formatMatchDate(match.matchDate)}</span>
      </li>
      <li className="flex items-start gap-2">
        <ClockIcon className={cn(iconClass, "mt-0.5")} />
        <span>{match.kickoffTime ?? "Saat açıklanmadı"}</span>
      </li>
      <li className="flex items-start gap-2">
        <PinIcon className={cn(iconClass, "mt-0.5")} />
        <span className="break-words">{match.venue ?? "Saha açıklanmadı"}</span>
      </li>
    </ul>
  );
}

export function MatchCard({
  match,
  timing,
  isNext = false,
}: {
  match: LeagueMatch;
  timing: MatchTiming;
  isNext?: boolean;
}) {
  const hasNumericScore = match.homeScore !== null && match.awayScore !== null;

  return (
    <article
      className={cn(
        "flex flex-col gap-3 rounded-2xl border p-3.5 sm:p-4",
        timing === "past" && !hasNumericScore
          ? "border-border-subtle bg-surface-base"
          : "border-border-subtle bg-surface-card shadow-shell",
        isNext && "border-maroon/40 ring-2 ring-maroon/20",
      )}
      aria-label={`${match.week}. hafta: ${match.homeTeam} - ${match.awayTeam}`}
    >
      <header className="flex flex-wrap items-center justify-between gap-2">
        <p className="type-meta text-maroon-deep">{match.week}. Hafta</p>
        <div className="flex flex-wrap items-center gap-1.5">
          {isNext ? (
            <span className="rounded-full bg-maroon px-2.5 py-1 text-[0.6875rem] font-bold text-white">
              Sıradaki maç
            </span>
          ) : null}
          {hasNumericScore || match.scoreRaw ? (
            <span className="rounded-full bg-maroon-deep px-2.5 py-1 text-[0.6875rem] font-bold text-white">
              Resmî sonuç
            </span>
          ) : (
            <span className={cn("rounded-full px-2.5 py-1 text-[0.6875rem] font-bold", timingClass[timing])}>
              {timingLabel[timing]}
            </span>
          )}
        </div>
      </header>

      <div className="flex flex-col gap-1.5">
        <TeamRow
          name={match.homeTeam}
          isClub={match.clubSide === "home"}
          side="Ev sahibi"
          score={hasNumericScore ? match.homeScore : null}
        />
        <TeamRow
          name={match.awayTeam}
          isClub={match.clubSide === "away"}
          side="Deplasman"
          score={hasNumericScore ? match.awayScore : null}
        />
      </div>

      {match.scoreRaw ? (
        <p className="text-[0.8125rem] font-semibold text-maroon-deep">TFF sonucu: {match.scoreRaw}</p>
      ) : null}

      <div className="border-t border-border-subtle pt-3">
        <MatchMeta match={match} />
      </div>
    </article>
  );
}

/** Yaklaşan ilk maç — sayfanın odak noktası. */
export function NextMatchCard({ match }: { match: LeagueMatch }) {
  const teams = [
    { name: match.homeTeam, isClub: match.clubSide === "home", side: "Ev sahibi" },
    { name: match.awayTeam, isClub: match.clubSide === "away", side: "Deplasman" },
  ];

  return (
    <section aria-labelledby="siradaki-mac" className="club-panel-accent-dark p-5 text-white sm:p-7 lg:p-8">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 id="siradaki-mac" className="type-label-caps-accent text-accent-bright">
          Sıradaki maç
        </h2>
        <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-white/80">{match.week}. Hafta</p>
      </div>

      <div className="mt-5 grid grid-cols-1 items-center gap-3 sm:grid-cols-[1fr_auto_1fr] sm:gap-5">
        {teams.map((team, index) => (
          <div key={team.side} className="contents">
            {index === 1 ? (
              <p aria-hidden className="text-center text-sm font-bold tracking-[0.3em] text-white/60">
                VS
              </p>
            ) : null}
            <div
              className={cn(
                "flex items-center gap-3 rounded-2xl p-3 sm:flex-col sm:p-4 sm:text-center",
                team.isClub ? "bg-white/12 ring-1 ring-white/30" : "bg-white/[0.04]",
              )}
            >
              <TeamBadge name={team.name} isClub={team.isClub} size="lg" tone="dark" />
              <div className="min-w-0">
                <p className={cn("text-sm leading-snug break-words sm:text-base", team.isClub ? "font-bold" : "font-semibold text-white/90")}>
                  {team.name}
                </p>
                <p className="mt-1 text-[0.6875rem] font-medium uppercase tracking-[0.14em] text-white/60">
                  {team.side}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 border-t border-white/15 pt-5">
        <MatchMeta match={match} tone="dark" />
      </div>
    </section>
  );
}

const resultLabel = { win: "Galibiyet", draw: "Beraberlik", loss: "Mağlubiyet" } as const;

const resultClass = {
  win: "bg-maroon text-white",
  draw: "bg-surface-muted text-maroon-deep",
  loss: "border border-maroon/30 text-maroon-deep",
} as const;

/** Resmî skoru olan maçın kulübümüz açısından sonucu (yalnızca TFF skorundan hesaplanır). */
function clubResult(match: LeagueMatch) {
  if (match.homeScore === null || match.awayScore === null || !match.clubSide) return null;
  const own = match.clubSide === "home" ? match.homeScore : match.awayScore;
  const other = match.clubSide === "home" ? match.awayScore : match.homeScore;
  if (own > other) return "win";
  return own === other ? "draw" : "loss";
}

export function ResultRow({ match }: { match: LeagueMatch }) {
  const result = clubResult(match);
  const hasNumericScore = match.homeScore !== null && match.awayScore !== null;

  return (
    <li className="rounded-2xl border border-border-subtle bg-surface-card p-3.5 sm:p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="type-meta text-maroon-deep">
          {match.week}. Hafta{match.matchDate ? ` · ${formatMatchDate(match.matchDate)}` : ""}
        </p>
        {result ? (
          <span className={cn("rounded-full px-2.5 py-1 text-[0.6875rem] font-bold", resultClass[result])}>
            {resultLabel[result]}
          </span>
        ) : null}
      </div>
      <div className="mt-3 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        <p
          className={cn(
            "text-right text-[0.8125rem] leading-snug break-words",
            match.clubSide === "home" ? "font-bold text-maroon" : "font-semibold text-text-primary",
          )}
        >
          {match.homeTeam}
        </p>
        <p className="min-w-[4.5rem] rounded-xl bg-maroon-deep px-3 py-1.5 text-center text-lg font-bold tabular-nums text-white">
          {hasNumericScore ? `${match.homeScore} - ${match.awayScore}` : match.scoreRaw}
        </p>
        <p
          className={cn(
            "text-[0.8125rem] leading-snug break-words",
            match.clubSide === "away" ? "font-bold text-maroon" : "font-semibold text-text-primary",
          )}
        >
          {match.awayTeam}
        </p>
      </div>
    </li>
  );
}
