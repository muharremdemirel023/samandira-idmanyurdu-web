"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import type { CSSProperties } from "react";

import { uploadAdminImageAction } from "@/app/admin/(protected)/image-upload/actions";
import { initialAdminImageUploadState } from "@/app/admin/(protected)/image-upload/image-upload-state";
import { adminImageAcceptValue, canvasToJpegFile, loadImageSource } from "@/lib/images/client-image-conversion";
import type { ImageStorageBucket } from "@/lib/supabase/storage/image-upload";

type CropPreset = "news-cover" | "hero" | "gallery" | "sponsor-logo" | "staff-portrait";

type ImageCropUploadFieldProps = {
  bucket: ImageStorageBucket;
  folder?: string;
  inputName: string;
  label: string;
  value?: string;
  preset: CropPreset;
  aspectRatio?: number;
  mode?: "cover" | "contain";
  description?: string;
  outputWidth?: number;
};

const presetLabels: Record<CropPreset, string> = {
  "news-cover": "Duyuru kapak gÃ¶rseli",
  hero: "Slider / hero gÃ¶rseli",
  gallery: "Galeri gÃ¶rseli",
  "sponsor-logo": "Sponsor logosu",
  "staff-portrait": "Teknik kadro profil fotoÄŸrafÄ±",
};

function getDefaultRatio(preset: CropPreset) {
  if (preset === "staff-portrait" || preset === "gallery") return 4 / 5;
  if (preset === "sponsor-logo") return 1;

  return 16 / 9;
}


export function ImageCropUploadField({
  bucket,
  folder,
  inputName,
  label,
  value = "",
  preset,
  aspectRatio,
  mode = "cover",
  description,
  outputWidth,
}: ImageCropUploadFieldProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [state, setState] = useState(initialAdminImageUploadState);
  const [currentUrl, setCurrentUrl] = useState(value);
  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [scale, setScale] = useState(1);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const [pending, startTransition] = useTransition();

  const ratio = aspectRatio ?? getDefaultRatio(preset);
  const canvasWidth = outputWidth ?? (preset === "staff-portrait" || preset === "gallery" ? 1080 : 1280);
  const canvasHeight = Math.round(canvasWidth / ratio);

  useEffect(() => {
    if (!sourceFile || !canvasRef.current) return;

    const file = sourceFile;
    let cancelled = false;
    let revokeSource: (() => void) | undefined;

    async function drawPreview() {
      try {
        const { image, revoke } = await loadImageSource(file);
        if (cancelled || !canvasRef.current) {
          revoke();
          return;
        }
        revokeSource = revoke;

      const canvas = canvasRef.current;
      canvas.width = canvasWidth;
      canvas.height = canvasHeight;
      const context = canvas.getContext("2d");
      if (!context) return;

      context.clearRect(0, 0, canvas.width, canvas.height);
      context.fillStyle = "#08142D";
      context.fillRect(0, 0, canvas.width, canvas.height);

      const baseScale =
        mode === "contain"
          ? Math.min(canvas.width / image.width, canvas.height / image.height)
          : Math.max(canvas.width / image.width, canvas.height / image.height);
      const finalScale = baseScale * scale;
      const drawWidth = image.width * finalScale;
      const drawHeight = image.height * finalScale;
      const maxMoveX = Math.max(0, (drawWidth - canvas.width) / 2);
      const maxMoveY = Math.max(0, (drawHeight - canvas.height) / 2);
      const x = (canvas.width - drawWidth) / 2 + (offsetX / 100) * maxMoveX;
      const y = (canvas.height - drawHeight) / 2 + (offsetY / 100) * maxMoveY;

      context.drawImage(image, x, y, drawWidth, drawHeight);
      } catch (error) {
        if (!cancelled) {
          setState({
            ok: false,
            message: error instanceof Error ? error.message : "GÃ¶rsel tarayÄ±cÄ±da iÅŸlenemedi.",
          });
        }
      }
    }

    drawPreview();

    return () => {
      cancelled = true;
      revokeSource?.();
    };
  }, [canvasHeight, canvasWidth, mode, offsetX, offsetY, scale, sourceFile]);

  function selectImage(file: File | undefined) {
    if (!file) return;

    setSourceFile(file);
    setScale(1);
    setOffsetX(0);
    setOffsetY(0);
    setState(initialAdminImageUploadState);
  }

  function uploadCroppedImage() {
    if (!canvasRef.current) {
      setState({ ok: false, message: "LÃ¼tfen Ã¶nce bir gÃ¶rsel seÃ§in." });
      return;
    }

    startTransition(async () => {
      const file = await canvasToJpegFile(canvasRef.current!, `${preset}-${Date.now()}.jpg`);
      const formData = new FormData();
      formData.set("bucket", bucket);
      formData.set("folder", folder ?? "");
      formData.set("image", file);

      const nextState = await uploadAdminImageAction(initialAdminImageUploadState, formData);
      setState(nextState);

      if (nextState.publicUrl) {
        setCurrentUrl(nextState.publicUrl);
      }
    });
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-semibold text-slate-100">{label}</label>
        <p className="mt-1 text-sm text-slate-400">
          {description ?? `${presetLabels[preset]} iÃ§in gÃ¶rsel seÃ§in, kÄ±rpÄ±n ve yÃ¼kleyin.`}
        </p>
      </div>

      <input
        type="hidden"
        name={inputName}
        value={currentUrl}
        readOnly
      />

      {currentUrl ? (
        <div
          className="overflow-hidden rounded-xl border border-white/10 bg-slate-950/40"
          style={{ aspectRatio: ratio }}
        >
          <img src={currentUrl} alt="" className="h-full w-full object-cover" />
        </div>
      ) : null}

      <div className="space-y-4 rounded-2xl border border-slate-800 bg-slate-950/45 p-4">
        <input
          ref={fileInputRef}
          type="file"
          accept={adminImageAcceptValue}
          onChange={(event) => selectImage(event.target.files?.[0])}
          className="block w-full text-sm text-slate-300 file:mr-4 file:min-h-11 file:rounded-md file:border-0 file:bg-blue-500 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-slate-950 hover:file:bg-blue-400"
        />

        {sourceFile ? (
          <>
            <canvas
              ref={canvasRef}
              className="w-full rounded-xl bg-[#08142D] object-contain"
              style={{ aspectRatio: ratio } as CSSProperties}
            />

            <div className="grid gap-4 sm:grid-cols-3">
              <label className="space-y-2 text-sm font-semibold text-slate-200">
                Ã–lÃ§ek
                <input
                  type="range"
                  min="1"
                  max="3"
                  step="0.01"
                  value={scale}
                  onChange={(event) => setScale(Number(event.target.value))}
                  className="w-full accent-orange-500"
                />
              </label>
              <label className="space-y-2 text-sm font-semibold text-slate-200">
                Yatay Konum
                <input
                  type="range"
                  min="-100"
                  max="100"
                  step="1"
                  value={offsetX}
                  onChange={(event) => setOffsetX(Number(event.target.value))}
                  className="w-full accent-orange-500"
                />
              </label>
              <label className="space-y-2 text-sm font-semibold text-slate-200">
                Dikey Konum
                <input
                  type="range"
                  min="-100"
                  max="100"
                  step="1"
                  value={offsetY}
                  onChange={(event) => setOffsetY(Number(event.target.value))}
                  className="w-full accent-orange-500"
                />
              </label>
            </div>

            <button
              type="button"
              disabled={pending}
              onClick={uploadCroppedImage}
              className="min-h-11 w-full rounded-full bg-blue-500 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-blue-400 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
            >
              {pending ? "YÃ¼kleniyor..." : "KÄ±rpÄ±lmÄ±ÅŸ GÃ¶rseli YÃ¼kle"}
            </button>
          </>
        ) : null}
      </div>

      {state.message ? (
        <p className={state.ok ? "text-sm text-emerald-300" : "text-sm text-red-300"}>
          {state.message}
        </p>
      ) : null}
    </div>
  );
}
