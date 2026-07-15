# Teknik Kadro CMS

Admin panelinde `/admin/staff` rotası teknik kadro yönetimi için hazırlandı.

## Gerekli tablo

Projede `staff` tablosu yoksa Supabase SQL editöründe aşağıdaki tablo yapısı oluşturulmalıdır:

```sql
create table public.staff (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  title text not null,
  short_summary text,
  biography text,
  highlights text[] default '{}',
  photo_url text,
  sort_order integer default 0,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

Önerilen Row Level Security yaklaşımı:

- Admin panelde listeleme, ekleme, düzenleme ve silme için yalnızca yetkili kullanıcılar.
- Public sitede aktif teknik kadro üyelerini göstermek için `is_active = true` koşullu okuma politikası.

Public `/akademi/teknik-kadro` sayfası bu tablodaki yalnızca `is_active = true` kayıtları okur.

## Görsel yükleme

Teknik kadro profil fotoğrafı:

- Bucket: `site-images`
- Klasör: `staff`
- Oran: `4:5`
- Kırpma ve ölçekleme tarayıcı tarafındaki canvas ile yapılır.

`site-images` bucket'ı Supabase Storage tarafında oluşturulmalı ve public görseller için uygun okuma politikası tanımlanmalıdır.
