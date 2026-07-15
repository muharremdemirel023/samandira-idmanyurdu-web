import Link from "next/link";

import {
  preRegistrationStatusLabels,
  type PreRegistrationStatus,
} from "@/app/admin/(protected)/pre-registrations/status";
import { createClient } from "@/lib/supabase/server";

type RecentPreRegistration = {
  id: string;
  guardian_name?: string | null;
  parent_name?: string | null;
  phone?: string | null;
  birth_year?: string | number | null;
  status?: string | null;
  created_at?: string | null;
};

type RecentContactMessage = {
  id: string;
  full_name: string | null;
  subject: string | null;
  status: string | null;
  created_at: string | null;
};

type CampaignDates = {
  starts_at: string | null;
  ends_at: string | null;
};

const contactStatusLabels: Record<string, string> = {
  new: "Yeni",
  read: "Okundu",
  replied: "Cevaplandı",
  closed: "Kapalı",
};

function formatDate(value?: string | null) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("tr-TR", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Europe/Istanbul",
  }).format(new Date(value));
}

function preRegistrationStatusLabel(status?: string | null) {
  if (status && status in preRegistrationStatusLabels) {
    return preRegistrationStatusLabels[status as PreRegistrationStatus];
  }
  return preRegistrationStatusLabels.new;
}

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  // Her sorgu bağımsız; tablo henüz oluşturulmamışsa ilgili kart 0, liste boş görünür.
  const [
    newPreRegistrations,
    unreadMessages,
    publishedNews,
    activeStaff,
    activeSponsors,
    activeInstagram,
    activeCampaignRows,
    recentPreRegistrations,
    recentMessages,
  ] = await Promise.allSettled([
    supabase
      .from("pre_registrations")
      .select("id", { count: "exact", head: true })
      .or("status.eq.new,status.is.null"),
    supabase
      .from("contact_messages")
      .select("id", { count: "exact", head: true })
      .eq("status", "new"),
    supabase.from("news").select("id", { count: "exact", head: true }).eq("is_active", true),
    supabase.from("staff").select("id", { count: "exact", head: true }).eq("is_active", true),
    supabase.from("sponsors").select("id", { count: "exact", head: true }).eq("is_active", true),
    supabase
      .from("instagram_posts")
      .select("id", { count: "exact", head: true })
      .eq("is_active", true),
    supabase.from("campaigns").select("starts_at,ends_at").eq("is_active", true),
    supabase
      .from("pre_registrations")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("contact_messages")
      .select("id,full_name,subject,status,created_at")
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  const safeCount = (result: (typeof newPreRegistrations)) => {
    if (result.status !== "fulfilled" || result.value.error) return 0;
    return result.value.count ?? 0;
  };

  const now = Date.now();
  const activeCampaigns =
    activeCampaignRows.status === "fulfilled" && !activeCampaignRows.value.error
      ? ((activeCampaignRows.value.data ?? []) as CampaignDates[]).filter((campaign) => {
          if (campaign.starts_at && new Date(campaign.starts_at).getTime() > now) return false;
          if (campaign.ends_at && new Date(campaign.ends_at).getTime() < now) return false;
          return true;
        }).length
      : 0;

  const preRegistrations =
    recentPreRegistrations.status === "fulfilled" && !recentPreRegistrations.value.error
      ? ((recentPreRegistrations.value.data ?? []) as RecentPreRegistration[])
      : [];

  const messages =
    recentMessages.status === "fulfilled" && !recentMessages.value.error
      ? ((recentMessages.value.data ?? []) as RecentContactMessage[])
      : [];

  const summaryCards = [
    {
      title: "Yeni Ön Kayıtlar",
      value: safeCount(newPreRegistrations),
      href: "/admin/pre-registrations",
      icon: "📋",
    },
    {
      title: "Okunmamış Mesajlar",
      value: safeCount(unreadMessages),
      href: "/admin/contact-messages",
      icon: "✉️",
    },
    {
      title: "Yayındaki Duyurular",
      value: safeCount(publishedNews),
      href: "/admin/news",
      icon: "📢",
    },
    {
      title: "Aktif Teknik Kadro",
      value: safeCount(activeStaff),
      href: "/admin/staff",
      icon: "🧑‍🏫",
    },
    {
      title: "Aktif Sponsorlar",
      value: safeCount(activeSponsors),
      href: "/admin/sponsors",
      icon: "🤝",
    },
    {
      title: "Aktif Instagram Paylaşımları",
      value: safeCount(activeInstagram),
      href: "/admin/instagram",
      icon: "📷",
    },
    {
      title: "Aktif Kampanya",
      value: activeCampaigns,
      href: "/admin/campaigns",
      icon: "🎯",
    },
  ];

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

      <section aria-label="Özet kartlar" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {summaryCards.map((card) => (
          <Link
            key={card.href + card.title}
            href={card.href}
            className="rounded-xl border border-slate-700 bg-slate-900/65 p-5 transition hover:border-orange-400"
          >
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-slate-300">{card.title}</p>
              <span aria-hidden className="text-lg">
                {card.icon}
              </span>
            </div>
            <p className="mt-3 text-3xl font-bold tabular-nums text-white">{card.value}</p>
          </Link>
        ))}
      </section>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-bold text-white">Son Ön Kayıtlar</h2>
            <Link
              href="/admin/pre-registrations"
              className="text-sm font-semibold text-orange-300 hover:underline"
            >
              Tümü →
            </Link>
          </div>

          {preRegistrations.length > 0 ? (
            <ul className="mt-4 divide-y divide-slate-800">
              {preRegistrations.map((item) => (
                <li key={item.id}>
                  <Link
                    href="/admin/pre-registrations"
                    className="block px-1 py-3 transition hover:bg-slate-800/50"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="break-words text-sm font-semibold text-white">
                        {item.guardian_name || item.parent_name || "-"}
                      </p>
                      <span className="rounded-full border border-slate-700 px-2.5 py-1 text-xs font-semibold text-slate-300">
                        {preRegistrationStatusLabel(item.status)}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-slate-400">
                      {[item.phone, item.birth_year ? `Doğum: ${item.birth_year}` : null, formatDate(item.created_at)]
                        .filter(Boolean)
                        .join(" • ")}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-sm text-slate-400">Henüz ön kayıt başvurusu yok.</p>
          )}
        </section>

        <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-bold text-white">Son İletişim Mesajları</h2>
            <Link
              href="/admin/contact-messages"
              className="text-sm font-semibold text-orange-300 hover:underline"
            >
              Tümü →
            </Link>
          </div>

          {messages.length > 0 ? (
            <ul className="mt-4 divide-y divide-slate-800">
              {messages.map((message) => (
                <li key={message.id}>
                  <Link
                    href="/admin/contact-messages"
                    className="block px-1 py-3 transition hover:bg-slate-800/50"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="break-words text-sm font-semibold text-white">
                        {message.full_name || "-"}
                      </p>
                      <span className="rounded-full border border-slate-700 px-2.5 py-1 text-xs font-semibold text-slate-300">
                        {contactStatusLabels[message.status || "new"] || "Yeni"}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-slate-400">
                      {[message.subject, formatDate(message.created_at)].filter(Boolean).join(" • ")}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-sm text-slate-400">Henüz iletişim mesajı yok.</p>
          )}
        </section>
      </div>
    </div>
  );
}
