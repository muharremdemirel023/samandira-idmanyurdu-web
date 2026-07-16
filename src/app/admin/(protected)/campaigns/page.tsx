import {
  createCampaign,
  deleteCampaign,
  updateCampaign,
} from "@/app/admin/(protected)/campaigns/actions";
import { ConfirmSubmitButton } from "@/components/admin/ConfirmSubmitButton";
import { ImageCropUploadField } from "@/components/admin/ImageCropUploadField";
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
  content_gap_px: number | null;
};

const inputClass =
  "w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-base text-white outline-none transition placeholder:text-slate-500 focus:border-orange-400 focus:ring-2 focus:ring-orange-400/30 sm:text-sm";

const labelClass = "block text-sm font-semibold text-slate-200";

/**
 * Kaydedilen UTC zaman damgasını, sunucunun çalıştığı ortamın saat dilimine bakmaksızın
 * her zaman İstanbul saatine göre <input type="datetime-local"> değerine çevirir.
 * (Yazma tarafındaki İstanbul-ofsetli dönüşümle simetriktir.)
 */
function toLocalInputValue(value: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Istanbul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);

  const get = (type: string) => parts.find((part) => part.type === type)?.value ?? "";
  return `${get("year")}-${get("month")}-${get("day")}T${get("hour")}:${get("minute")}`;
}

function CampaignFields({ row }: { row?: CampaignRow }) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className={labelClass}>Kampanya Adı</label>
        <input name="name" required defaultValue={row?.name || ""} className={inputClass} />
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <ImageCropUploadField
          bucket="site-images"
          folder="campaigns/desktop"
          inputName="desktop_image_url"
          label="Masaüstü Görseli"
          value={row?.desktop_image_url ?? ""}
          preset="campaign-poster"
          mode="contain"
        />
        <ImageCropUploadField
          bucket="site-images"
          folder="campaigns/mobile"
          inputName="mobile_image_url"
          label="Mobil Görseli"
          value={row?.mobile_image_url ?? ""}
          preset="campaign-poster"
          mode="contain"
          description="Boşsa masaüstü görseli kullanılır. Görsel seçip kırparak yükleyin."
        />
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

      <div className="space-y-2">
        <label className={labelClass}>Görsel ile Mesaj Kartı Boşluğu (px)</label>
        <input
          name="content_gap_px"
          type="number"
          min={-160}
          max={80}
          step={4}
          defaultValue={row?.content_gap_px ?? 12}
          className={inputClass}
        />
        <p className="text-xs leading-5 text-slate-400">
          Görselin altındaki başlık/buton kartının mesafesi. Görselin alt kısmında şeffaf boşluk
          varsa <span className="font-semibold text-slate-300">negatif değer</span> (örn. -40)
          girerek kartı görsele yaklaştırabilirsiniz. Varsayılan: 12.
        </p>
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

const errorMessages: Record<string, string> = {
  validation: "Kampanya adı zorunludur. Lütfen tekrar deneyin.",
  create: "Kampanya kaydedilemedi. Lütfen bilgileri kontrol edip tekrar deneyin.",
  update: "Kampanya güncellenemedi. Lütfen bilgileri kontrol edip tekrar deneyin.",
  delete: "Kampanya silinemedi. Lütfen tekrar deneyin.",
};

export default async function AdminCampaignsPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  const { saved, error } = await searchParams;
  const supabase = await createClient();
  const { data, error: fetchError } = await supabase
    .from("campaigns")
    .select("*")
    .order("created_at", { ascending: false });

  if (fetchError) {
    console.error("[admin/campaigns] Kampanya listesi alınamadı:", fetchError);
  }

  const rows = (data ?? []) as CampaignRow[];
  const errorMessage = error ? errorMessages[error] || "Bir hata oluştu. Lütfen tekrar deneyin." : null;

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

      {saved ? (
        <p className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm font-semibold text-emerald-300">
          Kampanya kaydedildi.
        </p>
      ) : null}

      {errorMessage ? (
        <p className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-300">
          {errorMessage}
        </p>
      ) : null}

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
