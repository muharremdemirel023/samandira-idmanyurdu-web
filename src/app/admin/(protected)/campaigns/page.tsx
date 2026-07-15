import {
  createCampaign,
  deleteCampaign,
  updateCampaign,
} from "@/app/admin/(protected)/campaigns/actions";
import { ConfirmSubmitButton } from "@/components/admin/ConfirmSubmitButton";
import { createClient } from "@/lib/supabase/server";

type CampaignRow = {
  id: string;
  name: string | null;
  desktop_image_url: string | null;
  mobile_image_url: string | null;
  title: string | null;
  description: string | null;
  button_label: string | null;
  button_href: string | null;
  is_active: boolean | null;
  starts_at: string | null;
  ends_at: string | null;
  open_delay_ms: number | null;
  auto_close_seconds: number | null;
  show_every_reload: boolean | null;
  show_once_per_user: boolean | null;
};

const inputClass =
  "w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-base text-white outline-none transition placeholder:text-slate-500 focus:border-orange-400 focus:ring-2 focus:ring-orange-400/30 sm:text-sm";

const labelClass = "block text-sm font-semibold text-slate-200";

function toLocalInputValue(value: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function CampaignFields({ row }: { row?: CampaignRow }) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className={labelClass}>Kampanya Adı</label>
        <input name="name" required defaultValue={row?.name || ""} className={inputClass} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label className={labelClass}>Masaüstü Görseli</label>
          <input
            name="desktop_image_url"
            defaultValue={row?.desktop_image_url || ""}
            className={inputClass}
            placeholder="/images/campaigns/..."
          />
        </div>
        <div className="space-y-2">
          <label className={labelClass}>Mobil Görseli</label>
          <input
            name="mobile_image_url"
            defaultValue={row?.mobile_image_url || ""}
            className={inputClass}
            placeholder="Boşsa masaüstü görseli kullanılır"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label className={labelClass}>Başlık (isteğe bağlı)</label>
          <input name="title" defaultValue={row?.title || ""} className={inputClass} />
        </div>
        <div className="space-y-2">
          <label className={labelClass}>Açıklama (isteğe bağlı)</label>
          <input name="description" defaultValue={row?.description || ""} className={inputClass} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label className={labelClass}>Buton Metni (isteğe bağlı)</label>
          <input name="button_label" defaultValue={row?.button_label || ""} className={inputClass} />
        </div>
        <div className="space-y-2">
          <label className={labelClass}>Buton Bağlantısı (isteğe bağlı)</label>
          <input
            name="button_href"
            defaultValue={row?.button_href || ""}
            className={inputClass}
            placeholder="/on-kayit"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-2">
          <label className={labelClass}>Başlangıç Tarihi</label>
          <input
            name="starts_at"
            type="datetime-local"
            defaultValue={toLocalInputValue(row?.starts_at ?? null)}
            className={inputClass}
          />
        </div>
        <div className="space-y-2">
          <label className={labelClass}>Bitiş Tarihi</label>
          <input
            name="ends_at"
            type="datetime-local"
            defaultValue={toLocalInputValue(row?.ends_at ?? null)}
            className={inputClass}
          />
        </div>
        <div className="space-y-2">
          <label className={labelClass}>Açılış Gecikmesi (ms)</label>
          <input
            name="open_delay_ms"
            type="number"
            defaultValue={row?.open_delay_ms ?? 500}
            className={inputClass}
          />
        </div>
        <div className="space-y-2">
          <label className={labelClass}>Açık Kalma (saniye)</label>
          <input
            name="auto_close_seconds"
            type="number"
            defaultValue={row?.auto_close_seconds ?? 6}
            className={inputClass}
          />
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <label className="flex min-h-11 flex-1 items-center gap-3 rounded-xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-sm font-semibold text-slate-200">
          <input
            name="is_active"
            type="checkbox"
            defaultChecked={row?.is_active ?? true}
            className="size-4 accent-orange-500"
          />
          Aktif
        </label>
        <label className="flex min-h-11 flex-1 items-center gap-3 rounded-xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-sm font-semibold text-slate-200">
          <input
            name="show_every_reload"
            type="checkbox"
            defaultChecked={row?.show_every_reload ?? true}
            className="size-4 accent-orange-500"
          />
          Her Yenilemede Göster
        </label>
        <label className="flex min-h-11 flex-1 items-center gap-3 rounded-xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-sm font-semibold text-slate-200">
          <input
            name="show_once_per_user"
            type="checkbox"
            defaultChecked={row?.show_once_per_user ?? false}
            className="size-4 accent-orange-500"
          />
          Kullanıcı Başına Bir Kez
        </label>
      </div>
    </div>
  );
}

export default async function AdminCampaignsPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("campaigns")
    .select("*")
    .order("created_at", { ascending: false });
  const rows = (data ?? []) as CampaignRow[];

  return (
    <div className="space-y-6">
      <header className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 sm:p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-orange-400">
          Site Yönetimi
        </p>
        <h1 className="mt-3 text-2xl font-bold tracking-tight text-white">Kampanya Yönetimi</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
          Ana sayfa açılış popup kampanyalarını yönetin. Aktif ve tarih aralığı uygun ilk kampanya
          gösterilir; hiçbiri uygun değilse popup açılmaz.
        </p>
      </header>

      <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
        <details>
          <summary className="cursor-pointer text-lg font-bold text-white">Kampanya Ekle</summary>
          <form action={createCampaign} className="mt-5 space-y-5 border-t border-slate-800 pt-5">
            <CampaignFields />
            <div className="flex justify-end">
              <ConfirmSubmitButton>Kampanyayı Kaydet</ConfirmSubmitButton>
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
                  {row.name} • {row.is_active ? "Aktif" : "Pasif"}
                </p>
                <form action={deleteCampaign.bind(null, row.id)}>
                  <ConfirmSubmitButton
                    confirmMessage="Bu kampanyayı silmek istediğinize emin misiniz?"
                    className="min-h-11 rounded-full border border-red-500/50 px-4 py-2 text-sm font-semibold text-red-300 transition hover:bg-red-500/10 disabled:opacity-60"
                  >
                    Sil
                  </ConfirmSubmitButton>
                </form>
              </div>

              <form
                action={updateCampaign.bind(null, row.id)}
                className="mt-4 space-y-5 border-t border-slate-800 pt-4"
              >
                <CampaignFields row={row} />
                <div className="flex justify-end">
                  <ConfirmSubmitButton>Güncelle</ConfirmSubmitButton>
                </div>
              </form>
            </article>
          ))}
        </div>
      ) : (
        <section className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/45 p-6">
          <p className="text-sm font-semibold text-slate-100">Henüz kampanya eklenmedi.</p>
          <p className="mt-2 text-sm text-slate-400">
            Aktif kampanya olmadığında ana sayfada popup gösterilmez.
          </p>
        </section>
      )}
    </div>
  );
}
