import type { ReactNode } from "react";

import { ExternalIcon, InfoIcon } from "@/components/league/LeagueIcons";
import { MatchCard, NextMatchCard, ResultRow } from "@/components/league/MatchCard";
import { SeasonSwitcher } from "@/components/league/SeasonSwitcher";
import { StandingsTable } from "@/components/league/StandingsTable";
import { Container } from "@/components/ui/Container";
import { tffSourceConfig } from "@/config/tff";
import { cn } from "@/lib/cn";
import {
  clubTffId,
  findNextMatch,
  formatSyncTime,
  getAgeCategory,
  getMatchTiming,
  hasOfficialScore,
  hasPublishedStandings,
  type LeagueCenterData,
  type LeagueCompetition,
} from "@/lib/tff/league-center";

const clubSourceUrl = `${tffSourceConfig.origin}${tffSourceConfig.clubPath}`;

function PageIntro({ category }: { category?: string }) {
  return (
    <div className="max-w-prose-section">
      <p className="type-overline club-kicker-line text-accent">Resmî fikstür</p>
      <h1 className="type-display text-text-primary">Lig Merkezi</h1>
      <p className="type-lead mt-5 max-w-prose-lead">
        {category ? `${category} takımımızın` : "Takımlarımızın"} {tffSourceConfig.sourceLabel} tarafından
        yayımlanan maç programı, sonuçları ve grup bilgileri.
      </p>
    </div>
  );
}

function SectionHeading({
  id,
  overline,
  title,
  children,
}: {
  id: string;
  overline: string;
  title: string;
  children?: ReactNode;
}) {
  return (
    <div className="mb-5 flex flex-col gap-2 sm:mb-6">
      <p className="type-overline text-accent">{overline}</p>
      <h2 id={id} className="type-heading-lg">
        {title}
      </h2>
      {children ? <div className="type-body max-w-prose-body">{children}</div> : null}
    </div>
  );
}

function Notice({ title, children, tone = "info" }: { title: string; children: ReactNode; tone?: "info" | "error" }) {
  return (
    <div
      role={tone === "error" ? "alert" : undefined}
      className={cn(
        "flex gap-3 rounded-2xl border p-4 sm:p-5",
        tone === "error" ? "border-accent/40 bg-accent-soft" : "border-border-subtle bg-surface-card",
      )}
    >
      <InfoIcon className={cn("mt-0.5 size-5 shrink-0", tone === "error" ? "text-accent-strong" : "text-maroon")} />
      <div className="min-w-0">
        <p className="font-semibold text-text-primary">{title}</p>
        <div className="type-body mt-1">{children}</div>
      </div>
    </div>
  );
}

function SourceLink({ href }: { href: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex min-h-[2.75rem] items-center gap-1.5 font-semibold text-maroon underline-offset-4 hover:underline"
    >
      Kaynak: {tffSourceConfig.sourceLabel}
      <ExternalIcon className="size-4" />
      <span className="sr-only">(yeni sekmede açılır)</span>
    </a>
  );
}

function InfoTile({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="min-w-0 rounded-2xl border border-border-subtle bg-surface-card p-4 shadow-shell">
      <dt className="type-meta">{label}</dt>
      <dd className="mt-2 text-base font-bold leading-snug break-words text-maroon-deep sm:text-lg">{value}</dd>
      {hint ? <dd className="mt-1 text-[0.75rem] text-text-muted">{hint}</dd> : null}
    </div>
  );
}

function LeagueInfo({ competition }: { competition: LeagueCompetition }) {
  const group = competition.groupNumber
    ? `${competition.groupNumber}. Grup`
    : (competition.groupLabel ?? "Açıklanmadı");

  return (
    <section aria-labelledby="lig-bilgileri">
      <h2 id="lig-bilgileri" className="sr-only">
        Lig bilgileri
      </h2>
      <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <InfoTile
          label="Sezon"
          value={competition.season.name}
          hint={competition.season.isCurrent ? "Güncel sezon" : "Arşiv sezonu"}
        />
        <InfoTile label="Kategori" value={getAgeCategory(competition.leagueName)} hint={competition.leagueName} />
        <InfoTile
          label="Grup"
          value={group}
          hint={competition.standingsWeek ? `${competition.standingsWeek}. hafta itibarıyla` : undefined}
        />
        <InfoTile label="Son güncelleme" value={formatSyncTime(competition.lastSyncedAt)} hint="TFF verisiyle eşitlendi" />
      </dl>
    </section>
  );
}

function SourceSection({ competition }: { competition?: LeagueCompetition }) {
  return (
    <section aria-label="Resmî kaynak" className="mt-14 border-t border-border-subtle pt-6 sm:mt-16">
      <SourceLink href={competition?.sourceUrl ?? clubSourceUrl} />
      <p className="type-body mt-2 max-w-prose-body">
        Fikstür, skor ve puan durumu bilgileri {tffSourceConfig.sourceLabel} tarafından yayımlanan resmî verilerden
        otomatik olarak alınır; kulübümüz tarafından değiştirilmez veya eklenmez. Bağlayıcı ve en güncel bilgi için
        resmî kaynağı inceleyin.
        {competition ? ` Son eşitleme: ${formatSyncTime(competition.lastSyncedAt)}.` : ""}
      </p>
    </section>
  );
}

function PageShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-1 flex-col">
      <section className="relative isolate pb-14 pt-[calc(var(--header-height)+0.75rem)] md:pb-20 md:pt-[calc(var(--header-height)+1rem)]">
        <div aria-hidden className="absolute inset-0 -z-20 bg-surface-base" />
        <Container>{children}</Container>
      </section>
    </div>
  );
}

/** Lig Merkezi sunumu. Yalnızca verilen veriyi gösterir; hiçbir değer üretmez. */
export function LeagueCenterView({ data, today }: { data: LeagueCenterData; today: string }) {
  if (data.status !== "ok") {
    return (
      <PageShell>
        <PageIntro />
        <div className="mt-10 max-w-3xl">
          {data.status === "error" ? (
            <Notice tone="error" title="Lig verilerine şu anda ulaşılamıyor.">
              Lütfen birkaç dakika sonra tekrar deneyin. Bu sürede güncel fikstürü resmî kaynaktan inceleyebilirsiniz.
            </Notice>
          ) : (
            <Notice title="Lig verileri hazırlanıyor.">
              {tffSourceConfig.sourceLabel} verileri ilk kez eşitlendiğinde fikstür ve grup bilgileri burada
              yayımlanacaktır.
            </Notice>
          )}
        </div>
        <SourceSection />
      </PageShell>
    );
  }

  const { competitions, selected, matches, standings } = data;
  const nextMatch = selected.season.isCurrent ? findNextMatch(matches, today) : null;
  const scoredMatches = matches.filter(hasOfficialScore);
  // Skoru yayımlanan maçlar "Maç Sonuçları"nda; fikstürde yalnızca skoru olmayanlar kalır.
  const fixtureMatches = matches.filter((match) => !hasOfficialScore(match));
  const upcomingMatches = fixtureMatches.filter((match) => getMatchTiming(match, today) !== "past");
  const pastMatches = fixtureMatches.filter((match) => getMatchTiming(match, today) === "past");
  const showStandings = selected.resultsPublished && hasPublishedStandings(standings);
  const currentSeason = competitions.find((item) => item.season.isCurrent);

  return (
    <PageShell>
      <PageIntro category={getAgeCategory(selected.leagueName)} />

      <div className="mt-8 flex flex-col gap-6 sm:mt-10">
        <SeasonSwitcher seasons={competitions.map((item) => item.season)} selectedId={selected.season.seasonId} />

        {!selected.season.isCurrent && currentSeason ? (
          <Notice title={`${selected.season.name} arşiv sezonu görüntüleniyor.`}>
            Güncel sezon ({currentSeason.season.name}) bilgileri için sezon seçiminden güncel sezonu seçin.
          </Notice>
        ) : null}

        <LeagueInfo competition={selected} />

        {nextMatch ? <NextMatchCard match={nextMatch} /> : null}
      </div>

      <section aria-labelledby="fikstur" className="mt-14 sm:mt-16">
        <SectionHeading id="fikstur" overline="Maç programı" title="Fikstür">
          Tarih, saat ve saha bilgileri TFF tarafından açıklandıkça otomatik olarak güncellenir.
        </SectionHeading>

        {fixtureMatches.length === 0 ? (
          <Notice title={scoredMatches.length > 0 ? "Bu sezonun tüm maçları oynandı." : "Henüz fikstür yayımlanmadı."}>
            {scoredMatches.length > 0
              ? "Resmî skorlar aşağıdaki Maç Sonuçları bölümünde yer alır."
              : `${tffSourceConfig.sourceLabel} bu sezon için fikstür yayımladığında maçlar burada listelenecektir.`}
          </Notice>
        ) : (
          <div className="flex flex-col gap-10">
            {upcomingMatches.length > 0 ? (
              <div>
                <h3 className="type-heading-md mb-4">Gelecek maçlar</h3>
                <ol className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {upcomingMatches.map((match) => (
                    <li key={match.matchId}>
                      <MatchCard
                        match={match}
                        timing={getMatchTiming(match, today)}
                        isNext={match.matchId === nextMatch?.matchId}
                      />
                    </li>
                  ))}
                </ol>
              </div>
            ) : null}

            {pastMatches.length > 0 ? (
              <div>
                <h3 className="type-heading-md mb-1">Tarihi geçen maçlar</h3>
                <p className="type-body mb-4 max-w-prose-body">
                  {selected.resultsPublished
                    ? "Bu maçlar için TFF henüz resmî skor yayımlamadı."
                    : "TFF bu lig için resmî skor yayımlamadığından bu maçlarda sonuç gösterilmez."}
                </p>
                <ol className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {pastMatches.map((match) => (
                    <li key={match.matchId}>
                      <MatchCard match={match} timing="past" />
                    </li>
                  ))}
                </ol>
              </div>
            ) : null}
          </div>
        )}
      </section>

      {scoredMatches.length > 0 ? (
        <section aria-labelledby="mac-sonuclari" className="mt-14 sm:mt-16">
          <SectionHeading id="mac-sonuclari" overline="Resmî skorlar" title="Maç Sonuçları" />
          <ol className="grid gap-3 lg:grid-cols-2">
            {[...scoredMatches].reverse().map((match) => (
              <ResultRow key={match.matchId} match={match} />
            ))}
          </ol>
        </section>
      ) : null}

      <section aria-labelledby="puan-durumu" className="mt-14 sm:mt-16">
        <SectionHeading id="puan-durumu" overline={selected.groupLabel ?? "Grup"} title="Puan Durumu" />

        {showStandings ? (
          <>
            <StandingsTable rows={standings} clubId={clubTffId} />
            <p className="mt-3 text-[0.75rem] text-text-muted">
              Sıralama TFF&apos;nin yayımladığı şekliyle gösterilir
              {selected.standingsWeek ? ` (${selected.standingsWeek}. hafta)` : ""}.
            </p>
          </>
        ) : (
          <div className="flex flex-col gap-5">
            <Notice title="Resmî puan durumu yayımlanmıyor.">
              {tffSourceConfig.sourceLabel} bu lig için skor ve puan bilgisi yayımlamamaktadır. Resmî bilgiler
              yayımlandığında puan durumu ve maç sonuçları burada otomatik olarak gösterilecektir.
            </Notice>

            {standings.length > 0 ? (
              <div>
                <h3 className="type-card-title text-maroon-deep">
                  {selected.groupNumber ? `${selected.groupNumber}. Grup` : "Grup"} takımları
                </h3>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {standings.map((row) => (
                    <li
                      key={row.clubId}
                      className={cn(
                        "rounded-full border px-3 py-1.5 text-[0.75rem] font-semibold",
                        row.clubId === clubTffId
                          ? "border-maroon bg-maroon text-white"
                          : "border-border-subtle bg-surface-card text-text-primary",
                      )}
                    >
                      {row.teamName}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        )}
      </section>

      <SourceSection competition={selected} />
    </PageShell>
  );
}
