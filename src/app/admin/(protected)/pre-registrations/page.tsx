import Link from "next/link";

import {
  resendPreRegistrationNotification,
  updatePreRegistrationStatus,
} from "@/app/admin/(protected)/pre-registrations/actions";
import {
  preRegistrationStatusLabels,
  type PreRegistrationStatus,
} from "@/app/admin/(protected)/pre-registrations/status";
import { requireAdmin } from "@/lib/auth/admin";

type NotificationStatus = "pending" | "sent" | "failed" | "skipped";
type PreRegistration = {
  id: string;
  guardian_name: string;
  phone_e164: string;
  student_name: string;
  birth_year: number;
  note: string | null;
  status: PreRegistrationStatus;
  notification_status: NotificationStatus;
  notification_attempts: number;
  notification_last_error: string | null;
  notification_sent_at: string | null;
  consent_at: string;
  created_at: string;
};

const pageSize = 20;
const notificationLabels: Record<NotificationStatus, string> = {
  pending: "Gönderim bekliyor",
  sent: "E-posta gönderildi",
  failed: "E-posta başarısız",
  skipped: "E-posta yapılandırılmamış",
};

function formatDate(value?: string | null) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("tr-TR", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Europe/Istanbul",
  }).format(new Date(value));
}

function parsePage(value?: string) {
  const parsed = Number.parseInt(value ?? "1", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}

export default async function AdminPreRegistrationsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const requestedPage = parsePage((await searchParams).page);
  const { supabase } = await requireAdmin();
  const from = (requestedPage - 1) * pageSize;
  const to = from + pageSize - 1;
  const { data, count, error } = await supabase
    .from("pre_registrations")
    .select(
      "id,guardian_name,phone_e164,student_name,birth_year,note,status,notification_status,notification_attempts,notification_last_error,notification_sent_at,consent_at,created_at",
      { count: "exact" },
    )
    .order("created_at", { ascending: false })
    .range(from, to);

  const registrations = (data ?? []) as PreRegistration[];
  const totalPages = Math.max(1, Math.ceil((count ?? 0) / pageSize));

  return (
    <div className="space-y-6">
      <header className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-orange-400">Başvurular</p>
            <h1 className="mt-3 text-2xl font-bold tracking-tight text-white">Ön Kayıtlar</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
              Başvurular realtime ile güncellenir; bağlantı kesilirse ekran dakikada bir yenilenir.
            </p>
          </div>
          <span className="rounded-full border border-slate-700 px-3 py-1.5 text-sm text-slate-300">
            Toplam {count ?? 0}
          </span>
        </div>
      </header>

      {error ? (
        <section role="alert" className="rounded-2xl border border-red-800 bg-red-950/45 p-5 text-red-100">
          Başvurular yüklenemedi. RLS politikası ve veritabanı migration durumunu kontrol edin.
        </section>
      ) : registrations.length > 0 ? (
        <div className="space-y-3">
          {registrations.map((registration) => {
            const status = registration.status in preRegistrationStatusLabels ? registration.status : "new";
            const notificationStatus = registration.notification_status ?? "pending";

            return (
              <article key={registration.id} className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
                <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_18rem]">
                  <dl className="grid gap-3 sm:grid-cols-2">
                    <div><dt className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-400">Veli</dt><dd className="mt-1 break-words text-sm font-semibold text-white">{registration.guardian_name}</dd></div>
                    <div><dt className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-400">Telefon</dt><dd className="mt-1 text-sm font-semibold"><a className="text-white underline decoration-slate-600 underline-offset-2" href={`tel:${registration.phone_e164}`}>{registration.phone_e164}</a></dd></div>
                    <div><dt className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-400">Oyuncu</dt><dd className="mt-1 break-words text-sm font-semibold text-white">{registration.student_name}</dd></div>
                    <div><dt className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-400">Doğum Yılı</dt><dd className="mt-1 text-sm font-semibold text-white">{registration.birth_year}</dd></div>
                    <div className="sm:col-span-2"><dt className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-400">Not</dt><dd className="mt-1 whitespace-pre-wrap break-words text-sm text-slate-300">{registration.note || "-"}</dd></div>
                    <div><dt className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-400">Başvuru Tarihi</dt><dd className="mt-1 text-sm text-slate-300">{formatDate(registration.created_at)}</dd></div>
                    <div><dt className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-400">KVKK Kaydı</dt><dd className="mt-1 text-sm text-slate-300">{formatDate(registration.consent_at)}</dd></div>
                    <div className="sm:col-span-2"><dt className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-400">Bildirim</dt><dd className="mt-1 text-sm text-slate-300">{notificationLabels[notificationStatus]}{registration.notification_attempts ? ` · ${registration.notification_attempts} deneme` : ""}{registration.notification_sent_at ? ` · ${formatDate(registration.notification_sent_at)}` : ""}</dd>{registration.notification_last_error ? <p className="mt-1 break-words text-xs text-red-300">{registration.notification_last_error}</p> : null}</div>
                  </dl>

                  <div className="space-y-3 rounded-xl bg-slate-950/45 p-4">
                    <form action={updatePreRegistrationStatus.bind(null, registration.id)} className="space-y-3">
                      <label className="block text-sm font-semibold text-slate-100" htmlFor={`status-${registration.id}`}>Durum</label>
                      <select id={`status-${registration.id}`} name="status" defaultValue={status} className="min-h-11 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-base text-white outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-400/30 sm:text-sm">
                        {Object.entries(preRegistrationStatusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                      </select>
                      <button type="submit" className="min-h-11 w-full rounded-full bg-orange-500 px-4 py-2 text-sm font-bold text-white transition hover:bg-orange-600">Durumu kaydet</button>
                    </form>
                    {notificationStatus !== "sent" ? (
                      <form action={resendPreRegistrationNotification.bind(null, registration.id)}>
                        <button type="submit" className="min-h-11 w-full rounded-full border border-slate-600 px-4 py-2 text-sm font-bold text-slate-100 transition hover:border-orange-400">E-postayı yeniden dene</button>
                      </form>
                    ) : null}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <section className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/45 p-6">
          <p className="text-sm font-semibold text-slate-100">Henüz ön kayıt başvurusu yok.</p>
        </section>
      )}

      {!error && totalPages > 1 ? (
        <nav aria-label="Başvuru sayfaları" className="flex items-center justify-between gap-4 rounded-xl border border-slate-800 bg-slate-900/60 p-4">
          {requestedPage > 1 ? <Link className="rounded-full border border-slate-700 px-4 py-2 text-sm font-semibold hover:border-orange-400" href={`/admin/pre-registrations?page=${requestedPage - 1}`}>← Önceki</Link> : <span />}
          <span className="text-sm text-slate-300">Sayfa {Math.min(requestedPage, totalPages)} / {totalPages}</span>
          {requestedPage < totalPages ? <Link className="rounded-full border border-slate-700 px-4 py-2 text-sm font-semibold hover:border-orange-400" href={`/admin/pre-registrations?page=${requestedPage + 1}`}>Sonraki →</Link> : <span />}
        </nav>
      ) : null}
    </div>
  );
}
