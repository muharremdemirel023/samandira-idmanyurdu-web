# Sponsor CMS

Admin panelinde `/admin/sponsors` rotası sponsor yönetimi için hazırlandı.

## Supabase tablosu

Eğer tablo yoksa Supabase SQL editöründe aşağıdaki SQL çalıştırılmalıdır:

```sql
create table public.sponsors (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  website_url text,
  logo_url text,
  sort_order integer default 0,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

## Storage

Sponsor logoları için bucket:

- `sponsors`

Klasör:

- `logos`

Uygulama Supabase Storage üzerinde `sponsors/logos` yoluna logo görseli yükler.

## Public görünüm

Ana sayfa yalnızca `is_active = true` sponsorları listeler. Sponsorun `website_url` alanı doluysa logoya tıklanınca website yeni sekmede açılır.
