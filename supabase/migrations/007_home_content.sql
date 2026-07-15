-- Ana sayfa metinleri (tek kayıt: id = 1)
create table if not exists home_content (
  id integer primary key default 1 check (id = 1),
  hero_overline text,
  hero_headline text,
  hero_lead text,
  cta_primary_label text,
  cta_primary_href text,
  cta_secondary_label text,
  cta_secondary_href text,
  fees_title text,
  fees_subtitle text,
  staff_title text,
  staff_subtitle text,
  instagram_title text,
  instagram_subtitle text,
  news_title text,
  news_subtitle text,
  updated_at timestamptz not null default now()
);

alter table home_content enable row level security;

drop policy if exists "home_content public read" on home_content;
create policy "home_content public read"
  on home_content for select
  using (true);

drop policy if exists "home_content authenticated write" on home_content;
create policy "home_content authenticated write"
  on home_content for all
  to authenticated
  using (true)
  with check (true);
