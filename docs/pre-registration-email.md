# Ön Kayıt E-posta Bildirimi

Public ön kayıt formu `pre_registrations` tablosuna kaydedildikten sonra kullanıcı
cevabını bekletmeden Next.js `after()` içinde akademi ekibine e-posta bildirimi gönderir.

## Ortam değişkenleri

```env
RESEND_API_KEY=
PRE_REGISTRATION_NOTIFY_EMAIL=samandiraidmanyurduakademi@gmail.com
PRE_REGISTRATION_FROM_EMAIL=Samandıra İdman Yurdu <kayit@samandiraidmanyurdu.com>
```

`PRE_REGISTRATION_FROM_EMAIL` için Resend üzerinde doğrulanmış bir alan adı kullanılmalıdır.

## Akış

1. Form verisi doğrulanır ve Supabase'e kaydedilir.
2. Kullanıcıya başarılı cevap döner.
3. `after()` görevi Resend API çağrısını 8 saniyelik timeout ile en fazla üç kez dener.
4. Sonuç kaydın `notification_status`, `notification_attempts`,
   `notification_last_error` ve `notification_sent_at` alanlarına yazılır.
5. Başarısız veya yapılandırılmamış bildirim admin başvuru kartından yeniden denenebilir.

E-posta hatası başvuru kaydını geri almaz. `RESEND_API_KEY` ve service-role anahtarı
yalnız sunucuda kullanılır; tarayıcıya gönderilmez.
