import Link from "next/link";

import { mainNavigation } from "@/components/navigation/nav-config";
import { cn } from "@/lib/cn";
import { siteConfig } from "@/config/site";

function SocialGlyph({ label }: { label: string }) {
  const glyph = label.replace(/\s+/g, "").slice(0, 2).toUpperCase() || "?";

  return (
    <span
      className="inline-flex size-8 items-center justify-center rounded-full border border-white/20 bg-white/10 text-[0.65rem] font-bold uppercase tracking-wide text-accent-bright"
      aria-hidden
    >
      {glyph}
    </span>
  );
}

export function Footer({ className }: { className?: string }) {
  return (
    <footer className={cn("mt-auto bg-maroon-deep text-white/75", className)}>
      <div className="mx-auto max-[var(--container-ultra-cap)] px-[var(--gutter)] py-14 lg:py-16">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4 lg:gap-12">
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.26em] text-accent-bright">
              Akademi
            </p>
            <div className="space-y-1">
              <p className="text-lg font-bold text-white">{siteConfig.name}</p>
              <p>{siteConfig.clubTagline}</p>
            </div>
          </div>

          <div className="space-y-3 lg:col-span-1">
            <p className="text-xs font-semibold uppercase tracking-[0.26em] text-accent-bright">
              {siteConfig.academy.title}
            </p>
            <p className="leading-relaxed text-[0.95rem]">{siteConfig.academy.summary}</p>
          </div>

          <nav aria-label="Site haritası" className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-[0.26em] text-accent-bright">
              Bağlantılar
            </p>
            <ul className="space-y-2 text-sm font-medium">
              {mainNavigation.map((item) => (
                <li key={item.href}>
                  <Link
                    className="block min-h-[1.75rem] text-white/75 transition-colors hover:text-white"
                    href={item.href}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-[0.26em] text-accent-bright">
              İletişim
            </p>
            <div className="space-y-2 text-sm">
              <p>
                <span className="block text-xs uppercase tracking-wider text-white/55">
                  Telefon
                </span>
                <a className="font-semibold text-white hover:text-accent-bright" href={`tel:${siteConfig.phoneTel}`}>
                  {siteConfig.phoneDisplay}
                </a>
              </p>
              <p>
                <span className="block text-xs uppercase tracking-wider text-white/55">
                  E-posta
                </span>
                <a className="font-semibold text-white hover:text-accent-bright" href={`mailto:${siteConfig.email}`}>
                  {siteConfig.email}
                </a>
              </p>
              <p>
                <span className="block text-xs uppercase tracking-wider text-white/55">
                  WhatsApp
                </span>
                <a
                  className="font-semibold text-white hover:text-accent-bright"
                  href={siteConfig.whatsAppHref}
                  target="_blank"
                  rel="noreferrer"
                >
                  Hızlı mesaj
                </a>
              </p>
              <p className="text-sm leading-relaxed">
                {siteConfig.addressLines.map((line) => (
                  <span key={line} className="block">
                    {line}
                  </span>
                ))}
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.26em] text-accent-bright">
                Sosyal
              </p>
              <ul className="flex flex-wrap gap-5 text-sm font-semibold text-white">
                {siteConfig.social.map(({ label, href }) => (
                  <li key={label}>
                    <a
                      href={href}
                      className="group inline-flex items-center gap-2 transition hover:text-accent-bright"
                      target="_blank"
                      rel="noreferrer noopener"
                    >
                      <span className="opacity-95 transition group-hover:opacity-100">
                        <SocialGlyph label={label} />
                      </span>
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-2 border-t border-white/15 pt-8 text-[0.8rem] text-white/60 md:flex-row md:items-center md:justify-between">
          <span>
            © {siteConfig.copyrightYear} <span className="font-medium text-white">{siteConfig.name}</span>
          </span>
          <span>Tüm hakları saklıdır.</span>
        </div>
      </div>
    </footer>
  );
}
