"use client";

import { useRef, useState, useTransition } from "react";

import { uploadAdminVideoAction } from "@/app/admin/(protected)/video-upload/actions";
import { initialAdminVideoUploadState } from "@/app/admin/(protected)/video-upload/video-upload-state";

type VideoFileUploadFieldProps = {
  folder?: string;
  onUploaded: (publicUrl: string) => void;
};

export function VideoFileUploadField({ folder, onUploaded }: VideoFileUploadFieldProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [state, setState] = useState(initialAdminVideoUploadState);
  const [pending, startTransition] = useTransition();

  function uploadSelectedVideo() {
    const file = fileInputRef.current?.files?.[0];

    if (!file) {
      setState({
        ok: false,
        message: "Lütfen bir video seçin.",
      });
      return;
    }

    startTransition(async () => {
      const formData = new FormData();
      formData.set("folder", folder ?? "");
      formData.set("video", file);

      const nextState = await uploadAdminVideoAction(initialAdminVideoUploadState, formData);
      setState(nextState);

      if (nextState.publicUrl) {
        onUploaded(nextState.publicUrl);
      }
    });
  }

  return (
    <div className="space-y-3">
      <input
        ref={fileInputRef}
        type="file"
        accept="video/mp4,video/webm,video/quicktime,video/x-m4v"
        className="block w-full text-sm text-slate-300 file:mr-4 file:min-h-11 file:rounded-md file:border-0 file:bg-blue-500 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-slate-950 hover:file:bg-blue-400"
      />

      <button
        type="button"
        disabled={pending}
        onClick={uploadSelectedVideo}
        className="min-h-11 w-full rounded-md bg-blue-500 px-4 py-2 text-sm font-bold text-slate-950 transition hover:bg-blue-400 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
      >
        {pending ? "Yükleniyor..." : "Video Yükle"}
      </button>

      <p className="text-sm text-slate-400">MP4, WEBM veya MOV. En fazla 50 MB.</p>

      {state.message ? (
        <p className={state.ok ? "text-sm text-emerald-300" : "text-sm text-red-300"}>{state.message}</p>
      ) : null}
    </div>
  );
}
