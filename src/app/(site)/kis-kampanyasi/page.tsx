import type { Metadata } from "next";
import Link from "next/link";

import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { siteConfig } from "@/config/site";
import { getActiveCampaign } from "@/lib/content";
import { WINTER_PACKAGES, type WinterPackageId } from "@/lib/pre-registration/constants";
import { createPageMetadata, SITE_URL } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Sancaktepe Futbol Okulu Kış Kampanyası | Samandıra İdman Yurdu",
  description:
    "Kış kampanyasında 5 aylık aidatla 6 ay futbol eğitimi! Kıyafet dahil avantajlı paketimizi inceleyin, hemen ön kayıt oluşturun.",
  path: "/kis-kampanyasi",
});

const faqs = [
  {
    question: "Kış kampanyasından kimler yararlanabilir?",
    answer:
      "Kampanyamız 6–13 yaş grubundaki (2013–2020 doğumlu) tüm yeni sporcu adaylarımız için geçerlidir. Daha önce akademimize kayıt olmamış veya bu dönem aramıza katılacak tüm çocuklarımız başvurabilir.",
  },
  {
    question: "6 Aylık Peşin Pakette 'Bir Ay Bizden' avantajı nedir?",
    answer:
      "Normalde 6 aylık antrenman aidatı toplam 27.000 TL iken, kış kampanyasına özel 6 aylık peşin pakette 1 aylık aidat kulübümüz tarafından karşılanır ve 6 aylık antrenman bedeli 22.500 TL olarak yansıtılır.",
  },
  {
    question: "Kıyafet bedeli ve malzemeler paket ücretine dahil mi?",
    answer:
      "Evet. Tüm paketlerimizde 3.000 TL değerindeki idman forması seti ve 6.000 TL değerindeki lisanslı yağmurluk ve eşofman takımı (toplam 9.000 TL) kayıt günü ödenecek toplam tutara dahildir; velilerimizden sonradan ek kıyafet ücreti talep edilmez.",
  },
  {
    question: "İlk antrenman ücretli mi? Deneme imkânı var mı?",
    answer:
      "Hayır, ilk değerlendirme antrenmanımız tamamen ücretsizdir. Teknik direktörlerimiz ve antrenörlerimiz çocuğunuzu sahada gözlemleyerek yaşına ve fiziksel seviyesine en uygun antrenman grubuna yerleştirir.",
  },
  {
    question: "Arkadaşını getiren veya kardeş kaydı yapanlar için ek indirim var mı?",
    answer:
      "Evet, iki öğrencinin birlikte kayıt olması durumunda geçerli %20 Arkadaşını Getir kampanyamız da devam etmektedir. Başvuru formunda dilerseniz Kış Kampanyası, dilerseniz %20 Arkadaşını Getir seçeneğini tercih edebilirsiniz.",
  },
];

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Ana Sayfa",
          "item": SITE_URL,
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "Kış Kampanyası",
          "item": `${SITE_URL}/kis-kampanyasi`,
        },
      ],
    },
    {
      "@type": "SportsActivityLocation",
      "name": "Samandıra İdman Yurdu S.K. Akademi - Sancaktepe Futbol Okulu Kış Kampanyası",
      "url": `${SITE_URL}/kis-kampanyasi`,
      "telephone": siteConfig.phoneTel,
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "Hacı Salih Caddesi No: 22",
        "addressLocality": "Sancaktepe",
        "addressRegion": "İstanbul",
        "postalCode": "34885",
        "addressCountry": "TR",
      },
      "description":
        "Kış kampanyasında 5 aylık aidatla 6 ay futbol eğitimi! Kıyafet dahil avantajlı paketimizi inceleyin, hemen ön kayıt oluşturun.",
      "offers": [
        {
          "@type": "Offer",
          "name": "6 Aylık Peşin Paket (Bir Ay Bizden)",
          "price": "31500",
          "priceCurrency": "TRY",
          "availability": "https://schema.org/InStock",
          "url": `${SITE_URL}/on-kayit?paket=winter_biannual#on-kayit-formu`,
          "description": "5 aylık aidatla 6 ay antrenman. 9.000 TL kıyafet seti dahil.",
        },
        {
          "@type": "Offer",
          "name": "Aylık Paket (İlk Aya Özel)",
          "price": "12000",
          "priceCurrency": "TRY",
          "availability": "https://schema.org/InStock",
          "url": `${SITE_URL}/on-kayit?paket=winter_monthly#on-kayit-formu`,
          "description": "Kayıt günü 12.000 TL (ilk ay aidatı + kıyafet seti). İkinci aydan itibaren 4.500 TL/ay.",
        },
        {
          "@type": "Offer",
          "name": "12 Aylık Peşin Paket (En Düşük Aylık Aidat)",
          "price": "51000",
          "priceCurrency": "TRY",
          "availability": "https://schema.org/InStock",
          "url": `${SITE_URL}/on-kayit?paket=winter_annual#on-kayit-formu`,
          "description": "12 ay antrenman bedeli 42.000 TL + 9.000 TL kıyafet seti dahil tek ödeme.",
        },
      ],
    },
  ],
};

export default async function KisKampanyasiPage() {
  const activeCampaign = await getActiveCampaign();
  // Kampanya aktif/pasif kontrolü: Veritabanında kış kampanyası açıkça pasif yapılmışsa veya bitmişse false döner
  const isCampaignActive = Boolean(
    !activeCampaign ||
    activeCampaign.name.trim().toLocaleLowerCase("tr-TR").includes("kış") ||
    activeCampaign.is_active
  );

  const biannualPkg = WINTER_PACKAGES.winter_biannual;
  const monthlyPkg = WINTER_PACKAGES.winter_monthly;
  const annualPkg = WINTER_PACKAGES.winter_annual;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
        }}
      />

      <div className="flex flex-1 flex-col">
        {/* ===================== HERO SECTION ===================== */}
        <section className="relative isolate overflow-hidden pb-14 pt-[calc(var(--header-height)+2rem)] md:pb-20 md:pt-[calc(var(--header-height)+3.5rem)]">
          <div aria-hidden className="absolute inset-0 -z-20 bg-surface-base" />
          <div
            aria-hidden
            className="absolute inset-y-0 right-0 -z-10 w-full bg-[radial-gradient(ellipse_at_65%_20%,rgba(234,88,12,0.14),transparent_42%),radial-gradient(ellipse_at_85%_75%,rgba(234,88,12,0.08),transparent_48%)] opacity-90 md:w-[60%]"
          />

          <Container>
            {/* Kampanya Pasif Bildirimi (Eğer idari panelden kapatılmışsa) */}
            {!isCampaignActive && (
              <div
                role="status"
                className="mb-8 rounded-2xl border border-amber-300 bg-amber-50 px-5 py-4 text-center font-semibold text-amber-900 shadow-shell"
              >
                ⚠️ Kış kampanyası dönemi sona ermiştir. Güncel akademi programlarımız ve yeni kayıtlar için ön kayıt formumuzu doldurabilirsiniz.
              </div>
            )}

            <div className="mx-auto max-w-4xl text-center">
              {/* Overline & Badge */}
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-accent/30 bg-orange-50 px-4 py-1.5 text-xs font-bold text-accent shadow-sm">
                <span>❄️ Sancaktepe Futbol Okulu</span>
                <span>•</span>
                <span>2026 Kış Dönemi Fırsatı</span>
              </div>

              {/* H1 */}
              <h1 className="type-display text-text-primary">
                Sancaktepe Futbol Okulu Kış Kampanyası
              </h1>

              {/* Lead Paragraph */}
              <p className="type-lead mx-auto mt-5 max-w-2xl text-text-muted">
                Kış kampanyasında <strong className="font-bold text-maroon-deep">5 aylık aidatla 6 ay futbol eğitimi!</strong> 9.000 TL değerindeki lisanslı yağmurluk, eşofman ve idman kıyafet seti dahil avantajlı paketimizi inceleyin, çocuğunuz sahaya bir adım önde çıksın.
              </p>

              {/* Key Highlights Badges */}
              <div className="mx-auto mt-6 flex flex-wrap justify-center gap-2.5">
                {[
                  "⚽ 6–13 Yaş Grupları",
                  "🎁 1 Ay Aidat Bizden",
                  "👕 Kıyafet Seti Dahil (9.000 TL)",
                  "⭐ Ücretsiz Deneme Antrenmanı",
                  "⏱️ 1 İş Gününde Geri Dönüş",
                ].map((item) => (
                  <span
                    key={item}
                    className="type-meta rounded-full border border-border-subtle bg-white px-3.5 py-1.5 font-medium text-text-primary shadow-xs"
                  >
                    {item}
                  </span>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="mt-8 flex flex-col justify-center gap-3.5 sm:flex-row sm:items-center">
                <Button
                  href={
                    isCampaignActive
                      ? "/on-kayit?paket=winter_biannual#on-kayit-formu"
                      : "/on-kayit"
                  }
                  className="min-h-12 px-8 text-base font-bold shadow-lg"
                >
                  Hemen Ön Kayıt Oluştur →
                </Button>
                <Button
                  href="#tum-paketler"
                  variant="outline"
                  className="min-h-12 border-accent/40 px-6 text-sm font-semibold text-accent hover:bg-accent/5"
                >
                  Tüm Paketleri İncele
                </Button>
                <Button
                  href={siteConfig.whatsAppHref}
                  target="_blank"
                  rel="noreferrer noopener"
                  variant="ghost"
                  className="min-h-12 px-5 text-sm font-semibold text-text-primary hover:bg-surface-muted"
                >
                  WhatsApp ile Sor
                </Button>
              </div>
            </div>
          </Container>
        </section>

        {/* ===================== HIGHLIGHT PACKAGE ===================== */}
        <section className="club-section bg-surface-muted/50 py-12 md:py-16">
          <Container>
            <div className="mx-auto max-w-3xl">
              <div className="relative overflow-hidden rounded-3xl border-2 border-accent bg-white p-6 shadow-xl sm:p-10">
                <div className="absolute right-0 top-0 rounded-bl-2xl bg-accent px-5 py-2 text-xs font-black uppercase tracking-wider text-white shadow-sm">
                  En Çok Tercih Edilen
                </div>

                <p className="type-label-caps-accent text-accent">Öne Çıkan Kampanya Teklifi</p>
                <h2 className="type-heading-lg mt-1 text-text-primary">
                  5 Aylık Aidatla 6 Ay Antrenman — Bir Ay Bizden
                </h2>

                <p className="mt-3 text-base leading-relaxed text-text-muted">
                  Samandıra İdman Yurdu Akademi kış döneminde çocuğunuza kesintisiz bir spor alışkanlığı kazandırmak için 6 aylık peşin pakette 1 aylık aidat ücretini hediye ediyoruz. 6 ay boyunca düzenli antrenman ve maç tecrübesi yaşarken, sporcunun tüm kışlık kıyafet donanımı da hazır olsun.
                </p>

                {/* Price Box */}
                <div className="mt-6 rounded-2xl border border-orange-100 bg-orange-50/70 p-5 sm:p-6">
                  <div className="flex flex-wrap items-baseline justify-between gap-4">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-accent">
                        Kayıt Günü Toplam Ödeme (Peşin)
                      </span>
                      <div className="mt-1 flex items-baseline gap-1.5 text-text-primary">
                        <span className="text-4xl font-black sm:text-5xl">
                          {biannualPkg.registrationDayTotal.toLocaleString("tr-TR")}
                        </span>
                        <span className="text-xl font-bold">TL</span>
                      </div>
                    </div>
                    <span className="inline-flex rounded-full bg-accent/15 px-3.5 py-1.5 text-xs font-bold text-accent">
                      {biannualPkg.paymentCondition}
                    </span>
                  </div>

                  <div className="mt-5 space-y-2 border-t border-orange-200/60 pt-4 text-sm text-text-primary">
                    <div className="flex items-center justify-between">
                      <span className="text-text-muted">6 Aylık Antrenman Bedeli (Normalde 27.000 TL):</span>
                      <strong className="font-semibold text-accent">22.500 TL (1 ay hediye)</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-text-muted">İdman Malzemesi (Forma Seti):</span>
                      <strong className="font-semibold">3.000 TL (Dahil)</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-text-muted">Yağmurluk ve Eşofman Takımı:</span>
                      <strong className="font-semibold">6.000 TL (Dahil)</strong>
                    </div>
                  </div>
                </div>

                {/* CTA */}
                <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
                  <Button
                    href={
                      isCampaignActive
                        ? "/on-kayit?paket=winter_biannual#on-kayit-formu"
                        : "/on-kayit"
                    }
                    className="min-h-12 flex-1 text-base font-bold shadow-md"
                  >
                    6 Aylık Paketi Seç ve Kaydol →
                  </Button>
                  <Button
                    href={`tel:${siteConfig.phoneTel}`}
                    variant="outline"
                    className="min-h-12 px-6 text-sm font-semibold"
                  >
                    Hemen Ara: {siteConfig.phoneDisplay}
                  </Button>
                </div>
              </div>
            </div>
          </Container>
        </section>

        {/* ===================== ALL 3 PACKAGES ===================== */}
        <section id="tum-paketler" className="club-section py-16 md:py-24">
          <Container>
            <div className="mx-auto max-w-2xl text-center">
              <p className="type-label-caps-accent text-accent">Şeffaf ve Net Fiyatlandırma</p>
              <h2 className="type-heading-lg mt-1 text-text-primary">
                Kış Dönemi Kayıt Seçenekleri ve Paketleri
              </h2>
              <p className="type-lead mt-3">
                Bütçenize ve planınıza en uygun paketi seçin; tüm paketlerde sporcu kıyafet takımı ilk günden teslim edilir.
              </p>
            </div>

            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {/* 1. Aylık Paket */}
              <div className="flex flex-col rounded-3xl border border-border-subtle bg-white p-6 shadow-shell sm:p-7">
                <span className="inline-flex w-fit rounded-full border border-accent/30 bg-orange-50 px-3 py-1 text-xs font-bold text-accent">
                  {monthlyPkg.badge}
                </span>
                <h3 className="mt-3 text-xl font-bold text-[var(--maroon-deep)]">
                  {monthlyPkg.name}
                </h3>
                <p className="mt-4 text-[0.7rem] font-bold uppercase tracking-wider text-text-muted">
                  Kayıt günü toplam ödeme
                </p>
                <p className="mt-0.5 leading-none text-text-primary">
                  <span className="text-3xl font-black">
                    {monthlyPkg.registrationDayTotal.toLocaleString("tr-TR")}
                  </span>
                  <span className="ml-1 text-lg font-bold">TL</span>
                </p>

                <div className="mt-6 flex flex-1 flex-col gap-2.5 text-sm">
                  <div className="flex justify-between">
                    <span className="text-text-muted">İlk Ay Aidatı:</span>
                    <strong className="font-semibold text-text-primary">3.000 TL</strong>
                  </div>
                  <p className="text-xs text-text-muted">
                    İkinci aydan itibaren 4.500 TL/ay olarak devam eder.
                  </p>

                  <div className="mt-3 space-y-2 border-t border-border-subtle pt-3">
                    <div className="flex justify-between">
                      <span className="text-text-muted">İdman Malzemesi:</span>
                      <strong className="font-semibold text-text-primary">3.000 TL</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-muted">Yağmurluk ve Eşofman:</span>
                      <strong className="font-semibold text-text-primary">6.000 TL</strong>
                    </div>
                  </div>
                </div>

                <Button
                  href={
                    isCampaignActive
                      ? "/on-kayit?paket=winter_monthly#on-kayit-formu"
                      : "/on-kayit"
                  }
                  variant="outline"
                  className="mt-7 min-h-11 w-full border-accent/40 font-bold text-accent hover:bg-accent/8"
                >
                  Aylık Paketi Seç →
                </Button>
              </div>

              {/* 2. 6 Aylık Peşin (Öne Çıkan) */}
              <div className="relative flex flex-col rounded-3xl border-2 border-accent bg-white p-6 shadow-xl sm:p-7">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-accent px-4 py-1 text-xs font-black text-white shadow-sm">
                  FIRSAT PAKETİ
                </div>

                <span className="inline-flex w-fit rounded-full bg-accent px-3 py-1 text-xs font-bold text-white">
                  {biannualPkg.badge}
                </span>
                <h3 className="mt-3 text-xl font-bold text-[var(--maroon-deep)]">
                  {biannualPkg.name}
                </h3>
                <p className="mt-4 text-[0.7rem] font-bold uppercase tracking-wider text-text-muted">
                  Kayıt günü toplam ödeme
                </p>
                <p className="mt-0.5 leading-none text-text-primary">
                  <span className="text-3xl font-black">
                    {biannualPkg.registrationDayTotal.toLocaleString("tr-TR")}
                  </span>
                  <span className="ml-1 text-lg font-bold">TL</span>
                </p>

                <div className="mt-6 flex flex-1 flex-col gap-2.5 text-sm">
                  <div className="flex justify-between">
                    <span className="text-text-muted">6 Ay Antrenman Bedeli:</span>
                    <strong className="font-semibold text-accent">22.500 TL (1 ay hediye)</strong>
                  </div>
                  <p className="text-xs text-accent">
                    5 aylık aidat ile 6 ay kesintisiz spor imkânı.
                  </p>

                  <div className="mt-3 space-y-2 border-t border-border-subtle pt-3">
                    <div className="flex justify-between">
                      <span className="text-text-muted">İdman Malzemesi:</span>
                      <strong className="font-semibold text-text-primary">3.000 TL</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-muted">Yağmurluk ve Eşofman:</span>
                      <strong className="font-semibold text-text-primary">6.000 TL</strong>
                    </div>
                  </div>
                </div>

                <Button
                  href={
                    isCampaignActive
                      ? "/on-kayit?paket=winter_biannual#on-kayit-formu"
                      : "/on-kayit"
                  }
                  className="mt-7 min-h-11 w-full font-bold shadow-md"
                >
                  6 Aylık Paketi Seç →
                </Button>
              </div>

              {/* 3. 12 Aylık Peşin */}
              <div className="flex flex-col rounded-3xl border border-border-subtle bg-white p-6 shadow-shell sm:p-7">
                <span className="inline-flex w-fit rounded-full border border-accent/30 bg-orange-50 px-3 py-1 text-xs font-bold text-accent">
                  {annualPkg.badge}
                </span>
                <h3 className="mt-3 text-xl font-bold text-[var(--maroon-deep)]">
                  {annualPkg.name}
                </h3>
                <p className="mt-4 text-[0.7rem] font-bold uppercase tracking-wider text-text-muted">
                  Kayıt günü toplam ödeme
                </p>
                <p className="mt-0.5 leading-none text-text-primary">
                  <span className="text-3xl font-black">
                    {annualPkg.registrationDayTotal.toLocaleString("tr-TR")}
                  </span>
                  <span className="ml-1 text-lg font-bold">TL</span>
                </p>

                <div className="mt-6 flex flex-1 flex-col gap-2.5 text-sm">
                  <div className="flex justify-between">
                    <span className="text-text-muted">Yıllık Antrenman:</span>
                    <strong className="font-semibold text-text-primary">42.000 TL</strong>
                  </div>
                  <p className="text-xs text-text-muted">
                    Yıl boyu en uygun aylık maliyet avantajı sağlar.
                  </p>

                  <div className="mt-3 space-y-2 border-t border-border-subtle pt-3">
                    <div className="flex justify-between">
                      <span className="text-text-muted">İdman Malzemesi:</span>
                      <strong className="font-semibold text-text-primary">3.000 TL</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-muted">Yağmurluk ve Eşofman:</span>
                      <strong className="font-semibold text-text-primary">6.000 TL</strong>
                    </div>
                  </div>
                </div>

                <Button
                  href={
                    isCampaignActive
                      ? "/on-kayit?paket=winter_annual#on-kayit-formu"
                      : "/on-kayit"
                  }
                  variant="outline"
                  className="mt-7 min-h-11 w-full border-accent/40 font-bold text-accent hover:bg-accent/8"
                >
                  12 Aylık Paketi Seç →
                </Button>
              </div>
            </div>
          </Container>
        </section>

        {/* ===================== BENEFITS / WHY US ===================== */}
        <section className="club-section bg-surface-base py-16 md:py-24">
          <Container>
            <div className="mx-auto max-w-2xl text-center">
              <p className="type-label-caps-accent text-accent">Akademi Standartları</p>
              <h2 className="type-heading-lg mt-1 text-text-primary">
                Samandıra İdman Yurdu Akademi Kış Dönemi Avantajları
              </h2>
              <p className="type-lead mt-3">
                Çocuğunuz sadece futbol öğrenmez; disiplin, saygı, takım ruhu ve özgüven kazanır.
              </p>
            </div>

            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  icon: "⚽",
                  title: "1 Ay Aidat Bizden",
                  desc: "6 aylık peşin kayıtlarda 5 aylık aidat ödeyerek 6 ay boyunca düzenli antrenman imkânından yararlanın.",
                },
                {
                  icon: "🧥",
                  title: "Kıyafet Paketi Dahil",
                  desc: "9.000 TL değerindeki lisanslı antrenman forması, yağmurluk ve eşofman takımı kayıt paketine dahildir.",
                },
                {
                  icon: "🎯",
                  title: "6–13 Yaş Pedagojik Plan",
                  desc: "Çocukların yaş ve motor gelişim seviyelerine uygun özel hazırlanmış bilimsel antrenman programları.",
                },
                {
                  icon: "🛡️",
                  title: "TFF Belgeli Teknik Kadro",
                  desc: "Gelişimi ve sporcu sağlığını ön planda tutan profesyonel antrenör kadrosu ile bireysel ilgi.",
                },
                {
                  icon: "🏟️",
                  title: "Ücretsiz Saha Değerlendirmesi",
                  desc: "İlk antrenman ücretsizdir; teknik ekibimiz oyuncunun seviyesini belirleyerek en uygun gruba yerleştirir.",
                },
                {
                  icon: "⚡",
                  title: "1 İş Gününde Hızlı İletişim",
                  desc: "Ön kayıt başvurunuz tarafımıza ulaştığında en geç 1 iş günü içinde akademi koordinatörümüz sizi arar.",
                },
              ].map((benefit) => (
                <div
                  key={benefit.title}
                  className="rounded-2xl border border-border-subtle bg-white p-6 shadow-shell"
                >
                  <div className="text-3xl">{benefit.icon}</div>
                  <h3 className="type-card-title mt-4 text-[var(--maroon-deep)]">
                    {benefit.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-text-muted">{benefit.desc}</p>
                </div>
              ))}
            </div>
          </Container>
        </section>

        {/* ===================== STEPS ===================== */}
        <section className="club-section py-16 md:py-20">
          <Container>
            <div className="mx-auto max-w-3xl text-center">
              <p className="type-label-caps-accent text-accent">Kayıt Adımları</p>
              <h2 className="type-heading-lg mt-1 text-text-primary">
                Başvuru ve Kayıt Süreci Nasıl İlerler?
              </h2>
            </div>

            <div className="mt-10 grid gap-6 sm:grid-cols-3">
              {[
                {
                  step: "01",
                  title: "Formu Doldurun",
                  desc: "Ön kayıt formundan veli ve oyuncu bilgilerini girerek 2 dakikada başvurunuzu iletin.",
                },
                {
                  step: "02",
                  title: "Sizi Arayalım",
                  desc: "Teknik koordinatörümüz yaş grubu ve antrenman saatleri hakkında bilgi vermek için size dönsün.",
                },
                {
                  step: "03",
                  title: "Sahaya Çıkın",
                  desc: "Ücretsiz deneme antrenmanında oyuncumuzu sahada görelim; uygun program netleşsin.",
                },
              ].map((item) => (
                <div
                  key={item.step}
                  className="relative rounded-2xl border border-border-subtle bg-white p-6 shadow-shell"
                >
                  <span className="font-mono text-3xl font-black text-accent/40">
                    {item.step}
                  </span>
                  <h3 className="type-card-title mt-2 text-text-primary">{item.title}</h3>
                  <p className="mt-2 text-sm text-text-muted">{item.desc}</p>
                </div>
              ))}
            </div>
          </Container>
        </section>

        {/* ===================== FAQ SECTION ===================== */}
        <section className="club-section bg-surface-muted/40 py-16 md:py-24">
          <Container>
            <div className="mx-auto max-w-2xl text-center">
              <p className="type-label-caps-accent text-accent">Merak Edilenler</p>
              <h2 className="type-heading-lg mt-1 text-text-primary">
                Kış Kampanyası Hakkında Sıkça Sorulan Sorular
              </h2>
            </div>

            <div className="mx-auto mt-10 max-w-3xl space-y-4">
              {faqs.map((faq) => (
                <div
                  key={faq.question}
                  className="rounded-2xl border border-border-subtle bg-white p-5 shadow-xs sm:p-6"
                >
                  <h3 className="text-base font-bold text-[var(--maroon-deep)] sm:text-lg">
                    {faq.question}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-text-muted sm:text-base">
                    {faq.answer}
                  </p>
                </div>
              ))}
            </div>
          </Container>
        </section>

        {/* ===================== CLOSING CTA ===================== */}
        <section className="relative overflow-hidden bg-maroon-deep py-16 text-white md:py-20">
          <div
            aria-hidden
            className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(234,88,12,0.22),transparent_40%),radial-gradient(circle_at_80%_80%,rgba(234,88,12,0.18),transparent_45%)]"
          />
          <Container className="relative">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-accent-bright">
                Hemen Başlayın
              </p>
              <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
                Çocuğunuzun Futbol Yolculuğunu Bu Kış Başlatın
              </h2>
              <p className="mt-4 text-base leading-relaxed text-white/80 sm:text-lg">
                5 aylık aidatla 6 ay futbol eğitimi fırsatından yararlanmak için ön kayıt formunu doldurun, kontenjanlar dolmadan yerinizi ayırtın.
              </p>

              <div className="mt-8 flex flex-col justify-center gap-3.5 sm:flex-row sm:items-center">
                <Button
                  href={
                    isCampaignActive
                      ? "/on-kayit?paket=winter_biannual#on-kayit-formu"
                      : "/on-kayit"
                  }
                  className="min-h-12 bg-accent px-8 font-bold text-white shadow-xl hover:bg-accent-strong"
                >
                  Ön Kayıt Formunu Aç →
                </Button>
                <Button
                  href={siteConfig.whatsAppHref}
                  target="_blank"
                  rel="noreferrer noopener"
                  variant="outline"
                  className="min-h-12 border-white/30 bg-transparent px-6 font-semibold text-white hover:bg-white/10"
                >
                  WhatsApp ile Yazın
                </Button>
              </div>

              <div className="mt-6 text-sm text-white/60">
                Sorularınız için:{" "}
                <a href={`tel:${siteConfig.phoneTel}`} className="font-semibold text-white underline underline-offset-4">
                  {siteConfig.phoneDisplay}
                </a>
              </div>
            </div>
          </Container>
        </section>
      </div>
    </>
  );
}
