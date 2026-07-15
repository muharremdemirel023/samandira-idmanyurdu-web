import { notFound } from "next/navigation";

import { updateStaff } from "@/app/admin/(protected)/staff/actions";
import { StaffForm } from "@/app/admin/(protected)/staff/StaffForm";
import { createClient } from "@/lib/supabase/server";

type EditStaffPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditStaffPage({ params }: EditStaffPageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: staffMember } = await supabase.from("staff").select("*").eq("id", id).single();

  if (!staffMember) {
    notFound();
  }

  return (
    <div>
      <div className="mb-6 rounded-2xl border border-slate-800 bg-slate-900/70 p-5 sm:p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-orange-400">
          Teknik Kadro
        </p>
        <h1 className="mt-3 text-2xl font-bold tracking-tight text-white">
          Kadro Üyesi Düzenle
        </h1>
      </div>
      <StaffForm action={updateStaff.bind(null, id)} submitLabel="Güncelle" values={staffMember} />
    </div>
  );
}
