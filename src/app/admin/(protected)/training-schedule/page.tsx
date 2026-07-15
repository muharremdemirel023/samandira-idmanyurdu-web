import {
  createTrainingSchedule,
  deleteTrainingSchedule,
  updateTrainingSchedule,
} from "@/app/admin/(protected)/training-schedule/actions";
import { ConfirmSubmitButton } from "@/components/admin/ConfirmSubmitButton";
import { createClient } from "@/lib/supabase/server";

type ScheduleRow = {
  id: string;
  age_group: string | null;
  days: string | null;
  start_time: string | null;
  end_time: string | null;
  location: string | null;
  description: string | null;
  is_active: boolean | null;
  sort_order: number | null;
};

const inputClass =
  "w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-base text-white outline-none transition placeholder:text-slate-500 focus:border-orange-400 focus:ring-2 focus:ring-orange-400/30 sm:text-sm";

const labelClass = "block text-sm font-semibold text-slate-200";

function ScheduleFields({ row }: { row?: ScheduleRow }) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_7rem_7rem_7rem]">
        <div className="space-y-2">
          <label className={labelClass}>Yaş Grubu</label>
          <input
            name="age_group"
            required
            defaultValue={row?.age_group || ""}
            className={inputClass}
            placeholder="U11 Grubu"
          />
        </div>
        <div className="space-y-2">
          <label className={labelClass}>Günler</label>
          <input
            name="days"
            required
            defaultValue={row?.days || ""}
            className={inputClass}
            placeholder="Cumartesi ve Pazar"
          />
        </div>
        <div className="space-y-2">
          <label className={labelClass}>Başlangıç</label>
          <input
            name="start_time"
            required
            defaultValue={row?.start_time || ""}
            className={inputClass}
            placeholder="09:00"
          />
        </div>
        <div className="space-y-2">
          <label className={labelClass}>Bitiş</label>
          <input
            name="end_time"
            required
            defaultValue={row?.end_time || ""}
            className={inputClass}
            placeholder="10:00"
          />
        </div>
        <div className="space-y-2">
          <label className={labelClass}>Sıralama</label>
          <input
            name="sort_order"
            type="number"
            defaultValue={row?.sort_order ?? 0}
            className={inputClass}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label className={labelClass}>Saha / Konum (isteğe bağlı)</label>
          <input
            name="location"
            defaultValue={row?.location || ""}
            className={inputClass}
            placeholder="Akademi sahası"
          />
        </div>
        <div className="space-y-2">
          <label className={labelClass}>Açıklama (isteğe bağlı)</label>
          <input
            name="description"
            defaultValue={row?.description || ""}
            className={inputClass}
            placeholder="Kısa not"
          />
        </div>
      </div>

      <label className="flex min-h-11 items-center gap-3 rounded-xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-sm font-semibold text-slate-200">
        <input
          name="is_active"
          type="checkbox"
          defaultChecked={row?.is_active ?? true}
          className="size-4 accent-orange-500"
        />
        Aktif Olarak Göster
      </label>
    </div>
  );
}

export default async function AdminTrainingSchedulePage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("training_schedules")
    .select("id,age_group,days,start_time,end_time,location,description,is_active,sort_order")
    .order("sort_order", { ascending: true });
  const rows = (data ?? []) as ScheduleRow[];

  return (
    <div className="space-y-6">
      <header className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 sm:p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-orange-400">
          İçerik Yönetimi
        </p>
        <h1 className="mt-3 text-2xl font-bold tracking-tight text-white">Antrenman Programı</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
          Ana sayfadaki antrenman programı satırlarını yönetin.
        </p>
      </header>

      <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
        <details>
          <summary className="cursor-pointer text-lg font-bold text-white">Program Satırı Ekle</summary>
          <form
            action={createTrainingSchedule}
            className="mt-5 space-y-5 border-t border-slate-800 pt-5"
          >
            <ScheduleFields />
            <div className="flex justify-end">
              <ConfirmSubmitButton>Satırı Kaydet</ConfirmSubmitButton>
            </div>
          </form>
        </details>
      </section>

      {rows.length > 0 ? (
        <div className="space-y-3">
          {rows.map((row) => (
            <article key={row.id} className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-400">
                  {row.age_group} • {row.is_active ? "Aktif" : "Pasif"}
                </p>
                <form action={deleteTrainingSchedule.bind(null, row.id)}>
                  <ConfirmSubmitButton
                    confirmMessage="Bu program satırını silmek istediğinize emin misiniz?"
                    className="min-h-11 rounded-full border border-red-500/50 px-4 py-2 text-sm font-semibold text-red-300 transition hover:bg-red-500/10 disabled:opacity-60"
                  >
                    Sil
                  </ConfirmSubmitButton>
                </form>
              </div>

              <form
                action={updateTrainingSchedule.bind(null, row.id)}
                className="mt-4 space-y-5 border-t border-slate-800 pt-4"
              >
                <ScheduleFields row={row} />
                <div className="flex justify-end">
                  <ConfirmSubmitButton>Güncelle</ConfirmSubmitButton>
                </div>
              </form>
            </article>
          ))}
        </div>
      ) : (
        <section className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/45 p-6">
          <p className="text-sm font-semibold text-slate-100">Henüz program satırı eklenmedi.</p>
          <p className="mt-2 text-sm text-slate-400">
            Kayıt eklenene kadar ana sayfada mevcut sabit program gösterilmeye devam eder.
          </p>
        </section>
      )}
    </div>
  );
}
