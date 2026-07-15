import { createFaq, deleteFaq, updateFaq } from "@/app/admin/(protected)/faq/actions";
import { ConfirmSubmitButton } from "@/components/admin/ConfirmSubmitButton";
import { createClient } from "@/lib/supabase/server";

type FaqRow = {
  id: string;
  question: string | null;
  answer: string | null;
  category: string | null;
  is_active: boolean | null;
  sort_order: number | null;
};

const inputClass =
  "w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-base text-white outline-none transition placeholder:text-slate-500 focus:border-orange-400 focus:ring-2 focus:ring-orange-400/30 sm:text-sm";

const labelClass = "block text-sm font-semibold text-slate-200";

function FaqFields({ row }: { row?: FaqRow }) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className={labelClass}>Soru</label>
        <input
          name="question"
          required
          defaultValue={row?.question || ""}
          className={inputClass}
          placeholder="Kayıt nasıl yapılır?"
        />
      </div>

      <div className="space-y-2">
        <label className={labelClass}>Cevap</label>
        <textarea
          name="answer"
          rows={3}
          required
          defaultValue={row?.answer || ""}
          className={inputClass}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_7rem]">
        <div className="space-y-2">
          <label className={labelClass}>Kategori (isteğe bağlı)</label>
          <input
            name="category"
            defaultValue={row?.category || ""}
            className={inputClass}
            placeholder="Kayıt, Antrenman, Genel..."
          />
        </div>
        <div className="space-y-2">
          <label className={labelClass}>Sıralama</label>
          <input
            name="sort_order"
            type="number"
            defaultValue={row?.sort_order ?? 0}
            className={inputClass}
          />
        </div>
      </div>

      <label className="flex min-h-11 items-center gap-3 rounded-xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-sm font-semibold text-slate-200">
        <input
          name="is_active"
          type="checkbox"
          defaultChecked={row?.is_active ?? true}
          className="size-4 accent-orange-500"
        />
        Aktif Olarak Göster
      </label>
    </div>
  );
}

export default async function AdminFaqPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("faqs")
    .select("id,question,answer,category,is_active,sort_order")
    .order("sort_order", { ascending: true });
  const rows = (data ?? []) as FaqRow[];

  return (
    <div className="space-y-6">
      <header className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 sm:p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-orange-400">
          İçerik Yönetimi
        </p>
        <h1 className="mt-3 text-2xl font-bold tracking-tight text-white">Sık Sorulan Sorular</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
          Public SSS sayfasında ve ana sayfa SSS bölümünde gösterilen soruları yönetin.
        </p>
      </header>

      <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
        <details>
          <summary className="cursor-pointer text-lg font-bold text-white">Soru Ekle</summary>
          <form action={createFaq} className="mt-5 space-y-5 border-t border-slate-800 pt-5">
            <FaqFields />
            <div className="flex justify-end">
              <ConfirmSubmitButton>Soruyu Kaydet</ConfirmSubmitButton>
            </div>
          </form>
        </details>
      </section>

      {rows.length > 0 ? (
        <div className="space-y-3">
          {rows.map((row) => (
            <article key={row.id} className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-400">
                  {row.category || "Genel"} • {row.is_active ? "Aktif" : "Pasif"}
                </p>
                <form action={deleteFaq.bind(null, row.id)}>
                  <ConfirmSubmitButton
                    confirmMessage="Bu soruyu silmek istediğinize emin misiniz?"
                    className="min-h-11 rounded-full border border-red-500/50 px-4 py-2 text-sm font-semibold text-red-300 transition hover:bg-red-500/10 disabled:opacity-60"
                  >
                    Sil
                  </ConfirmSubmitButton>
                </form>
              </div>

              <form action={updateFaq.bind(null, row.id)} className="mt-4 space-y-5 border-t border-slate-800 pt-4">
                <FaqFields row={row} />
                <div className="flex justify-end">
                  <ConfirmSubmitButton>Güncelle</ConfirmSubmitButton>
                </div>
              </form>
            </article>
          ))}
        </div>
      ) : (
        <section className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/45 p-6">
          <p className="text-sm font-semibold text-slate-100">Henüz soru eklenmedi.</p>
          <p className="mt-2 text-sm text-slate-400">
            Kayıt eklenene kadar public sayfalarda mevcut sabit sorular gösterilmeye devam eder.
          </p>
        </section>
      )}
    </div>
  );
}
