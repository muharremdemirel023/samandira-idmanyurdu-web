import Link from "next/link";

import { SectionReveal } from "@/components/motion/SectionReveal";
import { NewsCard, type PublicNewsItem } from "@/components/news/NewsCard";
import { Container } from "@/components/ui/Container";
import { createClient } from "@/lib/supabase/server";

async function getLatestNews() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("news")
    .select("id,title,slug,summary,cover_image_url,created_at")
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(3);

  return (data ?? []) as PublicNewsItem[];
}

export async function LatestNewsSection() {
  const news = await getLatestNews();

  return (
    <section className="club-section py-[var(--space-section-y-mobile)] md:py-[var(--space-section-y-desktop)]">
      <Container>
        <SectionReveal staggerIndex={0} className="stack-section-intro max-w-prose-section">
          <p className="type-overline club-kicker-line text-accent">Kulüpten haberler</p>
          <h2 className="type-heading-lg text-text-primary">Son Duyurular</h2>
          <p className="type-body-lg max-w-prose-body">
            Akademi programları, etkinlikler ve kulüp bilgilendirmeleri.
          </p>
        </SectionReveal>

        {news.length > 0 ? (
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {news.map((item) => (
              <NewsCard key={item.id} news={item} />
            ))}
          </div>
        ) : (
          <p className="type-body-lg mt-10 max-w-prose-body text-text-muted">
            Henüz duyuru eklenmedi.
          </p>
        )}

        <Link
          href="/duyurular"
          className="mt-8 inline-flex min-h-11 items-center justify-center rounded-full border border-border-subtle px-6 py-3 text-sm font-bold text-text-primary transition hover:border-accent hover:text-accent"
        >
          Tüm Duyurular
        </Link>
      </Container>
    </section>
  );
}
