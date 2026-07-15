-- Teknik kadro: sabit kodlanmış üç antrenörü staff tablosuna taşıyan seed.
-- Aynı isimde kayıt varsa tekrar eklemez. Supabase SQL Editor'de bir kez çalıştırın.

insert into staff (name, title, short_summary, biography, photo_url, sort_order, is_active)
select
  'Volkan Bekçi',
  'Akademi Koordinatörü',
  'Profesyonel futbolculuk kariyerinin ardından antrenörlüğe yönelen Volkan Bekçi, genç futbolcuların teknik, disiplin ve karakter gelişimine odaklanmaktadır.',
  E'Volkan Bekçi, Türk futbolunun öne çıkan isimlerinden biri olarak profesyonel futbol kariyeri boyunca üst düzey liglerde ve farklı takımlarda önemli başarılara imza atmıştır. Aktif sporculuk yaşamı süresince liderliği, görev aldığı takımların başarısında etkili rol oynamıştır.\nProfesyonel futbolculuk kariyerinin ardından edindiği bilgi ve tecrübeyi gelecek nesillere aktarmak amacıyla antrenörlük kariyerine yönelmiştir.\nUEFA B Lisansı ve TFF Çocuk Futbol Antrenör Sertifikası sahibi olan Bekçi, özellikle genç futbolcuların yeteneklerinin keşfedilmesi, doğru şekilde geliştirilmesi ve futbol disiplinine kazandırılması amacıyla çalışmalarını sürdürmektedir.\nSahip olduğu futbol kültürü, disiplin anlayışı ve eğitim odaklı yaklaşımıyla Volkan Bekçi, Türk futbolunun altyapı gelişimine sürdürülebilir katkı sağlamayı amaçlamaktadır.',
  '/images/coaches/volkanbekci.png',
  1,
  true
where not exists (select 1 from staff where name = 'Volkan Bekçi');

insert into staff (name, title, short_summary, biography, photo_url, sort_order, is_active)
select
  'Ali Acar',
  'Yardımcı Antrenör',
  'Spor Bilimleri Fakültesi mezunu ve aktif lisanslı futbolcu olan Ali Acar, akademik altyapısı ve saha tecrübesiyle sporcuların bireysel gelişimine katkı sağlamaktadır.',
  E'Futbol okulumuzun yardımcı antrenörü ve bireysel performans koçu Ali Acar, Spor Bilimleri Fakültesi mezunudur. Aynı zamanda aktif lisanslı futbolcu olarak spor kariyerini sürdürmektedir.\nKariyeri boyunca Beşiktaş Futbol Okulu, İstanbul Kartalları Futbol Okulu, Çekmeköy Belediyesi Futbol Okulları ile Samandıra FK altyapı U16, U17, U18 takımları ve A takımda yardımcı antrenör olarak görev almıştır.\nSahip olduğu akademik altyapı, saha tecrübesi ve uzmanlığıyla Ali Acar, antrenör kadromuza önemli katkılar sağlamakta; sporcularımızın bireysel gelişimine ve sportif başarılarına değer katmaktadır.',
  '/images/coaches/aliacar.png',
  2,
  true
where not exists (select 1 from staff where name = 'Ali Acar');

insert into staff (name, title, short_summary, biography, photo_url, sort_order, is_active)
select
  'Ersin Bekçi',
  'Antrenör',
  'Futbolculuk ve antrenörlük deneyimini genç sporcuların gelişimine aktaran Ersin Bekçi, akademimizde U8–U11 yaş gruplarında yardımcı antrenör olarak görev yapmaktadır.',
  E'Ersin Bekçi, futbol kariyerine Samandıra Spor''da başladı. Kulüpte 4 yıl boyunca başarılı performanslar sergileyen Bekçi, ardından Kartal Spor''a transfer oldu ve burada 3 yıl boyunca forma giydi.\nDaha sonra tekrar Samandıra Spor''a dönerek 3 yıl daha bu takımda futbol oynadı. Futbolculuk kariyerine Atalar Spor''da devam eden Bekçi, 3 yıl boyunca bu kulüpte yer aldıktan sonra futbol hayatını noktaladı ve antrenörlük kariyerine odaklandı.\n2015–2020 yılları arasında Samandıra Trabzon Spor Okulu''nda antrenör olarak görev yapan Bekçi, buradaki çalışmalarıyla tanındı. Daha sonra Samandıra FK U14 takımının başında antrenörlük görevini üstlenerek başarılı çalışmalarıyla dikkat çekti.\nErsin Bekçi, futbol akademimizde U8–U11 yaş gruplarında yardımcı antrenör olarak görev almakta ve genç futbolcuların eğitimine katkı sağlamaya devam etmektedir.\nFutbolculuk ve antrenörlük kariyerindeki deneyimiyle Ersin Bekçi, genç yeteneklerin gelişimine destek olmayı ve Türk futboluna katkı sağlamayı sürdürmektedir.',
  '/images/coaches/ersinbekci.png',
  3,
  true
where not exists (select 1 from staff where name = 'Ersin Bekçi');
