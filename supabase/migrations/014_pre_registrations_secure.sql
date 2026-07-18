-- Akademi on kayitlari: kanonik sema, RLS, rate limit ve realtime.
create table if not exists public.pre_registrations (
  id uuid primary key default gen_random_uuid(),
  guardian_name text,
  phone_e164 text,
  student_name text,
  birth_year smallint,
  note text,
  status text not null default 'new',
  consent_at timestamptz,
  privacy_version text,
  source text not null default 'web',
  dedupe_hash text,
  notification_status text not null default 'pending',
  notification_attempts integer not null default 0,
  notification_last_error text,
  notification_sent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Daha once Supabase panelinden olusturulmus bir tablo varsa eksik kanonik
-- kolonlari guvenli bicimde tamamla.
alter table public.pre_registrations add column if not exists guardian_name text;
alter table public.pre_registrations add column if not exists phone_e164 text;
alter table public.pre_registrations add column if not exists student_name text;
alter table public.pre_registrations add column if not exists birth_year smallint;
alter table public.pre_registrations add column if not exists note text;
alter table public.pre_registrations add column if not exists status text default 'new';
alter table public.pre_registrations add column if not exists consent_at timestamptz;
alter table public.pre_registrations add column if not exists privacy_version text;
alter table public.pre_registrations add column if not exists source text default 'web';
alter table public.pre_registrations add column if not exists dedupe_hash text;
alter table public.pre_registrations add column if not exists notification_status text default 'pending';
alter table public.pre_registrations add column if not exists notification_attempts integer default 0;
alter table public.pre_registrations add column if not exists notification_last_error text;
alter table public.pre_registrations add column if not exists notification_sent_at timestamptz;
alter table public.pre_registrations add column if not exists created_at timestamptz default now();
alter table public.pre_registrations add column if not exists updated_at timestamptz default now();

-- Olası eski kolon adlarindan kanonik kolonlara veri tasi.
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'pre_registrations' and column_name = 'parent_name'
  ) then
    execute 'update public.pre_registrations set guardian_name = coalesce(guardian_name, parent_name) where guardian_name is null';
  end if;

  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'pre_registrations' and column_name = 'player_name'
  ) then
    execute 'update public.pre_registrations set student_name = coalesce(student_name, player_name) where student_name is null';
  end if;

  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'pre_registrations' and column_name = 'child_name'
  ) then
    execute 'update public.pre_registrations set student_name = coalesce(student_name, child_name) where student_name is null';
  end if;

  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'pre_registrations' and column_name = 'phone'
  ) then
    execute $sql$
      update public.pre_registrations
      set phone_e164 = case
        when regexp_replace(phone, '[^0-9]', '', 'g') ~ '^90[0-9]{10}$'
          then '+' || regexp_replace(phone, '[^0-9]', '', 'g')
        when regexp_replace(phone, '[^0-9]', '', 'g') ~ '^0[0-9]{10}$'
          then '+90' || substring(regexp_replace(phone, '[^0-9]', '', 'g') from 2)
        when regexp_replace(phone, '[^0-9]', '', 'g') ~ '^[0-9]{10}$'
          then '+90' || regexp_replace(phone, '[^0-9]', '', 'g')
        else null
      end
      where phone_e164 is null
    $sql$;
  end if;

  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'pre_registrations' and column_name = 'notes'
  ) then
    execute 'update public.pre_registrations set note = coalesce(note, notes) where note is null';
  end if;
end
$$;

-- NOT VALID eski, duzensiz veriyi migration sirasinda bloke etmez; yeni ve
-- guncellenen kayitlarda kosullar yine uygulanir.
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'pre_registrations_required_fields') then
    alter table public.pre_registrations
      add constraint pre_registrations_required_fields check (
        guardian_name is not null and char_length(guardian_name) between 2 and 100
        and phone_e164 is not null and phone_e164 ~ '^\+905[0-9]{9}$'
        and student_name is not null and char_length(student_name) between 2 and 100
        and birth_year is not null
        and consent_at is not null
        and privacy_version is not null
      ) not valid;
  end if;

  if not exists (select 1 from pg_constraint where conname = 'pre_registrations_birth_year_check') then
    alter table public.pre_registrations
      add constraint pre_registrations_birth_year_check check (birth_year between 2000 and 2100) not valid;
  end if;

  if not exists (select 1 from pg_constraint where conname = 'pre_registrations_note_length') then
    alter table public.pre_registrations
      add constraint pre_registrations_note_length check (note is null or char_length(note) <= 1000) not valid;
  end if;

  if not exists (select 1 from pg_constraint where conname = 'pre_registrations_status_check') then
    alter table public.pre_registrations
      add constraint pre_registrations_status_check check (
        status in ('new', 'called', 'trial_training', 'registered', 'closed')
      ) not valid;
  end if;

  if not exists (select 1 from pg_constraint where conname = 'pre_registrations_notification_status_check') then
    alter table public.pre_registrations
      add constraint pre_registrations_notification_status_check check (
        notification_status in ('pending', 'sent', 'failed', 'skipped')
      ) not valid;
  end if;
end
$$;

create unique index if not exists pre_registrations_dedupe_hash_idx
  on public.pre_registrations (dedupe_hash)
  where dedupe_hash is not null;
create index if not exists pre_registrations_created_at_idx
  on public.pre_registrations (created_at desc);
create index if not exists pre_registrations_status_idx
  on public.pre_registrations (status, created_at desc);

create or replace function public.set_pre_registration_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end
$$;

drop trigger if exists set_pre_registration_updated_at on public.pre_registrations;
create trigger set_pre_registration_updated_at
before update on public.pre_registrations
for each row execute function public.set_pre_registration_updated_at();

alter table public.pre_registrations enable row level security;

drop policy if exists "pre_registrations admin read" on public.pre_registrations;
create policy "pre_registrations admin read"
  on public.pre_registrations for select
  to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

drop policy if exists "pre_registrations admin update" on public.pre_registrations;
create policy "pre_registrations admin update"
  on public.pre_registrations for update
  to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

revoke all on table public.pre_registrations from anon, authenticated;
grant select on table public.pre_registrations to authenticated;
grant update (status, notification_status, notification_attempts, notification_last_error, notification_sent_at, updated_at)
  on table public.pre_registrations to authenticated;
grant all on table public.pre_registrations to service_role;

-- Ham IP/telefon yerine yalnizca uygulamada uretilen SHA-256 anahtarlari tutulur.
create table if not exists public.pre_registration_rate_limits (
  key_hash text primary key,
  window_started_at timestamptz not null default now(),
  attempts integer not null default 1,
  updated_at timestamptz not null default now()
);

alter table public.pre_registration_rate_limits enable row level security;
revoke all on table public.pre_registration_rate_limits from anon, authenticated;
grant all on table public.pre_registration_rate_limits to service_role;

create or replace function public.consume_pre_registration_rate_limit(
  p_key_hash text,
  p_window_seconds integer,
  p_max_attempts integer
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_allowed boolean;
begin
  if p_key_hash is null or char_length(p_key_hash) <> 64
     or p_window_seconds < 1 or p_max_attempts < 1 then
    return false;
  end if;

  insert into public.pre_registration_rate_limits as limits (
    key_hash,
    window_started_at,
    attempts,
    updated_at
  ) values (
    p_key_hash,
    now(),
    1,
    now()
  )
  on conflict (key_hash) do update
  set
    attempts = case
      when limits.window_started_at <= now() - make_interval(secs => p_window_seconds) then 1
      else limits.attempts + 1
    end,
    window_started_at = case
      when limits.window_started_at <= now() - make_interval(secs => p_window_seconds) then now()
      else limits.window_started_at
    end,
    updated_at = now()
  returning attempts <= p_max_attempts into v_allowed;

  return v_allowed;
end
$$;

revoke all on function public.consume_pre_registration_rate_limit(text, integer, integer)
  from public, anon, authenticated;
grant execute on function public.consume_pre_registration_rate_limit(text, integer, integer)
  to service_role;

-- Admin sayfalarinin yeni kayitlari Supabase Realtime ile alabilmesi icin.
do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime')
     and not exists (
       select 1 from pg_publication_tables
       where pubname = 'supabase_realtime'
         and schemaname = 'public'
         and tablename = 'pre_registrations'
     ) then
    alter publication supabase_realtime add table public.pre_registrations;
  end if;
end
$$;
