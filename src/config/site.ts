/**
 * Kulüp / site sabitleri. İçerik güncellenirken yalnızca bu dosya merkezi kalır.
 */
export const siteConfig = {
  name: "Samandıra İdman Yurdu S.K.",
  shortName: "Samandıra İ.Y.",
  clubTagline: "Kulüpte rekabet gücü, akademide karakterli futbol gelişimi.",
  whatsAppHref: "https://wa.me/905326774661",
  /** `tel:` için E.164 uyumlu (boşluksuz) */
  phoneTel: "+905326774661",
  phoneDisplay: "+90 532 677 46 61",
  email: "samandiraidmanyurduakademi@gmail.com",
  academy: {
    title: "Akademi • Güçlü altyapı",
    summary:
      "Disiplin, karakter, takım kültürü ve yaş grubuna uygun antrenman planıyla çocuklarımız için güvenilir bir futbol gelişim ortamı.",
  },
  addressLines: ["Tesis / kulüp adresi", "İstanbul • Türkiye"],
  copyrightYear: 2026,
  social: [
    { label: "Instagram", href: "https://www.instagram.com/" },
  ],

  /** Ana sayfa metinleri (tek kaynak — bileşenler buradan beslenir). */
  home: {
    hero: {
      overline: "35 Yıllık Gelenek • Güçlü Gelecek",
      headline: "35 Yıldır\nSamandıra'nın Spor Kültürünü\nYaşatıyoruz.",
      lead:
        "Samandıra İdman Yurdu olarak 35 yıllık spor kültürümüzü yeni nesillere aktarmaya devam ediyoruz.",
      bgLabel: "Sahaya çıkan her çocuk için güven, disiplin ve gelişim odaklı akademi ortamı.",
      ctaPrimaryLabel: "Akademi Ön Kayıt",
      ctaSecondaryLabel: "Akademiyi Tanıyın",
    },
    pillars: {
      overline: "KULÜBÜMÜZ VE AKADEMİMİZ",
      title: "Köklü Kulüp,\nGüçlü Akademi.",
      subtitle:
        "Samandıra İdman Yurdu, spor kültürünü yaşatan ve genç sporcuların gelişimine önem veren bir kulüp yapısıyla hareket eder. Akademimiz, bu anlayışı sahaya taşıyarak çocuklarımızın hem sportif hem de kişisel gelişimine katkı sağlar.",
      club: {
        title: "Kulüp",
        body:
          "Samandıra İdman Yurdu, disiplin, takım ruhu ve mücadele kültürünü sahaya yansıtan köklü bir spor kulübüdür.",
        href: "/kulup",
        linkLabel: "Kulüp yapısını gör",
      },
      academy: {
        title: "Akademi",
        body:
          "Akademimizde çocuklarımız yaş gruplarına uygun futbol eğitimi alır, güvenli ve disiplinli bir ortamda gelişimlerini sürdürür.",
        href: "/akademi",
        linkLabel: "Akademiyi incele",
      },
    },
    ageBands: {
      overline: "Gelişim yolu",
      title: "Her yaşta net gelişim eşikleri.",
      subtitle:
        "Erken fazda hareket zekâsı ve oyun deneyimi; ilerleyen bloklarda taktik netlik ve performans parametreleri sıkılaştırılır.",
      groups: (
        [
          { rangeLabel: "6–8", copy: "Oyun • motor • ilk temas" },
          { rangeLabel: "9–11", copy: "Teknik rutin • koordinasyon • takım bağları" },
          { rangeLabel: "12–14", copy: "Hız • seçimleri hızlandırma • rekabet sıcaklığı" },
          { rangeLabel: "15+", copy: "Fizik güç • oyunsal öz • performans zemini" },
        ] satisfies Array<{ rangeLabel: string; copy: string }>
      ),
      cta: {
        label: "Yaş gruplarını incele",
        href: "/akademi/yas-gruplari",
      },
    },
    technicalStaff: {
      overline: "Teknik ekip",
      title: "Teknik Kadro",
      subtitle:
        "Akademi ve kulüp sahasında aynı futbol dilini konuşan, lisanslı ve deneyimli ekip yapısı.",
    },
    clubValues: {
      overline: "Kulüp DNA",
      title: "Gelişim Modelimiz",
      subtitle: "Saha dışı ve saha içi davranışları aynı çatı altında tanımlayan dört taşıyıcı sütun.",
      values: (
        [
          {
            key: "discipline",
            title: "Disiplin",
            body: "Zamanında geliş, antrenman standardına uyum ve kararlı tekrar kültürü.",
          },
          {
            key: "technical",
            title: "Teknik Gelişim",
            body: "Temel dokunuştan oyun modeline kadar ölçülebilir teknik bloklar ve net geri bildirim.",
          },
          {
            key: "team",
            title: "Takım Kültürü",
            body: "Rol paylaşımı, iletişim dili ve kolektif savunma bilinciyle büyüyen bir grup zekâsı.",
          },
          {
            key: "character",
            title: "Karakter ve Özgüven",
            body: "Baskı altında sakin kalma, sorumluluk alma ve sahada özgüvenli karar üretme.",
          },
        ] satisfies Array<{ key: string; title: string; body: string }>
      ),
    },
    trust: {
      overline: "Güven zemini",
      title: "Sahada ve Eğitimde Güven Veren Yapı",
      subtitle:
        "Kupa veya lig iddiası üretmeden; veli ve sporcu için şeffaf, sürdürülebilir bir operasyon sözü veriyoruz.",
      metrics: (
        [
          {
            label: "Lisanslı antrenman yaklaşımı",
            detail: "Kulüp içi metodoloji ve güvenlik protokolleriyle uyumlu ders tasarımı.",
          },
          {
            label: "Yaş grubuna göre gelişim",
            detail: "Her blok için net hedefler; bireysel ilerleme takibi ve düzenli değerlendirme.",
          },
          {
            label: "Düzenli iletişim",
            detail: "Veli ve sporcu ile açık kanallar; akademi ekibi ile tek çizgide bilgilendirme.",
          },
          {
            label: "Maç ve turnuva deneyimi",
            detail: "Rekabet ortamına kontrollü geçiş; yüklenmeden önce hazırlık ve toparlanma ritmi.",
          },
        ] satisfies Array<{ label: string; detail: string }>
      ),
    },
    media: {
      overline: "Galeri",
      title: "Sahadan kareler ve akademi anları.",
      subtitle:
        "Antrenman, maç günü ve kulüp yaşamından seçilen görseller aynı düzen içinde paylaşılır.",
      galleryLabel:
        "Akademi çalışmalarından, maç günlerinden ve kulüp etkinliklerinden seçilen anlar.",
      videoLabel: "Öne çıkan video ve maç günü içeriği alanı.",
    },
    preBand: {
      eyebrow: "Akademiye giriş",
      title: "İlk görüşme ve yaş grubu eşlemesi için operasyon ekibimize ulaşın.",
      body:
        "Oyuncunun mevcut seviyesini ve akademi bloklarını hızlıca hizalamak için ön kayıt formu veya WhatsApp ile tek kanaldan yazışma.",
      whatsappLabel: "WhatsApp yaz",
      formLabel: "Başvuru sayfasına git",
    },
  },

  /** /akademi — tam sayfa metinleri */
  akademiPage: {
    hero: {
      overline: "Güçlü altyapı",
      title: "Samandıra İdman Yurdu Akademi",
      lead:
        "Futbol gelişimini disiplin, karakter ve takım kültürüyle birleştiren altyapı modeli.",
      ctaPrimary: "Akademi Ön Kayıt",
      ctaSecondary: "Yaş Gruplarını İncele",
      secondaryHref: "#yas-gruplari-detay" as const,
    },
    philosophy: {
      overline: "Akademi felsefesi",
      title: "Önce karakter, sonra futbolcu.",
      intro:
        "Teknik gelişim kadar önem verdiğimiz şey, saha içi ve saha dışı tutarlılıktır. Amacımız yalnızca iyi pas atan sporcular değil; takımına güven veren, sorumluluk alan ve büyüme yolculuğunu sahiplenen bireyler yetiştirmektir.",
      pillars: (
        [
          {
            key: "discipline",
            title: "Disiplin",
            body: "Zaman yönetimi, antrenman standardına uyum ve sürekli gelişim için tekrar kültürü.",
          },
          {
            key: "growth",
            title: "Gelişim",
            body: "Yaş grubuna uygun hedefler; ölçülebilir ilerleme ve net geri bildirim döngüleri.",
          },
          {
            key: "confidence",
            title: "Özgüven",
            body: "Baskı altında sakin kalma ve karar alma cesareti; küçük başarıların güvene dönüşmesi.",
          },
          {
            key: "team",
            title: "Takım ruhu",
            body: "Paylaşım, empati ve kolektif savunma bilinciyle büyüyen bir oyun zekâsı.",
          },
        ] satisfies Array<{ key: string; title: string; body: string }>
      ),
    },
    ageDetail: {
      overline: "Gelişim yolu",
      title: "Yaş Grupları Detay",
      subtitle: "Her blokta gelişim odağı değişir; yükü kontrollü şekilde artırırız.",
      groups: (
        [
          {
            range: "6–8",
            focus: "Hareket kalitesi, oyun sevgisi ve temel temas becerileri. Küçük gruplarla bol tekrar ve pozitif öğrenme ortamı.",
          },
          {
            range: "9–11",
            focus: "Teknik rutinlerin oturması, yön değiştirme ve takım içi rollerin fark edilmesi. Oyun kurallarına uyum ve ilk taktik farkındalığı.",
          },
          {
            range: "12–14",
            focus: "Hız, mesafe ve baskı altında karar hızı. Pozisyon bilinci ve maç temposuna adaptasyon; fiziksel hazırlığın dengeli yükseltilmesi.",
          },
          {
            range: "15+",
            focus: "Performans disiplini, maç içi iletişim ve bireysel sorumluluk alanları. Rekabet ortamına kontrollü geçiş ve mental dayanıklılık.",
          },
        ] satisfies Array<{ range: string; focus: string }>
      ),
    },
    training: {
      overline: "Antrenman mimarisi",
      title: "Antrenman Sistemi",
      subtitle: "Haftalık döngü; teknik, taktik, fizik ve mental blokların birbirini beslediği yapı.",
      pillars: (
        [
          { key: "tech", title: "Teknik beceri", body: "İki ayak dengesi, ilk temas ve bire bir çözüm üretme kalitesi." },
          { key: "game", title: "Oyun bilgisi", body: "Alan yönetimi, pres çizgileri ve oyun modeline uyum." },
          { key: "phys", title: "Fiziksel gelişim", body: "Yaşa uygun hız, çeviklik ve dayanıklılık; yüklenme ve toparlanma dengesi." },
          { key: "mental", title: "Mental hazırlık", body: "Odak, hedef belirleme ve maç öncesi/sonrası rutinler." },
          {
            key: "match",
            title: "Maç ve turnuva deneyimi",
            body: "Kontrollü rekabet; öğrenilenlerin sahaya taşınması ve geri bildirimle kapanan döngü.",
          },
        ] satisfies Array<{ key: string; title: string; body: string }>
      ),
    },
    parentTrust: {
      overline: "Veli ortaklığı",
      title: "Veli için şeffaf ve güvenilir süreç",
      subtitle: "Akademiye güven, düzenli bilgi ve öngörülebilir iletişimle büyür.",
      points: (
        [
          {
            title: "Düzenli iletişim",
            body: "Dönemsel bilgilendirme ve akademi ekibiyle açık kanallar; sorularınız için net iletişim hattı.",
          },
          {
            title: "Yaşa uygun antrenman",
            body: "Yük ve süreler yaş grubuna göre kurgulanır; gelişim fizyolojisine saygılı yaklaşım.",
          },
          {
            title: "Güvenli ortam",
            body: "Davranış kuralları ve saha içi güvenlik bilinci; her çocuğun kendini rahat hissettiği yapı.",
          },
          {
            title: "Gelişim takibi",
            body: "Bireysel ilerlemenin gözlemlenmesi ve veliyle paylaşılan net geri bildirim noktaları.",
          },
        ] satisfies Array<{ title: string; body: string }>
      ),
    },
    faq: {
      overline: "SSS",
      title: "Akademi SSS",
      items: (
        [
          {
            q: "Kayıt nasıl yapılır?",
            a: "Ön kayıt formunu doldurarak başvurun. Ekibimiz yaş ve seviye uygunluğunu değerlendirip size dönüş yapar.",
          },
          {
            q: "Deneme antrenmanı var mı?",
            a: "Kontenjan ve yaş grubu durumuna göre deneme seansı planlanabilir. Ön kayıt sonrası netleştirilir.",
          },
          {
            q: "Hangi yaş grupları kabul ediliyor?",
            a: "6–8, 9–11, 12–14 ve 15+ blokları için yer açılır; her dönem kontenjan güncellenir.",
          },
          {
            q: "Antrenman günleri nasıl belirleniyor?",
            a: "Yaş grubu ve saha planına göre haftalık program oluşturulur; velilere düzenli olarak paylaşılır.",
          },
          {
            q: "Ekipman gerekli mi?",
            a: "Temel spor kıyafeti ve uygun futbol ayakkabısı yeterlidir. Kulüp tarafından sağlanan malzemeler hakkında kayıt sonrası bilgi verilir.",
          },
        ] satisfies Array<{ q: string; a: string }>
      ),
    },
    closingCta: {
      title: "Akademiye ilk adımı atın",
      body: "Ön kayıt ile süreci başlatın; sorularınız için WhatsApp hattından da hızlıca ulaşabilirsiniz.",
      formCta: "Ön kayıt formuna git",
      whatsappCta: "WhatsApp ile yazın",
    },
  },
} as const;
