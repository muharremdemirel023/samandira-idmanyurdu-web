# Galeri CMS

Admin panelinde `/admin/gallery` rotası albüm ve fotoğraf yönetimi için hazırlandı.

## Supabase tabloları

Eğer tablolar yoksa Supabase SQL editöründe aşağıdaki SQL çalıştırılmalıdır:

```sql
create table public.gallery_albums (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  cover_image_url text,
  sort_order integer default 0,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table public.gallery_images (
  id uuid primary key default gen_random_uuid(),
  album_id uuid references public.gallery_albums(id) on delete set null,
  image_url text not null,
  alt_text text,
  caption text,
  aspect_ratio text default '4:5',
  width integer default 1080,
  height integer default 1350,
  sort_order integer default 0,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

## Storage

Supabase Storage bucket:

- `gallery`

Klasörler:

- `gallery/images`
- `gallery/covers`

Not: Uygulama bucket olarak `gallery`, klasör olarak `images` ve `covers` kullanır. Supabase Storage path çıktısı bu bucket altında oluşur.

## Özellikler

- Albüm oluşturma, düzenleme, silme.
- Tek fotoğraf ekleme, düzenleme, silme.
- Çoklu fotoğraf yükleme.
- 20 fotoğrafa kadar çoklu seçim.
- Çoklu yüklemede otomatik `4:5 / 1080x1350` JPEG üretimi.
- Tek fotoğrafta `4:5` veya `1:1` format seçimi.
- Albüm ve fotoğraf sıralaması için yukarı/aşağı butonları.
- Silme işlemlerinde Türkçe onay mesajı.

## Public Galeri

`/galeri` sayfası aktif albümleri ve aktif fotoğrafları Supabase'den çeker. Görseller `4:5` ve `1:1` oranlarında bozulmadan grid içinde gösterilir.
