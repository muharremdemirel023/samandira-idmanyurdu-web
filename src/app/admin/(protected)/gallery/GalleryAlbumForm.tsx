import { ImageCropUploadField } from "@/components/admin/ImageCropUploadField";

type GalleryAlbumFormValues = {
  title?: string | null;
  description?: string | null;
  cover_image_url?: string | null;
  sort_order?: number | string | null;
  is_active?: boolean | null;
};

type GalleryAlbumFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  submitLabel: string;
  values?: GalleryAlbumFormValues;
};

const inputClass =
  "w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-base text-white outline-none transition placeholder:text-slate-500 focus:border-orange-400 focus:ring-2 focus:ring-orange-400/30 sm:text-sm";

const labelClass = "block text-sm font-semibold text-slate-200";

export function GalleryAlbumForm({ action, submitLabel, values }: GalleryAlbumFormProps) {
  return (
    <form action={action} className="space-y-5">
      <div className="grid gap-5 md:grid-cols-[1fr_10rem]">
        <div className="space-y-2">
          <label className={labelClass} htmlFor="album-title">
            Albüm Başlığı
          </label>
          <input
            id="album-title"
            name="title"
            required
            defaultValue={values?.title || ""}
            className={inputClass}
            placeholder="Albüm başlığı"
          />
        </div>

        <div className="space-y-2">
          <label className={labelClass} htmlFor="album-sort-order">
            Sıra No
          </label>
          <input
            id="album-sort-order"
            name="sort_order"
            type="number"
            defaultValue={values?.sort_order ?? 0}
            className={inputClass}
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className={labelClass} htmlFor="album-description">
          Açıklama
        </label>
        <textarea
          id="album-description"
          name="description"
          rows={3}
          defaultValue={values?.description || ""}
          className={inputClass}
          placeholder="Albüm açıklaması"
        />
      </div>

      <ImageCropUploadField
        bucket="gallery"
        folder="covers"
        inputName="cover_image_url"
        label="Kapak Görseli"
        description="Albüm kapak görselini 4:5 oranında kırpıp yükleyin."
        preset="gallery"
        aspectRatio={4 / 5}
        outputWidth={1080}
        value={values?.cover_image_url || ""}
      />

      <label className="flex min-h-11 items-center gap-3 rounded-xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-sm font-semibold text-slate-200">
        <input
          name="is_active"
          type="checkbox"
          defaultChecked={values?.is_active ?? true}
          className="size-4 accent-orange-500"
        />
        Aktif Olarak Göster
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
