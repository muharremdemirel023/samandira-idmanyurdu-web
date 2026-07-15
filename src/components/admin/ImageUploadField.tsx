"use client";

import { useRef, useState, useTransition } from "react";

import { uploadAdminImageAction } from "@/app/admin/(protected)/image-upload/actions";
import { initialAdminImageUploadState } from "@/app/admin/(protected)/image-upload/image-upload-state";
import { adminImageAcceptValue, convertImageFileToJpeg } from "@/lib/images/client-image-conversion";
import type { ImageStorageBucket } from "@/lib/supabase/storage/image-upload";

type ImageUploadFieldProps = {
  bucket: ImageStorageBucket;
  folder?: string;
  label?: string;
  description?: string;
  value?: string;
  inputName?: string;
  onUploaded?: (publicUrl: string) => void;
};

export function ImageUploadField({
  bucket,
  folder,
  label = "Görsel Yükle",
  description = "JPG, PNG, WEBP, HEIC veya HEIF. En fazla 5 MB.",
  value = "",
  inputName = "image_url",
  onUploaded,
}: ImageUploadFieldProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [state, setState] = useState(initialAdminImageUploadState);
  const [currentUrl, setCurrentUrl] = useState(value);
  const [pending, startTransition] = useTransition();

  function uploadSelectedImage() {
    const file = fileInputRef.current?.files?.[0];

    if (!file) {
      setState({
        ok: false,
        message: "Lütfen bir görsel seçin.",
      });
      return;
    }

    startTransition(async () => {
      let uploadFile: File;

      try {
        uploadFile = await convertImageFileToJpeg(file, `admin-image-${Date.now()}.jpg`);
      } catch (error) {
        setState({
          ok: false,
          message: error instanceof Error ? error.message : "Görsel hazırlanamadı.",
        });
        return;
      }

      const formData = new FormData();
      formData.set("bucket", bucket);
      formData.set("folder", folder ?? "");
      formData.set("image", uploadFile);

      const nextState = await uploadAdminImageAction(initialAdminImageUploadState, formData);
      setState(nextState);

      if (nextState.publicUrl) {
        setCurrentUrl(nextState.publicUrl);
        onUploaded?.(nextState.publicUrl);
      }
    });
  }

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-sm font-semibold text-slate-100">{label}</label>
        <p className="mt-1 text-sm text-slate-400">{description}</p>
      </div>

      {currentUrl ? (
        <div className="overflow-hidden rounded-lg border border-white/10 bg-slate-950/40">
          <img src={currentUrl} alt="" className="aspect-video w-full object-cover" />
        </div>
      ) : null}

      <div className="space-y-3">
        <input
          name={inputName}
          type="url"
          value={currentUrl}
          onChange={(event) => setCurrentUrl(event.target.value)}
          className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-base text-white outline-none transition placeholder:text-slate-500 focus:border-orange-400 focus:ring-2 focus:ring-orange-400/30 sm:text-sm"
          placeholder="https://..."
        />
        <input
          ref={fileInputRef}
          type="file"
          accept={adminImageAcceptValue}
          className="block w-full text-sm text-slate-300 file:mr-4 file:min-h-11 file:rounded-md file:border-0 file:bg-blue-500 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-slate-950 hover:file:bg-blue-400"
        />

        <button
          type="button"
          disabled={pending}
          onClick={uploadSelectedImage}
          className="min-h-11 w-full rounded-md bg-blue-500 px-4 py-2 text-sm font-bold text-slate-950 transition hover:bg-blue-400 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
        >
          {pending ? "Yükleniyor..." : "Görsel Yükle"}
        </button>
      </div>

      {state.message ? (
        <p className={state.ok ? "text-sm text-emerald-300" : "text-sm text-red-300"}>
          {state.message}
        </p>
      ) : null}
    </div>
  );
}
