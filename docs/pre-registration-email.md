# Ön Kayıt E-posta Bildirimi

Public ön kayıt formu başarılı şekilde Supabase `pre_registrations` tablosuna kaydedildikten sonra akademi ekibine e-posta bildirimi gönderir.

Gerekli ortam değişkenleri:

```env
RESEND_API_KEY=
PRE_REGISTRATION_NOTIFY_EMAIL=samandiraidmanyurduakademi@gmail.com
```

Akış:

1. Form verisi sunucu tarafında alınır.
2. Ön kayıt Supabase'e kaydedilir.
3. Kayıt başarılıysa Resend API ile e-posta bildirimi gönderilir.
4. E-posta gönderimi başarısız olursa kayıt silinmez; kullanıcıya başarılı kayıt mesajı gösterilmeye devam eder.

Not: `RESEND_API_KEY` tarayıcıya gönderilmez, yalnızca server action içinde kullanılır.
