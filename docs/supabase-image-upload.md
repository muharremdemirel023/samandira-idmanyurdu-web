# Supabase Görsel Yükleme Altyapısı

Bu altyapı admin CMS modüllerinde tekrar kullanılacak görsel yükleme akışını hazırlar. Henüz haber, galeri, sponsor veya diğer modüllere bağlanmamıştır.

## Bucket Kurulumu

Supabase Storage tarafında aşağıdaki bucket'lar manuel olarak oluşturulmalıdır:

- `site-images`
- `news`
- `gallery`
- `sponsors`
- `videos`

Bu bucket'lar public URL döndürecek şekilde kullanılacaksa bucket erişimi public olmalı veya CDN/public okuma politikası tanımlanmalıdır. Yükleme işlemi yalnızca oturum açmış admin kullanıcıları için Supabase Storage policy ile sınırlandırılmalıdır.

Önerilen policy yaklaşımı:

- `INSERT`: sadece authenticated kullanıcılar.
- `SELECT`: public görseller için herkes veya yalnızca ihtiyaca göre authenticated.
- `UPDATE` / `DELETE`: sadece admin rolüne sahip kullanıcılar.

Service role key kullanılmaz ve tarayıcıya gönderilmez.

## Yardımcı Yapı

Server helper:

```ts
uploadAdminImage({
  bucket: "news",
  folder: "covers",
  file,
});
```

Davranış:

- Supabase oturumunu server-side kontrol eder.
- `image/jpeg`, `image/png`, `image/webp`, `image/heic`, `image/heif` kabul eder.
- Admin arayüzünde seçilen görseller tarayıcı tarafında JPEG çıktısına dönüştürülerek yüklenir.
- En fazla 5 MB dosya kabul eder.
- Benzersiz dosya adı üretir.
- Upload sonrası public URL döndürür.

## Component Kullanımı

Admin form içinde örnek kullanım:

```tsx
<ImageUploadField
  bucket="news"
  folder="covers"
  label="Kapak görseli"
  inputName="cover_image_url"
/>
```

Planlanan kullanım alanları:

- Haber kapak görselleri
- Galeri görselleri
- Sponsor logoları
- Hero/slider görselleri
- Video kapak görselleri
- Teknik kadro profil fotoğrafları

Kırpma/ölçekleme gereken formlarda `ImageCropUploadField` kullanılmalıdır. Bu bileşen görseli tarayıcı tarafında canvas ile hazırlar ve mevcut upload action'ına kırpılmış dosyayı gönderir.

## Kalan Güvenlik Notları

- Bucket policy'leri Supabase panelinden mutlaka tanımlanmalıdır.
- Sadece `authenticated` kontrolü yeterli değilse admin rol kontrolü policy veya server tarafında genişletilmelidir.
- Dosya içerik doğrulaması MIME tipi ve boyutla sınırlıdır; gelişmiş ihtiyaçlarda görsel işleme/virüs taraması eklenebilir.
