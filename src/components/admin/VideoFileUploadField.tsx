"use client";

import { useRef, useState } from "react";

import { createClient } from "@/lib/supabase/client";
import {
  assertValidVideoFile,
  createVideoStoragePath,
  videoStorageBucket,
} from "@/lib/video-upload-constraints";

type VideoFileUploadFieldProps = {
  folder?: string;
  onUploaded: (publicUrl: string) => void;
};

/** Video dosyasını Vercel Server Action üzerinden geçirmeden doğrudan tarayıcıdan Supabase Storage'a yükler. */
export function VideoFileUploadField({ folder, onUploaded }: VideoFileUploadFieldProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [uploading, setUploading] = useState(false);

  async function uploadSelectedVideo() {
    if (uploading) return;

    const file = fileInputRef.current?.files?.[0];

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
    <div className="space-y-3">
      <input
        ref={fileInputRef}
        type="file"
        accept="video/mp4,video/webm,video/quicktime,video/x-m4v"
        disabled={uploading}
        className="block w-full text-sm text-slate-300 file:mr-4 file:min-h-11 file:rounded-md file:border-0 file:bg-blue-500 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-slate-950 hover:file:bg-blue-400 disabled:opacity-60"
      />

      <button
        type="button"
        disabled={uploading}
        onClick={uploadSelectedVideo}
        className="min-h-11 w-full rounded-md bg-blue-500 px-4 py-2 text-sm font-bold text-slate-950 transition hover:bg-blue-400 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
      >
        {uploading ? "Yükleniyor..." : "Video Yükle"}
      </button>

      <p className="text-sm text-slate-400">MP4, WEBM veya MOV. En fazla 50 MB.</p>

      {message ? (
        <p className={message.ok ? "text-sm text-emerald-300" : "text-sm text-red-300"}>{message.text}</p>
      ) : null}
    </div>
  );
}
