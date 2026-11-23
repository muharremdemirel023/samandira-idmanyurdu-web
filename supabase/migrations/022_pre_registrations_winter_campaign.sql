-- Kış kampanyası paketlerini yeni ön kayıtlar için kabul et;
-- online_15 geçmiş kayıtları görüntüleme ve saklama için geçerli kalır.
alter table public.pre_registrations
  drop constraint if exists pre_registrations_campaign_type_check;

alter table public.pre_registrations
  add constraint pre_registrations_campaign_type_check
  check (
    campaign_type in (
      'online_15',
      'friend_20',
      'winter_monthly',
      'winter_biannual',
      'winter_annual'
    )
  );
