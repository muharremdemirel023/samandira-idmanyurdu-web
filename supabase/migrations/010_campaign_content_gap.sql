-- Kampanya popup: görsel ile mesaj kartı arasındaki dikey boşluk (px).
-- Negatif değer kartı görselin üzerine doğru çeker (şeffaf kenarlı PNG'lerde faydalı).
alter table campaigns
  add column if not exists content_gap_px integer not null default 12;
