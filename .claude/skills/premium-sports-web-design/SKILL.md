---
name: premium-sports-web-design
description: Samandıra İdman Yurdu S.K. Akademi web sitesi için premium, modern, dinamik ve mobil uyumlu futbol akademisi arayüzleri tasarlarken kullanılır. Cam yüzeyli (glassmorphism) header, gerçek saha fotoğraflı hero, bordo/turuncu/beyaz marka dili gerektiren tasarım görevlerinde yükle. Admin panel ve backend işlerinde KULLANILMAZ.
---

# Premium Sports Web Design

## Amaç

Samandıra İdman Yurdu S.K. Akademi web sitesinde premium, modern, dinamik ve mobil uyumlu spor sitesi arayüzleri üret.

Tasarım dili:

- Profesyonel futbol akademisi
- Gerçek saha ve antrenman fotoğrafları
- Fotoğraf üzerinde koyu bordo overlay
- Cam yüzeyli, yarı saydam ve yüzen header
- İnce yarı saydam beyaz kenarlıklar
- Güçlü ama sade tipografi
- Bordo, turuncu, beyaz ve kontrollü koyu tonlar
- Premium iOS benzeri cam yüzey hissi
- Kurumsal ve güven veren görünüm

## Temel tasarım kuralları

- Referans tasarımı birebir kopyalama.
- Referanstaki yerleşim, denge ve görsel dili markaya uyarlayarak kullan.
- Gerçek akademi fotoğraflarını stok görsellerden önce tercih et.
- Tasarımda çocuk futbol akademisi enerjisi ve güven hissi birlikte bulunmalı.
- Büyük boşlukları amaçsız bırakma.
- Metin, görsel ve CTA dengeli görünmeli.
- Hero ilk ekranda akademinin ne sunduğunu açıkça anlatmalı.
- Her önemli bölümün tek ve belirgin bir amacı olmalı.

## Header tasarımı

- Header hero görselinin üzerinde yüzer şekilde kullanılabilir.
- Kapsül veya yuvarlatılmış dikdörtgen form tercih et.
- Koyu bordo veya siyah yarı saydam arka plan kullan.
- backdrop-blur ile cam yüzey hissi ver.
- İnce beyaz veya açık bordo kenarlık kullan.
- Ağır gölge, neon veya glow kullanma.
- Logo solda, menü ortada, CTA sağda konumlanabilir.
- Uzun marka adı yerleşimi bozuyorsa kısa görünüm kullanılabilir:
  "Samandıra İ.Y. Akademi"
- Mobilde logo ve hamburger kullanılmalı.
- Mobil menü aynı glassmorphism tasarım dilini sürdürmeli.

## Hero tasarımı

- Tam genişlik gerçek futbol veya antrenman fotoğrafı kullanılabilir.
- Okunabilirlik için bordo-siyah gradient veya koyu overlay ekle.
- Güçlü H1 başlığı kullan.
- Açıklamayı kısa ve okunabilir tut.
- En fazla iki CTA butonu kullan.
- Birincil CTA turuncu veya beyaz olabilir.
- İkincil CTA şeffaf veya outline olabilir.
- 35. yıl logosunu büyük arka plan süsü yerine küçük premium rozet olarak kullan.
- Küçük bilgi kartları kullanılabilir:
  - Yaş Grupları
  - Deneyimli Kadro
  - Hafta Sonu Antrenman
- Bilgi kartları fotoğrafı veya metni kapatmamalı.

## Glassmorphism kuralları

- Arka plan mutlaka kısmen görünmeli.
- Blur seviyesi kontrollü olmalı.
- Yüzeyler tamamen şeffaf veya tamamen opak olmamalı.
- Kenarlık ince olmalı.
- Çok fazla cam kart kullanma.
- Cam yüzey yalnızca header, küçük bilgi kartları veya önemli CTA çevresinde kullanılmalı.
- Metin kontrastı erişilebilir olmalı.

## Animasyon

- Mevcut Framer Motion altyapısını kullan.
- Yeni animasyon paketi ekleme.
- Başlık ve açıklamada hafif fade/slide kullanılabilir.
- Görsel hafif sağdan veya aşağıdan gelebilir.
- Bilgi kartları küçük gecikmelerle sıralı açılabilir.
- Animasyonlar 200–600 ms aralığında, kısa ve kurumsal olmalı.
- Sürekli hareket eden, sallanan veya dikkat dağıtan animasyon kullanma.
- prefers-reduced-motion desteğini bozma.

## Mobil tasarım

- Mobile-first çalış.
- Yatay taşma oluşturma.
- Başlık fontunu ekran genişliğine göre küçült.
- Header mobilde sıkışmamalı.
- CTA butonları en az 44 px dokunma yüksekliğinde olmalı.
- Mobilde metin ve fotoğraf aynı anda ekranı boğmamalı.
- Gerekirse bilgi kartlarını hero görselinin altına taşı.
- Fotoğrafın önemli kısmının kırpılmadığından emin ol.
- object-position değerini mobil ve masaüstü için ayrı ayarlayabilirsin.

## Marka kuralları

- Ana renk: bordo
- Vurgu rengi: turuncu
- Temel yüzey: beyaz
- Koyu yüzey: koyu bordo veya siyaha yakın bordo
- Neon, mor, mavi veya marka dışı baskın renk kullanma.
- Kulüp logosunu değiştirme, yeniden çizme veya efekt uygulama.
- 35. yıl görselini bozmadan kullan.
- Tipografi güçlü ama çocukça olmayan bir görünümde olmalı.

## Kod kuralları

- Mevcut Next.js, TypeScript, Tailwind ve Framer Motion mimarisini kullan.
- Mevcut dinamik Supabase verilerini koru.
- Admin panelindeki home_content alanlarını bozma.
- Sabit metin gerekiyorsa yalnızca fallback olarak ekle.
- Yeni paket yükleme.
- package.json değiştirme.
- Gereksiz refactor yapma.
- İstenen bileşen dışında başka dosyalara dokunma.
- Build, test, lint veya dev server çalıştırma.
- Sunucu ve istemci bileşen sınırlarını koru.
- Görsellerde mümkünse Next/Image kullan.

## Çalışma biçimi

Görev geldiğinde:

1. Yalnızca belirtilen sayfa veya bileşeni incele.
2. Mevcut tasarımın güçlü ve zayıf taraflarını kod üzerinden değerlendir.
3. Kullanıcının verdiği referansı birebir kopyalamadan marka diline uyarla.
4. Masaüstü ve mobil tasarımı birlikte tamamla.
5. Mevcut veri ve bağlantı davranışlarını koru.
6. İlgisiz dosyalara dokunma.

## Çıktı biçimi

İşlem sonunda yalnızca şunları yaz:

- değiştirilen dosyalar
- yeni masaüstü yerleşimi
- yeni mobil yerleşim
- kullanılan glassmorphism yaklaşımı
- kullanılan animasyonlar
- korunan dinamik veri kaynakları

Skill dosyasını oluşturduktan sonra başka hiçbir dosyayı değiştirme.
Build, test veya lint çalıştırma.
