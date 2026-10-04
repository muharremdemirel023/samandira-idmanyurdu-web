import { saveHomeContent } from "@/app/admin/(protected)/home-content/actions";
import { ConfirmSubmitButton } from "@/components/admin/ConfirmSubmitButton";
import { HeroManagementForm } from "@/components/admin/HeroManagementForm";
import type { HomeContent } from "@/lib/content";
import { resolveHeroContent } from "@/lib/hero-content";
import { createClient } from "@/lib/supabase/server";

const inputClass =
  "w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-base text-white outline-none transition placeholder:text-slate-500 focus:border-orange-400 focus:ring-2 focus:ring-orange-400/30 sm:text-sm";

const labelClass = "block text-sm font-semibold text-slate-200";

const groups: Array<{
  title: string;
  fields: Array<{ name: string; label: string; textarea?: boolean }>;
}> = [
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
  searchParams: Promise<{ saved?: string; heroSaved?: string; heroError?: string }>;
}) {
  const { saved, heroSaved, heroError } = await searchParams;
  const supabase = await createClient();
  const { data } = await supabase.from("home_content").select("*").eq("id", 1).maybeSingle();
  const content = (data ?? {}) as Partial<HomeContent>;
  const hero = resolveHeroContent(content);

  return (
    <div className="space-y-6">
      <header className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 sm:p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-orange-400">
          Site Yönetimi
        </p>
        <h1 className="mt-3 text-2xl font-bold tracking-tight text-white">Hero Bölümü Yönetimi</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
          Ana sayfa Hero alanını canlı önizleyin; görselleri, metinleri, aksiyonları ve medya öğelerini tek yerden yönetin.
        </p>
      </header>

      {heroSaved ? (
        <p className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm font-semibold text-emerald-300">
          Hero ayarları kaydedildi.
        </p>
      ) : null}

      {heroError ? (
        <p className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-300">
          Hero ayarları kaydedilemedi. Lütfen tekrar deneyin.
        </p>
      ) : null}

      <HeroManagementForm initialHero={hero} />

      {saved ? (
        <p className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm font-semibold text-emerald-300">
          Ana sayfa içerikleri kaydedildi.
        </p>
      ) : null}

      <form action={saveHomeContent} className="space-y-6">
        <header className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 sm:p-6">
          <h2 className="text-lg font-bold text-white">Diğer Ana Sayfa İçerikleri</h2>
          <p className="mt-2 text-sm text-slate-400">Ücretler, teknik kadro, Instagram ve duyuru başlıkları.</p>
        </header>
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
                      defaultValue={String(content[field.name as keyof HomeContent] || "")}
                      className={inputClass}
                    />
                  ) : (
                    <input
                      id={`home-${field.name}`}
                      name={field.name}
                      defaultValue={String(content[field.name as keyof HomeContent] || "")}
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
