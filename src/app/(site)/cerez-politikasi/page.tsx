import { Container } from "@/components/ui/Container";
import { CookiePreferencesLink } from "@/components/cookie-consent/CookiePreferencesLink";
import { siteConfig } from "@/config/site";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Çerez Politikası | Samandıra İY Akademi",
  description: "Samandıra İdman Yurdu S.K. Akademi web sitesinde kullanılan çerezler ve takip teknolojileri hakkında bilgi.",
  path: "/cerez-politikasi",
});

const cookieTable: Array<{
  name: string;
  category: "Zorunlu" | "Analitik" | "Pazarlama";
  purpose: string;
  duration: string;
}> = [
  {
    name: "Supabase oturum çerezleri (sb-*)",
    category: "Zorunlu",
    purpose: "Yönetim panelinde (/admin) oturum doğrulaması. Ziyaretçi sayfalarında kullanılmaz.",
    duration: "Oturum / birkaç hafta",
  },
  {
    name: "pre_registration_conversion",
    category: "Zorunlu",
    purpose: "Ön kayıt formu gönderildikten sonra teşekkür sayfasında aynı başvuruyu bir kez işaretlemek için kullanılır.",
    duration: "10 dakika",
  },
  {
    name: "siy-intro-seen, samandira_campaign_*",
    category: "Zorunlu",
    purpose: "Açılış animasyonunun ve kampanya penceresinin tarayıcıda tekrar gösterilmemesi için yerel depolamada tutulan tercihler.",
    duration: "Oturum / tarayıcı temizlenene kadar",
  },
  {
    name: "Google Analytics (gtag.js)",
    category: "Analitik",
    purpose: "Ziyaret istatistiklerini ölçmek için kullanılır. Yalnızca analitik çerezlerine onay verdiğinizde yüklenir.",
    duration: "Google Analytics standart süreleri",
  },
  {
    name: "Meta (Facebook) Pixel",
    category: "Pazarlama",
    purpose: "Kampanya performansını ölçmek için kullanılır. Yalnızca pazarlama çerezlerine onay verdiğinizde yüklenir.",
    duration: "Meta standart süreleri",
  },
  {
    name: "Instagram gömülü içerik (embed.js)",
    category: "Pazarlama",
    purpose: "Ana sayfadaki ve video galerisindeki Instagram paylaşımlarının görüntülenmesini sağlar. Onay verilmeden yalnızca bağlantı gösterilir.",
    duration: "Meta/Instagram standart süreleri",
  },
  {
    name: "YouTube gömülü video",
    category: "Pazarlama",
    purpose: "Video galerisinde eklenen YouTube videolarının oynatılmasını sağlar. Onay verilmeden yalnızca bağlantı gösterilir.",
    duration: "Google/YouTube standart süreleri",
  },
];

const categoryBadgeClass: Record<(typeof cookieTable)[number]["category"], string> = {
  Zorunlu: "bg-accent/10 text-accent",
  Analitik: "bg-maroon/10 text-maroon-deep",
  Pazarlama: "bg-yellow-200/70 text-maroon-deep",
};

export default function CerezPolitikasiPage() {
  return (
    <section className="flex-1 bg-surface-base pb-20 pt-[calc(var(--header-height)+3rem)] sm:pb-24">
      <Container>
        <article className="mx-auto max-w-3xl rounded-2xl border border-border-subtle bg-white p-6 shadow-shell sm:p-10">
          <p className="type-overline text-accent">Gizlilik</p>
          <h1 className="type-display mt-3 text-text-primary">Çerez Politikası</h1>
          <p className="type-body mt-5">
            Bu sayfa, {siteConfig.name} web sitesinde kullanılan çerezleri, yerel depolama
            kayıtlarını ve üçüncü taraf takip teknolojilerini; amaçlarını ve sürelerini açıklar.
            Çerez tercihlerinizi istediğiniz zaman değiştirebilirsiniz.
          </p>

          <div className="mt-6">
            <CookiePreferencesLink className="inline-flex min-h-11 items-center justify-center rounded-full bg-accent px-6 text-sm font-bold text-white transition hover:bg-accent-strong" />
          </div>

          <div className="mt-9 space-y-8 text-text-primary">
            <section>
              <h2 className="type-heading-md">1. Çerez kategorileri</h2>
              <p className="type-body mt-3">
                <strong>Zorunlu</strong> çerezler sitenin ve ön kayıt formunun çalışması için
                gereklidir ve kapatılamaz. <strong>Analitik</strong> çerezler ziyaret
                istatistiklerini ölçer. <strong>Pazarlama</strong> çerezleri; sosyal medya
                içeriklerinin gösterilmesini ve kampanya ölçümünü sağlar. Analitik ve pazarlama
                çerezleri yalnızca onay verdiğinizde yüklenir.
              </p>
            </section>

            <section>
              <h2 className="type-heading-md">2. Kullanılan çerez ve takip teknolojileri</h2>
              <div className="mt-4 overflow-x-auto">
                <table className="w-full min-w-[640px] border-collapse text-left text-sm">
                  <thead>
                    <tr className="border-b border-border-subtle text-xs font-semibold uppercase tracking-wider text-text-muted">
                      <th className="py-2 pr-4">Ad</th>
                      <th className="py-2 pr-4">Kategori</th>
                      <th className="py-2 pr-4">Amaç</th>
                      <th className="py-2">Süre</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cookieTable.map((row) => (
                      <tr key={row.name} className="border-b border-border-subtle/70 align-top">
                        <td className="py-3 pr-4 font-semibold">{row.name}</td>
                        <td className="py-3 pr-4">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${categoryBadgeClass[row.category]}`}
                          >
                            {row.category}
                          </span>
                        </td>
                        <td className="py-3 pr-4 text-sm leading-6 text-text-primary">{row.purpose}</td>
                        <td className="py-3 text-sm leading-6 text-text-muted">{row.duration}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section>
              <h2 className="type-heading-md">3. Tercihlerinizi yönetme</h2>
              <p className="type-body mt-3">
                Sayfanın üstündeki &quot;Çerez Tercihleri&quot; butonunu veya sitenin her
                sayfasındaki alt bilgide (footer) yer alan aynı bağlantıyı kullanarak analitik ve
                pazarlama çerezlerini istediğiniz zaman açabilir veya kapatabilirsiniz. Tercihiniz
                tarayıcınızda saklanır; tarayıcı verilerini temizlerseniz tercih ekranı yeniden
                görüntülenir.
              </p>
            </section>

            <section>
              <h2 className="type-heading-md">4. Kişisel verilerin korunması</h2>
              <p className="type-body mt-3">
                Ön kayıt formu üzerinden işlenen kişisel verilere ilişkin ayrıntılı bilgiye{" "}
                <a className="font-semibold text-accent underline" href="/kvkk-aydinlatma-metni">
                  KVKK Aydınlatma Metni
                </a>{" "}
                sayfasından ulaşabilirsiniz.
              </p>
            </section>
          </div>
        </article>
      </Container>
    </section>
  );
}
