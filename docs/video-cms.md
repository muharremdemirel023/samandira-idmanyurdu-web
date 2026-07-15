# Video CMS

Admin panelinde `/admin/videos` rotası video bağlantılarını yönetmek için hazırlandı.

Video dosyası yüklenmez. Yalnızca YouTube Shorts, Instagram Reel ve ileride TikTok için kullanılabilecek bağlantı altyapısı yönetilir.

## Supabase tablosu

Eğer tablo yoksa Supabase SQL editöründe aşağıdaki SQL çalıştırılmalıdır:

```sql
create table public.videos (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  video_url text not null,
  provider text not null,
  thumbnail_url text,
  sort_order integer default 0,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

## Storage

Kapak görselleri için bucket:

- `videos`

Klasör:

- `thumbnails`

Uygulama Supabase Storage üzerinde `videos/thumbnails` yoluna kapak görseli yükler.

## Provider algılama

- `youtube.com/shorts/`, `youtu.be`, `youtube.com/watch`: `youtube`
- `instagram.com/reel/`: `instagram`
- `tiktok.com/`: `tiktok`
- Diğer linkler: `other`

## Public görünüm

`/videolar` sayfası yalnızca `is_active = true` kayıtları listeler. Kapak görselleri `9:16` oranında gösterilir ve karta tıklanınca video yeni sekmede açılır.
