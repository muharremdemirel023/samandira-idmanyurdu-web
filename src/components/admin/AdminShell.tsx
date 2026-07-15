"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { useState } from "react";

type AdminMenuItem = {
  label: string;
  href: string;
};

type AdminMenuGroup = {
  title: string;
  items: AdminMenuItem[];
};

type AdminShellProps = {
  children: ReactNode;
  logoutAction: () => Promise<void>;
};

const menuGroups: AdminMenuGroup[] = [
  {
    title: "İçerik Yönetimi",
    items: [
      { label: "Duyurular", href: "/admin/news" },
      { label: "Instagram Paylaşımları", href: "/admin/instagram" },
      { label: "Teknik Kadro", href: "/admin/staff" },
      { label: "Antrenman Programı", href: "/admin/training-schedule" },
      { label: "Yaş Grupları", href: "/admin/age-groups" },
      { label: "Sık Sorulan Sorular", href: "/admin/faq" },
      { label: "Sponsorlar", href: "/admin/sponsors" },
    ],
  },
  {
    title: "Medya",
    items: [
      { label: "Galeri", href: "/admin/gallery" },
      { label: "Videolar", href: "/admin/videos" },
    ],
  },
  {
    title: "Başvurular",
    items: [
      { label: "Ön Kayıtlar", href: "/admin/pre-registrations" },
      { label: "İletişim Mesajları", href: "/admin/contact-messages" },
    ],
  },
  {
    title: "Site Yönetimi",
    items: [
      { label: "Kampanya Yönetimi", href: "/admin/campaigns" },
      { label: "Ana Sayfa İçerikleri", href: "/admin/home-content" },
      { label: "Site Ayarları", href: "/admin/settings" },
    ],
  },
];

function AdminNavigation({
  logoutAction,
  onNavigate,
}: {
  logoutAction: () => Promise<void>;
  onNavigate?: () => void;
}) {
  return (
    <nav className="space-y-7" aria-label="Yönetim menüsü">
      <Link
        href="/admin"
        onClick={onNavigate}
        className="block rounded-xl bg-slate-950/70 px-4 py-3 text-sm font-bold text-slate-100 transition hover:text-orange-300"
      >
        Yönetim Paneli
      </Link>

      {menuGroups.map((group) => (
        <section key={group.title} className="space-y-2">
          <h2 className="px-1 text-[0.7rem] font-bold uppercase tracking-[0.2em] text-orange-400">
            {group.title}
          </h2>
          <ul className="space-y-1">
            {group.items.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={onNavigate}
                  className="block min-h-11 rounded-lg px-3 py-2.5 text-sm font-semibold text-slate-300 transition hover:bg-slate-800/80 hover:text-white"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}

      <section className="space-y-2 border-t border-slate-800 pt-5">
        <h2 className="px-1 text-[0.7rem] font-bold uppercase tracking-[0.2em] text-orange-400">
          Hesap
        </h2>
        <form action={logoutAction}>
          <button
            type="submit"
            className="min-h-11 w-full rounded-lg px-3 py-2.5 text-left text-sm font-semibold text-slate-300 transition hover:bg-slate-800/80 hover:text-white"
          >
            Çıkış Yap
          </button>
        </form>
      </section>
    </nav>
  );
}

export function AdminShell({ children, logoutAction }: AdminShellProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-950/95 backdrop-blur">
        <div className="mx-auto flex min-h-16 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-orange-400">
              Yönetim Paneli
            </p>
            <p className="text-sm font-semibold text-slate-100">Samandıra İdman Yurdu</p>
          </div>

          <button
            type="button"
            className="min-h-11 rounded-full border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-orange-400 hover:text-orange-300 lg:hidden"
            aria-expanded={menuOpen}
            aria-controls="admin-mobile-menu"
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? "Menüyü Kapat" : "Menü"}
          </button>

          <form action={logoutAction} className="hidden lg:block">
            <button
              type="submit"
              className="min-h-11 rounded-full border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-orange-400 hover:text-orange-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400"
            >
              Çıkış Yap
            </button>
          </form>
        </div>
      </header>

      {menuOpen ? (
        <div id="admin-mobile-menu" className="border-b border-slate-800 bg-slate-950 px-4 py-5 lg:hidden">
          <AdminNavigation logoutAction={logoutAction} onNavigate={() => setMenuOpen(false)} />
        </div>
      ) : null}

      <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-6 sm:px-5 lg:grid-cols-[17rem_minmax(0,1fr)] lg:py-8">
        <aside className="hidden rounded-2xl border border-slate-800 bg-slate-900/55 p-5 lg:block">
          <AdminNavigation logoutAction={logoutAction} />
        </aside>

        <main className="min-w-0">{children}</main>
      </div>
    </div>
  );
}
