-- videos tablosu daha önce migration dışında oluşturulmuş; herkese açık okuma
-- politikası eksikse (site tarafında antrenman videoları bölümü için) eklenir.
alter table if exists videos enable row level security;

drop policy if exists "videos public read" on videos;
create policy "videos public read"
  on videos for select
  using (is_active = true);
