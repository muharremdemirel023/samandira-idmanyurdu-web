import { ImageCropUploadField } from "@/components/admin/ImageCropUploadField";

type CustomPageFormValues = {
  title?: string | null;
  slug?: string | null;
  summary?: string | null;
  content?: string | null;
  cover_image_url?: string | null;
  is_active?: boolean | null;
  show_in_menu?: boolean | null;
  show_in_footer?: boolean | null;
  sort_order?: number | null;
};

type CustomPageFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  submitLabel: string;
  values?: CustomPageFormValues;
};

const inputClass =
  "w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-base text-white outline-none transition placeholder:text-slate-500 focus:border-orange-400 focus:ring-2 focus:ring-orange-400/30 sm:text-sm";

const labelClass = "block text-sm font-semibold text-slate-200";

export function PageForm({ action, submitLabel, values }: CustomPageFormProps) {
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
            placeholder="Sayfa başlığı"
          />
        </div>

        <div className="space-y-2">
          <label className={labelClass} htmlFor="slug">
            Bağlantı Adı
          </label>
          <input
            id="slug"
            name="slug"
            defaultValue={values?.slug || ""}
            className={inputClass}
            placeholder="Boş bırakılırsa başlıktan otomatik oluşturulur"
          />
          <p className="text-xs leading-5 text-slate-400">
            Sayfa şu adreste yayınlanır: /sayfa/&lt;bağlantı-adı&gt;
          </p>
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
          placeholder="Kısa özet (isteğe bağlı)"
        />
      </div>

      <div className="space-y-2">
        <label className={labelClass} htmlFor="content">
          İçerik
        </label>
        <textarea
          id="content"
          name="content"
          rows={14}
          defaultValue={values?.content || ""}
          className={inputClass}
          placeholder="Sayfa içeriği"
        />
      </div>

      <ImageCropUploadField
        bucket="site-images"
        folder="pages"
        inputName="cover_image_url"
        label="Kapak Görseli (isteğe bağlı)"
        description="Sayfa üst kapak görselini 16:9 oranında kırpıp yükleyin."
        preset="hero"
        aspectRatio={16 / 9}
        value={values?.cover_image_url || ""}
      />

      <label className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-sm font-semibold text-slate-200">
        <input
          name="is_active"
          type="checkbox"
          defaultChecked={values?.is_active ?? true}
          className="size-4 accent-orange-500"
        />
        Yayında Olarak Kaydet
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex min-h-11 items-center gap-3 rounded-xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-sm font-semibold text-slate-200">
          <input
            name="show_in_menu"
            type="checkbox"
            defaultChecked={values?.show_in_menu ?? false}
            className="size-4 accent-orange-500"
          />
          Menüde Göster
        </label>
        <label className="flex min-h-11 items-center gap-3 rounded-xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-sm font-semibold text-slate-200">
          <input
            name="show_in_footer"
            type="checkbox"
            defaultChecked={values?.show_in_footer ?? false}
            className="size-4 accent-orange-500"
          />
          Footer&apos;da Göster
        </label>
      </div>

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
        />
        <p className="text-xs leading-5 text-slate-400">
          Menü/footer&apos;da küçük sayı önce görünür.
        </p>
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
