import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { LoginForm } from "@/app/(site)/veli/login/LoginForm";
import { Container } from "@/components/ui/Container";
import { hasParentSession } from "@/lib/auth/parent-session";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Veli Girişi | Samandıra İY Akademi",
  description:
    "Samandıra İdman Yurdu Akademi veli paneline telefon numarası ve şifrenizle güvenli giriş yapın.",
  path: "/veli/login",
});

const errorMessages: Record<string, string> = {
  credentials: "Telefon numarası veya şifre hatalı.",
  unauthorized: "Bu sayfayı görüntülemek için giriş yapmalısınız.",
  unavailable: "Giriş servisine şu an ulaşılamıyor. Lütfen daha sonra tekrar deneyin.",
  misconfigured: "Veli girişi henüz yapılandırılmamış. Lütfen akademi ile iletişime geçin.",
};

export default async function VeliLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  if (await hasParentSession()) {
    redirect("/veli/dashboard");
  }

  const { error } = await searchParams;

  return (
    <div className="flex flex-1 flex-col">
      <section className="relative isolate overflow-hidden pb-16 pt-[calc(var(--header-height)+2rem)] md:pb-20 md:pt-[calc(var(--header-height)+3.5rem)]">
        <div aria-hidden className="absolute inset-0 -z-20 bg-surface-base" />
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_20%_0%,rgba(109,31,46,0.10),transparent_42%),radial-gradient(ellipse_at_88%_18%,rgba(234,88,12,0.12),transparent_40%)]"
        />

        <Container>
          <div className="mx-auto w-full max-w-md">
            <div className="stack-section-intro text-center">
              <p className="type-overline club-kicker-line justify-center text-accent">
                Veli paneli
              </p>
              <h1 className="type-heading-lg text-text-primary">Veli Girişi</h1>
              <p className="type-lead mx-auto max-w-prose-lead text-text-muted">
                Akademi Pro hesabınızdaki telefon numarası ve şifre ile giriş yapın.
              </p>
            </div>

            <div className="mt-8 rounded-2xl border border-border-subtle bg-white p-5 shadow-shell sm:p-7">
              {error && errorMessages[error] ? (
                <p
                  role="alert"
                  className="mb-5 rounded-xl border border-red-200 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-700"
                >
                  {errorMessages[error]}
                </p>
              ) : null}

              <LoginForm />

              <p className="mt-6 text-center text-sm text-text-muted">
                Şifrenizi bilmiyor musunuz?{" "}
                <Link
                  href="/iletisim"
                  className="font-semibold text-maroon underline-offset-2 hover:underline"
                >
                  Akademi ile iletişime geçin
                </Link>
              </p>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}
