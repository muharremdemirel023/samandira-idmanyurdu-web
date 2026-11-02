import { z } from "zod";

const positiveId = z.number().int().positive();
const teamName = z.string().min(2).max(200);
const stat = z.number().int().min(-999).max(999).nullable();

export const tffSeasonSchema = z.object({
  seasonId: positiveId,
  name: z.string().min(4).max(20),
  isSelected: z.boolean(),
});

export const tffLeagueLinkSchema = z.object({
  leagueId: positiveId,
  leagueSlug: z.string().regex(/^[a-z0-9-]+$/),
  leagueName: z.string().min(1).max(120),
  seasonId: positiveId,
  seasonName: z.string().min(4).max(20),
  path: z.string().startsWith("/kulup/").max(300),
});

export const tffMatchSchema = z
  .object({
    matchId: positiveId,
    week: z.number().int().min(1).max(60),
    dateLabel: z.string().min(1).max(80),
    matchDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable(),
    kickoffTime: z.string().regex(/^\d{2}:\d{2}$/).nullable(),
    venue: z.string().min(1).max(200).nullable(),
    homeTeam: teamName,
    awayTeam: teamName,
    homeScore: z.number().int().min(0).max(99).nullable(),
    awayScore: z.number().int().min(0).max(99).nullable(),
    scoreRaw: z.string().max(40).nullable(),
    clubSide: z.enum(["home", "away"]).nullable(),
    sourcePath: z.string().startsWith("/mac/").max(500),
  })
  .refine((match) => (match.homeScore === null) === (match.awayScore === null), {
    message: "Skor iki taraf için birlikte bulunmalıdır.",
  });

export const tffStandingSchema = z.object({
  clubId: positiveId,
  teamName,
  displayOrder: z.number().int().min(1).max(60),
  played: stat,
  won: stat,
  drawn: stat,
  lost: stat,
  goalsFor: stat,
  goalsAgainst: stat,
  goalDifference: stat,
  points: stat,
});

export const tffStandingsSchema = z.object({
  groupLabel: z.string().min(1).max(80).nullable(),
  groupNumber: z.number().int().positive().nullable(),
  week: z.number().int().min(1).max(60).nullable(),
  rows: z.array(tffStandingSchema).max(60),
});

export const tffSyncPayloadSchema = z.object({
  seasons: z.array(tffSeasonSchema).min(1).max(100),
  competition: z.object({
    seasonId: positiveId,
    leagueId: positiveId,
    leagueSlug: z.string().regex(/^[a-z0-9-]+$/),
    leagueName: z.string().min(1).max(120),
    resultsPublished: z.boolean(),
    sourceUrl: z.string().startsWith("https://").max(500),
  }),
  matches: z.array(tffMatchSchema).max(200),
  standings: tffStandingsSchema.nullable(),
});

export type TffSeason = z.infer<typeof tffSeasonSchema>;
export type TffLeagueLink = z.infer<typeof tffLeagueLinkSchema>;
export type TffMatch = z.infer<typeof tffMatchSchema>;
export type TffStanding = z.infer<typeof tffStandingSchema>;
export type TffStandings = z.infer<typeof tffStandingsSchema>;
export type TffSyncPayload = z.infer<typeof tffSyncPayloadSchema>;
