import Link from "next/link";

import { createSlug } from "@/lib/slug";

export type PublicNewsItem = {
  id: string;
  title: string | null;
  slug: string | null;
  summary: string | null;
  cover_image_url: string | null;
  created_at: string | null;
};

function formatDate(value: string | null) {
  if (!value) return "";

  return new Intl.DateTimeFormat("tr-TR", {
    dateStyle: "medium",
    timeZone: "Europe/Istanbul",
  }).format(new Date(value));
}

export function getNewsHref(news: PublicNewsItem) {
  return `/duyurular/${news.slug || createSlug(news.title || news.id)}`;
}

export function NewsCard({ news }: { news: PublicNewsItem }) {
  return (
    <article className="group overflow-hidden rounded-2xl border border-border-subtle bg-white shadow-shell">
      <Link href={getNewsHref(news)} className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent">
        <div className="aspect-video overflow-hidden bg-surface-muted">
          {news.cover_image_url ? (
            <img
              src={news.cover_image_url}
              alt={news.title || "Duyuru görseli"}
              className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
            />
          ) : (
            <div className="flex h-full items-end bg-[radial-gradient(ellipse_at_50%_18%,rgba(251,146,60,0.18),transparent_38%),linear-gradient(155deg,#6d1f2e_0%,#42101c_52%,#26060d_100%)] p-5">
              <p className="type-label-caps-accent text-accent">Duyuru</p>
            </div>
          )}
        </div>

        <div className="p-5">
          {news.created_at ? (
            <p className="type-label-caps-accent text-accent">{formatDate(news.created_at)}</p>
          ) : null}
          <h3 className="mt-3 text-xl font-bold leading-tight text-maroon-deep">
            {news.title || "Başlıksız Duyuru"}
          </h3>
          {news.summary ? (
            <p className="type-body mt-3 line-clamp-3 text-text-muted">{news.summary}</p>
          ) : null}
          <p className="mt-5 text-sm font-bold text-accent">Duyuruyu Oku</p>
        </div>
      </Link>
    </article>
  );
}
