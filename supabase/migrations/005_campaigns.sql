-- Kampanya popup yönetimi
create table if not exists campaigns (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  desktop_image_url text,
  mobile_image_url text,
  title text,
  description text,
  button_label text,
  button_href text,
  is_active boolean not null default true,
  starts_at timestamptz,
  ends_at timestamptz,
  open_delay_ms integer not null default 500,
  auto_close_seconds integer not null default 6,
  show_every_reload boolean not null default true,
  show_once_per_user boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table campaigns enable row level security;

drop policy if exists "campaigns public read" on campaigns;
create policy "campaigns public read"
  on campaigns for select
  using (true);

drop policy if exists "campaigns authenticated write" on campaigns;
create policy "campaigns authenticated write"
  on campaigns for all
  to authenticated
  using (true)
  with check (true);
