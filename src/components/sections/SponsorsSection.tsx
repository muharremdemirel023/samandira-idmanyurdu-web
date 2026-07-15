import { SectionReveal } from "@/components/motion/SectionReveal";
import { Container } from "@/components/ui/Container";
import { createClient } from "@/lib/supabase/server";

type Sponsor = {
  id: string;
  name: string | null;
  website_url: string | null;
  logo_url: string | null;
};

async function getActiveSponsors() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("sponsors")
    .select("id,name,website_url,logo_url")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  return (data ?? []) as Sponsor[];
}

function SponsorLogo({ sponsor }: { sponsor: Sponsor }) {
  const content = (
    <div className="flex h-28 items-center justify-center bg-white p-5 transition duration-300 group-hover:bg-slate-100 sm:h-32">
      {sponsor.logo_url ? (
        <img
          src={sponsor.logo_url}
          alt={sponsor.name || "Sponsor logosu"}
          className="max-h-full max-w-full object-contain"
        />
      ) : (
        <span className="text-center text-sm font-bold text-[#26060d]">{sponsor.name}</span>
      )}
    </div>
  );

  if (sponsor.website_url) {
    return (
      <a
        href={sponsor.website_url}
        target="_blank"
        rel="noreferrer"
        className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        aria-label={`${sponsor.name || "Sponsor"} websitesini aç`}
      >
        {content}
      </a>
    );
  }

  return <div>{content}</div>;
}

export async function SponsorsSection() {
  const sponsors = await getActiveSponsors();

  if (sponsors.length === 0) {
    return null;
  }

  return (
    <section className="club-section py-[var(--space-section-y-mobile)] md:py-[var(--space-section-y-desktop)]">
      <Container>
        <SectionReveal staggerIndex={0} className="stack-section-intro max-w-prose-section">
          <p className="type-overline club-kicker-line text-accent">Destekçilerimiz</p>
          <h2 className="type-heading-lg text-text-primary">Sponsorlarımız</h2>
          <p className="type-body-lg max-w-prose-body">
            Kulübümüzün saha içi ve akademi yolculuğuna destek veren değerli iş ortaklarımız.
          </p>
        </SectionReveal>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {sponsors.map((sponsor, index) => (
            <SectionReveal key={sponsor.id} staggerIndex={index + 1}>
              <SponsorLogo sponsor={sponsor} />
            </SectionReveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
