import Link from "next/link";

import { deleteCustomPage, setCustomPagePublished } from "@/app/admin/(protected)/pages/actions";
import { createClient } from "@/lib/supabase/server";

type CustomPageItem = {
  id: string;
  title: string | null;
  slug: string | null;
  is_active: boolean | null;
  created_at: string | null;
  show_in_menu: boolean | null;
  show_in_footer: boolean | null;
  sort_order: number | null;
};

function formatDate(value: string | null) {
  if (!value) return "-";

  return new Intl.DateTimeFormat("tr-TR", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Europe/Istanbul",
  }).format(new Date(value));
}

export default async function AdminPagesPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("custom_pages")
    .select("id,title,slug,is_active,created_at,show_in_menu,show_in_footer,sort_order")
    .order("created_at", { ascending: false });
  const pages = (data ?? []) as CustomPageItem[];

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 rounded-2xl border border-slate-800 bg-slate-900/70 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-orange-400">
            Site Yönetimi
          </p>
          <h1 className="mt-3 text-2xl font-bold tracking-tight text-white">Sayfalar</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
            Menü veya footer&apos;a bağlı olmayan serbest içerik sayfaları oluşturun. Her sayfa
            /sayfa/&lt;bağlantı-adı&gt; adresinde yayınlanır.
          </p>
        </div>
        <Link
          href="/admin/pages/new"
          className="inline-flex min-h-11 items-center justify-center rounded-full bg-orange-500 px-5 py-3 text-sm font-bold text-white transition hover:bg-orange-600"
        >
          Sayfa Ekle
        </Link>
      </header>

      {pages.length > 0 ? (
        <div className="space-y-3">
          {pages.map((item) => (
            <article key={item.id} className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-400">
                    {item.is_active ? "Yayında" : "Taslak"}
                  </p>
                  <h2 className="mt-2 break-words text-lg font-bold text-white">
                    {item.title || "Başlıksız Sayfa"}
                  </h2>
                  <p className="mt-2 break-words text-sm text-slate-400">
                    Adres: /sayfa/{item.slug || "-"}
                  </p>
                  <p className="mt-1 text-sm text-slate-400">Tarih: {formatDate(item.created_at)}</p>
                  <p className="mt-2 text-xs font-semibold text-slate-400">
                    {item.show_in_menu ? "Menüde" : null}
                    {item.show_in_menu && item.show_in_footer ? " • " : null}
                    {item.show_in_footer ? "Footer'da" : null}
                    {!item.show_in_menu && !item.show_in_footer ? "Menü/Footer'da gösterilmiyor" : null}
                    {" "}
                    (Sıra: {item.sort_order ?? 0})
                  </p>
                </div>

                <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap lg:justify-end">
                  <Link
                    href={`/admin/pages/${item.id}`}
                    className="inline-flex min-h-11 items-center justify-center rounded-full border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-orange-400 hover:text-orange-300"
                  >
                    Düzenle
                  </Link>
                  <form action={setCustomPagePublished.bind(null, item.id, !item.is_active)}>
                    <button
                      type="submit"
                      className="min-h-11 w-full rounded-full border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-orange-400 hover:text-orange-300 sm:w-auto"
                    >
                      {item.is_active ? "Yayından Kaldır" : "Yayınla"}
                    </button>
                  </form>
                  <form action={deleteCustomPage.bind(null, item.id)}>
                    <button
                      type="submit"
                      className="min-h-11 w-full rounded-full border border-red-500/60 px-4 py-2 text-sm font-semibold text-red-200 transition hover:bg-red-500/10 sm:w-auto"
                    >
                      Sil
                    </button>
                  </form>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <section className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/45 p-6">
          <p className="text-sm font-semibold text-slate-100">Henüz sayfa eklenmedi.</p>
          <p className="mt-2 text-sm text-slate-400">İlk sayfayı ekleyerek başlayabilirsiniz.</p>
        </section>
      )}
    </div>
  );
}
