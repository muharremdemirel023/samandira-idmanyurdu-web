import { notFound } from "next/navigation";

import { updateNews } from "@/app/admin/(protected)/news/actions";
import { NewsForm } from "@/app/admin/(protected)/news/NewsForm";
import { createClient } from "@/lib/supabase/server";

type EditNewsPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditNewsPage({ params }: EditNewsPageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: news } = await supabase.from("news").select("*").eq("id", id).single();

  if (!news) {
    notFound();
  }

  return (
    <div>
      <div className="mb-6 rounded-2xl border border-slate-800 bg-slate-900/70 p-5 sm:p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-orange-400">
          Duyurular
        </p>
        <h1 className="mt-3 text-2xl font-bold tracking-tight text-white">Duyuru Düzenle</h1>
      </div>
      <NewsForm action={updateNews.bind(null, id)} submitLabel="Güncelle" values={news} />
    </div>
  );
}
