import { updatePreRegistrationStatus } from "@/app/admin/(protected)/pre-registrations/actions";
import {
  preRegistrationStatusLabels,
  type PreRegistrationStatus,
} from "@/app/admin/(protected)/pre-registrations/status";
import { createClient } from "@/lib/supabase/server";

type PreRegistration = {
  id: string;
  guardian_name?: string | null;
  parent_name?: string | null;
  phone?: string | null;
  student_name?: string | null;
  player_name?: string | null;
  child_name?: string | null;
  birth_year?: string | number | null;
  note?: string | null;
  notes?: string | null;
  status?: PreRegistrationStatus | null;
  created_at?: string | null;
};

function formatDate(value?: string | null) {
  if (!value) return "-";

  return new Intl.DateTimeFormat("tr-TR", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Europe/Istanbul",
  }).format(new Date(value));
}

function getDisplayValue(...values: Array<string | number | null | undefined>) {
  const value = values.find((item) => item !== null && item !== undefined && String(item).trim());
  return value ? String(value) : "-";
}

export default async function AdminPreRegistrationsPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("pre_registrations")
    .select("*")
    .order("created_at", { ascending: false });
  const registrations = (data ?? []) as PreRegistration[];

  return (
    <div className="space-y-6">
      <header className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 sm:p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-orange-400">
          Başvurular
        </p>
        <h1 className="mt-3 text-2xl font-bold tracking-tight text-white">Ön Kayıtlar</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
          Akademi ön kayıt başvurularını inceleyin ve başvuru durumlarını güncelleyin.
        </p>
      </header>

      {registrations.length > 0 ? (
        <div className="space-y-3">
          {registrations.map((registration) => {
            const status = registration.status && registration.status in preRegistrationStatusLabels
              ? registration.status
              : "new";

            return (
              <article
                key={registration.id}
                className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5"
              >
                <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_18rem]">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-400">
                        Veli
                      </p>
                      <p className="mt-1 break-words text-sm font-semibold text-white">
                        {getDisplayValue(registration.guardian_name, registration.parent_name)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-400">
                        Telefon
                      </p>
                      <p className="mt-1 break-words text-sm font-semibold text-white">
                        {getDisplayValue(registration.phone)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-400">
                        Öğrenci
                      </p>
                      <p className="mt-1 break-words text-sm font-semibold text-white">
                        {getDisplayValue(
                          registration.student_name,
                          registration.player_name,
                          registration.child_name,
                        )}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-400">
                        Doğum Yılı
                      </p>
                      <p className="mt-1 break-words text-sm font-semibold text-white">
                        {getDisplayValue(registration.birth_year)}
                      </p>
                    </div>
                    <div className="sm:col-span-2">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-400">
                        Not
                      </p>
                      <p className="mt-1 break-words text-sm text-slate-300">
                        {getDisplayValue(registration.note, registration.notes)}
                      </p>
                    </div>
                    <div className="sm:col-span-2">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-400">
                        Başvuru Tarihi
                      </p>
                      <p className="mt-1 text-sm text-slate-300">
                        {formatDate(registration.created_at)}
                      </p>
                    </div>
                  </div>

                  <form
                    action={updatePreRegistrationStatus.bind(null, registration.id)}
                    className="space-y-3 rounded-xl bg-slate-950/45 p-4"
                  >
                    <label className="block text-sm font-semibold text-slate-100" htmlFor={`status-${registration.id}`}>
                      Durum
                    </label>
                    <select
                      id={`status-${registration.id}`}
                      name="status"
                      defaultValue={status}
                      className="min-h-11 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-base text-white outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-400/30 sm:text-sm"
                    >
                      {Object.entries(preRegistrationStatusLabels).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                    <button
                      type="submit"
                      className="min-h-11 w-full rounded-full bg-orange-500 px-4 py-2 text-sm font-bold text-white transition hover:bg-orange-600"
                    >
                      Kaydet
                    </button>
                  </form>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <section className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/45 p-6">
          <p className="text-sm font-semibold text-slate-100">Henüz ön kayıt başvurusu yok.</p>
          <p className="mt-2 text-sm text-slate-400">Yeni başvurular geldiğinde burada listelenecektir.</p>
        </section>
      )}
    </div>
  );
}
