import { Container } from "@/components/ui/Container";

const contactEmail = "samandiraidmanyurduakademi@gmail.com";
const academyMapsHref =
  "https://maps.google.com/?q=Eyüp+Sultan+Mahallesi+Hacı+Salih+Caddesi+No+22+Sancaktepe+İstanbul";
const instagramAccounts = [
  {
    label: "samandiraidmanyurduspor",
    href: "https://www.instagram.com/samandiraidmanyurduspor",
  },
  {
    label: "samandiraidmanyurdu.academy",
    href: "https://www.instagram.com/samandiraidmanyurdu.academy",
  },
] as const;

function InstagramMark() {
  return (
    <span
      aria-hidden
      className="inline-flex size-8 shrink-0 items-center justify-center rounded-full border border-accent/35 bg-accent/10 text-accent"
    >
      <svg
        className="size-4"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
        <circle cx="12" cy="12" r="3.5" />
        <path d="M17.4 6.9h.01" />
      </svg>
    </span>
  );
}

export default function IletisimPage() {
  return (
    <div className="flex flex-1 flex-col">
      <section className="relative isolate overflow-hidden pb-14 pt-[calc(var(--header-height)+2rem)] md:pb-20 md:pt-[calc(var(--header-height)+3rem)]">
        <div
          aria-hidden
          className="absolute inset-0 -z-20 bg-surface-base"
        />
        <div
          aria-hidden
          className="absolute inset-y-0 right-0 -z-10 w-full bg-[radial-gradient(ellipse_at_58%_18%,rgba(234,88,12,0.10),transparent_36%),radial-gradient(ellipse_at_86%_72%,rgba(234,88,12,0.08),transparent_42%)] opacity-80 md:w-[58%]"
        />

        <Container>
          <div className="grid gap-12 lg:grid-cols-[0.78fr_1.22fr] lg:items-start lg:gap-16">
            <div className="stack-section-intro max-w-prose-display">
              <p className="type-overline club-kicker-line text-accent">İletişim</p>
              <h1 className="type-display text-text-primary">İletişim</h1>
              <p className="type-lead max-w-prose-lead">
                Samandıra İdman Yurdu Spor Kulübü ve Akademi ile iletişime
                geçmek için aşağıdaki bilgileri kullanabilirsiniz.
              </p>
            </div>

            <div className="divide-y divide-border-subtle/80">
              <div className="grid gap-3 py-5 first:pt-0 sm:grid-cols-[9rem_minmax(0,1fr)] sm:gap-6">
                <span className="type-label-caps text-text-muted">E-posta</span>
                <a
                  className="type-card-title break-words text-text-primary hover:text-accent"
                  href={`mailto:${contactEmail}`}
                >
                  {contactEmail}
                </a>
              </div>
              <div className="grid gap-3 py-5 sm:grid-cols-[9rem_minmax(0,1fr)] sm:gap-6">
                <span className="type-label-caps text-text-muted">Kulüp Adresi</span>
                <p className="type-body-lg">Samandıra, Sancaktepe / İstanbul</p>
              </div>
              <div className="grid gap-3 py-5 sm:grid-cols-[9rem_minmax(0,1fr)] sm:gap-6">
                <span className="type-label-caps text-text-muted">Akademi Adresi</span>
                <a
                  className="type-body-lg text-text-primary hover:text-accent"
                  href={academyMapsHref}
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  <span className="block">Eyüp Sultan Mahallesi, Hacı Salih Caddesi No:22</span>
                  <span className="block">34885 Sancaktepe / İstanbul</span>
                </a>
              </div>
              <div className="grid gap-3 py-5 sm:grid-cols-[9rem_minmax(0,1fr)] sm:gap-6">
                <span className="type-label-caps text-text-muted">Instagram</span>
                <div className="flex flex-col gap-3">
                  {instagramAccounts.map((account) => (
                    <a
                      key={account.label}
                      className="inline-flex items-center gap-3 text-text-primary hover:text-accent"
                      href={account.href}
                      target="_blank"
                      rel="noreferrer noopener"
                    >
                      <InstagramMark />
                      {account.label}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}
