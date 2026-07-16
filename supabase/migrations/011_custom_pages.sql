-- Admin panelden yönetilebilen serbest içerik sayfaları (/sayfa/[slug])
create table if not exists custom_pages (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  summary text,
  content text,
  cover_image_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table custom_pages enable row level security;

drop policy if exists "custom_pages public read" on custom_pages;
create policy "custom_pages public read"
  on custom_pages for select
  using (is_active = true);

drop policy if exists "custom_pages authenticated write" on custom_pages;
create policy "custom_pages authenticated write"
  on custom_pages for all
  to authenticated
  using (true)
  with check (true);
