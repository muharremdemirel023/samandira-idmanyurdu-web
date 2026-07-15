import Link from "next/link";

import { createNews } from "@/app/admin/(protected)/news/actions";
import { NewsForm } from "@/app/admin/(protected)/news/NewsForm";

export default function AdminCreateNewsPage() {
  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/news" className="text-sm font-semibold text-orange-300">
          Back to news
        </Link>
        <p className="mt-4 text-xs font-semibold uppercase tracking-[0.22em] text-orange-400">
          News
        </p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-white">
          Create News
        </h1>
      </div>

      <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
      <div className="mb-6 rounded-2xl border border-slate-800 bg-slate-900/70 p-5 sm:p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-orange-400">
          Duyurular
        </p>
        <h1 className="mt-3 text-2xl font-bold tracking-tight text-white">Duyuru Ekle</h1>
      </div>
      <NewsForm action={createNews} submitLabel="Kaydet" />
      </section>
    </div>
  );
}
