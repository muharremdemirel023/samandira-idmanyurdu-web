import {
  createInstagramPost,
  deleteInstagramPost,
  updateInstagramPost,
} from "@/app/admin/(protected)/instagram/actions";
import { ConfirmSubmitButton } from "@/components/admin/ConfirmSubmitButton";
import { createClient } from "@/lib/supabase/server";

type InstagramPost = {
  id: string;
  instagram_url: string | null;
  content_type: string | null;
  title: string | null;
  is_active: boolean | null;
  show_on_home: boolean | null;
  sort_order: number | null;
};

const inputClass =
  "w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-base text-white outline-none transition placeholder:text-slate-500 focus:border-orange-400 focus:ring-2 focus:ring-orange-400/30 sm:text-sm";

const labelClass = "block text-sm font-semibold text-slate-200";

function InstagramFields({ post }: { post?: InstagramPost }) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_10rem_7rem]">
        <div className="space-y-2">
          <label className={labelClass}>Instagram Bağlantısı</label>
          <input
            name="instagram_url"
            required
            defaultValue={post?.instagram_url || ""}
            className={inputClass}
            placeholder="https://www.instagram.com/p/... veya /reel/..."
          />
        </div>
        <div className="space-y-2">
          <label className={labelClass}>Tür</label>
          <select
            name="content_type"
            defaultValue={post?.content_type || "post"}
            className={inputClass}
          >
            <option value="post">Gönderi</option>
            <option value="reel">Reels</option>
          </select>
        </div>
        <div className="space-y-2">
          <label className={labelClass}>Sıralama</label>
          <input
            name="sort_order"
            type="number"
            defaultValue={post?.sort_order ?? 0}
            className={inputClass}
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className={labelClass}>Başlık / Not (isteğe bağlı)</label>
        <input
          name="title"
          defaultValue={post?.title || ""}
          className={inputClass}
          placeholder="Örn. Yaz kampı antrenmanı"
        />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <label className="flex min-h-11 flex-1 items-center gap-3 rounded-xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-sm font-semibold text-slate-200">
          <input
            name="is_active"
            type="checkbox"
            defaultChecked={post?.is_active ?? true}
            className="size-4 accent-orange-500"
          />
          Aktif
        </label>
        <label className="flex min-h-11 flex-1 items-center gap-3 rounded-xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-sm font-semibold text-slate-200">
          <input
            name="show_on_home"
            type="checkbox"
            defaultChecked={post?.show_on_home ?? true}
            className="size-4 accent-orange-500"
          />
          Ana Sayfada Göster
        </label>
      </div>
    </div>
  );
}

export default async function AdminInstagramPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("instagram_posts")
    .select("id,instagram_url,content_type,title,is_active,show_on_home,sort_order")
    .order("sort_order", { ascending: true });
  const posts = (data ?? []) as InstagramPost[];

  return (
    <div className="space-y-6">
      <header className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 sm:p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-orange-400">
          İçerik Yönetimi
        </p>
        <h1 className="mt-3 text-2xl font-bold tracking-tight text-white">
          Instagram Paylaşımları
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
          Ana sayfadaki Instagram bölümünde gösterilecek gönderi ve Reels bağlantılarını yönetin.
        </p>
      </header>

      <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
        <details>
          <summary className="cursor-pointer text-lg font-bold text-white">Paylaşım Ekle</summary>
          <form action={createInstagramPost} className="mt-5 space-y-5 border-t border-slate-800 pt-5">
            <InstagramFields />
            <div className="flex justify-end">
              <ConfirmSubmitButton>Paylaşımı Kaydet</ConfirmSubmitButton>
            </div>
          </form>
        </details>
      </section>

      {posts.length > 0 ? (
        <div className="space-y-3">
          {posts.map((post) => (
            <article key={post.id} className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-400">
                  {post.content_type === "reel" ? "Reels" : "Gönderi"} •{" "}
                  {post.is_active ? "Aktif" : "Pasif"} •{" "}
                  {post.show_on_home ? "Ana sayfada" : "Ana sayfada değil"}
                </p>
                <form action={deleteInstagramPost.bind(null, post.id)}>
                  <ConfirmSubmitButton
                    confirmMessage="Bu Instagram paylaşımını silmek istediğinize emin misiniz?"
                    className="min-h-11 rounded-full border border-red-500/50 px-4 py-2 text-sm font-semibold text-red-300 transition hover:bg-red-500/10 disabled:opacity-60"
                  >
                    Sil
                  </ConfirmSubmitButton>
                </form>
              </div>

              <form
                action={updateInstagramPost.bind(null, post.id)}
                className="mt-4 space-y-5 border-t border-slate-800 pt-4"
              >
                <InstagramFields post={post} />
                <div className="flex justify-end">
                  <ConfirmSubmitButton>Güncelle</ConfirmSubmitButton>
                </div>
              </form>
            </article>
          ))}
        </div>
      ) : (
        <section className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/45 p-6">
          <p className="text-sm font-semibold text-slate-100">Henüz Instagram paylaşımı eklenmedi.</p>
          <p className="mt-2 text-sm text-slate-400">
            Kayıt eklenene kadar ana sayfada mevcut sabit paylaşımlar gösterilmeye devam eder.
          </p>
        </section>
      )}
    </div>
  );
}
