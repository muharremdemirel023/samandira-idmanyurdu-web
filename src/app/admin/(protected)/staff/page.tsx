import Link from "next/link";

import { deleteStaff } from "@/app/admin/(protected)/staff/actions";
import { createClient } from "@/lib/supabase/server";

type StaffItem = {
  id: string;
  name: string | null;
  title: string | null;
  photo_url: string | null;
  sort_order: number | null;
  is_active: boolean | null;
};

export default async function AdminStaffPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("staff")
    .select("id,name,title,photo_url,sort_order,is_active")
    .order("sort_order", { ascending: true });
  const staff = (data ?? []) as StaffItem[];

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 rounded-2xl border border-slate-800 bg-slate-900/70 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-orange-400">
            İçerik Yönetimi
          </p>
          <h1 className="mt-3 text-2xl font-bold tracking-tight text-white">Teknik Kadro</h1>
        </div>
        <Link
          href="/admin/staff/new"
          className="inline-flex min-h-11 items-center justify-center rounded-full bg-orange-500 px-5 py-3 text-sm font-bold text-white transition hover:bg-orange-600"
        >
          Kadro Üyesi Ekle
        </Link>
      </header>

      {staff.length > 0 ? (
        <div className="space-y-3">
          {staff.map((member) => (
            <article key={member.id} className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 gap-4">
                  <div className="h-20 w-16 shrink-0 overflow-hidden rounded-xl bg-slate-950">
                    {member.photo_url ? (
                      <img src={member.photo_url} alt="" className="h-full w-full object-cover" />
                    ) : null}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-400">
                      {member.is_active ? "Aktif" : "Pasif"}
                    </p>
                    <h2 className="mt-1 break-words text-lg font-bold text-white">
                      {member.name || "İsimsiz"}
                    </h2>
                    <p className="mt-1 break-words text-sm text-slate-400">{member.title || "-"}</p>
                  </div>
                </div>

                <div className="flex flex-col gap-2 sm:flex-row">
                  <Link
                    href={`/admin/staff/${member.id}`}
                    className="inline-flex min-h-11 items-center justify-center rounded-full border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-orange-400 hover:text-orange-300"
                  >
                    Düzenle
                  </Link>
                  <form action={deleteStaff.bind(null, member.id)}>
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
          <p className="text-sm font-semibold text-slate-100">Henüz teknik kadro üyesi yok.</p>
          <p className="mt-2 text-sm text-slate-400">İlk teknik kadro üyesini ekleyerek başlayabilirsiniz.</p>
        </section>
      )}
    </div>
  );
}
