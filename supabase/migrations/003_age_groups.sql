-- Yaş grupları (public yaş grupları sayfası + ana sayfa önizleme)
create table if not exists age_groups (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  age_range text not null,
  short_description text,
  long_description text,
  image_url text,
  badge text,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table age_groups enable row level security;

drop policy if exists "age_groups public read" on age_groups;
create policy "age_groups public read"
  on age_groups for select
  using (true);

drop policy if exists "age_groups authenticated write" on age_groups;
create policy "age_groups authenticated write"
  on age_groups for all
  to authenticated
  using (true)
  with check (true);
