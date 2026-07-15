import { ImageCropUploadField } from "@/components/admin/ImageCropUploadField";

type NewsFormValues = {
  title?: string | null;
  slug?: string | null;
  summary?: string | null;
  content?: string | null;
  cover_image_url?: string | null;
  is_active?: boolean | null;
};

type NewsFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  submitLabel: string;
  values?: NewsFormValues;
};

const inputClass =
  "w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-base text-white outline-none transition placeholder:text-slate-500 focus:border-orange-400 focus:ring-2 focus:ring-orange-400/30 sm:text-sm";

const labelClass = "block text-sm font-semibold text-slate-200";

export function NewsForm({ action, submitLabel, values }: NewsFormProps) {
  return (
    <form action={action} className="space-y-5">
      <div className="grid gap-5 md:grid-cols-2">
        <div className="space-y-2">
          <label className={labelClass} htmlFor="title">
            Başlık
          </label>
          <input
            id="title"
            name="title"
            required
            defaultValue={values?.title || ""}
            className={inputClass}
            placeholder="Duyuru başlığı"
          />
        </div>

        <div className="space-y-2">
          <label className={labelClass} htmlFor="slug">
            Bağlantı Adı
          </label>
          <input
            id="slug"
            name="slug"
            required
            defaultValue={values?.slug || ""}
            className={inputClass}
            placeholder="duyuru-basligi"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className={labelClass} htmlFor="summary">
          Özet
        </label>
        <textarea
          id="summary"
          name="summary"
          rows={3}
          defaultValue={values?.summary || ""}
          className={inputClass}
          placeholder="Kısa özet"
        />
      </div>

      <div className="space-y-2">
        <label className={labelClass} htmlFor="content">
          İçerik
        </label>
        <textarea
          id="content"
          name="content"
          rows={12}
          defaultValue={values?.content || ""}
          className={inputClass}
          placeholder="Duyuru içeriği"
        />
      </div>

      <ImageCropUploadField
        bucket="news"
        folder="covers"
        inputName="cover_image_url"
        label="Kapak Görseli"
        description="Duyuru kapak görselini 16:9 oranında kırpıp yükleyin."
        preset="news-cover"
        aspectRatio={16 / 9}
        value={values?.cover_image_url || ""}
      />

      <label className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-sm font-semibold text-slate-200">
        <input
          name="is_published"
          type="checkbox"
          defaultChecked={Boolean(values?.is_active)}
          className="size-4 accent-orange-500"
        />
        Yayında Olarak Kaydet
      </label>

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
