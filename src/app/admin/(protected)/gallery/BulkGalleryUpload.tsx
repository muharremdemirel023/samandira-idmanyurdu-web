"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import {
  createGalleryImagesBulk,
  type GalleryAspectRatio,
} from "@/app/admin/(protected)/gallery/actions";
import {
  initialAdminImageUploadState,
  uploadAdminImageAction,
} from "@/app/admin/(protected)/image-upload/actions";
import { adminImageAcceptValue, loadImageSource } from "@/lib/images/client-image-conversion";

type GalleryAlbumOption = {
  id: string;
  title: string | null;
};

type BulkGalleryUploadProps = {
  albums: GalleryAlbumOption[];
};

type UploadResult = {
  name: string;
  ok: boolean;
  message: string;
};

const inputClass =
  "w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-base text-white outline-none transition placeholder:text-slate-500 focus:border-orange-400 focus:ring-2 focus:ring-orange-400/30 sm:text-sm";

async function resizeToGalleryFile(file: File) {
  const { image, revoke } = await loadImageSource(file);
  const canvas = document.createElement("canvas");
  canvas.width = 1080;
  canvas.height = 1350;
  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Görsel hazırlanamadı.");
  }

  context.fillStyle = "#08142D";
  context.fillRect(0, 0, canvas.width, canvas.height);

  const scale = Math.max(canvas.width / image.width, canvas.height / image.height);
  const drawWidth = image.width * scale;
  const drawHeight = image.height * scale;
  const x = (canvas.width - drawWidth) / 2;
  const y = (canvas.height - drawHeight) / 2;
  context.drawImage(image, x, y, drawWidth, drawHeight);
  revoke();

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((nextBlob) => {
      if (nextBlob) resolve(nextBlob);
      else reject(new Error("Görsel hazırlanamadı."));
    }, "image/jpeg", 0.9);
  });

  return new File([blob], `${file.name.replace(/\.[^.]+$/, "")}-galeri.jpg`, {
    type: "image/jpeg",
  });
}

export function BulkGalleryUpload({ albums }: BulkGalleryUploadProps) {
  const router = useRouter();
  const [albumId, setAlbumId] = useState("");
  const [results, setResults] = useState<UploadResult[]>([]);
  const [pending, startTransition] = useTransition();

  function uploadFiles(files: FileList | null) {
    if (!files?.length) {
      setResults([{ name: "Seçim", ok: false, message: "Lütfen fotoğraf seçin." }]);
      return;
    }

    const selectedFiles = Array.from(files).slice(0, 20);

    startTransition(async () => {
      const nextResults: UploadResult[] = [];
      const uploadedItems: Array<{
        album_id?: string | null;
        image_url: string;
        alt_text?: string | null;
        caption?: string | null;
        aspect_ratio: GalleryAspectRatio;
      }> = [];

      for (const file of selectedFiles) {
        try {
          const preparedFile = await resizeToGalleryFile(file);
          const formData = new FormData();
          formData.set("bucket", "gallery");
          formData.set("folder", "images");
          formData.set("image", preparedFile);

          const uploadState = await uploadAdminImageAction(initialAdminImageUploadState, formData);

          if (!uploadState.ok || !uploadState.publicUrl) {
            nextResults.push({
              name: file.name,
              ok: false,
              message: uploadState.message || "Fotoğraf yüklenemedi.",
            });
            setResults([...nextResults]);
            continue;
          }

          uploadedItems.push({
            album_id: albumId || null,
            image_url: uploadState.publicUrl,
            alt_text: file.name.replace(/\.[^.]+$/, ""),
            caption: null,
            aspect_ratio: "4:5",
          });
          nextResults.push({
            name: file.name,
            ok: true,
            message: "Yüklendi.",
          });
          setResults([...nextResults]);
        } catch (error) {
          nextResults.push({
            name: file.name,
            ok: false,
            message: error instanceof Error ? error.message : "Fotoğraf hazırlanamadı.",
          });
          setResults([...nextResults]);
        }
      }

      if (uploadedItems.length > 0) {
        const saveState = await createGalleryImagesBulk(uploadedItems);
        setResults((current) => [
          ...current,
          {
            name: "Kayıt",
            ok: saveState.ok,
            message: saveState.message,
          },
        ]);
        if (saveState.ok) {
          router.refresh();
        }
      }
    });
  }

  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-400">
          Toplu Fotoğraf Yükle
        </p>
        <p className="mt-2 text-sm text-slate-300">
          En fazla 20 fotoğraf seçebilirsiniz. Çoklu yüklemede format otomatik olarak Dikey 4:5 / 1080x1350 uygulanır.
        </p>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-[1fr_1.4fr]">
        <label className="space-y-2 text-sm font-semibold text-slate-200">
          Albüm
          <select value={albumId} onChange={(event) => setAlbumId(event.target.value)} className={inputClass}>
            <option value="">Albüm seçilmedi</option>
            {albums.map((album) => (
              <option key={album.id} value={album.id}>
                {album.title || "Başlıksız Albüm"}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-2 text-sm font-semibold text-slate-200">
          Fotoğraflar
          <input
            type="file"
            accept={adminImageAcceptValue}
            multiple
            disabled={pending}
            onChange={(event) => uploadFiles(event.target.files)}
            className="block w-full text-sm text-slate-300 file:mr-4 file:min-h-11 file:rounded-md file:border-0 file:bg-blue-500 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-slate-950 hover:file:bg-blue-400"
          />
        </label>
      </div>

      {pending ? <p className="mt-4 text-sm font-semibold text-orange-300">Yükleniyor...</p> : null}

      {results.length > 0 ? (
        <ul className="mt-4 space-y-2">
          {results.map((result, index) => (
            <li
              key={`${result.name}-${index}`}
              className={result.ok ? "text-sm text-emerald-300" : "text-sm text-red-300"}
            >
              {result.name}: {result.message}
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
