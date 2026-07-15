import Link from "next/link";

import { onboardingHref } from "@/components/navigation/nav-config";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/cn";

/**
 * Ana sayfa bilgi bölümleri — tüm metinler siteConfig'ten beslenir.
 * Açık zemin, sade kart düzeni; veli aradığı bilgiye kaydırarak ulaşır.
 */

const { akademiPage } = siteConfig;

function SectionShell({
  id,
  overline,
  title,
  subtitle,
  tinted = false,
  children,
}: {
  id: string;
  overline: string;
  title: string;
  subtitle?: string;
  tinted?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-heading`}
      className={cn(
        "club-section py-[var(--space-section-y-mobile)] md:py-[var(--space-section-y-desktop)]",
        tinted && "bg-surface-base",
      )}
    >
      <Container>
        <div className="stack-section-intro mb-8 md:mb-10">
          <p className="type-overline">{overline}</p>
          <h2 id={`${id}-heading`} className="type-heading-lg max-w-prose-section">
            {title}
          </h2>
          {subtitle ? <p className="type-body-lg max-w-prose-body">{subtitle}</p> : null}
        </div>
        {children}
      </Container>
    </section>
  );
}

function InfoCard({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-border-subtle bg-white p-5 shadow-shell sm:p-6">
      <h3 className="type-card-title text-maroon-deep">{title}</h3>
      <p className="type-body mt-2">{body}</p>
    </div>
  );
}

/** 4. Akademi hakkında */
export function AboutAcademySection() {
  return (
    <SectionShell
      id="akademi-hakkinda"
      overline={akademiPage.philosophy.overline}
      title={akademiPage.philosophy.title}
      subtitle={akademiPage.philosophy.intro}
      tinted
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {akademiPage.philosophy.pillars.map((p) => (
          <InfoCard key={p.key} title={p.title} body={p.body} />
        ))}
      </div>
      <div className="mt-8">
        <Button href="/akademi" variant="outline" className="min-h-[2.75rem]">
          Akademiyi Yakından Tanıyın
        </Button>
      </div>
    </SectionShell>
  );
}

/** 5. Vizyon ve misyon */
export function VisionMissionSection() {
  return (
    <SectionShell
      id="vizyon-misyon"
      overline="Vizyon ve misyon"
      title="Neden Varız, Nereye Gidiyoruz?"
    >
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-border-subtle bg-white p-6 shadow-shell sm:p-8">
          <p className="type-label-caps-accent text-accent">Vizyon</p>
          <p className="type-body-lg mt-3">
            Samandıra&apos;da yetişen her çocuğun futbolu güvenli, disiplinli ve keyifli bir ortamda
            öğrendiği; karakteriyle örnek gösterilen sporcular yetiştiren bölgenin referans akademisi
            olmak.
          </p>
        </div>
        <div className="rounded-2xl border border-border-subtle bg-white p-6 shadow-shell sm:p-8">
          <p className="type-label-caps-accent text-accent">Misyon</p>
          <p className="type-body-lg mt-3">
            Yaş grubuna uygun antrenman planı, lisanslı antrenör kadrosu ve veliyle açık iletişim
            kurarak çocuklarımızın hem sportif hem kişisel gelişimini sürdürülebilir şekilde
            desteklemek.
          </p>
        </div>
      </div>
    </SectionShell>
  );
}

/** 6. Antrenman modeli */
export function TrainingModelSection() {
  return (
    <SectionShell
      id="antrenman-modeli"
      overline={akademiPage.training.overline}
      title={akademiPage.training.title}
      subtitle={akademiPage.training.subtitle}
      tinted
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {akademiPage.training.pillars.map((p) => (
          <InfoCard key={p.key} title={p.title} body={p.body} />
        ))}
      </div>
      <div className="mt-8">
        <Button href="/akademi/antrenman-modeli" variant="outline" className="min-h-[2.75rem]">
          Antrenman Modelinin Detayı
        </Button>
      </div>
    </SectionShell>
  );
}

/** 8. Antrenman programı */
export function ProgramSection() {
  const rows = [
    { label: "6–8 yaş", value: "Hafta içi 1 gün + hafta sonu 1 gün • 60-75 dk seanslar" },
    { label: "9–11 yaş", value: "Haftada 2-3 antrenman • teknik ağırlıklı bloklar" },
    { label: "12–14 yaş", value: "Haftada 3 antrenman + hazırlık maçları" },
    { label: "15+ yaş", value: "Haftada 3-4 antrenman + maç ve turnuva takvimi" },
  ];

  return (
    <SectionShell
      id="antrenman-programi"
      overline="Haftalık ritim"
      title="Antrenman Programı"
      subtitle="Kesin gün ve saatler yaş grubuna ve saha planına göre dönem başında belirlenir; velilere düzenli olarak paylaşılır."
    >
      <div className="overflow-hidden rounded-2xl border border-border-subtle bg-white shadow-shell">
        <ul className="divide-y divide-border-subtle">
          {rows.map((row) => (
            <li key={row.label} className="flex flex-col gap-1 p-4 sm:flex-row sm:items-center sm:gap-6 sm:p-5">
              <span className="w-24 shrink-0 text-sm font-bold text-maroon-deep">{row.label}</span>
              <span className="type-body">{row.value}</span>
            </li>
          ))}
        </ul>
      </div>
      <p className="type-body mt-4 max-w-prose-body">
        Güncel program için{" "}
        <a className="font-semibold text-accent underline-offset-2 hover:underline" href={siteConfig.whatsAppHref} target="_blank" rel="noreferrer noopener">
          WhatsApp hattımızdan
        </a>{" "}
        bilgi alabilirsiniz.
      </p>
    </SectionShell>
  );
}

/** 9. Ücret ve kayıt bilgileri */
export function FeesSection() {
  const steps = [
    { title: "1. Ön kayıt formu", body: "Formu doldurun; yaş grubu ve iletişim bilgileriniz ekibimize ulaşsın." },
    { title: "2. Görüşme ve deneme", body: "Ekibimiz sizi arar; uygun yaş grubuna göre deneme antrenmanı planlanır." },
    { title: "3. Kayıt ve program", body: "Deneme sonrası kayıt tamamlanır, haftalık program ve ekipman bilgisi paylaşılır." },
  ];

  return (
    <SectionShell
      id="ucret-ve-kayit"
      overline="Ücret ve kayıt"
      title="Ücret ve Kayıt Bilgileri"
      subtitle="Ücretler yaş grubuna ve döneme göre belirlenir. Güncel ücret bilgisi ve ödeme seçenekleri için bizimle iletişime geçmeniz yeterli — ekibimiz aynı gün dönüş yapar."
      tinted
    >
      <div className="grid gap-4 md:grid-cols-3">
        {steps.map((s) => (
          <InfoCard key={s.title} title={s.title} body={s.body} />
        ))}
      </div>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Button href={onboardingHref} variant="primary" className="min-h-[2.75rem] font-bold">
          Ön Kayıt Formu
        </Button>
        <Button
          href={siteConfig.whatsAppHref}
          variant="outline"
          target="_blank"
          rel="noreferrer noopener"
          className="min-h-[2.75rem]"
        >
          WhatsApp&apos;tan Ücret Bilgisi Al
        </Button>
      </div>
    </SectionShell>
  );
}

/** 10. SSS */
export function HomeFaqSection() {
  return (
    <SectionShell
      id="sss"
      overline={akademiPage.faq.overline}
      title="Sık Sorulan Sorular"
    >
      <div className="overflow-hidden rounded-2xl border border-border-subtle bg-white shadow-shell">
        {akademiPage.faq.items.map((item) => (
          <details key={item.q} className="group border-b border-border-subtle px-4 last:border-b-0 sm:px-6">
            <summary className="flex min-h-[3rem] cursor-pointer list-none items-center justify-between gap-3 py-4 text-sm font-semibold text-maroon-deep [&::-webkit-details-marker]:hidden">
              {item.q}
              <span aria-hidden className="text-accent transition-transform duration-200 group-open:rotate-45">
                +
              </span>
            </summary>
            <p className="type-body pb-5">{item.a}</p>
          </details>
        ))}
      </div>
      <div className="mt-6">
        <Link
          href="/akademi/sik-sorulan-sorular"
          className="text-sm font-semibold text-accent underline-offset-2 hover:underline"
        >
          Tüm soruları görüntüle →
        </Link>
      </div>
    </SectionShell>
  );
}

/** 11. İletişim */
export function HomeContactSection() {
  return (
    <SectionShell
      id="iletisim-bilgileri"
      overline="Bize ulaşın"
      title="İletişim"
      subtitle="Sorularınız için telefon, WhatsApp veya e-posta ile ulaşabilirsiniz."
      tinted
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-2xl border border-border-subtle bg-white p-5 shadow-shell">
          <p className="type-label-caps-accent text-accent">Telefon / WhatsApp</p>
          <a className="mt-2 block text-base font-bold text-maroon-deep hover:text-accent" href={`tel:${siteConfig.phoneTel}`}>
            {siteConfig.phoneDisplay}
          </a>
        </div>
        <div className="rounded-2xl border border-border-subtle bg-white p-5 shadow-shell">
          <p className="type-label-caps-accent text-accent">E-posta</p>
          <a
            className="mt-2 block break-words text-base font-bold text-maroon-deep hover:text-accent"
            href={`mailto:${siteConfig.email}`}
          >
            {siteConfig.email}
          </a>
        </div>
        <div className="rounded-2xl border border-border-subtle bg-white p-5 shadow-shell sm:col-span-2 lg:col-span-1">
          <p className="type-label-caps-accent text-accent">Adres</p>
          <p className="type-body mt-2">
            {siteConfig.addressLines.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </p>
        </div>
      </div>
      <div className="mt-6">
        <Link href="/iletisim" className="text-sm font-semibold text-accent underline-offset-2 hover:underline">
          İletişim sayfasına git →
        </Link>
      </div>
    </SectionShell>
  );
}
