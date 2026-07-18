-- Panelden daha once eklenmis olabilecek gevsek policy'leri temizle. PostgreSQL
-- RLS policy'leri OR ile birlestirdigi icin yalniz yeni, dar policy eklemek yeterli degildir.
do $$
declare
  existing_policy record;
begin
  for existing_policy in
    select policyname
    from pg_policies
    where schemaname = 'public' and tablename = 'pre_registrations'
  loop
    execute format(
      'drop policy if exists %I on public.pre_registrations',
      existing_policy.policyname
    );
  end loop;
end
$$;

alter table public.pre_registrations enable row level security;
revoke all on table public.pre_registrations from anon, authenticated;

create policy "pre_registrations admin read"
  on public.pre_registrations for select
  to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create policy "pre_registrations admin update"
  on public.pre_registrations for update
  to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

grant select on table public.pre_registrations to authenticated;
grant update (status, notification_status, notification_attempts, notification_last_error, notification_sent_at, updated_at)
  on table public.pre_registrations to authenticated;
grant all on table public.pre_registrations to service_role;
