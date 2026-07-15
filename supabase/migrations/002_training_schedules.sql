-- Antrenman programı satırları
create table if not exists training_schedules (
  id uuid primary key default gen_random_uuid(),
  age_group text not null,
  days text not null,
  start_time text not null,
  end_time text not null,
  location text,
  description text,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table training_schedules enable row level security;

drop policy if exists "training_schedules public read" on training_schedules;
create policy "training_schedules public read"
  on training_schedules for select
  using (true);

drop policy if exists "training_schedules authenticated write" on training_schedules;
create policy "training_schedules authenticated write"
  on training_schedules for all
  to authenticated
  using (true)
  with check (true);
