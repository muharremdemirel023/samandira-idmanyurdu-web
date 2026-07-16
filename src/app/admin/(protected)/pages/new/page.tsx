import Link from "next/link";

import { createCustomPage } from "@/app/admin/(protected)/pages/actions";
import { PageForm } from "@/app/admin/(protected)/pages/PageForm";

export default function AdminCreatePagePage() {
  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/pages" className="text-sm font-semibold text-orange-300">
          Sayfalara dön
        </Link>
        <p className="mt-4 text-xs font-semibold uppercase tracking-[0.22em] text-orange-400">
          Site Yönetimi
        </p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-white">Sayfa Ekle</h1>
      </div>

      <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
        <PageForm action={createCustomPage} submitLabel="Kaydet" />
      </section>
    </div>
  );
}
