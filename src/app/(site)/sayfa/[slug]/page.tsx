import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Container } from "@/components/ui/Container";
import { createClient } from "@/lib/supabase/server";

type CustomPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

type CustomPageDetail = {
  title: string | null;
  slug: string | null;
  summary: string | null;
  content: string | null;
  cover_image_url: string | null;
};

async function getCustomPage(slug: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("custom_pages")
    .select("title,slug,summary,content,cover_image_url")
    .eq("slug", slug)
    .eq("is_active", true)
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("[sayfa/slug] Sayfa alınamadı:", error);
    return null;
  }

  return data as CustomPageDetail | null;
}

export async function generateMetadata({ params }: CustomPageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = await getCustomPage(slug);

  return {
    title: page?.title || "Sayfa",
    description: page?.summary || "Samandıra İdman Yurdu",
  };
}

export default async function CustomPage({ params }: CustomPageProps) {
  const { slug } = await params;
  const page = await getCustomPage(slug);

  if (!page) {
    notFound();
  }

  return (
    <main className="flex flex-1 flex-col">
      <article className="relative isolate overflow-hidden pb-14 pt-[calc(var(--header-height)+0.75rem)] md:pb-20 md:pt-[calc(var(--header-height)+1rem)]">
        <div aria-hidden className="absolute inset-0 -z-20 bg-surface-base" />
        <div
          aria-hidden
          className="absolute right-0 top-0 -z-10 h-72 w-72 bg-[radial-gradient(circle,rgba(234,88,12,0.10),transparent_68%)] blur-2xl"
        />

        <Container>
          <header className="max-w-4xl">
            <h1 className="type-display mt-5 text-text-primary">{page.title}</h1>
            {page.summary ? <p className="type-lead mt-5 max-w-prose-lead">{page.summary}</p> : null}
          </header>

          {page.cover_image_url ? (
            <div className="mt-10 aspect-video overflow-hidden bg-[#42101c]">
              <img
                src={page.cover_image_url}
                alt={page.title || "Sayfa görseli"}
                className="h-full w-full object-cover"
              />
            </div>
          ) : null}

          <div className="mt-10 max-w-3xl space-y-5 border-l border-accent/45 pl-6">
            {(page.content || "")
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
