# Ön Kayıt Güvenlik ve Kurulum Notları

## Gerekli migration'lar

Aşağıdaki migration'lar sırasıyla uygulanmalıdır:

1. `supabase/migrations/014_pre_registrations_secure.sql`
2. `supabase/migrations/015_pre_registrations_policy_hardening.sql`

Bu migration'lar:

- kanonik `pre_registrations` kolonlarını ve kontrollerini,
- daha önce panelden eklenmiş olabilecek gevşek policy'leri temizleyip anon erişimi kapatan RLS/grant kurallarını,
- yalnız `app_metadata.role = admin` olan kullanıcılar için select/update politikalarını,
- SHA-256 anahtarlı rate limit tablosu ve atomik tüketim fonksiyonunu,
- admin Realtime publication kaydını

oluşturur.

## Yönetici rolü

Panel artık yalnızca Supabase kullanıcısının JWT içindeki `app_metadata.role` değeri
`admin` ise açılır. İlk yönetici rolü Supabase SQL Editor'da yetkili bir operatör
tarafından atanabilir:

```sql
update auth.users
set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || '{"role":"admin"}'::jsonb
where email = 'YONETICI_EPOSTASI';
```

Rol değişikliğinden sonra kullanıcının yeni JWT alması için çıkış yapıp yeniden giriş
yapması gerekir. Service-role anahtarı hiçbir zaman `NEXT_PUBLIC_` önekiyle tanımlanmamalıdır.

## Turnstile

Production ortamında Turnstile varsayılan olarak fail-closed çalışır. Cloudflare'dan
alınan site ve secret key aşağıdaki değişkenlere eklenmelidir:

```env
NEXT_PUBLIC_TURNSTILE_SITE_KEY=
TURNSTILE_SECRET_KEY=
PRE_REGISTRATION_REQUIRE_TURNSTILE=true
```

Yerel geliştirmede anahtar yoksa doğrulama atlanır. Production'da yalnız kontrollü bir
geçici durum için `PRE_REGISTRATION_REQUIRE_TURNSTILE=false` kullanılabilir.

## Kayıt korumaları

- IP: 15 dakikada en fazla 8 doğrulanmış deneme.
- Telefon: 24 saatte en fazla 3 doğrulanmış deneme.
- Aynı telefon + oyuncu + doğum yılı kombinasyonu aynı İstanbul takvim gününde tek kayıt.
- Ham IP rate limit tablosuna yazılmaz; yalnız tek yönlü SHA-256 özet tutulur.
- Anon rolün tablo insert/select/update/delete yetkisi yoktur; kayıt yalnız server-only
  service-role istemcisi üzerinden yapılır.
