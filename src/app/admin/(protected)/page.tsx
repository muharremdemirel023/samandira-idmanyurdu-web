import Link from "next/link";

const dashboardLinks = [
  {
    title: "Duyurular",
    description: "Duyuru oluşturun, düzenleyin ve yayın durumunu yönetin.",
    href: "/admin/news",
  },
  {
    title: "Ön Kayıtlar",
    description: "Akademi başvurularını inceleyin ve başvuru durumlarını güncelleyin.",
    href: "/admin/pre-registrations",
  },
  {
    title: "Galeri",
    description: "Galeri yönetimi sonraki fazda aktif edilecektir.",
    href: "/admin/gallery",
  },
];

export default function AdminDashboardPage() {
  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow-2xl shadow-black/20">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-orange-400">
          Yönetim Paneli
        </p>
        <h1 className="mt-3 text-2xl font-bold tracking-tight text-white">
          Samandıra İdman Yurdu Yönetim Paneli
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
          Duyurular, ön kayıt başvuruları ve site içerikleri bu panel üzerinden yönetilir.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {dashboardLinks.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="rounded-xl border border-slate-700 bg-slate-900/65 p-5 transition hover:border-orange-400"
          >
            <p className="text-sm font-semibold text-slate-100">{item.title}</p>
            <p className="mt-2 text-sm text-slate-400">{item.description}</p>
          </Link>
        ))}
      </section>
    </div>
  );
}
