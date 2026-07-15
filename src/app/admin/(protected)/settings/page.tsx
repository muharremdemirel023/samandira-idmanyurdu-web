import { saveSiteSettings } from "@/app/admin/(protected)/settings/actions";
import { ConfirmSubmitButton } from "@/components/admin/ConfirmSubmitButton";
import { createClient } from "@/lib/supabase/server";

type SettingsRow = Record<string, string | null>;

const inputClass =
  "w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-base text-white outline-none transition placeholder:text-slate-500 focus:border-orange-400 focus:ring-2 focus:ring-orange-400/30 sm:text-sm";

const labelClass = "block text-sm font-semibold text-slate-200";

const textFields: Array<{ name: string; label: string; placeholder?: string }> = [
  { name: "academy_name", label: "Akademi Adı", placeholder: "Samandıra İdman Yurdu S.K." },
  { name: "academy_short_name", label: "Kısa Akademi Adı", placeholder: "Samandıra İ.Y." },
  { name: "phone", label: "Telefon", placeholder: "+90 ..." },
  { name: "whatsapp", label: "WhatsApp Numarası", placeholder: "+90 ..." },
  { name: "email", label: "E-posta" },
  { name: "address", label: "Adres" },
  { name: "maps_url", label: "Google Maps Bağlantısı", placeholder: "https://maps.google.com/..." },
  { name: "instagram_url", label: "Instagram URL", placeholder: "https://www.instagram.com/..." },
  { name: "working_hours", label: "Çalışma Saatleri", placeholder: "Hafta sonu 09:00–12:00" },
  { name: "header_logo_url", label: "Header Logo URL", placeholder: "/Samandiralogo.png" },
  { name: "footer_logo_url", label: "Footer Logo URL" },
  { name: "footer_description", label: "Footer Açıklaması" },
  { name: "seo_title", label: "SEO Başlığı" },
  { name: "seo_description", label: "SEO Açıklaması" },
  { name: "canonical_url", label: "Canonical Site URL", placeholder: "https://www.samandiraidmanyurdu.com" },
];

export default async function AdminSettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  const { saved } = await searchParams;
  const supabase = await createClient();
  const { data } = await supabase.from("site_settings").select("*").eq("id", 1).maybeSingle();
  const settings = (data ?? {}) as SettingsRow;

  return (
    <div className="space-y-6">
      <header className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 sm:p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-orange-400">
          Site Yönetimi
        </p>
        <h1 className="mt-3 text-2xl font-bold tracking-tight text-white">Site Ayarları</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
          İletişim bilgileri, logolar ve SEO alanları. Boş bırakılan alanlarda sitedeki mevcut
          varsayılan değerler kullanılır.
        </p>
      </header>

      {saved ? (
        <p className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm font-semibold text-emerald-300">
          Site ayarları kaydedildi.
        </p>
      ) : null}

      <form
        action={saveSiteSettings}
        className="space-y-5 rounded-2xl border border-slate-800 bg-slate-900/60 p-5 sm:p-6"
      >
        <div className="grid gap-5 md:grid-cols-2">
          {textFields.map((field) => (
            <div key={field.name} className="space-y-2">
              <label className={labelClass} htmlFor={`settings-${field.name}`}>
                {field.label}
              </label>
              <input
                id={`settings-${field.name}`}
                name={field.name}
                defaultValue={settings[field.name] || ""}
                placeholder={field.placeholder}
                className={inputClass}
              />
            </div>
          ))}
        </div>

        <p className="text-xs text-slate-400">
          Not: SEO alanları kaydedilir ancak sitedeki metadata şu an güvenilirlik nedeniyle koddaki
          mevcut değerlerle çalışmaya devam eder.
        </p>

        <div className="flex justify-end">
          <ConfirmSubmitButton>Ayarları Kaydet</ConfirmSubmitButton>
        </div>
      </form>
    </div>
  );
}
