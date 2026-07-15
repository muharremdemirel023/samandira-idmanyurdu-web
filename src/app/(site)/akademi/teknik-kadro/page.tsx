import type { Metadata } from "next";

import { Container } from "@/components/ui/Container";
import { getActiveStaffCoaches } from "@/lib/staff";
import { FeaturedCoachProfile } from "./FeaturedCoachProfile";

export const metadata: Metadata = {
  title: "Teknik Kadromuz",
  description: "Samandıra İdman Yurdu Akademi teknik kadro bilgileri.",
};

export default async function TeknikKadroPage() {
  const staff = await getActiveStaffCoaches();

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

          {staff.length > 0 ? (
            <div className="mt-10 space-y-10 md:mt-12 md:space-y-12">
              {staff.map((coach) => (
                <FeaturedCoachProfile key={coach.name} coach={coach} />
              ))}
            </div>
          ) : (
            <section className="mt-10 max-w-3xl border-l border-accent/45 pl-6">
              <h2 className="type-heading-md text-text-primary">Teknik kadro bilgileri yakında eklenecektir.</h2>
              <p className="type-body-lg mt-4 max-w-prose-body">
                Akademi teknik ekibi aktif edildiğinde bu sayfada görüntülenecektir.
              </p>
            </section>
          )}
        </Container>
      </section>
    </main>
  );
}
