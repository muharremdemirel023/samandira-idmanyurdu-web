"use client";

import { useEffect, useRef, useState } from "react";

import { createClient } from "@/lib/supabase/client";
import {
  assertValidVideoFile,
  canvasToThumbnailBlob,
  createAutoThumbnailStoragePath,
  createVideoStoragePath,
  videoStorageBucket,
} from "@/lib/video-upload-constraints";

export type AutoThumbnailResult = { url: string; path: string };

type VideoFileUploadFieldProps = {
  folder?: string;
  thumbnailFolder?: string;
  onUploaded: (publicUrl: string) => void;
  onThumbnailGenerated?: (result: AutoThumbnailResult | null) => void;
};

function formatSeconds(value: number) {
  return `${value.toFixed(1)}sn`;
}

/** Video dosyasını Vercel Server Action üzerinden geçirmeden doğrudan tarayıcıdan Supabase Storage'a yükler; ayrıca seçilen videodan otomatik 16:9 kapak görseli üretir. */
export function VideoFileUploadField({ folder, thumbnailFolder, onUploaded, onThumbnailGenerated }: VideoFileUploadFieldProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const didAutoCaptureRef = useRef(false);
  const previewUrlRef = useRef<string | null>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [duration, setDuration] = useState(0);
  const [currentSecond, setCurrentSecond] = useState(0);
  const [hasCapturedFrame, setHasCapturedFrame] = useState(false);

  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [uploading, setUploading] = useState(false);

  const [thumbnailStatus, setThumbnailStatus] = useState<{ ok: boolean; text: string } | null>(null);
  const [thumbnailBusy, setThumbnailBusy] = useState(false);

  useEffect(() => {
    return () => {
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    };
  }, []);

  function handleFileSelected(file: File | undefined) {
    if (!file) return;

    try {
      assertValidVideoFile(file);
    } catch (error) {
      setMessage({ ok: false, text: error instanceof Error ? error.message : "Video geçersiz." });
      return;
    }

    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);

    const nextPreviewUrl = URL.createObjectURL(file);
    previewUrlRef.current = nextPreviewUrl;

    didAutoCaptureRef.current = false;
    setSelectedFile(file);
    setPreviewUrl(nextPreviewUrl);
    setDuration(0);
    setCurrentSecond(0);
    setHasCapturedFrame(false);
    setMessage(null);
    setThumbnailStatus(null);
    onThumbnailGenerated?.(null);
  }

  function captureFrameToCanvas() {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || !video.videoWidth || !video.videoHeight) return false;

    canvas.width = 1280;
    canvas.height = 720;
    const context = canvas.getContext("2d");
    if (!context) return false;

    const scale = Math.max(canvas.width / video.videoWidth, canvas.height / video.videoHeight);
    const drawWidth = video.videoWidth * scale;
    const drawHeight = video.videoHeight * scale;
    const dx = (canvas.width - drawWidth) / 2;
    const dy = (canvas.height - drawHeight) / 2;

    context.clearRect(0, 0, canvas.width, canvas.height);
    context.drawImage(video, dx, dy, drawWidth, drawHeight);
    return true;
  }

  async function generateAndUploadThumbnail() {
    if (thumbnailBusy) return;

    const captured = captureFrameToCanvas();
    setHasCapturedFrame(captured);

    if (!captured || !canvasRef.current) {
      setThumbnailStatus({ ok: false, text: "Kapak görseli oluşturulamadı. Video yine de yüklenebilir." });
      onThumbnailGenerated?.(null);
      return;
    }

    setThumbnailBusy(true);
    setThumbnailStatus(null);

    try {
      const { blob, mime, extension } = await canvasToThumbnailBlob(canvasRef.current, 0.82);

      const supabase = createClient();
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setThumbnailStatus({
          ok: false,
          text: "Kapak yüklemek için yönetici oturumu gereklidir. Video yine de yüklenebilir.",
        });
        onThumbnailGenerated?.(null);
        return;
      }

      const path = createAutoThumbnailStoragePath(extension, thumbnailFolder);
      const file = new File([blob], `auto-cover-${Date.now()}.${extension}`, { type: mime });

      const { error: uploadError } = await supabase.storage.from(videoStorageBucket).upload(path, file, {
        cacheControl: "31536000",
        contentType: mime,
        upsert: false,
      });

      if (uploadError) {
        setThumbnailStatus({
          ok: false,
          text: `Kapak görseli yüklenemedi: ${uploadError.message}. Video yine de yüklenebilir.`,
        });
        onThumbnailGenerated?.(null);
        return;
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from(videoStorageBucket).getPublicUrl(path);

      onThumbnailGenerated?.({ url: publicUrl, path });
      setThumbnailStatus({ ok: true, text: "Kapak görseli otomatik oluşturuldu." });
    } catch (error) {
      setThumbnailStatus({
        ok: false,
        text:
          error instanceof Error
            ? `${error.message} Video yine de yüklenebilir.`
            : "Kapak görseli oluşturulamadı. Video yine de yüklenebilir.",
      });
      onThumbnailGenerated?.(null);
    } finally {
      setThumbnailBusy(false);
    }
  }

  function handleLoadedMetadata() {
    const video = videoRef.current;
    if (!video) return;

    const total = Number.isFinite(video.duration) ? video.duration : 0;
    const target = total > 0 && total < 1 ? total / 2 : total >= 1 ? 1 : 0;

    setDuration(total);
    setCurrentSecond(target);

    try {
      video.currentTime = target;
    } catch {
      captureFrameToCanvas();
    }
  }

  function handleSeeked() {
    const captured = captureFrameToCanvas();
    setHasCapturedFrame(captured);

    if (captured && !didAutoCaptureRef.current) {
      didAutoCaptureRef.current = true;
      void generateAndUploadThumbnail();
    }
  }

  function handleSliderChange(value: number) {
    setCurrentSecond(value);
    const video = videoRef.current;
    if (!video) return;

    try {
      video.currentTime = value;
    } catch {
      // Bazı tarayıcılar henüz arama yapılabilir değilken hata fırlatabilir; kullanıcı yeniden dener.
    }
  }

  async function uploadSelectedVideo() {
    if (uploading) return;

    const file = selectedFile ?? fileInputRef.current?.files?.[0];

    if (!file) {
      setMessage({ ok: false, text: "Lütfen bir video seçin." });
      return;
    }

    try {
      assertValidVideoFile(file);
    } catch (error) {
      setMessage({ ok: false, text: error instanceof Error ? error.message : "Video geçersiz." });
      return;
    }

    setUploading(true);
    setMessage(null);

    try {
      const supabase = createClient();

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setMessage({ ok: false, text: "Video yüklemek için yönetici oturumu gereklidir. Lütfen tekrar giriş yapın." });
        return;
      }

      const path = createVideoStoragePath(file, folder);
      const { error: uploadError } = await supabase.storage.from(videoStorageBucket).upload(path, file, {
        cacheControl: "31536000",
        contentType: file.type,
        upsert: false,
      });

      if (uploadError) {
        const text =
          uploadError.message === "Bucket not found"
            ? `"${videoStorageBucket}" adlı depolama alanı Supabase projesinde bulunamadı. Lütfen Supabase panelinden oluşturun.`
            : uploadError.message.toLowerCase().includes("row-level security") ||
                uploadError.message.toLowerCase().includes("permission")
              ? "Yükleme izniniz yok. Yönetici oturumunuzun süresi dolmuş olabilir, tekrar giriş yapmayı deneyin."
              : `Video yüklenemedi: ${uploadError.message}`;
        setMessage({ ok: false, text });
        return;
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from(videoStorageBucket).getPublicUrl(path);

      onUploaded(publicUrl);
      setMessage({ ok: true, text: "Video başarıyla yüklendi." });
    } catch (error) {
      setMessage({
        ok: false,
        text: error instanceof Error ? error.message : "Video yüklenirken beklenmeyen bir hata oluştu.",
      });
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <input
          ref={fileInputRef}
          type="file"
          accept="video/mp4,video/webm,video/quicktime,video/x-m4v"
          disabled={uploading}
          onChange={(event) => handleFileSelected(event.target.files?.[0])}
          className="block w-full text-sm text-slate-300 file:mr-4 file:min-h-11 file:rounded-md file:border-0 file:bg-blue-500 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-slate-950 hover:file:bg-blue-400 disabled:opacity-60"
        />

        <button
          type="button"
          disabled={uploading || !selectedFile}
          onClick={uploadSelectedVideo}
          className="min-h-11 w-full rounded-md bg-blue-500 px-4 py-2 text-sm font-bold text-slate-950 transition hover:bg-blue-400 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
        >
          {uploading ? "Yükleniyor..." : "Video Yükle"}
        </button>

        <p className="text-sm text-slate-400">MP4, WEBM veya MOV. En fazla 50 MB.</p>

        {message ? (
          <p className={message.ok ? "text-sm text-emerald-300" : "text-sm text-red-300"} role="status">
            {message.text}
          </p>
        ) : null}
      </div>

      {previewUrl ? (
        <div className="space-y-3 rounded-2xl border border-slate-800 bg-slate-950/45 p-4">
          <p className="text-sm font-semibold text-slate-200">Video Önizleme ve Kapak Görseli</p>

          <video
            ref={videoRef}
            src={previewUrl}
            muted
            playsInline
            controls
            onLoadedMetadata={handleLoadedMetadata}
            onSeeked={handleSeeked}
            className="w-full max-w-xs rounded-xl border border-slate-700 bg-black"
          />

          <div className="space-y-2">
            <label htmlFor="video-cover-second" className="block text-sm font-semibold text-slate-200">
              Kapak Karesi ({formatSeconds(currentSecond)} / {formatSeconds(duration)})
            </label>
            <input
              id="video-cover-second"
              type="range"
              min={0}
              max={Math.max(duration, 0.1)}
              step={0.1}
              value={currentSecond}
              disabled={duration <= 0}
              onChange={(event) => handleSliderChange(Number(event.target.value))}
              aria-label="Kapak görseli için video saniyesi seçin"
              className="w-full accent-orange-500 disabled:opacity-50"
            />
          </div>

          <canvas
            ref={canvasRef}
            aria-hidden="true"
            className={`w-full rounded-xl border border-slate-700 bg-black ${hasCapturedFrame ? "" : "hidden"}`}
            style={{ aspectRatio: 16 / 9 }}
          />

          <button
            type="button"
            disabled={thumbnailBusy || duration <= 0}
            onClick={() => void generateAndUploadThumbnail()}
            className="min-h-11 w-full rounded-md border border-orange-500 px-4 py-2 text-sm font-bold text-orange-300 transition hover:bg-orange-500/10 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
          >
            {thumbnailBusy ? "Kapak Oluşturuluyor..." : "Kapak Görselini Yeniden Oluştur"}
          </button>

          {thumbnailStatus ? (
            <p
              className={thumbnailStatus.ok ? "text-sm text-emerald-300" : "text-sm text-amber-300"}
              role="status"
            >
              {thumbnailStatus.text}
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
