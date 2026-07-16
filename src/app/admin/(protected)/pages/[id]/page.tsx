import { notFound } from "next/navigation";

import { updateCustomPage } from "@/app/admin/(protected)/pages/actions";
import { PageForm } from "@/app/admin/(protected)/pages/PageForm";
import { createClient } from "@/lib/supabase/server";

type EditCustomPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditCustomPagePage({ params }: EditCustomPageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: page } = await supabase.from("custom_pages").select("*").eq("id", id).single();

  if (!page) {
    notFound();
  }

  return (
    <div>
      <div className="mb-6 rounded-2xl border border-slate-800 bg-slate-900/70 p-5 sm:p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-orange-400">
          Site Yönetimi
        </p>
        <h1 className="mt-3 text-2xl font-bold tracking-tight text-white">Sayfa Düzenle</h1>
      </div>
      <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
        <PageForm action={updateCustomPage.bind(null, id)} submitLabel="Güncelle" values={page} />
      </section>
    </div>
  );
}
