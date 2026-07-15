# Admin Görsel Kırpma ve Ölçekleme

`ImageCropUploadField` admin CMS formlarında tekrar kullanılacak kırpma/ölçekleme bileşenidir.

## Özellikler

- Cihazdan görsel seçer.
- Görseli tarayıcı tarafında canvas üzerinde önizler.
- Ölçek, yatay konum ve dikey konum ayarı sağlar.
- Kırpılmış görseli JPEG olarak hazırlar.
- Hazırlanan dosyayı mevcut Supabase Storage upload action'ına gönderir.
- Dönen public URL'yi form alanına yazar.
- Mobilde tam genişlik input, slider ve butonlarla kullanılabilir.

## Desteklenen preset'ler

- `news-cover`: Duyuru kapak görseli, `16:9`
- `hero`: Slider / hero görseli, `16:9`
- `gallery`: Galeri görseli, varsayılan `4:5`
- `sponsor-logo`: Sponsor logosu, kare / contain yaklaşımı
- `staff-portrait`: Teknik kadro profil fotoğrafı, `4:5`

## Örnek kullanım

```tsx
<ImageCropUploadField
  bucket="news"
  folder="covers"
  inputName="cover_image_url"
  label="Kapak Görseli"
  preset="news-cover"
  aspectRatio={16 / 9}
/>
```

Teknik kadro profil fotoğrafı:

```tsx
<ImageCropUploadField
  bucket="site-images"
  folder="staff"
  inputName="photo_url"
  label="Profil Fotoğrafı"
  preset="staff-portrait"
  aspectRatio={4 / 5}
/>
```
