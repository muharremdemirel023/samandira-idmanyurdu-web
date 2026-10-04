-- Kampanya popup giriş animasyonu ayarları.
alter table campaigns
  add column if not exists animation_type text not null default 'scale-fade',
  add column if not exists animation_duration_ms integer not null default 1200,
  add column if not exists animation_delay_ms integer not null default 0;

alter table campaigns
  alter column open_delay_ms set default 1000;

update campaigns
set open_delay_ms = greatest(0, least(10000, open_delay_ms));

alter table campaigns
  drop constraint if exists campaigns_animation_type_check,
  add constraint campaigns_animation_type_check
    check (animation_type in ('none', 'fade', 'slide-up', 'zoom', 'scale-fade')),
  drop constraint if exists campaigns_animation_duration_ms_check,
  add constraint campaigns_animation_duration_ms_check
    check (animation_duration_ms between 300 and 3000),
  drop constraint if exists campaigns_animation_delay_ms_check,
  add constraint campaigns_animation_delay_ms_check
    check (animation_delay_ms between 0 and 3000),
  drop constraint if exists campaigns_open_delay_ms_check,
  add constraint campaigns_open_delay_ms_check
    check (open_delay_ms between 0 and 10000);
