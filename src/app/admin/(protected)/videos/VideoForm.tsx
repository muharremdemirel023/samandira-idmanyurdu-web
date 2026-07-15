"use client";

import { useMemo, useState } from "react";

import { detectVideoProvider } from "@/app/admin/(protected)/videos/video-provider";
import { ImageCropUploadField } from "@/components/admin/ImageCropUploadField";

type VideoFormValues = {
  title?: string | null;
  description?: string | null;
  video_url?: string | null;
  thumbnail_url?: string | null;
  sort_order?: number | string | null;
  is_active?: boolean | null;
};

type VideoFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  submitLabel: string;
  values?: VideoFormValues;
};

const inputClass =
  "w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-base text-white outline-none transition placeholder:text-slate-500 focus:border-orange-400 focus:ring-2 focus:ring-orange-400/30 sm:text-sm";

const labelClass = "block text-sm font-semibold text-slate-200";

const providerLabels = {
  youtube: "YouTube",
  instagram: "Instagram",
  tiktok: "TikTok",
  other: "Diğer",
};

export function VideoForm({ action, submitLabel, values }: VideoFormProps) {
  const [videoUrl, setVideoUrl] = useState(values?.video_url || "");
  const provider = useMemo(() => detectVideoProvider(videoUrl), [videoUrl]);

  return (
    <form action={action} className="space-y-5">
      <div className="grid gap-5 md:grid-cols-[1fr_10rem]">
        <div className="space-y-2">
          <label className={labelClass} htmlFor="video-title">
            Başlık
          </label>
          <input id="video-title" name="title" required defaultValue={values?.title || ""} className={inputClass} placeholder="Video başlığı" />
        </div>

        <div className="space-y-2">
          <label className={labelClass} htmlFor="video-sort-order">
            Sıra No
          </label>
          <input id="video-sort-order" name="sort_order" type="number" defaultValue={values?.sort_order ?? 0} className={inputClass} />
        </div>
      </div>

      <div className="space-y-2">
        <label className={labelClass} htmlFor="video-description">
          Açıklama
        </label>
        <textarea id="video-description" name="description" rows={3} defaultValue={values?.description || ""} className={inputClass} placeholder="Video açıklaması" />
      </div>

      <div className="space-y-2">
        <label className={labelClass} htmlFor="video-url">
          Video Linki
        </label>
        <input
          id="video-url"
          name="video_url"
          type="url"
          required
          value={videoUrl}
          onChange={(event) => setVideoUrl(event.target.value)}
          className={inputClass}
          placeholder="YouTube Shorts veya Instagram Reel linki"
        />
        <p className="text-sm text-slate-400">Algılanan sağlayıcı: {providerLabels[provider]}</p>
      </div>

      <ImageCropUploadField
        bucket="videos"
        folder="thumbnails"
        inputName="thumbnail_url"
        label="Kapak Görseli"
        description="Video kapak görselini 9:16 oranında kırpıp yükleyin."
        preset="gallery"
        aspectRatio={9 / 16}
        outputWidth={1080}
        value={values?.thumbnail_url || ""}
      />

      <label className="flex min-h-11 items-center gap-3 rounded-xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-sm font-semibold text-slate-200">
        <input name="is_active" type="checkbox" defaultChecked={values?.is_active ?? true} className="size-4 accent-orange-500" />
        Aktif Olarak Göster
      </label>

      <div className="flex justify-end">
        <button type="submit" className="min-h-11 w-full rounded-full bg-orange-500 px-6 py-3 text-sm font-bold text-white transition hover:bg-orange-600 sm:w-auto">
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
