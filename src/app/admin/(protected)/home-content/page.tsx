import { saveHomeContent } from "@/app/admin/(protected)/home-content/actions";
import { ConfirmSubmitButton } from "@/components/admin/ConfirmSubmitButton";
import { createClient } from "@/lib/supabase/server";

type HomeContentRow = Record<string, string | null>;

const inputClass =
  "w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-base text-white outline-none transition placeholder:text-slate-500 focus:border-orange-400 focus:ring-2 focus:ring-orange-400/30 sm:text-sm";

const labelClass = "block text-sm font-semibold text-slate-200";

const groups: Array<{
  title: string;
  fields: Array<{ name: string; label: string; textarea?: boolean }>;
}> = [
  {
    title: "Hero Bölümü",
    fields: [
      { name: "hero_overline", label: "Üst Etiket" },
      { name: "hero_headline", label: "Başlık (satırlar için Enter kullanın)", textarea: true },
      { name: "hero_lead", label: "Açıklama", textarea: true },
      { name: "cta_primary_label", label: "1. Buton Metni" },
      { name: "cta_primary_href", label: "1. Buton Bağlantısı" },
      { name: "cta_secondary_label", label: "2. Buton Metni" },
      { name: "cta_secondary_href", label: "2. Buton Bağlantısı" },
    ],
  },
  {
    title: "Ücretler Bölümü",
    fields: [
      { name: "fees_title", label: "Başlık" },
      { name: "fees_subtitle", label: "Açıklama", textarea: true },
    ],
  },
  {
    title: "Teknik Kadro Bölümü",
    fields: [
      { name: "staff_title", label: "Başlık" },
      { name: "staff_subtitle", label: "Açıklama", textarea: true },
    ],
  },
  {
    title: "Instagram Bölümü",
    fields: [
      { name: "instagram_title", label: "Başlık" },
      { name: "instagram_subtitle", label: "Açıklama", textarea: true },
    ],
  },
  {
    title: "Duyurular Bölümü",
    fields: [
      { name: "news_title", label: "Başlık" },
      { name: "news_subtitle", label: "Açıklama", textarea: true },
    ],
  },
];

export default async function AdminHomeContentPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  const { saved } = await searchParams;
  const supabase = await createClient();
  const { data } = await supabase.from("home_content").select("*").eq("id", 1).maybeSingle();
  const content = (data ?? {}) as HomeContentRow;

  return (
    <div className="space-y-6">
      <header className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 sm:p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-orange-400">
          Site Yönetimi
        </p>
        <h1 className="mt-3 text-2xl font-bold tracking-tight text-white">Ana Sayfa İçerikleri</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
          Ana sayfadaki temel metinler. Boş bırakılan alanlarda mevcut varsayılan metinler
          kullanılır.
        </p>
      </header>

      {saved ? (
        <p className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm font-semibold text-emerald-300">
          Ana sayfa içerikleri kaydedildi.
        </p>
      ) : null}

      <form action={saveHomeContent} className="space-y-6">
        {groups.map((group) => (
          <section
            key={group.title}
            className="space-y-5 rounded-2xl border border-slate-800 bg-slate-900/60 p-5 sm:p-6"
          >
            <h2 className="text-lg font-bold text-white">{group.title}</h2>
            <div className="grid gap-5 md:grid-cols-2">
              {group.fields.map((field) => (
                <div
                  key={field.name}
                  className={field.textarea ? "space-y-2 md:col-span-2" : "space-y-2"}
                >
                  <label className={labelClass} htmlFor={`home-${field.name}`}>
                    {field.label}
                  </label>
                  {field.textarea ? (
                    <textarea
                      id={`home-${field.name}`}
                      name={field.name}
                      rows={3}
                      defaultValue={content[field.name] || ""}
                      className={inputClass}
                    />
                  ) : (
                    <input
                      id={`home-${field.name}`}
                      name={field.name}
                      defaultValue={content[field.name] || ""}
                      className={inputClass}
                    />
                  )}
                </div>
              ))}
            </div>
          </section>
        ))}

        <div className="flex justify-end">
          <ConfirmSubmitButton>İçerikleri Kaydet</ConfirmSubmitButton>
        </div>
      </form>
    </div>
  );
}
