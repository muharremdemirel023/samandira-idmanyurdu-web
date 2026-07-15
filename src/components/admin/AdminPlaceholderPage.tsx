type AdminPlaceholderPageProps = {
  title: string;
};

export function AdminPlaceholderPage({ title }: AdminPlaceholderPageProps) {
  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-2xl shadow-black/20 sm:p-6">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-orange-400">
        Yönetim Paneli
      </p>
      <h1 className="mt-3 text-2xl font-bold tracking-tight text-white">{title}</h1>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
        Bu modül yakında aktif olacaktır.
      </p>
    </section>
  );
}
