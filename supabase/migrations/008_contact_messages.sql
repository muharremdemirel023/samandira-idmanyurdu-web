-- İletişim mesajları
create table if not exists contact_messages (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text,
  phone text,
  subject text,
  message text not null,
  status text not null default 'new' check (status in ('new', 'read', 'replied', 'closed')),
  admin_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table contact_messages enable row level security;

-- Public form ileride eklenirse anonim gönderime izin ver
drop policy if exists "contact_messages anon insert" on contact_messages;
create policy "contact_messages anon insert"
  on contact_messages for insert
  to anon
  with check (true);

drop policy if exists "contact_messages authenticated all" on contact_messages;
create policy "contact_messages authenticated all"
  on contact_messages for all
  to authenticated
  using (true)
  with check (true);
