import {
  createAgeGroup,
  deleteAgeGroup,
  updateAgeGroup,
} from "@/app/admin/(protected)/age-groups/actions";
import { ConfirmSubmitButton } from "@/components/admin/ConfirmSubmitButton";
import { createClient } from "@/lib/supabase/server";

type AgeGroupRow = {
  id: string;
  name: string | null;
  age_range: string | null;
  short_description: string | null;
  long_description: string | null;
  image_url: string | null;
  badge: string | null;
  is_active: boolean | null;
  sort_order: number | null;
};

const inputClass =
  "w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-base text-white outline-none transition placeholder:text-slate-500 focus:border-orange-400 focus:ring-2 focus:ring-orange-400/30 sm:text-sm";

const labelClass = "block text-sm font-semibold text-slate-200";

function AgeGroupFields({ row }: { row?: AgeGroupRow }) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_10rem_10rem_7rem]">
        <div className="space-y-2">
          <label className={labelClass}>Grup Adı</label>
          <input
            name="name"
            required
            defaultValue={row?.name || ""}
            className={inputClass}
            placeholder="Başlangıç Grubu"
          />
        </div>
        <div className="space-y-2">
          <label className={labelClass}>Yaş Aralığı</label>
          <input
            name="age_range"
            required
            defaultValue={row?.age_range || ""}
            className={inputClass}
            placeholder="6–8 Yaş"
          />
        </div>
        <div className="space-y-2">
          <label className={labelClass}>Etiket (isteğe bağlı)</label>
          <input
            name="badge"
            defaultValue={row?.badge || ""}
            className={inputClass}
            placeholder="Örn. Yeni"
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

      <div className="space-y-2">
        <label className={labelClass}>Kısa Açıklama</label>
        <input
          name="short_description"
          defaultValue={row?.short_description || ""}
          className={inputClass}
          placeholder="Kart üzerinde görünen tek cümlelik açıklama"
        />
      </div>

      <div className="space-y-2">
        <label className={labelClass}>Detaylı Açıklama / Özellikler</label>
        <textarea
          name="long_description"
          rows={4}
          defaultValue={row?.long_description || ""}
          className={inputClass}
          placeholder={"Her satıra bir özellik yazın:\nFutbolla ilk tanışma\nOyunla öğrenme"}
        />
        <p className="text-xs text-slate-400">
          Her satır public sayfada ayrı bir madde olarak gösterilir.
        </p>
      </div>

      <div className="space-y-2">
        <label className={labelClass}>Görsel URL (isteğe bağlı)</label>
        <input
          name="image_url"
          defaultValue={row?.image_url || ""}
          className={inputClass}
          placeholder="/images/... veya https://..."
        />
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

export default async function AdminAgeGroupsPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("age_groups")
    .select("id,name,age_range,short_description,long_description,image_url,badge,is_active,sort_order")
    .order("sort_order", { ascending: true });
  const rows = (data ?? []) as AgeGroupRow[];

  return (
    <div className="space-y-6">
      <header className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 sm:p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-orange-400">
          İçerik Yönetimi
        </p>
        <h1 className="mt-3 text-2xl font-bold tracking-tight text-white">Yaş Grupları</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
          Yaş grupları sayfasındaki kartları ve ana sayfa önizlemesini yönetin.
        </p>
      </header>

      <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
        <details>
          <summary className="cursor-pointer text-lg font-bold text-white">Yaş Grubu Ekle</summary>
          <form action={createAgeGroup} className="mt-5 space-y-5 border-t border-slate-800 pt-5">
            <AgeGroupFields />
            <div className="flex justify-end">
              <ConfirmSubmitButton>Yaş Grubunu Kaydet</ConfirmSubmitButton>
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
                  {row.age_range} • {row.name} • {row.is_active ? "Aktif" : "Pasif"}
                </p>
                <form action={deleteAgeGroup.bind(null, row.id)}>
                  <ConfirmSubmitButton
                    confirmMessage="Bu yaş grubunu silmek istediğinize emin misiniz?"
                    className="min-h-11 rounded-full border border-red-500/50 px-4 py-2 text-sm font-semibold text-red-300 transition hover:bg-red-500/10 disabled:opacity-60"
                  >
                    Sil
                  </ConfirmSubmitButton>
                </form>
              </div>

              <form
                action={updateAgeGroup.bind(null, row.id)}
                className="mt-4 space-y-5 border-t border-slate-800 pt-4"
              >
                <AgeGroupFields row={row} />
                <div className="flex justify-end">
                  <ConfirmSubmitButton>Güncelle</ConfirmSubmitButton>
                </div>
              </form>
            </article>
          ))}
        </div>
      ) : (
        <section className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/45 p-6">
          <p className="text-sm font-semibold text-slate-100">Henüz yaş grubu eklenmedi.</p>
          <p className="mt-2 text-sm text-slate-400">
            Kayıt eklenene kadar public sayfada mevcut sabit yaş grupları gösterilmeye devam eder.
          </p>
        </section>
      )}
    </div>
  );
}
