import { ImageCropUploadField } from "@/components/admin/ImageCropUploadField";

type SponsorFormValues = {
  name?: string | null;
  website_url?: string | null;
  logo_url?: string | null;
  sort_order?: number | string | null;
  is_active?: boolean | null;
};

type SponsorFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  submitLabel: string;
  values?: SponsorFormValues;
};

const inputClass =
  "w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-base text-white outline-none transition placeholder:text-slate-500 focus:border-orange-400 focus:ring-2 focus:ring-orange-400/30 sm:text-sm";

const labelClass = "block text-sm font-semibold text-slate-200";

export function SponsorForm({ action, submitLabel, values }: SponsorFormProps) {
  return (
    <form action={action} className="space-y-5">
      <div className="grid gap-5 md:grid-cols-[1fr_10rem]">
        <div className="space-y-2">
          <label className={labelClass} htmlFor="sponsor-name">
            Firma Adı
          </label>
          <input
            id="sponsor-name"
            name="name"
            required
            defaultValue={values?.name || ""}
            className={inputClass}
            placeholder="Sponsor firma adı"
          />
        </div>

        <div className="space-y-2">
          <label className={labelClass} htmlFor="sponsor-sort-order">
            Sıralama
          </label>
          <input
            id="sponsor-sort-order"
            name="sort_order"
            type="number"
            defaultValue={values?.sort_order ?? 0}
            className={inputClass}
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className={labelClass} htmlFor="sponsor-website">
          Website
        </label>
        <input
          id="sponsor-website"
          name="website_url"
          type="url"
          defaultValue={values?.website_url || ""}
          className={inputClass}
          placeholder="https://..."
        />
      </div>

      <ImageCropUploadField
        bucket="sponsors"
        folder="logos"
        inputName="logo_url"
        label="Logo"
        description="Sponsor logosunu kare alanda, oranı korunacak şekilde yükleyin."
        preset="sponsor-logo"
        aspectRatio={1}
        mode="contain"
        outputWidth={800}
        value={values?.logo_url || ""}
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
          className="min-h-11 w-full rounded-full bg-orange-500 px-6 py-3 text-sm font-bold text-white transition hover:bg-orange-600 sm:w-auto"
        >
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
