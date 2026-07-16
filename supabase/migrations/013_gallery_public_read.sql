-- gallery_albums / gallery_images tabloları daha önce migration dışında oluşturulmuş;
-- herkese açık okuma politikası eksikse (site tarafındaki /galeri/fotograflar için) eklenir.
alter table if exists gallery_albums enable row level security;
alter table if exists gallery_images enable row level security;

drop policy if exists "gallery_albums public read" on gallery_albums;
create policy "gallery_albums public read"
  on gallery_albums for select
  using (is_active = true);

drop policy if exists "gallery_images public read" on gallery_images;
create policy "gallery_images public read"
  on gallery_images for select
  using (is_active = true);
