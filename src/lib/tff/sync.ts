import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import { tffSourceConfig } from "@/config/tff";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { createTffClient } from "@/lib/tff/client";
import { TffSyncError } from "@/lib/tff/errors";
import { parseClubIndex, parseLeaguePage } from "@/lib/tff/parse";
import { tffSyncPayloadSchema, type TffStandings, type TffSyncPayload } from "@/lib/tff/schema";

type SyncOptions = {
  trigger: "cron" | "manual";
  /** Boşsa TFF'nin güncel sezonu; doluysa o sezon arşiv için bir kez çekilir. */
  seasonId?: number;
  /** Başarılı-senkronizasyon aralığını yok sayar (eşzamanlılık kilidini değil). */
  force?: boolean;
};

export type TffSyncResult =
  | {
      status: "success";
      runId: number;
      seasonId: number;
      leagueId: number;
      groupLabel: string | null;
      resultsPublished: boolean;
      matches: number;
      changes: Record<string, unknown>;
      warnings: string[];
    }
  | { status: "skipped"; reason: string }
  | { status: "failed"; runId: number | null; errorCode: string; error: string };

const RUNNING_SKIP_REASON = "Devam eden bir senkronizasyon var.";

async function findSkipReason(supabase: SupabaseClient, targetSeasonId: number | null, force: boolean) {
  if (force) return null;

  const since = new Date(Date.now() - tffSourceConfig.minSuccessIntervalHours * 3_600_000).toISOString();
  let query = supabase
    .from("tff_sync_runs")
    .select("id")
    .eq("status", "success")
    .gte("started_at", since)
    .limit(1);
  query = targetSeasonId === null ? query.is("target_season_id", null) : query.eq("target_season_id", targetSeasonId);

  const { data, error } = await query;
  if (error) throw new TffSyncError("db_error", `Senkronizasyon geçmişi okunamadı: ${error.message}`);

  return data.length > 0
    ? `Son ${tffSourceConfig.minSuccessIntervalHours} saat içinde başarılı senkronizasyon yapıldı.`
    : null;
}

/** Yarıda kalmış (ör. zaman aşımına uğramış) bir çalıştırmanın kilidini süresi dolunca bırakır. */
async function releaseStaleLock(supabase: SupabaseClient) {
  const lockSince = new Date(Date.now() - tffSourceConfig.runningLockMinutes * 60_000).toISOString();
  await supabase
    .from("tff_sync_runs")
    .update({
      status: "failed",
      finished_at: new Date().toISOString(),
      error_code: "stale_lock",
      error_message: "Çalıştırma tamamlanmadan sonlandı; kilit süresi dolduğu için bırakıldı.",
    })
    .eq("status", "running")
    .lt("started_at", lockSince);
}

/** TFF hiç skor veya sıfırdan farklı puan yayımlamadıysa sonuçlar "yayımlanmamış" sayılır. */
function hasPublishedResults(payload: Pick<TffSyncPayload, "matches" | "standings">) {
  if (payload.matches.some((match) => match.homeScore !== null || match.scoreRaw !== null)) return true;
  return (payload.standings?.rows ?? []).some((row) =>
    [row.played, row.won, row.drawn, row.lost, row.goalsFor, row.goalsAgainst, row.goalDifference, row.points].some(
      (value) => value !== null && value !== 0,
    ),
  );
}

/** Sonuç yayımlanmamışken TFF'nin gösterdiği yer tutucu sıfırlar veri olarak saklanmaz. */
function withoutPlaceholderStats(standings: TffStandings): TffStandings {
  return {
    ...standings,
    rows: standings.rows.map((row) => ({
      ...row,
      played: null,
      won: null,
      drawn: null,
      lost: null,
      goalsFor: null,
      goalsAgainst: null,
      goalDifference: null,
      points: null,
    })),
  };
}

function dedupeBy<T>(items: T[], key: (item: T) => number, warnings: string[], label: string) {
  const seen = new Set<number>();
  return items.filter((item) => {
    const id = key(item);
    if (seen.has(id)) {
      warnings.push(`${label} ${id} sayfada birden fazla kez geçiyor; ilk kayıt kullanıldı.`);
      return false;
    }
    seen.add(id);
    return true;
  });
}

function toRpcPayload(payload: TffSyncPayload) {
  return {
    seasons: payload.seasons.map((season) => ({
      season_id: season.seasonId,
      name: season.name,
      is_current: season.isSelected,
    })),
    competition: {
      season_id: payload.competition.seasonId,
      league_id: payload.competition.leagueId,
      league_slug: payload.competition.leagueSlug,
      league_name: payload.competition.leagueName,
      group_label: payload.standings?.groupLabel ?? null,
      group_number: payload.standings?.groupNumber ?? null,
      standings_week: payload.standings?.week ?? null,
      results_published: payload.competition.resultsPublished,
      source_url: payload.competition.sourceUrl,
    },
    matches: payload.matches.map((match) => ({
      match_id: match.matchId,
      week: match.week,
      date_label: match.dateLabel,
      match_date: match.matchDate,
      kickoff_time: match.kickoffTime,
      venue: match.venue,
      home_team: match.homeTeam,
      away_team: match.awayTeam,
      home_score: match.homeScore,
      away_score: match.awayScore,
      score_raw: match.scoreRaw,
      club_side: match.clubSide,
      source_path: match.sourcePath,
    })),
    standings: (payload.standings?.rows ?? []).map((row) => ({
      club_id: row.clubId,
      team_name: row.teamName,
      display_order: row.displayOrder,
      played: row.played,
      won: row.won,
      drawn: row.drawn,
      lost: row.lost,
      goals_for: row.goalsFor,
      goals_against: row.goalsAgainst,
      goal_difference: row.goalDifference,
      points: row.points,
    })),
  };
}

export async function runTffSync({ trigger, seasonId, force = false }: SyncOptions): Promise<TffSyncResult> {
  const supabase = createServiceRoleClient();
  const targetSeasonId = seasonId ?? null;

  const logSkipped = async (reason: string) => {
    await supabase.from("tff_sync_runs").insert({
      trigger,
      target_season_id: targetSeasonId,
      status: "skipped",
      finished_at: new Date().toISOString(),
      details: { reason },
    });
    return { status: "skipped", reason } as const;
  };

  const skipReason = await findSkipReason(supabase, targetSeasonId, force);
  if (skipReason) return logSkipped(skipReason);

  await releaseStaleLock(supabase);

  // "running" kaydı kilidin kendisidir: tff_sync_runs_single_running_idx ikinci bir kaydı reddeder.
  const { data: run, error: runError } = await supabase
    .from("tff_sync_runs")
    .insert({ trigger, target_season_id: targetSeasonId, status: "running" })
    .select("id")
    .single();
  if (runError?.code === "23505") return logSkipped(RUNNING_SKIP_REASON);
  if (runError || !run) {
    console.error("[tff-sync] Senkronizasyon kaydı açılamadı", runError);
    return { status: "failed", runId: null, errorCode: "db_error", error: "Senkronizasyon kaydı açılamadı." };
  }

  const client = createTffClient();
  let resolvedSeasonId: number | null = null;
  let resolvedLeagueId: number | null = null;

  try {
    await client.loadRobots();

    const { clubPath, leagueSlug } = tffSourceConfig;
    const index = parseClubIndex(await client.fetchHtml(clubPath), clubPath);
    const currentSeason =
      index.seasons.find((season) => season.isSelected) ??
      index.seasons.reduce((latest, season) => (season.seasonId > latest.seasonId ? season : latest));

    const targetSeason = targetSeasonId === null
      ? currentSeason
      : index.seasons.find((season) => season.seasonId === targetSeasonId);
    if (!targetSeason) {
      throw new TffSyncError("season_not_found", `TFF sezon listesinde ${targetSeasonId} numaralı sezon yok.`);
    }
    resolvedSeasonId = targetSeason.seasonId;

    // Arşiv sezonu için lig listesi o sezonun kulüp sayfasından okunur (sitenin kendi URL kalıbı).
    const leagues =
      targetSeason.seasonId === currentSeason.seasonId
        ? index.leagues
        : parseClubIndex(
            await client.fetchHtml(`${clubPath}/${targetSeason.name}/${targetSeason.seasonId}`),
            clubPath,
          ).leagues;

    const league = leagues.find(
      (item) => item.leagueSlug === leagueSlug && item.seasonId === targetSeason.seasonId,
    );
    if (!league) {
      throw new TffSyncError(
        "league_not_found",
        `${targetSeason.name} sezonunda kulübün "${leagueSlug}" ligi TFF sayfasında bulunamadı.`,
        { availableLeagues: leagues.map((item) => item.leagueSlug) },
      );
    }
    resolvedLeagueId = league.leagueId;

    const page = parseLeaguePage(await client.fetchHtml(league.path), clubPath);
    if (page.selectedSeasonId !== targetSeason.seasonId || page.activeLeagueId !== league.leagueId) {
      throw new TffSyncError("structure_changed", "TFF sayfası istenen sezon/lig yerine farklı içerik döndürdü.", {
        expected: { seasonId: targetSeason.seasonId, leagueId: league.leagueId },
        received: { seasonId: page.selectedSeasonId, leagueId: page.activeLeagueId },
      });
    }

    const warnings = [...page.warnings];
    const matches = dedupeBy(page.matches, (match) => match.matchId, warnings, "Maç");
    const standings = page.standings
      ? { ...page.standings, rows: dedupeBy(page.standings.rows, (row) => row.clubId, warnings, "Kulüp") }
      : null;
    if (!standings) warnings.push("Puan tablosu sayfada yok; önceki grup bilgisi korundu.");

    const resultsPublished = hasPublishedResults({ matches, standings });
    const parsed = tffSyncPayloadSchema.safeParse({
      seasons: index.seasons,
      competition: {
        seasonId: targetSeason.seasonId,
        leagueId: league.leagueId,
        leagueSlug: league.leagueSlug,
        leagueName: league.leagueName,
        resultsPublished,
        sourceUrl: new URL(league.path, tffSourceConfig.origin).toString(),
      },
      matches,
      standings: standings && !resultsPublished ? withoutPlaceholderStats(standings) : standings,
    });
    if (!parsed.success) {
      throw new TffSyncError("validation_failed", "TFF verisi doğrulamadan geçmedi.", {
        issues: parsed.error.issues.slice(0, 10).map((issue) => `${issue.path.join(".")}: ${issue.message}`),
      });
    }

    const { data: changes, error: applyError } = await supabase.rpc("tff_apply_sync", {
      p_payload: toRpcPayload(parsed.data),
    });
    if (applyError) throw new TffSyncError("db_error", `Veri kaydedilemedi: ${applyError.message}`);

    const groupLabel = parsed.data.standings?.groupLabel ?? null;
    const previousGroup = (changes as { previous_group_label?: string | null } | null)?.previous_group_label ?? null;
    if (groupLabel && previousGroup && previousGroup !== groupLabel) {
      warnings.push(`Grup değişti: ${previousGroup} → ${groupLabel}`);
    }

    await supabase
      .from("tff_sync_runs")
      .update({
        status: "success",
        finished_at: new Date().toISOString(),
        season_id: resolvedSeasonId,
        league_id: resolvedLeagueId,
        details: {
          changes,
          warnings,
          groupLabel,
          resultsPublished,
          requests: client.requestCount,
          sourceUrl: parsed.data.competition.sourceUrl,
        },
      })
      .eq("id", run.id);

    return {
      status: "success",
      runId: run.id,
      seasonId: resolvedSeasonId,
      leagueId: resolvedLeagueId,
      groupLabel,
      resultsPublished,
      matches: parsed.data.matches.length,
      changes: (changes ?? {}) as Record<string, unknown>,
      warnings,
    };
  } catch (error) {
    const syncError =
      error instanceof TffSyncError
        ? error
        : new TffSyncError("unexpected_error", error instanceof Error ? error.message : "Bilinmeyen hata");
    console.error(`[tff-sync] ${syncError.code}: ${syncError.message}`, syncError.details ?? "");

    // Hata durumunda veri tablolarına dokunulmaz; yalnızca çalıştırma kaydı güncellenir.
    await supabase
      .from("tff_sync_runs")
      .update({
        status: "failed",
        finished_at: new Date().toISOString(),
        season_id: resolvedSeasonId,
        league_id: resolvedLeagueId,
        error_code: syncError.code,
        error_message: syncError.message,
        details: { ...(syncError.details ?? {}), requests: client.requestCount },
      })
      .eq("id", run.id);

    return { status: "failed", runId: run.id, errorCode: syncError.code, error: syncError.message };
  }
}
