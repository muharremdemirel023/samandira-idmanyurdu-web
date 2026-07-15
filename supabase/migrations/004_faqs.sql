-- Sık sorulan sorular
create table if not exists faqs (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  answer text not null,
  category text,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table faqs enable row level security;

drop policy if exists "faqs public read" on faqs;
create policy "faqs public read"
  on faqs for select
  using (true);

drop policy if exists "faqs authenticated write" on faqs;
create policy "faqs authenticated write"
  on faqs for all
  to authenticated
  using (true)
  with check (true);
