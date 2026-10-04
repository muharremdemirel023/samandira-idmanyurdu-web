-- Ön kayıt başvurularına kampanya seçimi ve "Arkadaşını Getir" ikinci öğrenci bilgisi ekler.
alter table public.pre_registrations
  add column if not exists campaign_type text not null default 'online_15',
  add column if not exists student2_name text,
  add column if not exists student2_birth_year smallint;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'pre_registrations_campaign_type_check') then
    alter table public.pre_registrations
      add constraint pre_registrations_campaign_type_check
      check (campaign_type in ('online_15', 'friend_20'));
  end if;

  if not exists (select 1 from pg_constraint where conname = 'pre_registrations_friend_campaign_requires_student2') then
    alter table public.pre_registrations
      add constraint pre_registrations_friend_campaign_requires_student2 check (
        campaign_type <> 'friend_20'
        or (
          student2_name is not null and char_length(student2_name) between 2 and 100
          and student2_birth_year is not null
        )
      ) not valid;
  end if;

  if not exists (select 1 from pg_constraint where conname = 'pre_registrations_student2_birth_year_check') then
    alter table public.pre_registrations
      add constraint pre_registrations_student2_birth_year_check
      check (student2_birth_year is null or student2_birth_year between 2000 and 2100) not valid;
  end if;
end
$$;

create index if not exists pre_registrations_campaign_type_idx
  on public.pre_registrations (campaign_type, created_at desc);
