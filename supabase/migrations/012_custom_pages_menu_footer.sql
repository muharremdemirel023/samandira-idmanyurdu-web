-- custom_pages: menüde/footer'da gösterme ve sıralama alanları
alter table custom_pages
  add column if not exists show_in_menu boolean not null default false,
  add column if not exists show_in_footer boolean not null default false,
  add column if not exists sort_order integer not null default 0;
