-- Site ayarları (tek kayıt: id = 1)
create table if not exists site_settings (
  id integer primary key default 1 check (id = 1),
  academy_name text,
  academy_short_name text,
  phone text,
  whatsapp text,
  email text,
  address text,
  maps_url text,
  instagram_url text,
  working_hours text,
  header_logo_url text,
  footer_logo_url text,
  footer_description text,
  seo_title text,
  seo_description text,
  canonical_url text,
  updated_at timestamptz not null default now()
);

alter table site_settings enable row level security;

drop policy if exists "site_settings public read" on site_settings;
create policy "site_settings public read"
  on site_settings for select
  using (true);

drop policy if exists "site_settings authenticated write" on site_settings;
create policy "site_settings authenticated write"
  on site_settings for all
  to authenticated
  using (true)
  with check (true);
