import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Container } from "@/components/ui/Container";
import { createClient } from "@/lib/supabase/server";

type NewsDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

type NewsDetail = {
  title: string | null;
  slug: string | null;
  summary: string | null;
  content: string | null;
  cover_image_url: string | null;
  created_at: string | null;
};

function formatDate(value: string | null) {
  if (!value) return "";

  return new Intl.DateTimeFormat("tr-TR", {
    dateStyle: "long",
    timeZone: "Europe/Istanbul",
  }).format(new Date(value));
}

async function getNews(slug: string) {
  const supabase = await createClient();
  // `.single()` yerine `.limit(1).maybeSingle()` kullanılıyor: slug kolonunda
  // benzersizlik zorunluluğu olmadığından aynı slug'a sahip birden fazla kayıt
  // varsa `.single()` hata döndürüp sayfayı yanlışlıkla 404'e düşürüyordu.
  const { data, error } = await supabase
    .from("news")
    .select("title,slug,summary,content,cover_image_url,created_at")
    .eq("slug", slug)
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("[duyurular/slug] Duyuru alınamadı:", error);
    return null;
  }

  return data as NewsDetail | null;
}

export async function generateMetadata({ params }: NewsDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const news = await getNews(slug);

  return {
    title: news?.title || "Duyuru",
    description: news?.summary || "Samandıra İdman Yurdu duyurusu.",
  };
}

export default async function NewsDetailPage({ params }: NewsDetailPageProps) {
  const { slug } = await params;
  const news = await getNews(slug);

  if (!news) {
    notFound();
  }

  return (
    <main className="flex flex-1 flex-col">
      <article className="relative isolate overflow-hidden pb-14 pt-[calc(var(--header-height)+0.75rem)] md:pb-20 md:pt-[calc(var(--header-height)+1rem)]">
        <div
          aria-hidden
          className="absolute inset-0 -z-20 bg-surface-base"
        />
        <div
          aria-hidden
          className="absolute right-0 top-0 -z-10 h-72 w-72 bg-[radial-gradient(circle,rgba(234,88,12,0.10),transparent_68%)] blur-2xl"
        />

        <Container>
          <header className="max-w-4xl">
            <p className="type-overline club-kicker-line text-accent">
              {formatDate(news.created_at) || "Duyuru"}
            </p>
            <h1 className="type-display mt-5 text-text-primary">{news.title}</h1>
            {news.summary ? <p className="type-lead mt-5 max-w-prose-lead">{news.summary}</p> : null}
          </header>

          {news.cover_image_url ? (
            <div className="mt-10 aspect-video overflow-hidden bg-[#42101c]">
              <img
                src={news.cover_image_url}
                alt={news.title || "Duyuru görseli"}
                className="h-full w-full object-cover"
              />
            </div>
          ) : null}

          <div className="mt-10 max-w-3xl space-y-5 border-l border-accent/45 pl-6">
            {(news.content || news.summary || "")
              .split("\n")
              .map((paragraph) => paragraph.trim())
              .filter(Boolean)
              .map((paragraph) => (
                <p key={paragraph} className="type-body-lg max-w-prose-body text-text-muted">
                  {paragraph}
                </p>
              ))}
          </div>
        </Container>
      </article>
    </main>
  );
}
