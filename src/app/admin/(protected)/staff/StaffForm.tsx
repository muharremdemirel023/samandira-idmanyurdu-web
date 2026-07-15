import { ImageCropUploadField } from "@/components/admin/ImageCropUploadField";

type StaffFormValues = {
  name?: string | null;
  title?: string | null;
  short_summary?: string | null;
  biography?: string | null;
  highlights?: string[] | string | null;
  photo_url?: string | null;
  sort_order?: number | string | null;
  is_active?: boolean | null;
};

type StaffFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  submitLabel: string;
  values?: StaffFormValues;
};

const inputClass =
  "w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-base text-white outline-none transition placeholder:text-slate-500 focus:border-orange-400 focus:ring-2 focus:ring-orange-400/30 sm:text-sm";

const labelClass = "block text-sm font-semibold text-slate-200";

function formatHighlights(value: StaffFormValues["highlights"]) {
  if (Array.isArray(value)) return value.join("\n");
  return value || "";
}

export function StaffForm({ action, submitLabel, values }: StaffFormProps) {
  return (
    <form action={action} className="space-y-5">
      <div className="grid gap-5 md:grid-cols-2">
        <div className="space-y-2">
          <label className={labelClass} htmlFor="name">
            Ad Soyad
          </label>
          <input
            id="name"
            name="name"
            required
            defaultValue={values?.name || ""}
            className={inputClass}
            placeholder="Antrenör adı"
          />
        </div>

        <div className="space-y-2">
          <label className={labelClass} htmlFor="title">
            Görev
          </label>
          <input
            id="title"
            name="title"
            required
            defaultValue={values?.title || ""}
            className={inputClass}
            placeholder="Antrenör"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className={labelClass} htmlFor="short_summary">
          Kısa Özet
        </label>
        <textarea
          id="short_summary"
          name="short_summary"
          rows={3}
          defaultValue={values?.short_summary || ""}
          className={inputClass}
          placeholder="Kısa tanıtım metni"
        />
      </div>

      <div className="space-y-2">
        <label className={labelClass} htmlFor="biography">
          Biyografi
        </label>
        <textarea
          id="biography"
          name="biography"
          rows={8}
          defaultValue={values?.biography || ""}
          className={inputClass}
          placeholder="Detaylı biyografi"
        />
      </div>

      <div className="space-y-2">
        <label className={labelClass} htmlFor="highlights">
          Öne Çıkanlar
        </label>
        <textarea
          id="highlights"
          name="highlights"
          rows={4}
          defaultValue={formatHighlights(values?.highlights)}
          className={inputClass}
          placeholder={"Her satıra bir özellik yazın"}
        />
      </div>

      <ImageCropUploadField
        bucket="site-images"
        folder="staff"
        inputName="photo_url"
        label="Profil Fotoğrafı"
        description="Teknik kadro profil fotoğrafını 4:5 portre oranında kırpıp yükleyin."
        preset="staff-portrait"
        aspectRatio={4 / 5}
        value={values?.photo_url || ""}
      />

      <div className="grid gap-5 md:grid-cols-2">
        <div className="space-y-2">
          <label className={labelClass} htmlFor="sort_order">
            Sıralama
          </label>
          <input
            id="sort_order"
            name="sort_order"
            type="number"
            defaultValue={values?.sort_order ?? 0}
            className={inputClass}
            placeholder="0"
          />
        </div>

        <label className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-sm font-semibold text-slate-200 md:self-end">
          <input
            name="is_active"
            type="checkbox"
            defaultChecked={values?.is_active ?? true}
            className="size-4 accent-orange-500"
          />
          Aktif Olarak Göster
        </label>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          className="min-h-11 w-full rounded-full bg-orange-500 px-6 py-3 text-sm font-bold text-white transition hover:bg-orange-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 sm:w-auto"
        >
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
