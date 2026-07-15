import type { Metadata } from "next";

import { Container } from "@/components/ui/Container";
import { FeaturedCoachProfile } from "./FeaturedCoachProfile";
import { featuredCoaches } from "./featured-coaches";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Teknik Kadromuz",
  description: "Samandıra İdman Yurdu Akademi teknik kadro bilgileri.",
};

type StaffMember = {
  id: string;
  title: string | null;
  name: string | null;
  short_summary: string | null;
  biography: string | null;
  highlights: string[] | null;
  photo_url: string | null;
};

async function getActiveStaff() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("staff")
    .select("id,title,name,short_summary,biography,highlights,photo_url")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  return (data ?? []) as StaffMember[];
}

function StaffProfile({ member }: { member: StaffMember }) {
  const paragraphs = (member.biography || "")
    .split("\n")
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  return (
    <article className="grid gap-7 border-t border-border-subtle pt-10 first:border-t-0 first:pt-0 md:grid-cols-[15rem_minmax(0,1fr)] md:gap-10 lg:grid-cols-[17rem_minmax(0,1fr)]">
      <div className="relative aspect-[4/5] w-full max-w-[16rem] overflow-hidden bg-[#42101c] shadow-[0_24px_70px_-48px_rgba(0,0,0,0.95)] md:max-w-none">
        {member.photo_url ? (
          <img
            src={member.photo_url}
            alt={member.name || "Teknik kadro profil fotoğrafı"}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-end bg-[radial-gradient(ellipse_at_50%_18%,rgba(234,88,12,0.10),transparent_38%),linear-gradient(155deg,#6d1f2e_0%,#42101c_52%,#26060d_100%)] p-5">
            <p className="type-label-caps-accent text-accent">Profil fotoğrafı</p>
          </div>
        )}
      </div>

      <div className="max-w-4xl">
        <p className="type-overline club-kicker-line text-accent">{member.title}</p>
        <h2 className="mt-3 text-[clamp(2rem,4vw,3.25rem)] font-black uppercase leading-none tracking-normal text-text-primary">
          {member.name}
        </h2>
        {member.short_summary ? (
          <p className="type-body-lg mt-5 max-w-prose-lead font-medium text-text-muted">
            {member.short_summary}
          </p>
        ) : null}

        {member.highlights && member.highlights.length > 0 ? (
          <div className="mt-6">
            <p className="type-label-caps-accent text-accent">Öne çıkanlar</p>
            <ul className="mt-3 flex flex-wrap gap-2.5">
              {member.highlights.map((highlight) => (
                <li
                  key={highlight}
                  className="border border-accent/30 bg-accent/8 px-3 py-1.5 text-sm font-semibold text-text-primary"
                >
                  {highlight}
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {paragraphs.length > 0 ? (
          <div className="mt-7 space-y-4 border-l border-accent/40 pl-5">
            {paragraphs.map((paragraph) => (
              <p key={paragraph} className="type-body max-w-prose-body text-text-muted">
                {paragraph}
              </p>
            ))}
          </div>
        ) : null}
      </div>
    </article>
  );
}

export default async function TeknikKadroPage() {
  const staff = await getActiveStaff();

  return (
    <main className="flex flex-1 flex-col">
      <section className="relative isolate overflow-hidden pb-12 pt-[calc(var(--header-height)+0.75rem)] md:pb-16 md:pt-[calc(var(--header-height)+1rem)]">
        <div
          aria-hidden
          className="absolute inset-0 -z-20 bg-surface-base"
        />
        <div
          aria-hidden
          className="absolute right-0 top-0 -z-10 h-80 w-80 bg-[radial-gradient(circle,rgba(234,88,12,0.10),transparent_68%)] blur-2xl"
        />

        <Container>
          <header className="max-w-prose-section">
            <p className="type-overline club-kicker-line text-accent">Akademi ekibi</p>
            <h1 className="type-display text-text-primary">Teknik Kadromuz</h1>
            <p className="type-lead mt-5 max-w-prose-lead">
              Genç sporcularımızın gelişimine yön veren deneyimli teknik ekibimiz.
            </p>
          </header>

          <div className="mt-10 space-y-10 md:mt-12 md:space-y-12">
            {featuredCoaches.map((coach) => (
              <FeaturedCoachProfile key={coach.name} coach={coach} />
            ))}
            {staff.map((member) => (
              <StaffProfile key={member.id} member={member} />
            ))}
          </div>
        </Container>
      </section>
    </main>
  );
}
