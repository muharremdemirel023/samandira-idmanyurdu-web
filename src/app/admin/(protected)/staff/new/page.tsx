import { createStaff } from "@/app/admin/(protected)/staff/actions";
import { StaffForm } from "@/app/admin/(protected)/staff/StaffForm";

export default function NewStaffPage() {
  return (
    <div>
      <div className="mb-6 rounded-2xl border border-slate-800 bg-slate-900/70 p-5 sm:p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-orange-400">
          Teknik Kadro
        </p>
        <h1 className="mt-3 text-2xl font-bold tracking-tight text-white">
          Kadro Üyesi Ekle
        </h1>
      </div>
      <StaffForm action={createStaff} submitLabel="Kaydet" />
    </div>
  );
}
