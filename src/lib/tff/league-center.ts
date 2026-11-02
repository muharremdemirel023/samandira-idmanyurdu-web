import "server-only";

import { tffSourceConfig } from "@/config/tff";
import { createPublicClient } from "@/lib/supabase/public";

/*
 * Lig Merkezi okuma katmanı: veriler yalnızca Supabase'den (anon + RLS) okunur.
 * Veriler herkese açık olduğundan ziyaretçi oturumu kullanılmaz (çerezsiz istemci).
 * Ziyaretçi isteği hiçbir koşulda TFF'ye gitmez; TFF verisini /api/cron/tff-sync yazar.
 */

export type LeagueSeason = {
  seasonId: number;
  name: string;
  isCurrent: boolean;
};

export type LeagueCompetition = {
  season: LeagueSeason;
  leagueId: number;
  leagueName: string;
  groupLabel: string | null;
  groupNumber: number | null;
  standingsWeek: number | null;
  resultsPublished: boolean;
  sourceUrl: string;
  lastSyncedAt: string;
};

export type LeagueMatch = {
  matchId: number;
  week: number;
  dateLabel: string;
  matchDate: string | null;
  kickoffTime: string | null;
  venue: string | null;
  homeTeam: string;
  awayTeam: string;
  homeScore: number | null;
  awayScore: number | null;
  scoreRaw: string | null;
  clubSide: "home" | "away" | null;
};

export type LeagueStanding = {
  clubId: number;
  teamName: string;
  displayOrder: number;
  played: number | null;
  won: number | null;
  drawn: number | null;
  lost: number | null;
  goalsFor: number | null;
  goalsAgainst: number | null;
  goalDifference: number | null;
  points: number | null;
};

export type LeagueCenterData =
  | { status: "ok"; competitions: LeagueCompetition[]; selected: LeagueCompetition; matches: LeagueMatch[]; standings: LeagueStanding[] }
  | { status: "empty" }
  | { status: "error" };

/** Kulübün TFF kimliği, kaynak yolundan okunur (ör. /kulup/.../2143). */
export const clubTffId = Number(tffSourceConfig.clubPath.split("/").pop());

type CompetitionRow = {
  season_id: number;
  league_id: number;
  league_name: string;
  group_label: string | null;
  group_number: number | null;
  standings_week: number | null;
  results_published: boolean;
  source_url: string;
  last_synced_at: string;
  tff_seasons: { name: string; is_current: boolean } | null;
};

function toCompetition(row: CompetitionRow): LeagueCompetition | null {
  if (!row.tff_seasons) return null;
  return {
    season: { seasonId: row.season_id, name: row.tff_seasons.name, isCurrent: row.tff_seasons.is_current },
    leagueId: row.league_id,
    leagueName: row.league_name,
    groupLabel: row.group_label,
    groupNumber: row.group_number,
    standingsWeek: row.standings_week,
    resultsPublished: row.results_published,
    sourceUrl: row.source_url,
    lastSyncedAt: row.last_synced_at,
  };
}

/**
 * Seçili sezonun fikstür ve puan durumunu okur. `seasonName` boşsa veya
 * veritabanında yoksa TFF'nin güncel sezonu, o da yoksa en yeni sezon seçilir.
 */
export async function getLeagueCenterData(seasonName?: string): Promise<LeagueCenterData> {
  try {
    const supabase = createPublicClient();
    const { data: competitionRows, error } = await supabase
      .from("tff_competitions")
      .select(
        "season_id,league_id,league_name,group_label,group_number,standings_week,results_published,source_url,last_synced_at,tff_seasons(name,is_current)",
      )
      .eq("league_slug", tffSourceConfig.leagueSlug)
      .order("season_id", { ascending: false });

    if (error) {
      console.error("[lig-merkezi] Lig bilgileri okunamadı", error.message);
      return { status: "error" };
    }

    const competitions = ((competitionRows ?? []) as unknown as CompetitionRow[])
      .map(toCompetition)
      .filter((item): item is LeagueCompetition => item !== null);
    if (competitions.length === 0) return { status: "empty" };

    const selected =
      competitions.find((item) => item.season.name === seasonName) ??
      competitions.find((item) => item.season.isCurrent) ??
      competitions[0];

    const [matchesResult, standingsResult] = await Promise.all([
      supabase
        .from("tff_matches")
        .select(
          "match_id,week,date_label,match_date,kickoff_time,venue,home_team,away_team,home_score,away_score,score_raw,club_side",
        )
        .eq("season_id", selected.season.seasonId)
        .eq("league_id", selected.leagueId)
        .is("removed_from_source_at", null)
        .order("week", { ascending: true })
        .order("match_date", { ascending: true, nullsFirst: false })
        .order("kickoff_time", { ascending: true, nullsFirst: false }),
      supabase
        .from("tff_standings")
        .select("club_id,team_name,display_order,played,won,drawn,lost,goals_for,goals_against,goal_difference,points")
        .eq("season_id", selected.season.seasonId)
        .eq("league_id", selected.leagueId)
        .order("display_order", { ascending: true }),
    ]);

    if (matchesResult.error || standingsResult.error) {
      console.error(
        "[lig-merkezi] Fikstür veya puan durumu okunamadı",
        matchesResult.error?.message ?? standingsResult.error?.message,
      );
      return { status: "error" };
    }

    const matches: LeagueMatch[] = (matchesResult.data ?? []).map((row) => ({
      matchId: row.match_id,
      week: row.week,
      dateLabel: row.date_label,
      matchDate: row.match_date,
      // Postgres "time" alanı "13:00:00" döner; arayüzde saat:dakika yeterli.
      kickoffTime: row.kickoff_time ? String(row.kickoff_time).slice(0, 5) : null,
      venue: row.venue,
      homeTeam: row.home_team,
      awayTeam: row.away_team,
      homeScore: row.home_score,
      awayScore: row.away_score,
      scoreRaw: row.score_raw,
      clubSide: row.club_side,
    }));

    const standings: LeagueStanding[] = (standingsResult.data ?? []).map((row) => ({
      clubId: row.club_id,
      teamName: row.team_name,
      displayOrder: row.display_order,
      played: row.played,
      won: row.won,
      drawn: row.drawn,
      lost: row.lost,
      goalsFor: row.goals_for,
      goalsAgainst: row.goals_against,
      goalDifference: row.goal_difference,
      points: row.points,
    }));

    return { status: "ok", competitions, selected, matches, standings };
  } catch (error) {
    console.error("[lig-merkezi] Veri okunamadı", error);
    return { status: "error" };
  }
}

/* --- Saf yardımcılar (sunum mantığı; veri üretmez) --- */

export type MatchTiming = "upcoming" | "today" | "past" | "undated";

/** İstanbul saatine göre bugünün tarihi (YYYY-MM-DD). */
export function istanbulToday(now: Date) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Istanbul" }).format(now);
}

export function getMatchTiming(match: LeagueMatch, today: string): MatchTiming {
  if (!match.matchDate) return "undated";
  if (match.matchDate === today) return "today";
  return match.matchDate > today ? "upcoming" : "past";
}

export function hasOfficialScore(match: LeagueMatch) {
  return (match.homeScore !== null && match.awayScore !== null) || match.scoreRaw !== null;
}

/**
 * Yaklaşan ilk maç: skoru olmayan, bugün veya sonrası tarihli ilk maç; hiç
 * tarihli maç yoksa tarihi henüz açıklanmamış en erken hafta.
 */
export function findNextMatch(matches: LeagueMatch[], today: string) {
  const open = matches.filter((match) => !hasOfficialScore(match));
  const dated = open
    .filter((match) => match.matchDate !== null && match.matchDate >= today)
    .sort((a, b) =>
      `${a.matchDate} ${a.kickoffTime ?? "99:99"}`.localeCompare(`${b.matchDate} ${b.kickoffTime ?? "99:99"}`),
    );
  if (dated[0]) return dated[0];

  return open.filter((match) => match.matchDate === null).sort((a, b) => a.week - b.week)[0] ?? null;
}

/** Puan tablosunda TFF'nin gerçekten değer yayımladığı sütunlar. */
export function hasPublishedStandings(standings: LeagueStanding[]) {
  return standings.some((row) =>
    [row.played, row.won, row.drawn, row.lost, row.goalsFor, row.goalsAgainst, row.goalDifference, row.points].some(
      (value) => value !== null && value !== 0,
    ),
  );
}

export function formatMatchDate(matchDate: string) {
  const [year, month, day] = matchDate.split("-").map(Number);
  return new Intl.DateTimeFormat("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    weekday: "long",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, month - 1, day)));
}

export function formatSyncTime(timestamp: string) {
  return new Intl.DateTimeFormat("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Istanbul",
  }).format(new Date(timestamp));
}

/** "U11 LİGİ" → "U11"; kategori adı TFF lig adından okunur. */
export function getAgeCategory(leagueName: string) {
  return leagueName.match(/U\s?\d{2}/i)?.[0].replace(/\s/, "").toUpperCase() ?? leagueName;
}
