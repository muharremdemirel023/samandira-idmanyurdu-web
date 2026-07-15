import type { Metadata } from "next";

import { NewsCard, type PublicNewsItem } from "@/components/news/NewsCard";
import { Container } from "@/components/ui/Container";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Duyurular",
  description: "Samandıra İdman Yurdu duyuruları ve akademi bilgilendirmeleri.",
};

async function getActiveNews() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("news")
    .select("id,title,slug,summary,cover_image_url,created_at")
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  return (data ?? []) as PublicNewsItem[];
}

export default async function DuyurularPage() {
  const news = await getActiveNews();

  return (
    <main className="flex flex-1 flex-col">
      <section className="relative isolate overflow-hidden pb-14 pt-[calc(var(--header-height)+0.75rem)] md:pb-20 md:pt-[calc(var(--header-height)+1rem)]">
        <div
          aria-hidden
          className="absolute inset-0 -z-20 bg-surface-base"
        />
        <div
          aria-hidden
          className="absolute right-0 top-0 -z-10 h-72 w-72 bg-[radial-gradient(circle,rgba(234,88,12,0.10),transparent_68%)] blur-2xl"
        />

        <Container>
          <div className="max-w-prose-section">
            <p className="type-overline club-kicker-line text-accent">Kulüp bilgilendirmeleri</p>
            <h1 className="type-display text-text-primary">Duyurular</h1>
            <p className="type-lead mt-5 max-w-prose-lead">
              Akademi kayıt dönemleri, antrenman programları ve kulüp duyuruları bu sayfada paylaşılır.
            </p>
          </div>

          {news.length > 0 ? (
            <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {news.map((item) => (
                <NewsCard key={item.id} news={item} />
              ))}
            </div>
          ) : (
            <section className="mt-10 max-w-3xl border-l border-accent/45 pl-6">
              <h2 className="type-heading-md text-text-primary">Henüz duyuru eklenmedi.</h2>
              <p className="type-body-lg mt-4 max-w-prose-body">
                Yeni duyurular eklendiğinde bu sayfada görüntülenecektir.
              </p>
            </section>
          )}
        </Container>
      </section>
    </main>
  );
}
