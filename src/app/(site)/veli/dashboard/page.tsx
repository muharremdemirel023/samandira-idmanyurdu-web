import type { Metadata } from "next";

import { parentLogout } from "@/app/(site)/veli/actions";
import { Container } from "@/components/ui/Container";
import { requireParentSession } from "@/lib/auth/parent-session";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Veli Paneli | Samandıra İY Akademi",
  description: "Samandıra İdman Yurdu Akademi veli paneli.",
  path: "/veli/dashboard",
  noIndex: true,
});

export const dynamic = "force-dynamic";

export default async function VeliDashboardPage() {
  const { meta } = await requireParentSession();
  const greetingName = meta.parentName?.trim() || "Veli";

  return (
    <div className="flex flex-1 flex-col">
      <section className="relative isolate overflow-hidden pb-16 pt-[calc(var(--header-height)+2rem)] md:pb-20 md:pt-[calc(var(--header-height)+3.5rem)]">
        <div aria-hidden className="absolute inset-0 -z-20 bg-surface-base" />
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_12%_0%,rgba(109,31,46,0.09),transparent_40%),radial-gradient(ellipse_at_90%_10%,rgba(234,88,12,0.10),transparent_38%)]"
        />

        <Container>
          <div className="mx-auto max-w-3xl">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="stack-section-intro max-w-prose-section">
                <p className="type-overline club-kicker-line text-accent">Veli paneli</p>
                <h1 className="type-heading-lg text-text-primary">Hoş geldiniz, {greetingName}</h1>
                <p className="type-lead text-text-muted">
                  Bu alan Akademi Pro hesabınıza bağlı güvenli veli panelidir. Öğrenci ve
                  performans ekranları yakında eklenecektir.
                </p>
              </div>

              <form action={parentLogout} className="shrink-0">
                <button
                  type="submit"
                  className="inline-flex min-h-[2.75rem] cursor-pointer items-center justify-center rounded-full border border-maroon/25 bg-white px-5 py-2.5 text-sm font-semibold text-maroon-deep transition hover:border-maroon/50 hover:bg-white/90"
                >
                  Çıkış Yap
                </button>
              </form>
            </div>

            <div className="mt-8 space-y-4">
              <div className="rounded-2xl border border-border-subtle bg-white p-5 sm:p-6">
                <h2 className="text-base font-bold text-text-primary">Oturum bilgisi</h2>
                <dl className="mt-4 space-y-3 text-sm">
                  <div className="flex flex-col gap-1 sm:flex-row sm:gap-4">
                    <dt className="min-w-28 font-semibold text-text-muted">Telefon</dt>
                    <dd className="text-text-primary">{meta.phone ?? "—"}</dd>
                  </div>
                  <div className="flex flex-col gap-1 sm:flex-row sm:gap-4">
                    <dt className="min-w-28 font-semibold text-text-muted">Durum</dt>
                    <dd className="text-text-primary">Giriş yapıldı</dd>
                  </div>
                </dl>
              </div>

              <div className="rounded-2xl border border-dashed border-border-subtle bg-white/70 p-5 sm:p-6">
                <h2 className="text-base font-bold text-text-primary">Yakında</h2>
                <p className="mt-2 text-sm leading-6 text-text-muted">
                  Öğrenci listesi, antrenman ve performans özetleri bu panel üzerinden
                  paylaşılacaktır.
                </p>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}
