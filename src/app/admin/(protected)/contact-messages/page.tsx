import {
  deleteContactMessage,
  updateContactMessage,
} from "@/app/admin/(protected)/contact-messages/actions";
import { ConfirmSubmitButton } from "@/components/admin/ConfirmSubmitButton";
import { createClient } from "@/lib/supabase/server";

type ContactMessage = {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  subject: string | null;
  message: string | null;
  status: string | null;
  admin_note: string | null;
  created_at: string | null;
};

const statusLabels: Record<string, string> = {
  new: "Yeni",
  read: "Okundu",
  replied: "Cevaplandı",
  closed: "Kapalı",
};

const inputClass =
  "w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-base text-white outline-none transition placeholder:text-slate-500 focus:border-orange-400 focus:ring-2 focus:ring-orange-400/30 sm:text-sm";

function formatDate(value: string | null) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("tr-TR", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Europe/Istanbul",
  }).format(new Date(value));
}

function toWhatsAppHref(phone: string) {
  const digits = phone.replace(/\D/g, "");
  return `https://wa.me/${digits.startsWith("0") ? `9${digits}` : digits}`;
}

export default async function AdminContactMessagesPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("contact_messages")
    .select("*")
    .order("created_at", { ascending: false });
  const messages = (data ?? []) as ContactMessage[];

  return (
    <div className="space-y-6">
      <header className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 sm:p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-orange-400">
          Başvurular
        </p>
        <h1 className="mt-3 text-2xl font-bold tracking-tight text-white">İletişim Mesajları</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
          Gelen mesajları görüntüleyin, durumlarını güncelleyin ve yönetici notu ekleyin.
        </p>
      </header>

      {messages.length > 0 ? (
        <div className="space-y-3">
          {messages.map((message) => (
            <article key={message.id} className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-400">
                  {statusLabels[message.status || "new"] || "Yeni"} • {formatDate(message.created_at)}
                </p>
                <form action={deleteContactMessage.bind(null, message.id)}>
                  <ConfirmSubmitButton
                    confirmMessage="Bu mesajı silmek istediğinize emin misiniz?"
                    className="min-h-11 rounded-full border border-red-500/50 px-4 py-2 text-sm font-semibold text-red-300 transition hover:bg-red-500/10 disabled:opacity-60"
                  >
                    Sil
                  </ConfirmSubmitButton>
                </form>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-400">
                    Gönderen
                  </p>
                  <p className="mt-1 break-words text-sm font-semibold text-white">
                    {message.full_name || "-"}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-400">
                    Konu
                  </p>
                  <p className="mt-1 break-words text-sm font-semibold text-white">
                    {message.subject || "-"}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-400">
                    İletişim
                  </p>
                  <div className="mt-1 flex flex-wrap gap-3 text-sm font-semibold">
                    {message.email ? (
                      <a className="text-orange-300 hover:underline" href={`mailto:${message.email}`}>
                        {message.email}
                      </a>
                    ) : null}
                    {message.phone ? (
                      <a
                        className="text-emerald-300 hover:underline"
                        href={toWhatsAppHref(message.phone)}
                        target="_blank"
                        rel="noreferrer noopener"
                      >
                        WhatsApp: {message.phone}
                      </a>
                    ) : null}
                    {!message.email && !message.phone ? (
                      <span className="text-slate-400">-</span>
                    ) : null}
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-400">
                    Mesaj
                  </p>
                  <p className="mt-1 whitespace-pre-line break-words text-sm text-slate-300">
                    {message.message || "-"}
                  </p>
                </div>
              </div>

              <form
                action={updateContactMessage.bind(null, message.id)}
                className="mt-4 grid gap-3 border-t border-slate-800 pt-4 sm:grid-cols-[10rem_minmax(0,1fr)_auto]"
              >
                <select
                  name="status"
                  defaultValue={message.status || "new"}
                  aria-label="Mesaj durumu"
                  className={inputClass}
                >
                  {Object.entries(statusLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
                <input
                  name="admin_note"
                  defaultValue={message.admin_note || ""}
                  placeholder="Yönetici notu (isteğe bağlı)"
                  aria-label="Yönetici notu"
                  className={inputClass}
                />
                <ConfirmSubmitButton>Kaydet</ConfirmSubmitButton>
              </form>
            </article>
          ))}
        </div>
      ) : (
        <section className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/45 p-6">
          <p className="text-sm font-semibold text-slate-100">Henüz iletişim mesajı yok.</p>
          <p className="mt-2 text-sm text-slate-400">
            Yeni mesajlar geldiğinde burada listelenecektir.
          </p>
        </section>
      )}
    </div>
  );
}
