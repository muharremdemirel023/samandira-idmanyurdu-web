-- Kış Kampanyası Karlı Etiket 3D animasyonlu popup.
insert into campaigns (
  name,
  title,
  description,
  button_label,
  button_href,
  is_active,
  open_delay_ms,
  auto_close_seconds,
  show_every_reload,
  show_once_per_user
)
select
  'Kış Kampanyası Karlı Etiket',
  'Kış Kampanyası',
  '6 Aylık Paket · Bir ay bizden',
  'Hemen Kayıt Ol',
  '/on-kayit?paket=winter_biannual#on-kayit-formu',
  true,
  1000,
  0,
  false,
  false
where not exists (
  select 1 from campaigns where name = 'Kış Kampanyası Karlı Etiket'
);
