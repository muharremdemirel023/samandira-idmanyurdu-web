import { createVideo } from "@/app/admin/(protected)/videos/actions";
import { VideoForm } from "@/app/admin/(protected)/videos/VideoForm";
import { VideoSortableList } from "@/app/admin/(protected)/videos/VideoSortableList";
import { createClient } from "@/lib/supabase/server";

type VideoItem = {
  id: string;
  title: string | null;
  description: string | null;
  video_url: string | null;
  provider: string | null;
  thumbnail_url: string | null;
  sort_order: number | null;
  is_active: boolean | null;
};

export default async function AdminVideosPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("videos")
    .select("id,title,description,video_url,provider,thumbnail_url,sort_order,is_active")
    .order("sort_order", { ascending: true });
  const videos = (data ?? []) as VideoItem[];

  return (
    <div className="space-y-6">
      <header className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 sm:p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-orange-400">
          İçerik Yönetimi
        </p>
        <h1 className="mt-3 text-2xl font-bold tracking-tight text-white">Videolar</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
          YouTube Shorts ve Instagram Reel bağlantılarını yönetin. Video dosyası yüklenmez.
        </p>
      </header>

      <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
        <details>
          <summary className="cursor-pointer text-lg font-bold text-white">Video Ekle</summary>
          <div className="mt-5 border-t border-slate-800 pt-5">
            <VideoForm action={createVideo} submitLabel="Videoyu Kaydet" />
          </div>
        </details>
      </section>

      <section className="space-y-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-orange-400">
            Videolar
          </p>
          <h2 className="mt-2 text-xl font-bold text-white">Video Listesi</h2>
        </div>
        <VideoSortableList videos={videos} />
      </section>
    </div>
  );
}
