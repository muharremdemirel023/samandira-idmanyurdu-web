-- TFF Istanbul Il Temsilciligi resmi fikstur verisi (otomatik senkronizasyon).
-- Bu tablolara yalnizca /api/cron/tff-sync (service_role) yazar; manuel giris yoktur.
-- Sezon, lig ve grup kimlikleri TFF sayfasindan okunur, hicbiri sabit degildir.

create table if not exists public.tff_seasons (
  season_id integer primary key,
  name text not null,
  is_current boolean not null default false,
  first_seen_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists tff_seasons_single_current_idx
  on public.tff_seasons (is_current)
  where is_current;

create table if not exists public.tff_competitions (
  season_id integer not null references public.tff_seasons (season_id),
  league_id integer not null,
  league_slug text not null,
  league_name text not null,
  group_label text,
  group_number integer,
  standings_week integer,
  -- TFF skor veya sifirdan farkli puan yayimladiginda true olur.
  results_published boolean not null default false,
  source_url text not null,
  last_synced_at timestamptz not null default now(),
  first_seen_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (season_id, league_id)
);

create table if not exists public.tff_matches (
  -- TFF mac kimligi (/mac/.../{id}); tekrar eden kayitlari engeller.
  match_id bigint primary key,
  season_id integer not null,
  league_id integer not null,
  week integer not null,
  date_label text not null,
  match_date date,
  kickoff_time time,
  venue text,
  home_team text not null,
  away_team text not null,
  home_score smallint,
  away_score smallint,
  -- Sayiya cevrilemeyen skor metni (ornegin hukmen) degistirilmeden saklanir.
  score_raw text,
  club_side text,
  source_path text not null,
  first_seen_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  removed_from_source_at timestamptz,
  updated_at timestamptz not null default now(),
  constraint tff_matches_competition_fk
    foreign key (season_id, league_id) references public.tff_competitions (season_id, league_id),
  constraint tff_matches_club_side_check check (club_side is null or club_side in ('home', 'away')),
  constraint tff_matches_score_check check (
    (home_score is null or home_score between 0 and 99)
    and (away_score is null or away_score between 0 and 99)
  )
);

create index if not exists tff_matches_competition_week_idx
  on public.tff_matches (season_id, league_id, week);

create table if not exists public.tff_standings (
  season_id integer not null,
  league_id integer not null,
  club_id integer not null,
  team_name text not null,
  display_order integer not null,
  -- TFF sonuc yayimlamadiginda istatistikler null tutulur (sifir uretilmez).
  played smallint,
  won smallint,
  drawn smallint,
  lost smallint,
  goals_for smallint,
  goals_against smallint,
  goal_difference smallint,
  points smallint,
  updated_at timestamptz not null default now(),
  primary key (season_id, league_id, club_id),
  constraint tff_standings_competition_fk
    foreign key (season_id, league_id) references public.tff_competitions (season_id, league_id)
);

create table if not exists public.tff_sync_runs (
  id bigint generated always as identity primary key,
  trigger text not null,
  target_season_id integer,
  status text not null default 'running',
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  season_id integer,
  league_id integer,
  error_code text,
  error_message text,
  details jsonb not null default '{}'::jsonb,
  constraint tff_sync_runs_trigger_check check (trigger in ('cron', 'manual')),
  constraint tff_sync_runs_status_check check (status in ('running', 'success', 'failed', 'skipped'))
);

create index if not exists tff_sync_runs_started_at_idx
  on public.tff_sync_runs (started_at desc);

-- Ayni anda yalnizca bir senkronizasyon calisabilir; kilit veritabaninda atomik tutulur.
create unique index if not exists tff_sync_runs_single_running_idx
  on public.tff_sync_runs ((true))
  where status = 'running';

-- Fikstur verisi herkese acik okunur; yazma yalnizca service_role ile.
alter table public.tff_seasons enable row level security;
alter table public.tff_competitions enable row level security;
alter table public.tff_matches enable row level security;
alter table public.tff_standings enable row level security;
alter table public.tff_sync_runs enable row level security;

drop policy if exists "tff_seasons public read" on public.tff_seasons;
create policy "tff_seasons public read" on public.tff_seasons for select to anon, authenticated using (true);

drop policy if exists "tff_competitions public read" on public.tff_competitions;
create policy "tff_competitions public read" on public.tff_competitions for select to anon, authenticated using (true);

drop policy if exists "tff_matches public read" on public.tff_matches;
create policy "tff_matches public read" on public.tff_matches for select to anon, authenticated using (true);

drop policy if exists "tff_standings public read" on public.tff_standings;
create policy "tff_standings public read" on public.tff_standings for select to anon, authenticated using (true);

revoke all on table public.tff_seasons, public.tff_competitions, public.tff_matches, public.tff_standings
  from anon, authenticated;
grant select on table public.tff_seasons, public.tff_competitions, public.tff_matches, public.tff_standings
  to anon, authenticated;

-- Senkronizasyon gunlugu yalnizca sunucu tarafinda okunur.
revoke all on table public.tff_sync_runs from anon, authenticated;

grant all on table public.tff_seasons, public.tff_competitions, public.tff_matches,
  public.tff_standings, public.tff_sync_runs to service_role;

-- Tum yazimlar tek transaction'da yapilir: hata olursa onceki basarili veri aynen kalir.
create or replace function public.tff_apply_sync(p_payload jsonb)
returns jsonb
language plpgsql
set search_path = public
as $$
declare
  v_season_id integer := (p_payload #>> '{competition,season_id}')::integer;
  v_league_id integer := (p_payload #>> '{competition,league_id}')::integer;
  v_current_season_id integer;
  v_previous_group text;
  v_match_ids bigint[];
  v_matches_changed integer := 0;
  v_matches_removed integer := 0;
  v_standings_rows integer := 0;
begin
  if v_season_id is null or v_league_id is null then
    raise exception 'tff_apply_sync: competition.season_id ve competition.league_id zorunludur';
  end if;

  select (s ->> 'season_id')::integer into v_current_season_id
  from jsonb_array_elements(coalesce(p_payload -> 'seasons', '[]'::jsonb)) s
  where (s ->> 'is_current')::boolean
  limit 1;

  if v_current_season_id is not null then
    update tff_seasons set is_current = false, updated_at = now()
    where is_current and season_id <> v_current_season_id;
  end if;

  insert into tff_seasons (season_id, name, is_current)
  select (s ->> 'season_id')::integer, s ->> 'name', coalesce((s ->> 'is_current')::boolean, false)
  from jsonb_array_elements(coalesce(p_payload -> 'seasons', '[]'::jsonb)) s
  on conflict (season_id) do update
  set name = excluded.name, is_current = excluded.is_current, updated_at = now()
  where (tff_seasons.name, tff_seasons.is_current) is distinct from (excluded.name, excluded.is_current);

  select group_label into v_previous_group
  from tff_competitions
  where season_id = v_season_id and league_id = v_league_id;

  insert into tff_competitions (
    season_id, league_id, league_slug, league_name, group_label, group_number,
    standings_week, results_published, source_url, last_synced_at
  )
  values (
    v_season_id,
    v_league_id,
    p_payload #>> '{competition,league_slug}',
    p_payload #>> '{competition,league_name}',
    p_payload #>> '{competition,group_label}',
    (p_payload #>> '{competition,group_number}')::integer,
    (p_payload #>> '{competition,standings_week}')::integer,
    coalesce((p_payload #>> '{competition,results_published}')::boolean, false),
    p_payload #>> '{competition,source_url}',
    now()
  )
  on conflict (season_id, league_id) do update
  set
    league_slug = excluded.league_slug,
    league_name = excluded.league_name,
    -- Puan tablosu sayfada yoksa bilinen son grup bilgisi korunur.
    group_label = coalesce(excluded.group_label, tff_competitions.group_label),
    group_number = coalesce(excluded.group_number, tff_competitions.group_number),
    standings_week = coalesce(excluded.standings_week, tff_competitions.standings_week),
    results_published = excluded.results_published,
    source_url = excluded.source_url,
    last_synced_at = now(),
    updated_at = now();

  with incoming as (
    select *
    from jsonb_to_recordset(coalesce(p_payload -> 'matches', '[]'::jsonb)) as m (
      match_id bigint,
      week integer,
      date_label text,
      match_date date,
      kickoff_time time,
      venue text,
      home_team text,
      away_team text,
      home_score smallint,
      away_score smallint,
      score_raw text,
      club_side text,
      source_path text
    )
  ),
  upserted as (
    insert into tff_matches as t (
      match_id, season_id, league_id, week, date_label, match_date, kickoff_time, venue,
      home_team, away_team, home_score, away_score, score_raw, club_side, source_path
    )
    select
      m.match_id, v_season_id, v_league_id, m.week, m.date_label, m.match_date, m.kickoff_time, m.venue,
      m.home_team, m.away_team, m.home_score, m.away_score, m.score_raw, m.club_side, m.source_path
    from incoming m
    on conflict (match_id) do update
    set
      season_id = excluded.season_id,
      league_id = excluded.league_id,
      week = excluded.week,
      date_label = excluded.date_label,
      match_date = excluded.match_date,
      kickoff_time = excluded.kickoff_time,
      venue = excluded.venue,
      home_team = excluded.home_team,
      away_team = excluded.away_team,
      home_score = excluded.home_score,
      away_score = excluded.away_score,
      score_raw = excluded.score_raw,
      club_side = excluded.club_side,
      source_path = excluded.source_path,
      last_seen_at = now(),
      removed_from_source_at = null,
      updated_at = case
        when (t.week, t.date_label, t.match_date, t.kickoff_time, t.venue, t.home_team, t.away_team,
              t.home_score, t.away_score, t.score_raw, t.club_side, t.removed_from_source_at)
          is distinct from
             (excluded.week, excluded.date_label, excluded.match_date, excluded.kickoff_time, excluded.venue,
              excluded.home_team, excluded.away_team, excluded.home_score, excluded.away_score,
              excluded.score_raw, excluded.club_side, null::timestamptz)
          then now()
        else t.updated_at
      end
    returning t.match_id, t.updated_at = now() as changed
  )
  select array_agg(match_id), count(*) filter (where changed)
  into v_match_ids, v_matches_changed
  from upserted;

  -- TFF'den kalkan maclar silinmez, yalnizca isaretlenir. Bos liste gelirse
  -- (olasi ayristirma hatasi) mevcut kayitlara dokunulmaz.
  if coalesce(array_length(v_match_ids, 1), 0) > 0 then
    update tff_matches
    set removed_from_source_at = now(), updated_at = now()
    where season_id = v_season_id
      and league_id = v_league_id
      and removed_from_source_at is null
      and match_id <> all (v_match_ids);
    get diagnostics v_matches_removed = row_count;
  end if;

  if jsonb_typeof(p_payload -> 'standings') = 'array' and jsonb_array_length(p_payload -> 'standings') > 0 then
    delete from tff_standings
    where season_id = v_season_id
      and league_id = v_league_id
      and club_id <> all (
        array(select (s ->> 'club_id')::integer from jsonb_array_elements(p_payload -> 'standings') s)
      );

    insert into tff_standings (
      season_id, league_id, club_id, team_name, display_order, played, won, drawn, lost,
      goals_for, goals_against, goal_difference, points
    )
    select
      v_season_id, v_league_id, s.club_id, s.team_name, s.display_order, s.played, s.won, s.drawn, s.lost,
      s.goals_for, s.goals_against, s.goal_difference, s.points
    from jsonb_to_recordset(p_payload -> 'standings') as s (
      club_id integer,
      team_name text,
      display_order integer,
      played smallint,
      won smallint,
      drawn smallint,
      lost smallint,
      goals_for smallint,
      goals_against smallint,
      goal_difference smallint,
      points smallint
    )
    on conflict (season_id, league_id, club_id) do update
    set
      team_name = excluded.team_name,
      display_order = excluded.display_order,
      played = excluded.played,
      won = excluded.won,
      drawn = excluded.drawn,
      lost = excluded.lost,
      goals_for = excluded.goals_for,
      goals_against = excluded.goals_against,
      goal_difference = excluded.goal_difference,
      points = excluded.points,
      updated_at = now();

    v_standings_rows := jsonb_array_length(p_payload -> 'standings');
  end if;

  return jsonb_build_object(
    'matches_received', coalesce(array_length(v_match_ids, 1), 0),
    'matches_changed', v_matches_changed,
    'matches_removed', v_matches_removed,
    'standings_rows', v_standings_rows,
    'previous_group_label', v_previous_group
  );
end
$$;

revoke all on function public.tff_apply_sync(jsonb) from public, anon, authenticated;
grant execute on function public.tff_apply_sync(jsonb) to service_role;
