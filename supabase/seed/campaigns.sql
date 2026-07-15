-- Mevcut yaz kayıt kampanyası. Tekrar çalıştırılırsa kopya oluşturmaz.

insert into campaigns (
  name,
  desktop_image_url,
  mobile_image_url,
  is_active,
  open_delay_ms,
  auto_close_seconds,
  show_every_reload,
  show_once_per_user
)
select
  'Bu Yaz Ekrana Değil, Sahaya Bağlan',
  '/images/campaigns/yaz-kayit-baslik.png',
  '/images/campaigns/yaz-kayit-baslik.png',
  true,
  500,
  6,
  true,
  false
where not exists (
  select 1 from campaigns where name = 'Bu Yaz Ekrana Değil, Sahaya Bağlan'
);
