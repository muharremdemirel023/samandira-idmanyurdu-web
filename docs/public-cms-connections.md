# Public CMS Bağlantıları

Admin panelde eklenen içeriklerin public sitede otomatik görünmesi için public sayfalar Supabase tablolarına bağlandı.

## Duyurular

Admin modülünün kullandığı tablo:

- `public.news`

Public kullanılan alanlar:

- `id`
- `title`
- `slug`
- `summary`
- `content`
- `cover_image_url`
- `is_active`
- `created_at`

Gerekli alanlar yoksa Supabase SQL editöründe örnek migration:

```sql
alter table public.news
  add column if not exists slug text,
  add column if not exists summary text,
  add column if not exists content text,
  add column if not exists cover_image_url text,
  add column if not exists is_active boolean default false,
  add column if not exists created_at timestamptz default now();

create unique index if not exists news_slug_unique on public.news(slug);
```

Not: Eski kurulumda `is_published` kullanıldıysa aşağıdaki taşıma uygulanabilir:

```sql
update public.news
set is_active = coalesce(is_active, is_published, false)
where is_active is null;
```

Public akış:

- Ana sayfa `Son Duyurular` son 3 aktif duyuruyu gösterir.
- `/duyurular` tüm aktif duyuruları listeler.
- `/duyurular/[slug]` aktif duyuru detayını gösterir.
- Kapak görseli `cover_image_url` alanından 16:9 oranında gösterilir.

## Teknik Kadro

Admin modülünün kullandığı tablo:

- `public.staff`

Public kullanılan alanlar:

- `id`
- `name`
- `title`
- `short_summary`
- `biography`
- `highlights`
- `photo_url`
- `sort_order`
- `is_active`

Gerekli tablo yoksa `docs/staff-cms.md` içindeki SQL kullanılmalıdır.

Public akış:

- `/akademi/teknik-kadro` yalnızca `is_active = true` kayıtları gösterir.
- Profil fotoğrafları `photo_url` alanından 4:5 oranında gösterilir.
