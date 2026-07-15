-- Admin panel görsel yüklemeleri için storage bucket'ları.
-- Kod tarafındaki karşılığı: src/lib/supabase/storage/image-upload.ts (imageStorageBuckets)

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('site-images', 'site-images', true, 5242880, array['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']),
  ('news',        'news',        true, 5242880, array['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']),
  ('gallery',     'gallery',     true, 5242880, array['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']),
  ('sponsors',    'sponsors',    true, 5242880, array['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']),
  ('videos',      'videos',      true, 52428800, null)
on conflict (id) do nothing;

-- Herkes okuyabilir (public site görselleri)
drop policy if exists "admin image buckets public read" on storage.objects;
create policy "admin image buckets public read"
  on storage.objects for select
  using (bucket_id in ('site-images', 'news', 'gallery', 'sponsors', 'videos'));

-- Yalnızca giriş yapmış (admin) kullanıcı yükleyebilir
drop policy if exists "admin image buckets authenticated insert" on storage.objects;
create policy "admin image buckets authenticated insert"
  on storage.objects for insert
  to authenticated
  with check (bucket_id in ('site-images', 'news', 'gallery', 'sponsors', 'videos'));

-- Yalnızca giriş yapmış kullanıcı güncelleyebilir / silebilir
drop policy if exists "admin image buckets authenticated update" on storage.objects;
create policy "admin image buckets authenticated update"
  on storage.objects for update
  to authenticated
  using (bucket_id in ('site-images', 'news', 'gallery', 'sponsors', 'videos'))
  with check (bucket_id in ('site-images', 'news', 'gallery', 'sponsors', 'videos'));

drop policy if exists "admin image buckets authenticated delete" on storage.objects;
create policy "admin image buckets authenticated delete"
  on storage.objects for delete
  to authenticated
  using (bucket_id in ('site-images', 'news', 'gallery', 'sponsors', 'videos'));
