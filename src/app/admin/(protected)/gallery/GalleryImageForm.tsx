"use client";

import { useState } from "react";

import type { GalleryAspectRatio } from "@/app/admin/(protected)/gallery/actions";
import { ImageCropUploadField } from "@/components/admin/ImageCropUploadField";

type GalleryAlbumOption = {
  id: string;
  title: string | null;
};

type GalleryImageFormValues = {
  album_id?: string | null;
  image_url?: string | null;
  alt_text?: string | null;
  caption?: string | null;
  aspect_ratio?: GalleryAspectRatio | string | null;
  sort_order?: number | string | null;
  is_active?: boolean | null;
};

type GalleryImageFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  submitLabel: string;
  albums: GalleryAlbumOption[];
  values?: GalleryImageFormValues;
};

const inputClass =
  "w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-base text-white outline-none transition placeholder:text-slate-500 focus:border-orange-400 focus:ring-2 focus:ring-orange-400/30 sm:text-sm";

const labelClass = "block text-sm font-semibold text-slate-200";

export function GalleryImageForm({ action, submitLabel, albums, values }: GalleryImageFormProps) {
  const [aspectRatio, setAspectRatio] = useState<GalleryAspectRatio>(
    values?.aspect_ratio === "1:1" ? "1:1" : "4:5",
  );
  const ratio = aspectRatio === "1:1" ? 1 : 4 / 5;

  return (
    <form action={action} className="space-y-5">
      <div className="grid gap-5 md:grid-cols-2">
        <div className="space-y-2">
          <label className={labelClass} htmlFor="gallery-image-album">
            Albüm
          </label>
          <select
            id="gallery-image-album"
            name="album_id"
            defaultValue={values?.album_id || ""}
            className={inputClass}
          >
            <option value="">Albüm seçilmedi</option>
            {albums.map((album) => (
              <option key={album.id} value={album.id}>
                {album.title || "Başlıksız Albüm"}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className={labelClass} htmlFor="gallery-image-aspect">
            Format
          </label>
          <select
            id="gallery-image-aspect"
            name="aspect_ratio"
            value={aspectRatio}
            onChange={(event) => setAspectRatio(event.target.value as GalleryAspectRatio)}
            className={inputClass}
          >
            <option value="4:5">Dikey 4:5</option>
            <option value="1:1">Kare 1:1</option>
          </select>
        </div>
      </div>

      <ImageCropUploadField
        bucket="gallery"
        folder="images"
        inputName="image_url"
        label="Fotoğraf"
        description="Seçilen formata göre fotoğrafı kırpıp yükleyin."
        preset="gallery"
        aspectRatio={ratio}
        outputWidth={1080}
        value={values?.image_url || ""}
      />

      <div className="grid gap-5 md:grid-cols-[1fr_10rem]">
        <div className="space-y-2">
          <label className={labelClass} htmlFor="gallery-image-alt">
            Başlık / Alt Metin
          </label>
          <input
            id="gallery-image-alt"
            name="alt_text"
            defaultValue={values?.alt_text || ""}
            className={inputClass}
            placeholder="Fotoğraf başlığı"
          />
        </div>

        <div className="space-y-2">
          <label className={labelClass} htmlFor="gallery-image-sort">
            Sıra No
          </label>
          <input
            id="gallery-image-sort"
            name="sort_order"
            type="number"
            defaultValue={values?.sort_order ?? 0}
            className={inputClass}
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className={labelClass} htmlFor="gallery-image-caption">
          Açıklama
        </label>
        <textarea
          id="gallery-image-caption"
          name="caption"
          rows={3}
          defaultValue={values?.caption || ""}
          className={inputClass}
          placeholder="Fotoğraf açıklaması"
        />
      </div>

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
