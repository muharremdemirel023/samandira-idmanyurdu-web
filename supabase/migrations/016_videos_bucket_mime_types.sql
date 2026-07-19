-- Video dosyaları artık tarayıcıdan doğrudan Storage'a yüklendiği için
-- (bkz. src/components/admin/VideoFileUploadField.tsx) sunucu tarafı tip/boyut
-- doğrulamasını bucket seviyesinde de zorunlu kılar.
update storage.buckets
set
  file_size_limit = 52428800,
  allowed_mime_types = array['video/mp4', 'video/webm', 'video/quicktime', 'video/x-m4v', 'image/jpeg', 'image/png', 'image/webp']
where id = 'videos';
