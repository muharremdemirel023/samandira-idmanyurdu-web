import type { Metadata } from "next";
import Link from "next/link";

import { parentLogout } from "@/app/(site)/veli/actions";
import { Container } from "@/components/ui/Container";
import {
  fetchParentStudents,
  type ParentStudent,
} from "@/lib/akademi-pro/parent-students";
import { requireParentSession } from "@/lib/auth/parent-session";
import { cn } from "@/lib/cn";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Veli Paneli | Samandıra İY Akademi",
  description: "Samandıra İdman Yurdu Akademi veli paneli.",
  path: "/veli/dashboard",
  noIndex: true,
});

export const dynamic = "force-dynamic";

const logoutButtonClass =
  "inline-flex min-h-[2.75rem] cursor-pointer items-center justify-center rounded-full border border-maroon/25 bg-white px-5 py-2.5 text-sm font-semibold text-maroon-deep transition hover:border-maroon/50 hover:bg-white/90";

/** Doğum tarihinden bugünkü yaşı hesaplar (YYYY-MM-DD). */
function ageFromBirthDate(birthDate: string | null): number | null {
  const match = birthDate?.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return null;

  const [, year, month, day] = match.map(Number);
  const today = new Date();
  let age = today.getFullYear() - year;
  const beforeBirthday =
    today.getMonth() + 1 < month || (today.getMonth() + 1 === month && today.getDate() < day);
  if (beforeBirthday) age -= 1;
  return age >= 0 && age < 100 ? age : null;
}

function formatBirthDate(birthDate: string | null): string | null {
  const match = birthDate?.match(/^(\d{4})-(\d{2})-(\d{2})/);
  return match ? `${match[3]}.${match[2]}.${match[1]}` : null;
}

function StudentDetails({ student }: { student: ParentStudent }) {
  const age = ageFromBirthDate(student.birthDate);
  const birthDate = formatBirthDate(student.birthDate);
  const schedule = [student.trainingDays, student.trainingTime].filter(Boolean).join(" · ");

  // Akademi Pro'da ayrı grup tablosu yok; öğrencinin grubu age_group alanıdır.
  const rows: { label: string; value: string }[] = [
    { label: "Grup", value: student.ageGroup ?? "Belirtilmemiş" },
    {
      label: "Yaş",
      value: age !== null ? `${age} yaş${birthDate ? ` (${birthDate})` : ""}` : "—",
    },
    { label: "Antrenman", value: schedule || "—" },
    { label: "Antrenör", value: student.coachName ?? "—" },
  ];

  return (
    <div className="rounded-2xl border border-border-subtle bg-white p-5 sm:p-6">
      <p className="type-overline text-accent">Öğrenci</p>
      <h2 className="mt-1 text-xl font-bold text-text-primary">{student.fullName}</h2>

      <dl className="mt-5 space-y-3 text-sm">
        {rows.map((row) => (
          <div key={row.label} className="flex flex-col gap-1 sm:flex-row sm:gap-4">
            <dt className="min-w-28 font-semibold text-text-muted">{row.label}</dt>
            <dd className="text-text-primary">{row.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

export default async function VeliDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ ogrenci?: string | string[] }>;
}) {
  const { accessToken, meta } = await requireParentSession();
  const greetingName = meta.parentName?.trim() || "Veli";

  const [result, params] = await Promise.all([fetchParentStudents(accessToken), searchParams]);

  // Seçim yalnızca RLS'in döndürdüğü liste içinden yapılır; URL'deki id
  // listede yoksa ilk öğrenci gösterilir.
  const requestedId = typeof params.ogrenci === "string" ? params.ogrenci : null;
  const students = result.ok ? result.students : [];
  const selected = students.find((student) => student.id === requestedId) ?? students[0] ?? null;

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
                  Akademi Pro hesabınıza bağlı öğrencilerin bilgilerini buradan takip
                  edebilirsiniz.
                </p>
              </div>

              <form action={parentLogout} className="shrink-0">
                <button type="submit" className={logoutButtonClass}>
                  Çıkış Yap
                </button>
              </form>
            </div>

            <div className="mt-8 space-y-4">
              {!result.ok ? (
                <div
                  role="alert"
                  className="rounded-2xl border border-red-200 bg-red-500/10 p-5 sm:p-6"
                >
                  <h2 className="text-base font-bold text-red-700">
                    {result.reason === "session"
                      ? "Oturumunuzu yenilemeniz gerekiyor"
                      : "Öğrenci bilgileri yüklenemedi"}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-red-700">{result.message}</p>
                  <div className="mt-4 flex flex-wrap gap-3">
                    {result.reason === "session" ? (
                      <form action={parentLogout}>
                        <button type="submit" className={logoutButtonClass}>
                          Tekrar giriş yap
                        </button>
                      </form>
                    ) : (
                      <Link href="/veli/dashboard" className={logoutButtonClass}>
                        Tekrar dene
                      </Link>
                    )}
                  </div>
                </div>
              ) : students.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-border-subtle bg-white/70 p-5 sm:p-6">
                  <h2 className="text-base font-bold text-text-primary">Bağlı öğrenci yok</h2>
                  <p className="mt-2 text-sm leading-6 text-text-muted">
                    Hesabınıza bağlı bir Samandıra İdman Yurdu Akademi öğrencisi bulunamadı.
                    Öğrenci kaydındaki veli adı ve telefonunun hesabınızla aynı olduğundan emin
                    olmak için akademi ile iletişime geçin.
                  </p>
                </div>
              ) : (
                <>
                  {students.length > 1 ? (
                    <nav aria-label="Öğrenci seçimi" className="flex flex-wrap gap-2">
                      {students.map((student) => {
                        const isActive = student.id === selected?.id;
                        return (
                          <Link
                            key={student.id}
                            href={`/veli/dashboard?ogrenci=${encodeURIComponent(student.id)}`}
                            scroll={false}
                            aria-current={isActive ? "page" : undefined}
                            className={cn(
                              "inline-flex min-h-[2.75rem] items-center rounded-full border px-4 py-2 text-sm font-semibold transition",
                              isActive
                                ? "border-maroon bg-maroon text-white"
                                : "border-border-subtle bg-white text-text-primary hover:border-maroon/40",
                            )}
                          >
                            {student.fullName}
                          </Link>
                        );
                      })}
                    </nav>
                  ) : null}

                  {selected ? <StudentDetails student={selected} /> : null}
                </>
              )}

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
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}
