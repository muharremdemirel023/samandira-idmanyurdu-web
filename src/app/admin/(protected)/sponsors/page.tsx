import { createSponsor } from "@/app/admin/(protected)/sponsors/actions";
import { SponsorForm } from "@/app/admin/(protected)/sponsors/SponsorForm";
import { SponsorSortableList } from "@/app/admin/(protected)/sponsors/SponsorSortableList";
import { createClient } from "@/lib/supabase/server";

type SponsorItem = {
  id: string;
  name: string | null;
  website_url: string | null;
  logo_url: string | null;
  sort_order: number | null;
  is_active: boolean | null;
};

export default async function AdminSponsorsPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("sponsors")
    .select("id,name,website_url,logo_url,sort_order,is_active")
    .order("sort_order", { ascending: true });
  const sponsors = (data ?? []) as SponsorItem[];

  return (
    <div className="space-y-6">
      <header className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 sm:p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-orange-400">
          İçerik Yönetimi
        </p>
        <h1 className="mt-3 text-2xl font-bold tracking-tight text-white">Sponsorlar</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
          Sponsor logolarını, firma bağlantılarını, sıralamayı ve yayın durumunu yönetin.
        </p>
      </header>

      <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
        <details>
          <summary className="cursor-pointer text-lg font-bold text-white">Sponsor Ekle</summary>
          <div className="mt-5 border-t border-slate-800 pt-5">
            <SponsorForm action={createSponsor} submitLabel="Sponsoru Kaydet" />
          </div>
        </details>
      </section>

      <section className="space-y-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-orange-400">
            Sponsorlar
          </p>
          <h2 className="mt-2 text-xl font-bold text-white">Sponsor Listesi</h2>
        </div>
        <SponsorSortableList sponsors={sponsors} />
      </section>
    </div>
  );
}
