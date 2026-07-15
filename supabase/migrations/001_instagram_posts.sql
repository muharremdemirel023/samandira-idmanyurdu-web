-- Instagram paylaşımları (ana sayfa embed listesi)
create table if not exists instagram_posts (
  id uuid primary key default gen_random_uuid(),
  instagram_url text not null,
  content_type text not null default 'post' check (content_type in ('post', 'reel')),
  title text,
  is_active boolean not null default true,
  show_on_home boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table instagram_posts enable row level security;

drop policy if exists "instagram_posts public read" on instagram_posts;
create policy "instagram_posts public read"
  on instagram_posts for select
  using (true);

drop policy if exists "instagram_posts authenticated write" on instagram_posts;
create policy "instagram_posts authenticated write"
  on instagram_posts for all
  to authenticated
  using (true)
  with check (true);
