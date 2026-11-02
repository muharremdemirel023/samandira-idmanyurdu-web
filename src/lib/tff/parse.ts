import { TffSyncError } from "@/lib/tff/errors";
import type { TffLeagueLink, TffMatch, TffSeason, TffStanding, TffStandings } from "@/lib/tff/schema";

/*
 * TFF İstanbul kulüp sayfaları sunucu tarafında üretilen HTML'dir (JSON API yok).
 * Ayrıştırıcı bilinen sınıf adlarına dayanır; beklenen yapı bulunamazsa
 * "structure_changed" hatası verir ki kaynak değişikliği kayıt altına alınsın.
 */

const NAMED_ENTITIES: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
};

const TURKISH_MONTHS: Record<string, number> = {
  ocak: 1,
  şubat: 2,
  mart: 3,
  nisan: 4,
  mayıs: 5,
  haziran: 6,
  temmuz: 7,
  ağustos: 8,
  eylül: 9,
  ekim: 10,
  kasım: 11,
  aralık: 12,
};

type StandingStatKey = Exclude<keyof TffStanding, "clubId" | "teamName" | "displayOrder">;

// Puan tablosu sütun başlıkları; bilinmeyen bir başlık kaynak değişikliği sayılır.
const STANDING_COLUMNS: Record<string, StandingStatKey> = {
  O: "played",
  G: "won",
  B: "drawn",
  M: "lost",
  A: "goalsFor",
  AG: "goalsFor",
  Y: "goalsAgainst",
  YG: "goalsAgainst",
  AV: "goalDifference",
  P: "points",
};

const CLUB_LEAGUE_PATH = /^(\/kulup\/[^/]+\/\d+)\/([^/]+)\/(\d+)\/([^/]+)\/(\d+)$/;

export function decodeHtml(value: string) {
  return value.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (match, entity: string) => {
    if (entity.startsWith("#")) {
      const code =
        entity[1].toLowerCase() === "x" ? parseInt(entity.slice(2), 16) : parseInt(entity.slice(1), 10);
      return Number.isFinite(code) && code > 0 && code <= 0x10ffff ? String.fromCodePoint(code) : match;
    }
    return NAMED_ENTITIES[entity.toLowerCase()] ?? match;
  });
}

export function cleanText(html: string) {
  return decodeHtml(html.replace(/<[^>]*>/g, " ")).replace(/\s+/g, " ").trim();
}

/** Takım adlarını karşılaştırmak için: TFF adlarında çift boşluk ve büyük/küçük harf farkı olabiliyor. */
export function teamKey(name: string) {
  return name.replace(/\s+/g, " ").trim().toLocaleUpperCase("tr-TR");
}

function getAttr(tagAttributes: string, name: string) {
  const match = tagAttributes.match(new RegExp(`\\s${name}="([^"]*)"`, "i"));
  return match ? decodeHtml(match[1]) : null;
}

function structureChanged(message: string, details?: Record<string, unknown>): never {
  throw new TffSyncError("structure_changed", message, details);
}

export type TffClubIndex = {
  seasons: TffSeason[];
  leagues: TffLeagueLink[];
};

/** Kulüp sayfasındaki sezon seçicisini ve o sezonun lig bağlantılarını okur. */
export function parseClubIndex(html: string, clubPath: string): TffClubIndex {
  const select = html.match(/<select\b[^>]*id="seasonselect"[^>]*>([\s\S]*?)<\/select>/i);
  if (!select) structureChanged("Sezon seçicisi (#seasonselect) bulunamadı.");

  const seasons = [...select[1].matchAll(/<option\b([^>]*)>([\s\S]*?)<\/option>/gi)].map(([, attrs, label]) => ({
    seasonId: Number(getAttr(attrs, "value")),
    name: getAttr(attrs, "data-friendly-name") ?? cleanText(label),
    isSelected: /\sselected\b/i.test(attrs),
  }));
  if (seasons.length === 0) structureChanged("Sezon listesi boş.");

  const leagues: TffLeagueLink[] = [];
  for (const [, attrs, label] of html.matchAll(/<a\b([^>]*class="content-filter__link"[^>]*)>([\s\S]*?)<\/a>/gi)) {
    const href = (getAttr(attrs, "href") ?? "").split("#")[0];
    const parts = href.match(CLUB_LEAGUE_PATH);
    if (!parts || parts[1] !== clubPath) continue;

    leagues.push({
      leagueId: Number(parts[5]),
      leagueSlug: parts[4],
      leagueName: cleanText(label),
      seasonId: Number(parts[3]),
      seasonName: parts[2],
      path: href,
    });
  }

  return { seasons, leagues };
}

export type TffLeaguePage = {
  index: TffClubIndex;
  selectedSeasonId: number | null;
  activeLeagueId: number | null;
  clubName: string | null;
  matches: TffMatch[];
  standings: TffStandings | null;
  warnings: string[];
};

function parseTurkishDate(label: string) {
  const match = label.match(/^(\d{1,2})\s+(\S+)\s+(\d{4})\b/);
  if (!match) return null;

  const month = TURKISH_MONTHS[match[2].toLocaleLowerCase("tr-TR")];
  const day = Number(match[1]);
  const year = Number(match[3]);
  if (!month) return null;

  const date = new Date(Date.UTC(year, month - 1, day));
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) return null;

  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function parseScore(homeText: string, awayText: string) {
  if (!homeText && !awayText) return { homeScore: null, awayScore: null, scoreRaw: null };
  if (/^\d{1,2}$/.test(homeText) && /^\d{1,2}$/.test(awayText)) {
    return { homeScore: Number(homeText), awayScore: Number(awayText), scoreRaw: null };
  }
  // Hükmen vb. metinler sayıya çevrilmeden aynen saklanır.
  return { homeScore: null, awayScore: null, scoreRaw: `${homeText} - ${awayText}`.trim() };
}

function parseMatches(html: string, clubName: string | null, warnings: string[]) {
  if (!html.includes('class="team-detail-results"')) {
    structureChanged("Fikstür alanı (team-detail-results) bulunamadı.");
  }

  const list = html.match(/<ul class="widget-results__list">([\s\S]*?)<\/ul>/);
  if (!list) return [];

  const matches: TffMatch[] = [];
  let week: number | null = null;
  let dateLabel = "";
  let matchDate: string | null = null;

  for (const item of list[1].split(/<li class="widget-results__item">/).slice(1)) {
    const header = item.match(/widget-results__title">([\s\S]*?)<\/div>/);
    if (header) {
      const text = cleanText(header[1]);
      const parts = text.match(/^(\d+)\.\s*Hafta\s*-?\s*(.*)$/i);
      if (!parts) structureChanged("Hafta başlığı beklenen biçimde değil.", { text });

      week = Number(parts[1]);
      dateLabel = parts[2] || "Tarih Belirlenmedi";
      matchDate = parseTurkishDate(dateLabel);
      if (!matchDate && !/belirlenmedi/i.test(dateLabel)) {
        warnings.push(`${week}. hafta tarihi çözümlenemedi: "${dateLabel}"`);
      }
      continue;
    }

    const link = item.match(/href="(\/mac\/[^"]+\/(\d+))"/);
    if (!link) continue;
    if (week === null) structureChanged("Maç, hafta başlığından önce geldi.");

    const teams = [...item.matchAll(/widget-results__team-name">([\s\S]*?)<\/h5>/g)].map((m) => cleanText(m[1]));
    if (teams.length !== 2) structureChanged("Maçta iki takım adı bulunamadı.", { matchId: link[2] });

    const score = item.match(
      /widget-results__score-winner">([\s\S]*?)<\/span>\s*-\s*<span class="widget-results__score-loser">([\s\S]*?)<\/span>/,
    );
    if (!score) structureChanged("Skor alanı bulunamadı.", { matchId: link[2] });
    // Sınıf adları "winner/loser" olsa da değerler konuma göredir (ev sahibi - deplasman).
    const parsedScore = parseScore(cleanText(score[1]), cleanText(score[2]));
    if (parsedScore.scoreRaw) warnings.push(`Maç ${link[2]} skoru sayısal değil: "${parsedScore.scoreRaw}"`);

    let venue: string | null = null;
    let kickoffTime: string | null = null;
    const stadium = item.match(/widget-results__stadiumname">([\s\S]*?)<\/div>/);
    if (stadium) {
      const [venuePart, ...timeParts] = stadium[1].split(/<span\b/);
      venue = cleanText(venuePart) || null;
      const time = cleanText(`<span${timeParts.join("<span")}`).match(/(\d{1,2}):(\d{2})/);
      kickoffTime = time ? `${time[1].padStart(2, "0")}:${time[2]}` : null;
    }

    let clubSide: TffMatch["clubSide"] = null;
    if (clubName) {
      if (teamKey(teams[0]) === teamKey(clubName)) clubSide = "home";
      else if (teamKey(teams[1]) === teamKey(clubName)) clubSide = "away";
      else warnings.push(`Maç ${link[2]} kulübümüzün adını içermiyor.`);
    }

    matches.push({
      matchId: Number(link[2]),
      week,
      dateLabel,
      matchDate,
      kickoffTime,
      venue,
      homeTeam: teams[0],
      awayTeam: teams[1],
      ...parsedScore,
      clubSide,
      sourcePath: link[1],
    });
  }

  return matches;
}

function parseStandings(html: string): TffStandings | null {
  const widget = html.match(/<aside class="widget card widget--sidebar widget-standings">([\s\S]*?)<\/aside>/);
  if (!widget) return null;

  const title = cleanText(widget[1].match(/<h4>([\s\S]*?)<\/h4>/)?.[1] ?? "");
  const weekMatch = title.match(/(\d+)\.\s*Hafta Puan Durumu/i);
  const groupLabel = cleanText(widget[1].match(/<h5 class="widget--sub-header">([\s\S]*?)<\/h5>/)?.[1] ?? "") || null;
  const groupNumber = groupLabel?.match(/^(\d+)\.\s*GRUP$/i)?.[1];

  const thead = widget[1].match(/<thead>([\s\S]*?)<\/thead>/);
  const tbody = widget[1].match(/<tbody>([\s\S]*?)<\/tbody>/);
  if (!thead || !tbody) structureChanged("Puan tablosu başlığı veya gövdesi bulunamadı.");

  const headers = [...thead[1].matchAll(/<th\b[^>]*>([\s\S]*?)<\/th>/g)].map((m) => cleanText(m[1]).toUpperCase());
  if (headers[0] !== "TAKIM") structureChanged("Puan tablosu ilk sütunu TAKIM değil.", { headers });

  const columns = headers.slice(1).map((header) => {
    const key = STANDING_COLUMNS[header];
    if (!key) structureChanged(`Puan tablosunda bilinmeyen sütun: ${header}`, { headers });
    return key;
  });

  const rows = [...tbody[1].matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/g)].map(([, row], index) => {
    const cells = [...row.matchAll(/<td\b[^>]*>([\s\S]*?)<\/td>/g)].map((m) => m[1]);
    const clubId = cells[0]?.match(/href="\/kulup\/[^"/]+\/(\d+)"/)?.[1];
    const name = cells[0]?.match(/team-meta__name">([\s\S]*?)<\/h6>/)?.[1];
    if (!clubId || !name || cells.length - 1 !== columns.length) {
      structureChanged("Puan tablosu satırı beklenen biçimde değil.", { row: index + 1 });
    }

    const standing: TffStanding = {
      clubId: Number(clubId),
      teamName: cleanText(name),
      displayOrder: index + 1,
      played: null,
      won: null,
      drawn: null,
      lost: null,
      goalsFor: null,
      goalsAgainst: null,
      goalDifference: null,
      points: null,
    };
    columns.forEach((key, column) => {
      const value = cleanText(cells[column + 1]);
      if (!/^-?\d+$/.test(value)) structureChanged("Puan tablosunda sayısal olmayan değer.", { value });
      standing[key] = Number(value);
    });
    return standing;
  });

  return {
    groupLabel,
    groupNumber: groupNumber ? Number(groupNumber) : null,
    week: weekMatch ? Number(weekMatch[1]) : null,
    rows,
  };
}

/** Kulübün belirli bir sezon/lig sayfasını (fikstür + grup puan tablosu) okur. */
export function parseLeaguePage(html: string, clubPath: string): TffLeaguePage {
  const warnings: string[] = [];
  const index = parseClubIndex(html, clubPath);

  const active = html.match(/content-filter__item--active"\s*>\s*<a\b([^>]*)>/);
  const activeLeagueId = active ? Number(getAttr(active[1], "data-id")) || null : null;

  const officialName = html.match(/<td>\s*Resmi Ad(?:ı|&#x131;)\s*<\/td>\s*<td>([\s\S]*?)<\/td>/i);
  const clubName = officialName ? cleanText(officialName[1]) || null : null;
  if (!clubName) warnings.push("Kulüp resmî adı okunamadı; ev/deplasman bilgisi boş bırakıldı.");

  return {
    index,
    selectedSeasonId: index.seasons.find((season) => season.isSelected)?.seasonId ?? null,
    activeLeagueId,
    clubName,
    matches: parseMatches(html, clubName, warnings),
    standings: parseStandings(html),
    warnings,
  };
}
